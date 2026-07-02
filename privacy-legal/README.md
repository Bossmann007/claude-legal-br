# Plugin de Privacidade e Proteção de Dados (LGPD)

Fluxos de trabalho para equipe de privacidade in-house sob a **LGPD (Lei 13.709/2018)**: revisão de contratos de tratamento de dados (equivalente brasileiro à DPA), atendimento a requisições de titular (Art. 18), geração de Relatório de Impacto à Proteção de Dados (RIPD/DPIA — Art. 38 e Res. CD/ANPD nº 18/2024), e análise de gap regulatório frente à ANPD. Construído em torno de um perfil de prática aprendido a partir da sua política de privacidade real, modelo de contrato de tratamento e um RIPD de referência.

**Every output is a draft for attorney review — cited, flagged, and gated — not a legal conclusion.** The plugin does the work: reads the documents, applies your playbook, finds the issues, drafts the memo. A lawyer reviews, verifies, and decides. Citations are tagged by source so you know which ones came from a research tool and which ones need checking. Privilege markers are applied conservatively so nothing waives by accident. Consequential actions — filing, sending, executing — are gated behind explicit confirmation.

## Who this is for

| Role | Primary workflows |
|---|---|
| **Privacy counsel** | DPA review, PIA sign-off, reg gap analysis |
| **Privacy program manager** | DSAR handling, PIA intake, vendor privacy review |
| **Product counsel** | PIA generation for launches |
| **Support / CS** | DSAR first-line response (with escalation) |

## Primeira execução: entrevista de cold-start

O plugin entrevista você para aprender: você é controlador ou operador (Art. 5º, VI/VII LGPD), quais regulações realmente se aplicam (LGPD é a base; avaliar GDPR/CCPA se houver operação internacional), o que você aceita ou não em um contrato de tratamento de dados. Depois lê três documentos-semente — sua política de privacidade, seu modelo de contrato de tratamento, um RIPD (relatório de impacto) que você aprova — e aprende suas posições reais e estilo de casa.

Your configuration is stored at `~/.claude/plugins/config/claude-for-legal/privacy-legal/CLAUDE.md` and survives plugin updates.

```
/privacy-legal:cold-start-interview
```

## Commands

| Command | Does |
|---|---|
| `/privacy-legal:cold-start-interview` | Cold-start interview |
| `/privacy-legal:use-case-triage [activity]` | Precisa de RIPD/DPIA? Classificação rápida + condições, com base na hipótese legal do Art. 7º LGPD |
| `/privacy-legal:dpa-review [file]` | Revisa contrato de tratamento de dados contra seu playbook (detecta direção automaticamente: controlador ou operador) |
| `/privacy-legal:dsar-response` | Conduz atendimento a requisição de titular (Art. 18 LGPD) e redige a resposta dentro do prazo |
| `/privacy-legal:pia-generation [feature]` | Gera RIPD (Relatório de Impacto à Proteção de Dados) no seu formato de casa |
| `/privacy-legal:reg-gap-analysis [regulation]` | Compara nova norma da ANPD contra política/prática atual |
| `/privacy-legal:policy-monitor` | Weekly sweep for policy drift, or direct query for a proposed new practice |
| `/privacy-legal:matter-workspace` | Manage matter workspaces (multi-client private practice only) — new, list, switch, close, none |

## Skills

| Skill | Purpose |
|---|---|
| **cold-start-interview** | Writes CLAUDE.md from interview + seed docs |
| **use-case-triage** | Does this need a PIA / DPIA / can it proceed? Policy conflict check + handoffs |
| **dpa-review** | Bi-directional (processor/controller) DPA term-by-term review |
| **dsar-response** | Identity verification → system walk → exemptions → response draft |
| **pia-generation** | PIA in house format, with policy consistency check |
| **reg-gap-analysis** | New reg vs. current state, remediation plan |
| **policy-monitor** | Crawls outputs for practice drift; drafts policy language updates |
| **matter-workspace** | Create, list, switch, and close matter workspaces for multi-client practices; isolates each client/matter so context does not leak across them |

