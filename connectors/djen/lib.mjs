// Pure logic for the DJEN connector — no I/O, unit-testable offline (test.mjs).
// DJEN = Diário de Justiça Eletrônico Nacional (CNJ). Public consultation API:
// GET https://comunicaapi.pje.jus.br/api/v1/comunicacao — no auth key.

const UF_RE = /^(ac|al|am|ap|ba|ce|df|es|go|ma|mg|ms|mt|pa|pb|pe|pi|pr|rj|rn|ro|rr|rs|sc|se|sp|to)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeUf(uf) {
  return String(uf || "").trim().toLowerCase();
}

export function isValidUf(uf) {
  return UF_RE.test(normalizeUf(uf));
}

export function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
}

// Build the query string for the public consulta. Only provided params are sent.
// Throws on malformed inputs so bad values never reach the wire.
export function buildQuery({
  numeroOab,
  ufOab,
  nomeAdvogado,
  numeroProcesso,
  siglaTribunal,
  dataInicio,
  dataFim,
  meio,
  pagina = 1,
  itensPorPagina = 50,
} = {}) {
  const p = new URLSearchParams();

  if (numeroOab != null && String(numeroOab).length) {
    const n = digitsOnly(numeroOab);
    if (!n) throw new Error("numeroOab deve conter dígitos.");
    p.set("numeroOab", n);
    if (!ufOab) throw new Error("ufOab é obrigatório quando numeroOab é informado.");
  }
  if (ufOab != null && String(ufOab).length) {
    const uf = normalizeUf(ufOab);
    if (!isValidUf(uf)) throw new Error(`ufOab inválida: "${ufOab}".`);
    p.set("ufOab", uf.toUpperCase());
  }
  if (nomeAdvogado) p.set("nomeAdvogado", String(nomeAdvogado).trim());
  if (numeroProcesso) p.set("numeroProcesso", String(numeroProcesso).trim());
  if (siglaTribunal) p.set("siglaTribunal", String(siglaTribunal).trim().toUpperCase());
  if (meio) p.set("meio", String(meio).trim().toUpperCase());

  for (const [k, v] of [["dataDisponibilizacaoInicio", dataInicio], ["dataDisponibilizacaoFim", dataFim]]) {
    if (v) {
      if (!DATE_RE.test(v)) throw new Error(`${k} deve estar em YYYY-MM-DD (recebido "${v}").`);
      p.set(k, v);
    }
  }

  // At least one identifying filter is required — otherwise the API would return
  // the entire national diary.
  if (!p.has("numeroOab") && !p.has("nomeAdvogado") && !p.has("numeroProcesso")) {
    throw new Error(
      "Informe ao menos um filtro: numeroOab+ufOab, nomeAdvogado, ou numeroProcesso.",
    );
  }

  p.set("pagina", String(Math.max(1, Number(pagina) || 1)));
  p.set("itensPorPagina", String(Math.max(1, Math.min(Number(itensPorPagina) || 50, 100))));
  return p.toString();
}

export function buildUrl(baseUrl, query) {
  return `${baseUrl.replace(/\/$/, "")}?${query}`;
}

// Reduce a raw comunicação item to the fields a lawyer acts on. Defensive: the
// public API mixes snake_case and camelCase and omits fields freely.
export function parseComunicacao(item = {}) {
  const advs = Array.isArray(item.destinatarioadvogados)
    ? item.destinatarioadvogados.map((d) => {
        const a = d?.advogado ?? d ?? {};
        return {
          nome: a.nome ?? null,
          oab: a.numero_oab ?? a.numeroOab ?? null,
          uf: a.uf_oab ?? a.ufOab ?? null,
        };
      })
    : [];
  const texto = (item.texto ?? "").toString();
  return {
    id: item.id ?? item.hash ?? null,
    dataDisponibilizacao: item.data_disponibilizacao ?? item.dataDisponibilizacao ?? null,
    tribunal: item.siglaTribunal ?? item.sigla_tribunal ?? null,
    orgao: item.nomeOrgao ?? item.nome_orgao ?? null,
    tipoComunicacao: item.tipoComunicacao ?? item.tipo_comunicacao ?? null,
    numeroProcesso:
      item.numeroprocessocommascara ?? item.numero_processo ?? item.numeroProcesso ?? null,
    meio: item.meiocompleto ?? item.meio ?? null,
    link: item.link ?? null,
    advogados: advs,
    // Text can be long; keep a preview plus full text so the model can decide.
    textoPreview: texto.replace(/\s+/g, " ").trim().slice(0, 400),
    texto,
  };
}

export function parseItems(json) {
  const items = json?.items ?? json?.content ?? [];
  return Array.isArray(items) ? items.map(parseComunicacao) : [];
}

export function totalCount(json, fallback) {
  return json?.count ?? json?.total ?? json?.totalElements ?? fallback;
}
