# Arquitetura — claude-legal-br

Monorepo de plugins jurídicos para o Brasil, adaptado do *Claude for Legal* da Anthropic. Cada domínio é um **plugin standalone** com seu próprio `CLAUDE.md`, `README.md`, `.mcp.json` e `.claude-plugin/plugin.json` (todos em v1.0.2).

## Taxonomia de domínios (13)

| Domínio | Persona | Escopo |
|---|---|---|
| `commercial-legal` | Jurídico comercial in-house | Contratos com fornecedores/clientes, NDA, MSA/SaaS |
| `corporate-legal` | Societário / M&A | Atas, diligência, consentimentos, closing |
| `employment-legal` | Trabalhista | CLT, CCTs, rescisões, investigações internas |
| `privacy-legal` | Privacidade / DPO | LGPD, DPA, titulares, ANPD |
| `product-legal` | Product counsel | Revisão de produto, termos de uso |
| `ip-legal` | Propriedade intelectual | Marcas, patentes, clearance, C&D |
| `litigation-legal` | Contencioso | Cronologias, peças, preservação de documentos |
| `regulatory-legal` | Regulatório | Monitoramento de feeds, gap analysis |
| `ai-governance-legal` | Governança de IA | Inventário de IA, AIA, triagem de casos de uso |
| `law-student` | Estudante de Direito | Estudo, IRAC, flashcards, simulados |
| `legal-clinic` | NPJ / clínica jurídica | Supervisão de estagiários, cartas, prazos |
| `legal-builder-hub` | Admin do plugin | Instalar/gerenciar skills, QA |
| `external_plugins/cocounsel-legal` | Pesquisa profunda | Deep research jurídico (upstream) |

Diretórios não-domínio: `skills/` (comandos core do plugin raiz: review-contract, triage-nda, brief, etc.), `references/` (templates compartilhados), `scripts/` (validação e deploy de managed agents), `managed-agent-cookbooks/`.

## Padrões estruturais

- **Skills replicadas por design**: `customize`, `cold-start-interview` e `matter-workspace` existem em ~12 domínios com conteúdo *parametrizado por domínio* (não idêntico — cada um referencia o perfil, os paths e os skills do próprio plugin). Isso mantém cada plugin instalável isoladamente. **Não consolidar** sem quebrar o modelo standalone; mudanças no padrão devem ser propagadas aos 12.
- **Guardrails canônicos vivem no `CLAUDE.md` de cada domínio** (seção "Shared guardrails"): atribuição de fontes, no-silent-supplement, destination check, severity floor, jurisdiction recognition, retrieved-content trust. Skills podem repetir, mas o CLAUDE.md controla em conflito. O processo de escalonamento consolidado está em [references/escalation-process.md](references/escalation-process.md).
- **References por skill**: skills complexos carregam sua própria pasta `references/` (ex.: `corporate-legal/skills/tabular-review/references/excel-output.md`). Links relativos resolvem dentro do skill.
- **Config em runtime**: skills leem perfis em `~/.claude/plugins/config/claude-for-legal/<domínio>/CLAUDE.md`, preenchidos pelo `cold-start-interview` de cada plugin.

## Interdependências entre domínios

- `legal-builder-hub` gerencia (instala/desabilita/QA) skills dos demais.
- `employment-legal` investigation-* skills delegam ao reference skill `internal-investigation` do próprio domínio.
- Handoffs declarados em texto (ex.: policy-drafting → handbook-updates) são intra-domínio. **Não há dependências circulares entre domínios.**

## Estado de localização BR

O core (READMEs, CLAUDE.md dos domínios, playbook) está adaptado ao direito brasileiro (LGPD, CLT, CDC, Código Civil, Lei 14.133/2021, Estatuto da OAB). Alguns skills ainda carregam substância US-centric — ver backlog em `README.md` § Localização.

## Como adicionar um domínio

1. Copie a estrutura de um domínio existente (`CLAUDE.md`, `README.md`, `.mcp.json`, `.claude-plugin/plugin.json`, `skills/`).
2. Inclua as skills padrão parametrizadas: `cold-start-interview`, `customize`, e `matter-workspace` (se multi-cliente).
3. Reescreva o `CLAUDE.md` com o perfil da prática, mantendo intactas as seções compartilhadas (Shared guardrails, Outputs, Jurisdiction recognition).
4. Registre o domínio na tabela acima e no decision tree do `README.md`.
