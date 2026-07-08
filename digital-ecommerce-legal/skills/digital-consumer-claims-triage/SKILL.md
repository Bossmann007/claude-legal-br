---
name: digital-consumer-claims-triage
description: >
  Triagem de reclamação de consumidor em ambiente digital (cobrança indevida,
  propaganda enganosa, falha na entrega, chargeback). Análise de mérito e opções
  de resposta. Rascunho para revisão de advogado.
user-invocable: true
argument-hint: "[cola a reclamação ou descreva o caso]"
---

# Digital Consumer Claims Triage

## Matter context

**Matter context.** Check `## Matter workspaces` in the practice-level CLAUDE.md. If `Enabled` is `✗` (the default for in-house users), skip the rest of this paragraph — skills use practice-level context and the matter machinery is invisible. If enabled and there is no active matter, ask: "Which matter is this for? Run `/digital-ecommerce-legal:matter-workspace switch <slug>` or say `practice-level`." Load the active matter's `matter.md` for matter-specific context and overrides. Write outputs to the matter folder at `~/.claude/plugins/config/claude-for-legal/digital-ecommerce-legal/matters/<matter-slug>/`.

---

## Purpose

When a consumer makes a complaint via chat, email, or a platform like Reclame Aqui, the team needs a quick triage: Is the claim valid? What's the exposure? What are our response options?

This skill takes the complaint, applies the relevant law (CDC art. 37, 39, 49, Decreto 7.962/2013, Marco Civil art. 19), and produces a triage memo with legal merit assessment + recommended response.

## Jurisdiction assumption

**Premissa de jurisdição (Brasil):**

- **CDC Art. 37 — Publicidade enganosa:** Qualquer propaganda que induz o consumidor a erro sobre características do produto. Sanção: anulação + reparação. `[CORRECTION NEEDED: fonte confirma publicidade enganosa/abusiva e erro sobre características, mas Art. 37 não diz "sanção: anulação + reparação" — https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm]`

- **CDC Art. 39 — Práticas abusivas:** (I) Exigir pagamento de quantidade não solicitada; (II) Elevar o preço no checkout sem aviso; (III) Condicionar a compra a bens/serviços não solicitados; (IV) Aplicar multa contratual desproporcional; (V) Colocar cliente em situação de inferioridade. `[CORRECTION NEEDED: fonte diz I = venda casada/limites quantitativos, II = recusar atendimento, III = enviar/entregar sem solicitação, IV = prevalecer-se de fraqueza/ignorância, V = exigir vantagem manifestamente excessiva — https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm]`

- **CDC Art. 49 — Direito de arrependimento:** Consumidor pode desistir da compra no prazo de 7 dias (corridos, não úteis [verified: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm]). Se o cliente reclama 6 dias após a compra, direito existe. Se reclama 8 dias, prescrição completou.

- **Decreto 7.962/2013:** Fornecedor é responsável pela entrega até o consumidor receber. Se o produto não chegar ou chegar com defeito, é ato do fornecedor. `[CORRECTION NEEDED: fonte confirma dever de informar forma e prazo de entrega/disponibilização no Art. 2º, V, mas não diz essa regra ampla de responsabilidade por entrega até recebimento — https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm]`

> **No silent supplement.** If a research query returns few results for a CDC article or Decreto 7.962 provision, report what was found and stop. Do NOT invent case law or assert a rule you're unsure of. Instead, ask the user / attorney.

## Load the playbook

Read `~/.claude/plugins/config/claude-for-legal/digital-ecommerce-legal/CLAUDE.md` first. Any standing positions on claims (e.g., "we always refund COD orders within 48h", "we dispute chargebacks if order was shipped") apply to this triage.

## The triage

### Step 1: Classify the claim type

