#!/usr/bin/env node
// Offline self-check for the DataJud connector — no network. Run: node test.mjs
import assert from "node:assert";
import {
  isValidTribunal,
  indexUrl,
  digitsOnly,
  buildProcessoQuery,
  buildPesquisaQuery,
  parseProcessoHit,
  parseHits,
} from "./lib.mjs";

// tribunal validation is the SSRF guard
assert.equal(isValidTribunal("tjsp"), true);
assert.equal(isValidTribunal("TJSP"), true); // normalized
assert.equal(isValidTribunal("trf4"), true);
assert.equal(isValidTribunal("trt24"), true);
assert.equal(isValidTribunal("trt25"), false); // only 1-24 exist
assert.equal(isValidTribunal("stj"), true);
assert.equal(isValidTribunal("../secret"), false);
assert.equal(isValidTribunal("tjsp/_search?x=1"), false);
assert.equal(isValidTribunal(""), false);

// url building rejects bad siglas, accepts good ones
assert.equal(
  indexUrl("https://api-publica.datajud.cnj.jus.br", "tjpr"),
  "https://api-publica.datajud.cnj.jus.br/api_publica_tjpr/_search",
);
assert.throws(() => indexUrl("https://x", "evil/../"), /inválido/);

// number normalization
assert.equal(digitsOnly("1234567-89.2023.8.26.0100"), "12345678920238260100");

// query builders
const pq = buildProcessoQuery("1234567-89.2023.8.26.0100");
assert.equal(pq.query.match.numeroProcesso, "1234567-89.2023.8.26.0100");
const pqd = buildProcessoQuery("1234567-89.2023.8.26.0100", { digits: true });
assert.equal(pqd.query.match.numeroProcesso, "12345678920238260100");

const empty = buildPesquisaQuery({});
assert.deepEqual(empty.query, { match_all: {} });

const filtered = buildPesquisaQuery({
  classeCodigo: 7,
  orgaoJulgador: "Vara Cível",
  dataAjuizamentoDe: "2020-01-01",
  tamanho: 500, // clamped to 100
  rawAggs: { por_classe: { terms: { field: "classe.codigo" } } },
});
assert.equal(filtered.size, 100);
assert.equal(filtered.query.bool.must.length, 3);
assert.ok(filtered.aggs.por_classe);

// hit parsing: movements sorted oldest-first, missing fields tolerated
const parsed = parseProcessoHit({
  numeroProcesso: "x",
  classe: { codigo: 7, nome: "Procedimento Comum Cível" },
  movimentos: [
    { codigo: 246, nome: "Publicação", dataHora: "2023-05-10T10:00:00" },
    { codigo: 26, nome: "Distribuição", dataHora: "2023-01-02T09:00:00" },
  ],
});
assert.equal(parsed.totalMovimentos, 2);
assert.equal(parsed.movimentos[0].nome, "Distribuição"); // earliest first
assert.equal(parsed.valorCausa, null); // absent → null, no throw

assert.deepEqual(parseHits({ hits: { hits: [{ _source: { a: 1 } }] } }), [{ a: 1 }]);
assert.deepEqual(parseHits({}), []); // empty/sealed response

console.log("ok — all DataJud lib checks passed");
