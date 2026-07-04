#!/usr/bin/env node
// Offline self-check for the DataJud connector — no network. Run: node test.mjs
import assert from "node:assert";
import {
  isValidTribunal,
  indexUrl,
  PUBLIC_KEY_FALLBACK,
  digitsOnly,
  isValidCnj,
  isSigiloso,
  normalizeTribunaisPermitidos,
  isTribunalPermitido,
  filterHitsPorTribunaisPermitidos,
  sanitizeAggs,
  MAX_MOVIMENTOS,
  buildProcessoQuery,
  buildPesquisaQuery,
  parseProcessoHit,
  parseHits,
} from "./lib.mjs";

const LIVE = process.argv.includes("--live");

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

// optional active-court allowlist
const allowTjsp = normalizeTribunaisPermitidos(["TJSP"]);
assert.equal(isTribunalPermitido({ tribunal: "TJSP" }, allowTjsp), true);
assert.equal(isTribunalPermitido({ siglaTribunal: "TJPR" }, allowTjsp), false);
assert.equal(isTribunalPermitido({ tribunal: "TJPR" }, normalizeTribunaisPermitidos([])), true);
assert.equal(isTribunalPermitido({ tribunal: "TJPR" }, undefined), true);
const scoped = filterHitsPorTribunaisPermitidos(
  [{ numeroProcesso: "1", tribunal: "TJSP" }, { numeroProcesso: "2", tribunal: "TJPR" }],
  ["tjsp"],
);
assert.equal(scoped.hits.length, 1);
assert.equal(scoped.hits[0].numeroProcesso, "1");
assert.equal(scoped.resultadosForaDoEscopo, 1);
assert.equal(
  filterHitsPorTribunaisPermitidos([{ tribunal: "TJPR" }], []).resultadosForaDoEscopo,
  0,
);
assert.equal(
  filterHitsPorTribunaisPermitidos([{ tribunal: "TJPR" }], undefined).hits.length,
  1,
);

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

// CNJ format validation (catches lawyer typos)
assert.equal(isValidCnj("1234567-89.2023.8.26.0100"), true);
assert.equal(isValidCnj("12345678920238260100"), true);
assert.equal(isValidCnj("123"), false); // too short
assert.equal(isValidCnj("1234567-89.2023.8.26.01000"), false); // 21 digits

// sigilo detection (never surface a sealed hit)
assert.equal(isSigiloso({ nivelSigilo: 0 }), false);
assert.equal(isSigiloso({}), false);
assert.equal(isSigiloso({ nivelSigilo: 1 }), true);
assert.equal(isSigiloso({ nivel_sigilo: 5 }), true); // snake_case tolerated

// movements are capped and reported
const many = {
  movimentos: Array.from({ length: MAX_MOVIMENTOS + 30 }, (_, i) => ({
    codigo: i,
    nome: `mov${i}`,
    dataHora: `2023-01-01T00:${String(i % 60).padStart(2, "0")}:00`,
  })),
};
const cap = parseProcessoHit(many);
assert.equal(cap.movimentos.length, MAX_MOVIMENTOS);
assert.equal(cap.totalMovimentos, MAX_MOVIMENTOS + 30); // reports the true total
assert.equal(cap.movimentosOmitidos, 30);

// aggregation sanitizer: allow safe, reject dangerous, clamp terms size
const okAgg = sanitizeAggs({ por_classe: { terms: { field: "classe.codigo", size: 9999 } } });
assert.equal(okAgg.por_classe.terms.size, 100); // clamped
assert.throws(() => sanitizeAggs({ x: { scripted_metric: {} } }), /não permitido/);
assert.throws(
  () => sanitizeAggs({ a: { terms: { field: "f" }, aggs: { b: { terms: { field: "g" }, aggs: { c: { terms: { field: "h" } } } } } } }),
  /profundidade/,
); // nesting past MAX_AGG_DEPTH

async function liveSmoke() {
  const baseUrl =
    process.env.DATAJUD_BASE_URL || "https://api-publica.datajud.cnj.jus.br";
  const timeoutMs = Number(process.env.DATAJUD_TIMEOUT_MS) || 20000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${baseUrl}/api_publica_tjsp/_search`, {
      method: "POST",
      headers: {
        Authorization: `APIKey ${process.env.DATAJUD_API_KEY || PUBLIC_KEY_FALLBACK}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ size: 1, query: { match_all: {} } }),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 200 || res.status === 429) {
    const note = res.status === 429 ? " (reachable)" : "";
    console.log(`LIVE: datajud ${res.status}${note}`);
    return;
  }
  if (res.status >= 500) throw new Error(`DataJud unreachable: HTTP ${res.status}`);
  console.log(`LIVE: datajud ${res.status} (reachable)`);
}

console.log("ok — all DataJud lib checks passed");
if (LIVE) await liveSmoke();
