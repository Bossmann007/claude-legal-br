// Pure logic for the DataJud connector — no I/O, no network, so it is unit-testable
// offline (see test.mjs). server.mjs wires these into the MCP stdio protocol + fetch.

// DataJud public API indexes are named `api_publica_<sigla>`. Validating the sigla
// against a strict pattern is the SSRF guard: the sigla goes into the request URL
// path, so only [a-z0-9] tokens that match a real tribunal alias are allowed.
// Covers: 27 TJs, TRF1-6, TRT1-24, TREs (tre + UF), and superior courts.
const TRIBUNAL_RE =
  /^(tj(ac|al|am|ap|ba|ce|dft|es|go|ma|mg|ms|mt|pa|pb|pe|pi|pr|rj|rn|ro|rr|rs|sc|se|sp|to)|trf[1-6]|trt([1-9]|1\d|2[0-4])|tre(ac|al|am|ap|ba|ce|df|es|go|ma|mg|ms|mt|pa|pb|pe|pi|pr|rj|rn|ro|rr|rs|sc|se|sp|to)|stj|tst|tse|stm)$/;

export function normalizeTribunal(sigla) {
  return String(sigla || "").trim().toLowerCase();
}

export function isValidTribunal(sigla) {
  return TRIBUNAL_RE.test(normalizeTribunal(sigla));
}

export function indexUrl(baseUrl, sigla) {
  const s = normalizeTribunal(sigla);
  if (!isValidTribunal(s)) {
    throw new Error(
      `Tribunal inválido: "${sigla}". Use a sigla DataJud (ex.: tjsp, tjpr, trf4, trt9, stj).`,
    );
  }
  return `${baseUrl.replace(/\/$/, "")}/api_publica_${s}/_search`;
}

// The 20-digit CNJ number, with or without the NNNNNNN-DD.AAAA.J.TR.OOOO mask.
export function digitsOnly(numero) {
  return String(numero || "").replace(/\D/g, "");
}

// A well-formed CNJ number has exactly 20 digits. This catches lawyer typos
// (a truncated/extra-digit number) before it becomes a wasted, hitless query.
// ponytail: length check only, not the mod-97 verifying digit — the API is the
// source of truth on whether the process exists; add the DV check if false
// positives from transposed digits become a real problem.
export function isValidCnj(numero) {
  return digitsOnly(numero).length === 20;
}

export function buildProcessoQuery(numeroProcesso, { digits = false } = {}) {
  const value = digits ? digitsOnly(numeroProcesso) : String(numeroProcesso || "").trim();
  return { size: 5, query: { match: { numeroProcesso: value } } };
}

// Aggregations are an abuse vector against a public API: a deep/expensive agg
// (high-cardinality terms, deep nesting) can hammer CNJ's cluster. Allow only a
// safe subset, cap terms bucket size, and cap nesting depth.
const ALLOWED_AGG_TYPES = new Set([
  "terms",
  "date_histogram",
  "histogram",
  "avg",
  "min",
  "max",
  "sum",
  "value_count",
  "cardinality",
  "stats",
]);
const MAX_AGG_DEPTH = 2;
const MAX_TERMS_SIZE = 100;

export function sanitizeAggs(aggs, depth = 0) {
  if (!aggs || typeof aggs !== "object" || Array.isArray(aggs)) return undefined;
  if (depth >= MAX_AGG_DEPTH) {
    throw new Error(`Agregação excede a profundidade máxima (${MAX_AGG_DEPTH}).`);
  }
  const out = {};
  for (const [name, spec] of Object.entries(aggs)) {
    if (!spec || typeof spec !== "object") continue;
    const clean = {};
    for (const key of Object.keys(spec)) {
      if (key === "aggs" || key === "aggregations") {
        clean.aggs = sanitizeAggs(spec[key], depth + 1);
      } else if (ALLOWED_AGG_TYPES.has(key)) {
        const body = { ...spec[key] };
        if (key === "terms" && body.size != null) {
          body.size = Math.max(1, Math.min(Number(body.size) || 10, MAX_TERMS_SIZE));
        }
        clean[key] = body;
      } else {
        throw new Error(
          `Tipo de agregação não permitido: "${key}". Permitidos: ${[...ALLOWED_AGG_TYPES].join(", ")}.`,
        );
      }
    }
    if (Object.keys(clean).length) out[name] = clean;
  }
  return Object.keys(out).length ? out : undefined;
}

