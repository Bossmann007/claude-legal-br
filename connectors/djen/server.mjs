#!/usr/bin/env node
// DJEN MCP connector — read-only access to the CNJ public "Comunica" API
// (Diário de Justiça Eletrônico Nacional): court communications / intimações by
// OAB, lawyer name, or process number. Zero dependencies, MCP stdio transport.
//
// Public API, no auth key. stdout carries ONLY JSON-RPC; logs go to stderr.
import readline from "node:readline";
import { buildQuery, buildUrl, parseItems, totalCount } from "./lib.mjs";

const BASE_URL =
  process.env.DJEN_BASE_URL || "https://comunicaapi.pje.jus.br/api/v1/comunicacao";
// The public DJEN API is frequently slow under load (broad queries can take
// 30s+); default generously and let callers retry on timeout.
const TIMEOUT_MS = Number(process.env.DJEN_TIMEOUT_MS) || 45000;

const log = (...a) => process.stderr.write(`[djen] ${a.join(" ")}\n`);

async function djenGet(params) {
  const url = buildUrl(BASE_URL, buildQuery(params)); // throws on bad input
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e.name === "AbortError")
      throw new Error(`DJEN timeout após ${TIMEOUT_MS}ms.`);
    throw new Error(`Falha de rede ao consultar o DJEN: ${e.message}`);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DJEN HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// ---- tool handlers -------------------------------------------------------

async function consultar(args = {}) {
  const json = await djenGet(args);
  const comunicacoes = parseItems(json);
  return {
    total: totalCount(json, comunicacoes.length),
    retornados: comunicacoes.length,
    comunicacoes,
    nota: "Comunicações públicas do DJEN/CNJ. A data de disponibilização define o início da contagem do prazo (a intimação considera-se realizada no dia útil seguinte à disponibilização — Lei 11.419/2006 art. 4º §3º [verificar]). Calcule prazos com /litigation-legal:prazos-cpc e confirme na fonte oficial antes de agir.",
  };
}

const TOOLS = [
  {
    name: "djen_consultar",
    description:
      "Consulta comunicações/intimações no DJEN (Diário de Justiça Eletrônico Nacional, CNJ) por OAB (numeroOab+ufOab), nome do advogado, e/ou intervalo de datas de disponibilização. Base do 'watcher' de intimações. Read-only, dados públicos. A data de disponibilização inicia a contagem de prazo.",
    inputSchema: {
      type: "object",
      properties: {
        numeroOab: { type: "string", description: "Número da OAB (só dígitos)." },
        ufOab: { type: "string", description: "UF da OAB (ex.: PR, SP). Obrigatório com numeroOab." },
        nomeAdvogado: { type: "string", description: "Nome completo do advogado (alternativa à OAB)." },
        siglaTribunal: { type: "string", description: "Filtrar por tribunal (ex.: TJPR, TRF4)." },
        dataInicio: { type: "string", description: "Data de disponibilização inicial (YYYY-MM-DD)." },
        dataFim: { type: "string", description: "Data de disponibilização final (YYYY-MM-DD)." },
        meio: { type: "string", description: "Meio da comunicação (D=Diário, E=Eletrônico) — opcional." },
        pagina: { type: "integer", description: "Página (padrão 1)." },
        itensPorPagina: { type: "integer", description: "Itens por página (1-100, padrão 50)." },
      },
      required: [],
    },
  },
  {
    name: "djen_por_processo",
    description:
      "Consulta as comunicações/intimações de um processo específico no DJEN pelo número CNJ. Read-only, dados públicos.",
    inputSchema: {
      type: "object",
      properties: {
        numeroProcesso: { type: "string", description: "Número CNJ do processo (com ou sem máscara)." },
        dataInicio: { type: "string", description: "Data inicial (YYYY-MM-DD) — opcional." },
        dataFim: { type: "string", description: "Data final (YYYY-MM-DD) — opcional." },
        pagina: { type: "integer", description: "Página (padrão 1)." },
        itensPorPagina: { type: "integer", description: "Itens por página (1-100, padrão 50)." },
      },
      required: ["numeroProcesso"],
    },
  },
];

async function dispatch(name, args) {
  switch (name) {
    case "djen_consultar":
      return consultar(args);
    case "djen_por_processo":
      return consultar(args); // numeroProcesso is just another filter
    default:
      throw new Error(`Ferramenta desconhecida: ${name}`);
  }
}

// ---- MCP stdio JSON-RPC loop (shared shape with the datajud connector) ----

const PROTOCOL_VERSION = "2024-11-05";
const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");
const reply = (id, result) => send({ jsonrpc: "2.0", id, result });
const replyError = (id, code, message) =>
  send({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(msg) {
  const { id, method, params } = msg;
  if (method === "initialize") {
    return reply(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: "djen", version: "1.0.0" },
    });
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled")
    return;
  if (method === "ping") return reply(id, {});
  if (method === "tools/list") return reply(id, { tools: TOOLS });
  if (method === "tools/call") {
    const { name, arguments: args } = params || {};
    try {
      const data = await dispatch(name, args || {});
      return reply(id, {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      });
    } catch (e) {
      log("tool error:", e.message);
      return reply(id, {
        content: [{ type: "text", text: `Erro: ${e.message}` }],
        isError: true,
      });
    }
  }
  if (id !== undefined) replyError(id, -32601, `Método não suportado: ${method}`);
}

const inflight = new Set();
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return log("linha não-JSON ignorada");
  }
  const p = Promise.resolve(handle(msg))
    .catch((e) => log("handler crash:", e.message))
    .finally(() => inflight.delete(p));
  inflight.add(p);
});
rl.on("close", async () => {
  await Promise.allSettled(inflight);
  process.exit(0);
});
log(`pronto (base=${BASE_URL})`);
