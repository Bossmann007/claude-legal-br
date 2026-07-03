#!/usr/bin/env node
// DataJud MCP connector — read-only access to the CNJ public case-metadata API.
// Zero dependencies: implements the MCP stdio transport (newline-delimited
// JSON-RPC 2.0) by hand so it runs with plain `node`, no npm install.
//
// Protocol log/errors go to stderr; stdout carries ONLY JSON-RPC messages.
import readline from "node:readline";
import {
  indexUrl,
  buildProcessoQuery,
  buildPesquisaQuery,
  parseProcessoHit,
  parseHits,
  digitsOnly,
} from "./lib.mjs";

// CNJ publishes the public API key openly on the Datajud wiki and rotates it at
// will. It is NOT a secret. Prefer an env override so a rotated key needs no code
// change; fall back to the key published as of 2026-07 with a verify note.
const PUBLIC_KEY_FALLBACK =
  "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
const API_KEY = process.env.DATAJUD_API_KEY || PUBLIC_KEY_FALLBACK;
const BASE_URL =
  process.env.DATAJUD_BASE_URL || "https://api-publica.datajud.cnj.jus.br";
const TIMEOUT_MS = Number(process.env.DATAJUD_TIMEOUT_MS) || 20000;

const log = (...a) => process.stderr.write(`[datajud] ${a.join(" ")}\n`);

async function datajudPost(sigla, body) {
  const url = indexUrl(BASE_URL, sigla); // throws on invalid sigla (SSRF guard)
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `APIKey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e.name === "AbortError")
      throw new Error(`DataJud timeout após ${TIMEOUT_MS}ms (${sigla}).`);
    throw new Error(`Falha de rede ao consultar DataJud (${sigla}): ${e.message}`);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403)
      throw new Error(
        `DataJud recusou a chave (HTTP ${res.status}). A chave pública do CNJ pode ter rotacionado — confira a atual em https://datajud-wiki.cnj.jus.br/api-publica/acesso/ e defina DATAJUD_API_KEY.`,
      );
    throw new Error(`DataJud HTTP ${res.status} (${sigla}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

// ---- tool handlers -------------------------------------------------------

async function buscarProcesso({ tribunal, numero_processo }) {
  if (!numero_processo) throw new Error("numero_processo é obrigatório.");
  let json = await datajudPost(tribunal, buildProcessoQuery(numero_processo));
  let sources = parseHits(json);
  // Indices vary on whether numeroProcesso is stored masked or digits-only.
  if (sources.length === 0) {
    json = await datajudPost(
      tribunal,
      buildProcessoQuery(numero_processo, { digits: true }),
    );
    sources = parseHits(json);
  }
  if (sources.length === 0) {
    return {
      encontrado: false,
      aviso:
        "Nenhum processo encontrado. Pode ser sigiloso (não exposto pela API pública), estar em outro tribunal, ou o número está incorreto. Confirme a sigla do tribunal e o número CNJ.",
      numero_consultado: numero_processo,
      digits: digitsOnly(numero_processo),
    };
  }
  return { encontrado: true, ...parseProcessoHit(sources[0]) };
}

async function pesquisar(args = {}) {
  const body = buildPesquisaQuery(args);
  const json = await datajudPost(args.tribunal, body);
  const sources = parseHits(json).map(parseProcessoHit);
  return {
    total: json?.hits?.total?.value ?? sources.length,
    retornados: sources.length,
    processos: sources,
    ...(json?.aggregations ? { aggregations: json.aggregations } : {}),
    nota: "Metadados públicos DataJud/CNJ. Processos sigilosos não aparecem. Verifique dados críticos na fonte oficial (PJe/tribunal) antes de agir.",
  };
}

const TOOLS = [
  {
    name: "datajud_buscar_processo",
    description:
      "Busca um processo pelo número unificado CNJ na API pública do DataJud (metadados: classe, assuntos, órgão julgador, data de ajuizamento, valor da causa, e a timeline de movimentos). Read-only. Processos em segredo de justiça não são retornados.",
    inputSchema: {
      type: "object",
      properties: {
        tribunal: {
          type: "string",
          description:
            "Sigla DataJud do tribunal (ex.: tjsp, tjpr, tjrj, trf4, trt9, stj, tst).",
        },
        numero_processo: {
          type: "string",
          description:
            "Número CNJ do processo, com ou sem máscara (NNNNNNN-DD.AAAA.J.TR.OOOO).",
        },
      },
      required: ["tribunal", "numero_processo"],
    },
  },
  {
    name: "datajud_pesquisar",
    description:
      "Pesquisa processos por filtros (classe, assunto, órgão julgador, grau, faixa de data de ajuizamento) num tribunal — base para jurimetria. Aceita agregações Elasticsearch via `agregacoes` para contagens (ex.: procedência por classe, distribuição por órgão). Read-only, apenas metadados públicos.",
    inputSchema: {
      type: "object",
      properties: {
        tribunal: { type: "string", description: "Sigla DataJud do tribunal." },
        classe_codigo: { type: "integer", description: "Código TPU da classe processual." },
        assunto_codigo: { type: "integer", description: "Código TPU do assunto." },
        orgao_julgador: { type: "string", description: "Nome (ou parte) do órgão julgador/vara." },
        grau: { type: "string", description: "Grau de jurisdição (ex.: G1, G2, JE)." },
        data_ajuizamento_de: { type: "string", description: "Data inicial (YYYY-MM-DD)." },
        data_ajuizamento_ate: { type: "string", description: "Data final (YYYY-MM-DD)." },
        tamanho: { type: "integer", description: "Nº de processos a retornar (1-100, padrão 20)." },
        agregacoes: {
          type: "object",
          description:
            "Objeto de aggregations Elasticsearch (opcional) para estatísticas de jurimetria.",
        },
      },
      required: ["tribunal"],
    },
  },
];

async function dispatch(name, args) {
  switch (name) {
    case "datajud_buscar_processo":
      return buscarProcesso(args);
    case "datajud_pesquisar":
      return pesquisar({ ...args, rawAggs: args.agregacoes });
    default:
      throw new Error(`Ferramenta desconhecida: ${name}`);
  }
}

// ---- MCP stdio JSON-RPC loop --------------------------------------------

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
      serverInfo: { name: "datajud", version: "1.0.0" },
    });
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled")
    return; // notifications: no response
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

// Track in-flight requests so a stdin EOF while a fetch is pending does not
// drop its response — drain before exiting.
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
log(`pronto (base=${BASE_URL}, key=${process.env.DATAJUD_API_KEY ? "env" : "pública-fallback"})`);