## Quick start

### 1. Setup

```
/privacy-legal:cold-start-interview
```

Have ready: your public privacy policy URL, your standard DPA, one reference PIA.

### 2. Triar nova funcionalidade ou atividade de tratamento

```
/privacy-legal:use-case-triage "Marketing quer usar dados comportamentais para personalização de anúncios"
```

Saída: PODE PROSSEGUIR / RIPD NECESSÁRIO / RIPD OBRIGATÓRIO (alto risco, Art. 38 LGPD) / PARAR — com tabela de condições, pergunta sobre hipótese legal aplicável (Art. 7º — consentimento, legítimo interesse, execução de contrato, cumprimento de obrigação legal, etc.), e oferta de iniciar o RIPD na mesma conversa.

### 3. Revisar contrato de tratamento de dados de cliente

```
/privacy-legal:dpa-review contrato-cliente.pdf
```

Saída: direção detectada automaticamente, termo a termo contra o playbook, redlines propostas, checagem de consistência com a política de privacidade e com o Art. 42 LGPD (responsabilidade e direito de regresso).

### 4. Atender requisição de titular (Art. 18 LGPD)

```
/privacy-legal:dsar-response
```

Conduz: classificar direito invocado → verificar identidade → localizar dados nos sistemas → avaliar exceções (Art. 18, §4º e hipóteses de sigilo/segredo comercial) → redigir resposta dentro do prazo. Usa a lista de sistemas da sua CLAUDE.md de configuração.

### 5. Gerar RIPD para nova funcionalidade

```
/privacy-legal:pia-generation "Funcionalidade de compartilhamento de localização"
```

Perguntas de intake → RIPD no seu formato de casa (Art. 38 LGPD + Res. CD/ANPD nº 18/2024) → diff de política → lista de condições.

## Como o plugin aprende

Seu perfil de prática em `~/.claude/plugins/config/claude-for-legal/privacy-legal/CLAUDE.md` não é estático — melhora conforme você usa o plugin. As skills avisam quando uma saída usou um padrão que você deveria ajustar. A skill `policy-monitor` observa desvio entre sua política e sua prática real e propõe atualizações. Você pode reexecutar o setup, editar o arquivo diretamente, ou pedir a uma skill que registre uma nova posição.

## File structure

```
privacy-legal/
├── .claude-plugin/plugin.json
├── .mcp.json
├── CLAUDE.md
├── README.md
├── skills/
│   ├── cold-start-interview/
│   ├── use-case-triage/
│   ├── dpa-review/
│   ├── dsar-response/
│   ├── pia-generation/
│   ├── reg-gap-analysis/
│   ├── policy-monitor/
│   └── matter-workspace/
└── hooks/hooks.json
```

## Notas

- Revisão de contrato de tratamento é bidirecional: a mesma skill trata contratos de cliente (defender flexibilidade operacional, como operador) e contratos de fornecedor (proteger os dados, como controlador). Direção detectada automaticamente, ou pergunte.
- Formato do RIPD vem do seu RIPD-semente. Se você não forneceu um durante o setup, usa estrutura genérica alinhada ao guia da ANPD — reexecute o setup com um RIPD de referência para corrigir.
- Análise de gap (`reg-gap-analysis`) trata normas novas da ANPD chegando. Policy monitor trata desvio interno de prática. Ferramentas diferentes para direções diferentes de mudança.
- Policy monitor exige pasta de outputs configurada (definida no setup) para a varredura funcionar. Modo de consulta direta funciona sem isso.
- **Transferência internacional de dados (Art. 33 LGPD):** qualquer fluxo de dados para fora do Brasil deve ser sinalizado — exige cláusula-padrão contratual, selo/certificado emitido pela ANPD, regras corporativas globais aprovadas, ou uma das hipóteses do Art. 33 (consentimento específico do titular, cumprimento de obrigação legal, execução de política pública, etc.). Sinalizar `[review]` sempre que o contrato de tratamento envolver processamento fora do território nacional.
