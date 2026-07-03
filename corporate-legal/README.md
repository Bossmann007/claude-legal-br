# Plugin de Direito Societário / Corporate — Jurisdição Brasileira

Fluxos de trabalho de jurídico corporativo in-house em quatro áreas: operações de M&A, conselho e secretaria societária, governança de companhia aberta, e gestão de entidades. Ativa só os módulos relevantes para sua função. A entrevista de cold-start é modular — pergunta o necessário por área ativa e escreve só as seções relevantes no seu perfil de prática.

**Este plugin não inclui conector automático para PJe/e-SAJ/Projudi/DataJud; os dados são inseridos manualmente (colados ou enviados como upload).**


**Toda saída é um rascunho para revisão de advogado — citado, sinalizado e aprovado — não uma conclusão legal.** O plugin faz o trabalho: lê os documentos, aplica seu manual, identifica os problemas, redige o memorando. Um advogado revisa, verifica e decide. Citações são marcadas pela fonte. Marcadores de sigilo são aplicados conservadoramente. Ações consequentes — protocolo, envio, execução — são controladas atrás de confirmação explícita.

## Quem deve usar

| Função | Módulos ativos |
|---|---|
| **Advogado(a) de M&A in-house** | M&A |
| **Secretário(a) societário(a) / assistente** | Conselho & Secretaria |
| **GC de companhia aberta (S.A. de capital aberto, CVM)** | M&A + Companhia Aberta + Conselho & Secretaria |
| **GC de empresa privada (Ltda. ou S.A. fechada)** | M&A + Conselho & Secretaria + Gestão de Entidades |
| **Jurídico operacional / GC solo** | O que for aplicável — combine livremente |

## Primeira execução

```
/corporate-legal:cold-start-interview
```

Percorre a seleção de módulos, depois uma entrevista curta e direcionada para cada área ativa. Escreve um `~/.claude/plugins/config/claude-for-legal/corporate-legal/CLAUDE.md` modular, só com as seções relevantes. Sua configuração fica salva nesse caminho e sobrevive a atualizações do plugin.

Setup por operação (só módulo M&A):

```
/corporate-legal:cold-start-interview --new-deal
```

## Comandos

| Comando | Faz |
|---|---|
| `/corporate-legal:cold-start-interview` | Cold-start modular, ou `--new-deal` / `--module [m&a \| board \| public \| entities]` |
| `/corporate-legal:diligence-issue-extraction [pasta]` | Lê docs do VDR, extrai issues no formato da casa |
| `/corporate-legal:tabular-review` | Revisão tabular — uma linha por documento, uma coluna por ponto de dado, toda célula citada à fonte, saída Excel |
| `/corporate-legal:material-contract-schedule` | Cronograma de contratos relevantes a partir dos achados de diligence |
| `/corporate-legal:closing-checklist` | Checklist de fechamento — o que está bloqueando, caminho crítico |
| `/corporate-legal:written-consent` | Deliberação por escrito (consentimento unânime) — rascunho por precedente + tracker de assinantes |
| `/corporate-legal:entity-compliance` | Tracker de compliance societário — init, report, update, audit, export |
| `/corporate-legal:integration-management` | Plano de integração pós-fechamento, tracker de anuências (Art. 299 CC — assunção de dívida), cessão contratual, relatórios de status |
| `/corporate-legal:matter-workspace` | Gerencia workspaces de matéria (só prática multi-cliente) — new, list, switch, close, none |

## Pré-requisitos

Vários recursos referenciam integrações com Slack, Google Drive, SharePoint, Box, Intralinks ou Datasite. Isso exige servidores MCP configurados no seu ambiente — **não vêm empacotados com o plugin**. Sem eles, o plugin cai para saída em arquivo (rascunhos escritos localmente em vez de postados num canal, arquivos de tracker escritos em disco em vez de lidos de um repositório conectado).

Configure servidores MCP em `.mcp.json` no nível do repo ou do usuário. Skills e agents detectam o que está disponível em tempo de execução e ajustam o comportamento.

**Nota Brasil:** para atos societários que exigem registro (alteração contratual, ata de assembleia), o prazo legal de 30 dias para arquivamento na Junta Comercial (Art. 36, Lei 8.934/1994) corre independente de qualquer integração — o plugin não substitui o protocolo na Junta.

## Skills