| Type | CDC article | Key question |
|---|---|---|
| **Cobrança indevida** | Art. 39, I | Was the customer charged for something they didn't request? |
| **Propaganda enganosa** | Art. 37 | Did our ad claim something the product doesn't do? |
| **Alteração de preço no checkout** | Art. 39, II | Did we show one price in the catalog and a different price in the cart/invoice? |
| **Falha na entrega** | Decreto 7.962/2013 Art. 15 | Did we fail to deliver on the promised date or at all? |
| **Produto defeituoso / não conforme** | CDC Art. 20 | Is the product broken or not what was promised? |
| **Recusa de devolução / arrependimento** | CDC Art. 49 | Did we refuse to allow a 7-day return? |
| **Chargeback** | Banking / Art. 39 | Consumer did a chargeback — did they have a legitimate reason? |

### Step 2: Assess the claim on legal merit

**High-risk claims** (we likely lose if this goes to court):

- "I requested a refund within 7 days and you refused" → **We lose.** Art. 49 is non-waivable. `[verified: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm]`
- "Your ad said 'guaranteed to work' and it doesn't; I want a refund" → **We lose if we can't prove it works.** Art. 37 shifts burden of proof to advertiser. `[CORRECTION NEEDED: Art. 37 define/proíbe publicidade enganosa; ônus da prova da veracidade/correção da informação publicitária é Art. 38 CDC — https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm]`
- "I never authorized this charge" + "It appeared on my card statement" → **We lose if we can't prove authorization.** Chargeback is often correct.
- "You charged me twice" → **We lose.** This is Art. 39, I — unsolicted charging. Refund + damages. `[CORRECTION NEEDED: Art. 39, I trata de venda casada/limites quantitativos; envio/fornecimento sem solicitação está no Art. 39, III, e cobrança indevida é tratada no Art. 42, parágrafo único — https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm]`

**Medium-risk claims** (defense exists but gray):

- "The package arrived 8 days late; I want compensation" → Depend on what Termos says; if "3-5 days" promised and it took 13, we're liable for breach but damages are unclear. `[review]`
- "You said 'free shipping' but added a $10 fee at checkout" → Likely violation of Art. 39, II. Refund of fee is minimum. `[CORRECTION NEEDED: Art. 39, II trata de recusar atendimento às demandas do consumidor; a fonte não confirma a caracterização indicada como Art. 39, II — https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm]`

**Low-risk claims** (we have a defense):

- "I regret buying after 8 days" → We have defense: 7-day window closed. But be nice — may offer partial refund as retention play.
- "The product has a small scratch" → If we disclosed "cosmetic wear" in photo, we have defense. If undisclosed, it's non-conformity (CDC Art. 20) and repair/replacement/refund applies. `[review]`

### Step 3: Response options

1. **Refund** — Use if: high-risk claim, low-dollar amount, or customer service recovery.
2. **Refund with Terms clarification** — Use if: medium-risk claim + Terms actually supports our position.
3. **Repair / replacement** — For defect claims; often better than refund.
4. **Deny + escalate to attorney** — Use if: claim is clearly baseless + customer is unreasonable. ⚠️ Requires attorney approval.
5. **Escalate to dispute resolution** — If customer threatens escalation or files PROCON complaint.

## Consequential-action gate

**Before recommending "deny" or escalating to legal action:**

Read `## Who's using this` in `~/.claude/plugins/config/claude-for-legal/digital-ecommerce-legal/CLAUDE.md`. If the Role is Non-lawyer:

> Recommending denial or escalation is a legal decision with business consequences (reputational risk, potential lawsuit, regulatory scrutiny). Have you reviewed this with your attorney? If yes, proceed. If no, here's a brief: [Claim type, legal merit (high/medium/low risk), aggravating factors, recommended response, reason for that response.]

Do not recommend "deny" or "escalate to arbitration" without explicit attorney approval.

## Output

Format as a brief triage report with claim summary, legal merit assessment (🔴 high-risk | 🟠 medium | 🟢 low), and recommended next step.

## What this skill does not do

- It doesn't represent the company in actual disputes or litigation — that requires a lawyer.
- It doesn't generate formal responses for regulatory bodies (PROCON, ANPD, etc.) — that's attorney work.
- It doesn't assess the reputational impact of refusal — that's a business/marketing call.