// Structured jurimetria search. Every filter is optional; only the provided ones
// are ANDed together. `rawAggs` is an escape hatch for Elasticsearch aggregations
// (used by the jurimetria skill to count by classe/movimento/orgao) — sanitized.
export function buildPesquisaQuery({
  classeCodigo,
  assuntoCodigo,
  orgaoJulgador,
  grau,
  dataAjuizamentoDe,
  dataAjuizamentoAte,
  tamanho = 20,
  rawAggs,
} = {}) {
  const must = [];
  if (classeCodigo != null) must.push({ match: { "classe.codigo": classeCodigo } });
  if (assuntoCodigo != null) must.push({ match: { "assuntos.codigo": assuntoCodigo } });
  if (orgaoJulgador) must.push({ match: { "orgaoJulgador.nome": orgaoJulgador } });
  if (grau) must.push({ match: { grau } });
  if (dataAjuizamentoDe || dataAjuizamentoAte) {
    const range = {};
    if (dataAjuizamentoDe) range.gte = dataAjuizamentoDe;
    if (dataAjuizamentoAte) range.lte = dataAjuizamentoAte;
    must.push({ range: { dataAjuizamento: range } });
  }
  const size = Math.max(0, Math.min(Number(tamanho) || 20, 100));
  const body = { size, query: must.length ? { bool: { must } } : { match_all: {} } };
  const aggs = sanitizeAggs(rawAggs);
  if (aggs) body.aggs = aggs;
  return body;
}

// Cap the movements timeline so a process with thousands of movements cannot
// blow up the model context (and amplify any injection surface). Keep the most
// recent MAX_MOVIMENTOS; report how many were dropped.
export const MAX_MOVIMENTOS = 100;

// A process may carry a sigilo (secrecy) level. If the public API ever leaks a
// hit with nivelSigilo > 0 (it has happened before CNJ reindexes), we must NOT
// surface its data — CPC art. 189 / LGPD. Returns true when the hit is sealed.
export function isSigiloso(source = {}) {
  const n = Number(source.nivelSigilo ?? source.nivel_sigilo ?? 0);
  return Number.isFinite(n) && n > 0;
}

// Reduce a raw _source hit to the capa fields a lawyer actually reads, plus a
// movements timeline sorted oldest-first. Defensive against missing fields —
// DataJud omits sealed/absent data rather than erroring. Sealed hits are
// redacted to a warning by the server before this is called.
export function parseProcessoHit(source = {}) {
  const all = Array.isArray(source.movimentos)
    ? source.movimentos
        .map((m) => ({
          codigo: m?.codigo ?? null,
          nome: m?.nome ?? null,
          dataHora: m?.dataHora ?? null,
        }))
        .sort((a, b) => String(a.dataHora).localeCompare(String(b.dataHora)))
    : [];
  // Keep the most recent MAX_MOVIMENTOS (slice from the end after asc sort).
  const movimentos = all.length > MAX_MOVIMENTOS ? all.slice(-MAX_MOVIMENTOS) : all;
  const movimentosOmitidos = all.length - movimentos.length;
  return {
    numeroProcesso: source.numeroProcesso ?? null,
    tribunal: source.tribunal ?? null,
    grau: source.grau ?? null,
    classe: source.classe ?? null,
    assuntos: source.assuntos ?? [],
    orgaoJulgador: source.orgaoJulgador ?? null,
    dataAjuizamento: source.dataAjuizamento ?? null,
    dataHoraUltimaAtualizacao: source.dataHoraUltimaAtualizacao ?? null,
    valorCausa: source.valorCausa ?? source.valor ?? null,
    movimentos,
    totalMovimentos: all.length,
    ...(movimentosOmitidos > 0
      ? {
          movimentosOmitidos,
          notaMovimentos: `Exibindo os ${movimentos.length} movimentos mais recentes de ${all.length}. ${movimentosOmitidos} omitidos para não exceder o contexto.`,
        }
      : {}),
  };
}

export function parseHits(json) {
  const hits = json?.hits?.hits;
  return Array.isArray(hits) ? hits.map((h) => h?._source ?? {}) : [];
}