| Skill | Módulo | Propósito |
|---|---|---|
| **cold-start-interview** | Todos | Entrevista modular — ativa só as seções relevantes |
| **diligence-issue-extraction** | M&A | Docs do VDR → issues no formato da casa, por categoria |
| **tabular-review** | M&A | Revisa um conjunto de documentos contra um schema de colunas tipado; células citadas; saída `.xlsx` / `.csv` / markdown; alimenta material-contract-schedule |
| **deal-team-summary** | M&A | Briefs em camadas: executivo / líder da operação / time de trabalho |
| **material-contract-schedule** | M&A | Cronograma de divulgação por definição do contrato de compra e venda |
| **closing-checklist** | M&A | Auto-atualizável: absorve achados de diligence e do cronograma |
| **ai-tool-handoff** | M&A | Integração Luminance/Kira — extração em massa + camada de QA |
| **board-minutes** | Conselho & Secretaria | Reuniões detectadas por calendário → rascunho de ata no formato da casa (Art. 1.075, §1º, Código Civil — Ltda.; Art. 130, Lei 6.404/1976 — S.A.) |
| **written-consent** | Conselho & Secretaria | Deliberação por escrito com busca de precedente no repositório de consentimentos; alerta de escopo pra atos relevantes pontuais |
| **entity-compliance** | Gestão de Entidades | Tracker de calendário de compliance (YAML); prazos de arquivamento por entidade e Junta Comercial estadual; auditoria de saúde; ingestão de relatório de registro; export CSV |
| **integration-management** | M&A | Tracker de integração pós-fechamento; plano faseado (Dia 1/30/90/180); tracker de anuências obrigatórias (Art. 299, Código Civil — assunção de dívida) com prazos do contrato de compra e venda; cessão contratual em escala (repositório ou lista manual); relatórios semanais de status |
| **matter-workspace** | Cria, lista, alterna e fecha workspaces de matéria pra práticas multi-cliente; isola contexto de cada cliente/matéria pra não vazar entre eles |

*Skills de Companhia Aberta (S.A. CVM) chegam no próximo release.*

## Comandos interativos vs. agents agendados

Os comandos acima rodam quando você invoca — pra quando você está trabalhando numa matéria. Os agents abaixo rodam numa agenda — pro que se move enquanto você não está olhando:

| Agent | Módulo | O que observa | Cadência padrão |
|---|---|---|---|
| **dataroom-watcher** | M&A | VDR por novos uploads de documento; sinaliza uploads que batem categorias de alta prioridade; roda status do closing checklist | Semanal |

## Integrações

**Conecte uma ferramenta de pesquisa primeiro — os guardrails de citação dependem dela.** Sem uma, toda citação é marcada `[verify]` e a nota do revisor acima de cada entregável registra que as fontes não foram verificadas. Skills funcionam de qualquer jeito; uma ferramenta de pesquisa desloca o trabalho de verificação pra fora do seu prato.

Vem com:

- **Slack** — busca mensagens, lê canais, encontra discussões (categoria geral)
- **Google Drive** — busca, lê e busca documentos (categoria geral)
- **Box** — data room e gestão de documentos

Intralinks, Datasite e outros conectores de VDR podem ser adicionados em `.mcp.json` quando URLs do parceiro estiverem disponíveis.

**Nota Brasil:** não há equivalente direto de CourtListener/Westlaw para jurisprudência e legislação brasileira nesse pacote — cite `[model knowledge — verify]` até conectar uma fonte (JusBrasil, STJ/STF, Diário Oficial) e verifique manualmente antes de confiar na citação.

## Como aprende

Seu perfil de prática em `~/.claude/plugins/config/claude-for-legal/corporate-legal/CLAUDE.md` não é estático — melhora conforme você usa o plugin. Skills avisam quando uma saída usou um padrão que você deveria ajustar. Você pode rodar o setup de novo, editar o arquivo direto, ou pedir a uma skill que registre uma nova posição.

## Notas de M&A

- Extração de issues aplica limiares de materialidade — não lê todo documento se o limiar diz top N por valor.
- Lado comprador e lado vendedor são ambos suportados. O Perfil de Prática registra qual lado se aplica a essa operação; skills ajustam a postura de acordo.
- Handoff pra ferramenta de IA (Luminance/Kira) é opcional. Se `~/.claude/plugins/config/claude-for-legal/corporate-legal/CLAUDE.md` diz sem ferramenta, toda extração roda pela skill direta.
- Closing checklist inicializa a partir do contrato de compra e venda, depois se auto-atualiza conforme diligence revela anuências necessárias.
- **Nota Brasil:** cessão de posição contratual ou assunção de dívida em operação societária brasileira exige anuência expressa do credor/contraparte (Art. 299, Código Civil) — sem ela, o devedor original permanece responsável. O tracker de integration-management sinaliza esse requisito como bloqueante quando aplicável.
