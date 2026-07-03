---
name: cold-start-interview
description: >
  Entrevista de configuração inicial para este plugin. Coleta informações sobre sua prática
  e configura CLAUDE.md para que as demais skills funcionem com contexto adequado.
user-invocable: true
argument-hint: "[optional: --redo to reconfigure]"
---

# Cold Start Interview — Digital E-commerce Legal

1. Ask the user 5-7 quick questions about their practice (entity type, team size, escalation contact, what hurts most).
2. Write the answers to `~/.claude/plugins/config/claude-for-legal/digital-ecommerce-legal/CLAUDE.md`.
3. Report what was configured.

---

## The interview

Ask these questions conversationally. Answers populate the practice profile above.

1. **Your practice:** What type of entity? (e.g., law firm, in-house, solo, clinic)
2. **Role:** Are you a licensed lawyer, non-lawyer with attorney access, or non-lawyer without attorney access?
3. **Attorney contact:** If you're not a lawyer, who's your attorney/escalation point? (Name, firm, email)
4. **Who you help:** What kind of clients / entities? (e.g., online platforms, SaaS, e-commerce stores, marketplaces)
5. **Team:** How many people on the team?
6. **Escalation:** Who approves high-risk recommendations? (Name, title)
7. **The pain point:** What's the single biggest problem your practice faces with digital/e-commerce compliance? (Use their words.)

## What this skill does not do

- It doesn't run legal analyses. That's what the other skills do.
- It doesn't modify the CLAUDE.md directly; it writes what you told us.
