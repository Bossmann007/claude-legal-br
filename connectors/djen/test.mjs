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

console.log("ok — all DJEN lib checks passed");
