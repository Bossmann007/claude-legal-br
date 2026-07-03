# Banca Simulada — managed-agent template

## Overview

Adversarial pre-filing review: a draft petição (complaint/response) is routed to three specialized subagents that simulate the perspectives of the judge, opposing counsel, and a synthesizer. The judge-agent reads the draft and raises what a judge would question — competência, legitimidade, interesse, pedido genérico. The opposing-counsel-agent raises the strongest defenses/preliminary objections (CPC art. 337 [model knowledge — verify]) the other side would file. The synthesizer-agent consolidates findings into a fix-list before filing. This packages the adversarial-audit pattern as a product for pre-protocolo review, ensuring the petição survives the threshold gatekeeping motions (moções preliminares, exceções de incompetência, etc.).

## ⚠️ Before you deploy

- **Banca Simulada is not opposing counsel.** The agents simulate what a judge or opposing counsel would question, not what they will accept as strategy or settlement. A petição that passes Banca Simulada review may still lose on merits.
- **Judge-agent raises procedural defects only.** The judge-agent flags threshold issues (jurisdiction, standing, claim specificity) that could result in dismissal. It does not opine on underlying claim strength.
- **Opposing counsel agent raises CPC art. 337 defenses.** These are preliminary objections and special defenses (incompetence, improper venue, lack of legitimacy, res judicata, statute of limitations, etc.) at the threshold, not affirmative defenses on merits.
- **Fix-list is pre-filing only.** Once a petição is filed, these issues become part of the record. Fixing requires amendment (emenda à inicial, CPC art. 302 [model knowledge — verify]), which may be barred after contestação.
- **Local rules matter.** Every tribunal (TJ, TRF, TST) has its own regimento interno and provimentos. The agents simulate general CPC doctrine; local deviations require manual review.

## Deploy

```bash
export ANTHROPIC_API_KEY=sk-ant-...
../../scripts/deploy-managed-agent.sh banca-simulada
```

## Subagents

Three agents work in sequence:

| Agent | Input | Output | Tools | Purpose |
|---|---|---|---|---|
| **agente-juiz** | Draft petição + context | JSON: procedural defects flagged per rule | Read, Grep | Raises threshold issues (jurisdiction, standing, claim specificity) |
| **agente-parte-contraria** | Draft petição + context | JSON: CPC art. 337 defenses per category | Read, Grep | Raises strongest preliminary objections |
| **agente-sintese** | All three outputs + original petição | Markdown: consolidated fix-list + priority | Read, Write, Grep | Consolidates into action items before filing |

## Adaptation notes

This cookbook is a starting point. Before production:

- **Load the complaint/response draft.** `.md` or `.docx` plaintext of peça inicial (complaint), contestação (response), reconvenção (counterclaim).
- **Set the matter context.** Parties, jurisdiction (TJ/TRF specific), tribunal, judge (if assigned), dispute category (contract, labor, consumer, etc.).
- **Calibrate the judge-agent rule set.** Applies CPC rules generically. Wire with the specific tribunal's provimentos and recent decisões-padrão.
- **Calibrate the opposing-counsel-agent defense checklist.** Weights CPC art. 337 defenses by dispute category. Update for your tribunal's patterns.
- **Wire delivery.** Slack notification, PDF report, flag in docket-watcher feed, etc.
- **Set the schedule.** Pre-filing review only — run on demand or 24 hours before filing deadline.

## Computed suggestions are leads, not conclusions

**Every suggestion from Banca Simulada requires attorney judgment.** The judge-agent may flag "pedido genérico," but the attorney may have drafted intentionally broad. The opposing-counsel-agent may flag "statute of limitations," but the attorney may have a tolling argument. Banca Simulada is upstream of filing, not a substitute.

## Workflow

1. **User uploads draft petição** → `draft-complaint.md` or `draft-complaint.docx`.
2. **Skill captures context:** parties, jurisdiction, judge (if assigned), dispute category, applicable statutes.
3. **Agente-juiz runs:** Flags procedural defects per CPC (jurisdiction, standing, claim specificity, capacity, representation). Returns JSON: issue, rule, severity, fix suggestion.
4. **Agente-parte-contraria runs:** Flags strongest CPC art. 337 defenses (incompetence, improper venue, lack of legitimacy, statute of limitations, etc.). Returns JSON: defense, rule, evidence, strength.
5. **Agente-sintese runs:** Consolidates both outputs + original draft into markdown fix-list with priority (🔴 blocking / 🟠 high / 🟡 medium / 🟢 low). Lists each issue, rule, fix, and effort estimate.
6. **Output:** markdown report + optional JSON for further processing.

## Security & isolation

Draft petições contain PII, client facts, confidential strategies, and untrusted input (e.g., quoted opposing counsel briefs). Three-tier isolation:

| Tier | Touches draft? | Tools | Purpose |
|---|---|---|---|
| **agente-juiz** | **Yes** | Read, Grep only | Procedural analysis; returns structured flags |
| **agente-parte-contraria** | **Yes** | Read, Grep only | Defense analysis; returns structured flags |
| **agente-sintese** | **All three** | Read, Write, Grep | Synthesizes; writes markdown report |

All agents avoid free-text narration about draft content. Output is structured (JSON from juiz/contra; markdown from sintese) so attorney review focuses on issues, not agent commentary.

## What this cookbook does not do

- **It does not conclude on the merits.** Flags procedural defects and likely threshold defenses only.
- **It does not replace attorney review.** Every flagged issue requires attorney judgment.
- **It does not account for attorney strategy.** A claim drafted broadly intentionally may be flagged as "pedido genérico" — the attorney may override.
- **It does not ensure filing deadlines are met.** Running Banca Simulada takes time. Run early.
- **It does not substitute for local counsel.** If filing in unfamiliar tribunal, have local counsel review both draft and Banca Simulada output.
