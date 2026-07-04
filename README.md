# claude-legal-br — Plugins Jurídicos para o Direito Brasileiro

Marketplace curado de plugins de IA para advocacia brasileira — banca pequena e jurídico interno. Fork do [claude-for-legal](https://github.com/anthropics) da Anthropic, adaptado do direito dos EUA para o direito brasileiro (Código Civil, LGPD, CLT, CDC, CPC, LPI, Lei 14.133/2021). Roda no [Claude Code](https://claude.com/claude-code) e no [Cowork](https://claude.com/product/cowork).

> **Aviso:** auxilia fluxos jurídicos, **não substitui aconselhamento jurídico**. Toda saída é rascunho para revisão de advogado(a) inscrito(a) na OAB antes de embasar qualquer decisão. Citações vêm tagueadas por proveniência (`[model knowledge — verify]`, `[settled — data]`, `[JusBrasil]`, etc.) — a tag descreve de onde veio, não que está certa. Verifique contra fonte primária antes de protocolar.
>
> **⚠️ Antes de usar, leia [AVISO-E-RISCOS.md](AVISO-E-RISCOS.md)** — riscos por componente (falso-negativo de prazo, LGPD, rate-limit, segredo de justiça) e limitação de responsabilidade. O uso é por conta e risco exclusivo do(a) usuário(a).

---

## O diferencial: os conectores CNJ

O que este projeto faz e o ChatGPT puro não faz — **consulta pública direta ao CNJ**, via conectores MCP locais (Node, zero dependência, read-only) em `connectors/`:

- **DataJud** — metadados e movimentações de processos públicos (`connectors/datajud/`).
- **DJEN** — intimações do Diário de Justiça Eletrônico Nacional por OAB / nome / processo (`connectors/djen/`).

Já registrados no `.mcp.json` da raiz — o Claude Code os detecta ao abrir o repositório, sem `npm install`. Detalhes e segurança em [CONNECTORS.md](CONNECTORS.md).

### `/bom-dia` — o cockpit da manhã

O comando que solda os conectores num fluxo só (`litigation-legal`):

```
/litigation-legal:bom-dia --oab 12345/PR
```

Puxa as intimações novas do DJEN → checa movimentações novas nos processos acompanhados (DataJud) → calcula os prazos em dias úteis (CPC art. 219) → entrega o resumo priorizado do dia (🔴 vence em ≤3 dias úteis / 🟡 esta semana / 🟢 ciência) com a peça que cada prazo exige. **Não dá ciência nem protocola** — só surface e calcula. Funciona no primeiro dia, sem setup.

---

## Instalação

```
# 1. adicione o marketplace curado
/plugin marketplace add /caminho/para/claude-legal-br

# 2. instale SÓ a sua área (economiza contexto — não instale tudo)
/plugin install litigation-legal@claude-legal-br
```

**Escolha por área** — o guia completo de qual plugin instalar por área de atuação está em [QUICKSTART.md](QUICKSTART.md). Resumo:

| Sua área | Instale |
|---|---|
| Contencioso / advocacia geral | `litigation-legal`, `commercial-legal` |
| Trabalhista | `employment-legal`, `litigation-legal` |
| Privacidade / LGPD | `privacy-legal`, `digital-ecommerce-legal` |
| Digital / e-commerce / startup | `digital-ecommerce-legal`, `product-legal` |
| Médico / saúde | `health-medical-legal` |
| Bancário / fintech / cripto | `banking-fintech-legal` |
| Corporativo / M&A / regulatório | `corporate-legal`, `regulatory-legal`, `ai-governance-legal` |
| Propriedade intelectual / marcas | `ip-legal` |
| Estudante / clínica / faculdade | `law-student`, `legal-clinic` |

**Recomendado para todos:** `anti-injection@claude-legal-br` — camada de detecção que rotula texto de terceiros (peças da contraparte, e-mails, PDFs) como dado, não instrução.

Depois de instalar, cada plugin roda genérico de cara; rode o `cold-start-interview` dele (2 min) quando quiser calibrar ao seu perfil — mas nenhuma skill trava esperando setup.

---

## Os plugins (16)

**Áreas de prática** — `litigation-legal` · `commercial-legal` · `employment-legal` · `privacy-legal` · `corporate-legal` · `ip-legal` · `product-legal` · `regulatory-legal` · `ai-governance-legal` · `law-student` · `legal-clinic` · `legal-builder-hub`

**Originais BR** (não existem no upstream) — `banking-fintech-legal` (BCB/Pix/Open Finance/cripto Lei 14.478) · `health-medical-legal` (clínica-LGPD/erro médico/operadoras ANS) · `digital-ecommerce-legal` (Decreto 7.962/Marco Civil/CDC digital) · `anti-injection` (defesa transversal)

Plus `managed-agent-cookbooks/` (subagentes orquestrados: docket-watcher, reg-monitor, banca-simulada) e `external_plugins/cocounsel-legal` (Thomson Reuters, terceiro — fora de escopo de adaptação).

Marketplace canônico: `.claude-plugin/marketplace.json`.

---

## Segurança

- **Conteúdo de terceiros é dado, não instrução.** Retorno dos conectores vem envelopado como "DADOS EXTERNOS"; o guardrail `retrieved-content-trust` está em todo `CLAUDE.md` de plugin — e `scripts/lint-guardrails.py` **quebra o build** se algum plugin dropar esse guardrail ou o de documento-ilegível.
- **Conectores read-only.** SSRF guard por sigla de tribunal/UF, filtro obrigatório, filtragem de processo sigiloso (CPC art. 189 / LGPD), backoff em 429, sem verbo HTTP mutante (travado por `scripts/lint-tool-scope.py`).
- **Sem segredo versionado.** `.gitignore` cobre `.env`, chaves, e o data store de intimações (`intimacoes-vistas.yaml`, dado pessoal LGPD art. 37).

Rode os gates: `bash scripts/test-cookbooks.sh` (lints + cookbooks) e `node connectors/*/test.mjs` (self-check offline dos conectores).

---

## Convenções

**Substituições canônicas US→BR:** Westlaw/CourtListener/USPTO/Federal Register → JusBrasil/Escavador/PJe/INPI/DOU; GDPR/CCPA → LGPD; US employment → CLT; US patent → LPI; torts/consumer → Código Civil/CDC. Regime US mantido só como seção de fallback explicitamente gated.

**Tiering de modelo** nos cookbooks: `claude-sonnet-4-6` para análise/julgamento/orquestração, `claude-haiku-4-5` para leitura/normalização/cálculo/template. Sweep de ids: `scripts/bump-models.sh`.

---

## Histórico de adaptação

Três ondas de adaptação US→BR + dois audits adversariais (segurança/citação) + uma reorientação de produto (marketplace por área, gate invertido para genérico-primeiro, `/bom-dia`, guardrail como lint). Detalhe das correções de exatidão jurídica e da taxonomia de proveniência: ver histórico de commits e [ARCHITECTURE.md](ARCHITECTURE.md).

**Ainda lawyer-verify antes de uso high-stakes:** citações tagueadas `[verify]`/`[settled]`, e a granularidade de PJe por tribunal (cada TJ/TRF roda instância própria, sem endpoint federado — os conectores usam as APIs públicas federadas do CNJ, DataJud/DJEN, que não incluem autos nem processos sigilosos).
