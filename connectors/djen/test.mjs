#!/usr/bin/env node
// Offline self-check for the DJEN connector — no network. Run: node test.mjs
import assert from "node:assert";
import {
  isValidUf,
  digitsOnly,
  buildQuery,
  buildUrl,
  parseComunicacao,
  parseItems,
} from "./lib.mjs";

const LIVE = process.argv.includes("--live");

// UF validation
assert.equal(isValidUf("pr"), true);
assert.equal(isValidUf("SP"), true);
assert.equal(isValidUf("xx"), false);
assert.equal(digitsOnly("123.456/PR"), "123456");

// query requires at least one identifying filter
assert.throws(() => buildQuery({}), /ao menos um filtro/);
// numeroOab requires ufOab
assert.throws(() => buildQuery({ numeroOab: "12345" }), /ufOab é obrigatório/);
assert.throws(() => buildQuery({ numeroOab: "12345", ufOab: "zz" }), /ufOab inválida/);
// bad date rejected
assert.throws(
  () => buildQuery({ nomeAdvogado: "Fulano", dataInicio: "06/2024" }),
  /YYYY-MM-DD/,
);

// good query: OAB + date range, size clamped
const q = buildQuery({
  numeroOab: "12.345",
  ufOab: "pr",
  dataInicio: "2024-06-01",
  dataFim: "2024-06-07",
  itensPorPagina: 999,
});
const params = new URLSearchParams(q);
assert.equal(params.get("numeroOab"), "12345");
assert.equal(params.get("ufOab"), "PR");
assert.equal(params.get("dataDisponibilizacaoInicio"), "2024-06-01");
assert.equal(params.get("itensPorPagina"), "100"); // clamped
assert.equal(params.get("pagina"), "1");

// nomeAdvogado alone is a valid filter
assert.ok(buildQuery({ nomeAdvogado: "Maria Silva" }).includes("nomeAdvogado"));

// url assembly
assert.equal(
  buildUrl("https://comunicaapi.pje.jus.br/api/v1/comunicacao/", "a=1"),
  "https://comunicaapi.pje.jus.br/api/v1/comunicacao?a=1",
);

// parse tolerates snake/camel mix and missing fields
const c = parseComunicacao({
  id: 9,
  data_disponibilizacao: "2024-06-03",
  siglaTribunal: "TJPR",
  tipoComunicacao: "Intimação",
  numeroprocessocommascara: "0001234-56.2024.8.16.0001",
  texto: "  Fica    intimado o réu para   contestar. ",
  destinatarioadvogados: [{ advogado: { nome: "Maria Silva", numero_oab: "12345", uf_oab: "PR" } }],
});
assert.equal(c.tribunal, "TJPR");
assert.equal(c.numeroProcesso, "0001234-56.2024.8.16.0001");
assert.equal(c.textoPreview, "Fica intimado o réu para contestar."); // whitespace collapsed
assert.equal(c.advogados[0].oab, "12345");

assert.deepEqual(parseItems({}), []); // empty response
assert.equal(parseItems({ items: [{ siglaTribunal: "TRF4" }] })[0].tribunal, "TRF4");

// long text is truncated and flagged (context/injection cap)
const longo = parseComunicacao({ id: 1, texto: "x".repeat(5000) });
assert.equal(longo.texto.length, 4000);
assert.equal(longo.textoTruncado, true);
assert.equal(longo.textoTamanhoOriginal, 5000);
// short text untouched, no truncation flags
const curto = parseComunicacao({ id: 2, texto: "curto" });
assert.equal(curto.texto, "curto");
assert.equal(curto.textoTruncado, undefined);

// malformed/absent envelope shapes don't throw
assert.deepEqual(parseItems({ items: "nope" }), []);
assert.deepEqual(parseItems(null), []);
assert.equal(parseComunicacao({}).id, null);
assert.equal(parseComunicacao({}).advogados.length, 0);

async function liveSmoke() {
  const baseUrl =
    process.env.DJEN_BASE_URL || "https://comunicaapi.pje.jus.br/api/v1/comunicacao";
  const timeoutMs = Number(process.env.DJEN_TIMEOUT_MS) || 45000;
  const query = buildQuery({
    siglaTribunal: "TJSP",
    numeroOab: "000000",
    ufOab: "SP",
    itensPorPagina: 1,
  });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(buildUrl(baseUrl, query), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 200) {
    console.log(`LIVE: djen ${res.status}`);
    return;
  }
  if (res.status >= 500) throw new Error(`DJEN unreachable: HTTP ${res.status}`);
  throw new Error(`DJEN unexpected live status: HTTP ${res.status}`);
}

console.log("ok — all DJEN lib checks passed");
if (LIVE) await liveSmoke();
