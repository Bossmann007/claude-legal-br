---
name: terms-of-use-privacy-review
description: >
  Revisão de Termos de Uso e Política de Privacidade de plataforma digital
  sob Marco Civil da Internet (Lei 12.965/2014) e LGPD (Lei 13.709/2018):
  guarda de logs, responsabilidade de provedor, consentimento, cookies.
user-invocable: true
argument-hint: "[cola Termos + Política, ou link para arquivo]"
---

# Terms of Use & Privacy Policy Review

## Matter context

**Matter context.** Check `## Matter workspaces` in the practice-level CLAUDE.md. If `Enabled` is `✗` (the default for in-house users), skip the rest of this paragraph — skills use practice-level context and the matter machinery is invisible. If enabled and there is no active matter, ask: "Which matter is this for? Run `/digital-ecommerce-legal:matter-workspace switch <slug>` or say `practice-level`." Load the active matter's `matter.md` for matter-specific context and overrides. Write outputs to the matter folder at `~/.claude/plugins/config/claude-for-legal/digital-ecommerce-legal/matters/<matter-slug>/`.

---

## Purpose

Termos de Uso de plataforma digital (loja online, SaaS, marketplace) e sua Política de Privacidade devem estar alinhados com duas leis: o Marco Civil da Internet (Lei 12.965/2014) e a LGPD (Lei 13.709/2018). [model knowledge — verify]

Esta skill revisa ambos os documentos contra esse framework. Identifica gaps, conflitos, e riscos regulatórios.

## Jurisdiction assumption

**Premissa de jurisdição (Brasil):**

- **Marco Civil (Lei 12.965/2014):** Aplicável a "provedor de internet" (Art. 5º [model knowledge — verify]) — qualquer pessoa física ou jurídica que presta serviço de internet a usuários, incluindo lojas online e marketplaces. O Marco fixa responsabilidade civil dos provedores por conteúdo de terceiro (Art. 19 — isenção se cumprir seus Termos e Lei; Art. 20 — isenção condicional a "conhecimento prévio" de ilegalidade [model knowledge — verify]; Art. 21 — responsabilidade solidária do provedor que se beneficia da violação [model knowledge — verify]). Aplicável também guardar logs de acesso (Art. 13 — até 6 meses, prorrogável judicialmente [model knowledge — verify]). Direitos do usuário incluem anonimato (Art. 9º [model knowledge — verify]), inviolabilidade da privacidade (Art. 7º, I [model knowledge — verify]).

- **LGPD (Lei 13.709/2018):** Aplicável a "controlador" (Art. 5º, VI [model knowledge — verify]) e "operador" (Art. 5º, VII [model knowledge — verify]). Loja online é controladora dos dados de cliente. Marketplace pode ser controlador ou operador dependendo do modelo. LGPD exige: base legal para cada finalidade (Art. 7º [model knowledge — verify]), consentimento informado (Art. 8º [model knowledge — verify]), transparência (Art. 9º [model knowledge — verify]), direitos do titular (Art. 18 [model knowledge — verify]), responsabilidade (Art. 42 [model knowledge — verify]). Transferência internacional de dados pessoais exige cláusula-padrão contratual ou país com decisão de adequação (Art. 33 [model knowledge — verify]).

> **No silent supplement.** If a research query to the configured legal research tool (JusBrasil, Escavador) returns few or no results for a Marco Civil or LGPD requirement, report what was found and stop. Do NOT fill the gap from web search or model knowledge without asking.

## Load the playbook

Read `~/.claude/plugins/config/claude-for-legal/digital-ecommerce-legal/CLAUDE.md` first. Any specific positions the team has on what constitutes acceptable Terms (e.g., limitation of liability approach, arbitration yes/no, user dispute handling) apply to this review.

## The review

### Part 1: Marco Civil Compliance

- **Art. 19 — Safe harbor for user-generated content.** Does the Terms say the platform is NOT liable for content posted by users unless the platform knew in advance and didn't remove it?
- **Art. 20 — Conditional safe harbor.** Does Terms require removal upon notification of illegality? Is the requirement clear?
- **Art. 13 — Logs and data retention.** Does Terms say platform keeps access logs for how long? (Art. 13 requires up to 6 months [model knowledge — verify])
- **Art. 7º, I — User privacy.** Does the Terms respect user privacy? Does it disclose what monitoring happens?

### Part 2: LGPD Compliance

- **Art. 5º, VI/VII — Controller and operator.** Who is the controller? Who is the operator? Is this clear?
- **Art. 7º — Lawful basis for each purpose.** For each data collection, is there a lawful basis (consent, contract, legal obligation, legitimate interest)?
- **Art. 8º — Consent.** If consent is the basis: is it informed? Separate from other contract terms? Can the user withdraw it?
- **Art. 9º — Transparency.** Does Terms disclose what data is collected, who it's shared with, and for how long?
- **Art. 18 — Data subject rights.** Does Terms acknowledge user's right to access, correct, delete, port, and object to data processing?
- **Art. 33 — International transfers.** If data goes to other countries, is that disclosed? Are there proper legal mechanisms?

### Part 3: Marco Civil + LGPD alignment

- **Does the Terms conflict with the Privacy Policy?** (E.g., Terms says "we never share data" but Privacy Policy says "we share with partners.") 🔴 Blocking conflict.
- **Does the Terms set Rules that violate LGPD?** (E.g., "we reserve the right to delete your account without notice" — may violate Art. 18.) Flag for attorney judgment. `[review]`
- **Is there a Data Processing Addendum (DPA)?** (If users are businesses and platform processes data on their behalf, a DPA is needed under Art. 5º, VII.) If missing, flag.

## Output

Format as a checklist summary + detailed findings. Highlight blocking issues (🔴), warnings (🟡), and clear items (✅).

## What this skill does not do

- It doesn't review marketing claims for truthfulness.
- It doesn't audit code or data security.
- It doesn't negotiate with third-party vendors on your behalf.
