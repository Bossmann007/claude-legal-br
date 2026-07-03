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

export function buildProcessoQuery(numeroProcesso, { digits = false } = {}) {
  const value = digits ? digitsOnly(numeroProcesso) : String(numeroProcesso || "").trim();
  return { size: 5, query: { match: { numeroProcesso: value } } };
}

// Structured jurimetria search. Every filter is optional; only the provided ones
// are ANDed together. `rawAggs` is an escape hatch for Elasticsearch aggregations
// (used by the jurimetria skill to count by classe/movimento/orgao).
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
  if (rawAggs && typeof rawAggs === "object") body.aggs = rawAggs;
  return body;
}

// Reduce a raw _source hit to the capa fields a lawyer actually reads, plus a
// movements timeline sorted oldest-first. Defensive against missing fields —
// DataJud omits sealed/absent data rather than erroring.
export function parseProcessoHit(source = {}) {
  const movimentos = Array.isArray(source.movimentos)
    ? source.movimentos
        .map((m) => ({
          codigo: m?.codigo ?? null,
          nome: m?.nome ?? null,
          dataHora: m?.dataHora ?? null,
        }))
        .sort((a, b) => String(a.dataHora).localeCompare(String(b.dataHora)))
    : [];
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
    totalMovimentos: movimentos.length,
  };
}

export function parseHits(json) {
  const hits = json?.hits?.hits;
  return Array.isArray(hits) ? hits.map((h) => h?._source ?? {}) : [];
}
