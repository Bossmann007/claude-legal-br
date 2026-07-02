# Plugin de Produtividade Jurídica (BR)

Plugin de produtividade com IA para times jurídicos internos no Brasil, projetado para [Cowork](https://claude.com/product/cowork), o aplicativo agentic de mesa da Anthropic — também funciona no Claude Code. Automatiza revisão contratual, triagem de Acordos de Confidencialidade (NDA), fluxos de compliance, pareceres jurídicos e respostas padronizadas — tudo configurável conforme o playbook e a tolerância a risco da sua organização.

> **Aviso:** Este plugin auxilia em fluxos jurídicos mas não substitui aconselhamento jurídico. Sempre valide as conclusões com profissionais habilitados (OAB). A análise gerada por IA deve ser revisada por advogado antes de embasar decisões jurídicas. Os exemplos padrão deste plugin refletem o direito brasileiro (Código Civil, LGPD, CLT, CDC, Lei 14.133/2021). Se sua organização opera sob outras jurisdições, customize o playbook em `.claude/legal.local.md`.

## Personas-Alvo

- **Contencioso/Comercial** -- Negociação de contratos, gestão de fornecedores, suporte a operações
- **Jurídico de Produto** -- Revisões de produto, termos de uso, políticas de privacidade, propriedade intelectual
- **Privacidade / Compliance** -- LGPD, revisão de DPA/Acordo de Tratamento de Dados, atendimento a titulares, monitoramento regulatório (ANPD)
- **Suporte ao Contencioso** -- Preservação de documentos, preparação para litígio, pareceres de caso

## Qual domínio devo usar?

```
Sua tarefa envolve...
├─ Contrato com fornecedor/cliente, NDA, MSA?        → commercial-legal
├─ Empregado, rescisão, CCT, investigação interna?   → employment-legal
│    (disputa trabalhista NÃO é commercial-legal)
├─ LGPD, DPA, titular de dados, ANPD?                → privacy-legal
├─ M&A, atas, diligência, societário?                → corporate-legal
├─ Marca, patente, clearance, cease & desist?        → ip-legal
├─ Processo judicial, cronologia, peças?             → litigation-legal
├─ Lançamento de produto, termos de uso?             → product-legal
├─ Monitorar regulação, gap analysis?                → regulatory-legal
├─ Uso de IA na empresa, AIA, inventário?            → ai-governance-legal
├─ Estudar Direito (aluno)?                          → law-student
├─ NPJ / clínica com estagiários?                    → legal-clinic
├─ Instalar/gerenciar skills deste repo?             → legal-builder-hub
└─ Pesquisa jurídica profunda multi-fonte?           → external_plugins/cocounsel-legal
```

Visão completa da arquitetura e taxonomia: [ARCHITECTURE.md](ARCHITECTURE.md). Quando escalar para advogado humano: [references/escalation-process.md](references/escalation-process.md).

## Instalação

```
claude plugins add claude-legal-br
```

## Início Rápido

### 1. Instale o plugin

```
claude plugins add claude-legal-br
```

### 2. Configure seu playbook

Crie um arquivo de configuração local definindo as posições padrão da sua organização — playbook de negociação, tolerância a risco e termos padrão.

Crie um arquivo `legal.local.md` onde o Claude possa encontrá-lo:

- **Cowork**: salve em qualquer pasta compartilhada com o Cowork. O plugin encontra automaticamente.
- **Claude Code**: salve em `.claude/` do seu projeto.

```markdown
# Configuração do Playbook Jurídico

## Posições de Revisão Contratual

### Limitação de Responsabilidade
- Posição padrão: teto mútuo de 12 meses de honorários pagos/devidos
- Faixa aceitável: 6-24 meses de honorários
- Gatilho de escalonamento: responsabilidade ilimitada, inclusão de danos indiretos

### Indenização
- Posição padrão: indenização mútua para violação de PI e vazamento de dados (LGPD)
- Aceitável: indenização limitada a reclamações de terceiros
- Gatilho de escalonamento: obrigação de indenização unilateral, sem teto

### Propriedade Intelectual
- Posição padrão: cada parte mantém PI pré-existente; cliente é titular dos dados do cliente
- Gatilho de escalonamento: cláusulas amplas de cessão de PI, "work for hire" sobre PI pré-existente

### Proteção de Dados (LGPD)
- Posição padrão: exigir Acordo de Tratamento de Dados para qualquer tratamento de dado pessoal
- Requisitos: notificação de suboperador, eliminação de dados ao término, notificação de incidente em até 72h ao controlador (alinhado à ANPD)
- Gatilho de escalonamento: ausência de Acordo de Tratamento de Dados, transferência internacional sem salvaguardas (art. 33 LGPD)

### Prazo e Rescisão
- Posição padrão: vigência anual com rescisão por conveniência mediante aviso de 30 dias
- Aceitável: plurianual com rescisão por conveniência após período inicial
- Gatilho de escalonamento: renovação automática sem aviso prévio, ausência de rescisão por conveniência

### Lei Aplicável e Foro
- Preferencial: foro da comarca da sede da empresa, lei brasileira (Código Civil)
- Aceitável: principais praças comerciais nacionais
- Gatilho de escalonamento: foro estrangeiro, arbitragem obrigatória em sede desfavorável

## Padrões de NDA (Acordo de Confidencialidade)
- Obrigações mútuas exigidas
- Prazo: 2-3 anos padrão, 5 anos para segredo de negócio
- Exceções padrão: desenvolvido independentemente, de domínio público, recebido legitimamente de terceiro
- Cláusula de resíduos: aceitável se escopo restrito

## Modelos de Resposta
Configure caminhos para seus modelos ou defina templates inline para dúvidas recorrentes.
```

### 3. Conecte suas ferramentas

O plugin funciona melhor conectado às suas ferramentas via MCP. Servidores pré-configurados incluem Slack, Box, Egnyte, Atlassian e Microsoft 365. Veja [CONNECTORS.md](CONNECTORS.md) para a lista completa.

## Comandos

### `/review-contract` -- Revisão Contratual contra o Playbook

Revisa um contrato contra o playbook de negociação da sua organização. Sinaliza desvios, gera redlines e fornece análise de impacto no negócio.

```
/review-contract
```

Aceita: upload de arquivo, URL ou texto colado. Pergunta o contexto (qual parte você representa, prazo, focos de atenção) e revisa cláusula a cláusula contra o playbook configurado.

### `/triage-nda` -- Pré-Triagem de NDA

Triagem rápida de Acordos de Confidencialidade recebidos contra critérios padrão. Classifica como VERDE (aprovação padrão), AMARELO (revisão jurídica) ou VERMELHO (problemas relevantes).

```
/triage-nda
```

### `/vendor-check` -- Status de Acordos com Fornecedor

Verifica o status de acordos existentes com um fornecedor em todos os sistemas conectados.

```
/vendor-check [nome do fornecedor]
```

Relata NDAs, contratos de prestação de serviços, Acordos de Tratamento de Dados, datas de vencimento e termos-chave existentes.

### `/brief` -- Briefing do Time Jurídico

Gera briefings contextuais para o seu trabalho jurídico.

```
/brief daily          # Briefing matinal de itens relevantes
/brief topic [query]  # Parecer de pesquisa sobre questão jurídica específica
/brief incident       # Briefing rápido sobre situação em desenvolvimento
```

### `/respond` -- Gerar Resposta Padronizada

Gera uma resposta a partir dos templates configurados para tipos comuns de solicitação.

```
/respond [tipo-de-solicitacao]
```

Tipos suportados incluem: solicitação de titular de dados (LGPD), preservação de prova, dúvida de fornecedor, solicitação de NDA e categorias customizadas.

## Skills

| Skill | Descrição |
|-------|-------------|
| `review-contract` | Análise contratual baseada em playbook, classificação de desvios, geração de redlines |
| `triage-nda` | Critérios de triagem de NDA, regras de classificação, recomendações de encaminhamento |
| `compliance-check` | LGPD/ANPD, CLT, CDC, Lei 14.133/2021, revisão de Acordo de Tratamento de Dados, atendimento a titulares |
| `legal-response` | Gestão de templates, categorias de resposta, gatilhos de escalonamento |
| `legal-risk-assessment` | Framework de severidade de risco, níveis de classificação, critérios de escalonamento |
| `meeting-briefing` | Metodologia de preparação de reunião, levantamento de contexto, acompanhamento de ações |
| `signature-request` | Checklist pré-assinatura, ordem de assinatura via ICP-Brasil/assinatura eletrônica |
| `vendor-check` | Status de acordos com fornecedor, análise de lacunas, prazos próximos |

## Exemplos de Fluxo

### Revisão Contratual

1. Recebe um contrato de fornecedor por e-mail
2. Executa `/review-contract` e envia o documento
3. Fornece contexto: "Somos o contratante, precisamos fechar até o fim do trimestre, foco em proteção de dados e responsabilidade"
4. Recebe análise cláusula a cláusula com sinalizações VERDE/AMARELO/VERMELHO
5. Recebe sugestão de redação (redline) para itens AMARELO e VERMELHO
6. Compartilha a análise com o time responsável

### Triagem de NDA

1. Time comercial envia um NDA de um novo prospect
2. Executa `/triage-nda` e cola ou envia o NDA
3. Recebe classificação instantânea: VERDE (encaminhar para assinatura), AMARELO (pontos específicos a revisar) ou VERMELHO (precisa de revisão jurídica completa)
4. Para NDAs VERDE, aprova diretamente; para AMARELO/VERMELHO, trata os pontos sinalizados

### Briefing Diário

1. Inicia o dia com `/brief daily`
2. Recebe um resumo de solicitações contratuais da véspera, dúvidas de compliance, prazos próximos e itens de agenda que exigem preparação jurídica
3. Prioriza o dia conforme urgência e prazos

### Verificação de Fornecedor

1. Time de negócio pergunta sobre uma nova contratação com fornecedor existente
2. Executa `/vendor-check Empresa X`
3. Vê acordos existentes, datas de vencimento e termos-chave rapidamente
4. Sabe na hora se precisa de novo NDA ou pode prosseguir sob termos existentes

## Integração MCP

> Se você encontrar placeholders desconhecidos ou precisar checar quais ferramentas estão conectadas, veja [CONNECTORS.md](CONNECTORS.md).

O plugin se conecta às suas ferramentas via servidores MCP (Model Context Protocol):

| Categoria | Exemplos | Finalidade |
|----------|----------|---------|
| Chat | Slack, Teams | Solicitações do time, notificações, triagem |
| Armazenamento em nuvem | Box, Egnyte | Playbooks, templates, precedentes |
| Suíte de escritório | Microsoft 365 | E-mail, agenda, documentos |
| Gestão de projetos | Atlassian (Jira/Confluence) | Acompanhamento de processos, tarefas |

Veja [CONNECTORS.md](CONNECTORS.md) para a lista completa de integrações suportadas, incluindo CLM, CRM, assinatura eletrônica e outras opções.

Configure as conexões em `.mcp.json`. O plugin degrada graciosamente quando ferramentas estão indisponíveis -- sinaliza lacunas e sugere verificações manuais.

## Customização

### Configuração do Playbook

Seu playbook é o coração do sistema de revisão contratual. Defina suas posições em `legal.local.md`:

- **Posições padrão**: termos contratuais preferidos
- **Faixas aceitáveis**: o que pode ser aceito sem escalonamento
- **Gatilhos de escalonamento**: termos que exigem revisão sênior ou advogado externo

### Templates de Resposta

Defina templates para dúvidas recorrentes. Templates suportam substituição de variáveis e incluem gatilhos de escalonamento embutidos para situações que não devem usar resposta padronizada.

### Framework de Risco

Customize a matriz de avaliação de risco conforme o apetite a risco e o esquema de classificação da sua organização.

## Estrutura de Arquivos

```
claude-legal-br/
├── .claude-plugin/plugin.json
├── .mcp.json
├── README.md
├── CONNECTORS.md
└── skills/
    ├── review-contract/SKILL.md
    ├── triage-nda/SKILL.md
    ├── compliance-check/SKILL.md
    ├── legal-response/SKILL.md
    ├── legal-risk-assessment/SKILL.md
    ├── meeting-briefing/SKILL.md
    ├── signature-request/SKILL.md
    └── vendor-check/SKILL.md
```

## Localização — backlog

Três ondas de adaptação concluídas. Todos os 12 plugins de área de prática do marketplace (mais `external_plugins/cocounsel-legal`, mantido como está — plugin de terceiro da Thomson Reuters, branded em Westlaw por natureza, fora de escopo de adaptação) foram auditados por substância US-centric e corrigidos. Os `managed-agent-cookbooks/` com integrações de pesquisa jurídica (`docket-watcher`, `reg-monitor`) também foram adaptados.

**Terceira onda (auditoria adversarial independente):** reescritos BR-first, regime US mantido só como fallback explicitamente gated — `ip-legal/skills/takedown` (Marco Civil arts. 19/21 + Lei 9.610/1998; DMCA como fallback provedor-US), `ip-legal/skills/invention-intake` (período de graça 12 meses LPI art. 12; elegibilidade LPI arts. 10/18 no lugar de § 101/Alice), `litigation-legal/skills/legal-hold` (dever de guarda + exibição CPC 396-404, presunção art. 400, no lugar de Zubulake/Rule 37(e)), `litigation-legal/skills/cold-start-interview` (fases CPC — saneamento art. 357, prescrição, honorários sucumbenciais), `employment-legal/skills/internal-investigation` (sigilo OAB, Lei 14.457/2022 canal de denúncia, MPT no lugar de Upjohn/Weingarten/EEOC), `privacy-legal/skills/cold-start-interview` (LGPD-first + RIPD art. 38/Res. ANPD 18/2024), `regulatory-legal/skills/comments` (consulta pública/tomada de subsídios Lei 13.848/2019), `legal-clinic/skills/build-guide` e `status` (NPJ/Defensoria/comarca). Correções pontuais: `fto-triage` (art. 40 p.u. derrubado por ADI 5.529/2021; treble damages removido), `infringement-triage` (litigância de má-fé/perdas e danos no lugar de Rule 11/treble), `regulatory-legal/CLAUDE.md` (hierarquia de fontes DOU/gov.br primeiro).

**Vocabulário de tags de proveniência** — canônico em todo o repo: Westlaw/CourtListener/Trellis/Descrybe → JusBrasil/Escavador/PJe; USPTO → INPI; Federal Register → DOU (Diário Oficial da União, seções I/II/III) + portais gov.br por agência (sem API única — RSS/scraping). Aplicado em `CLAUDE.md` de todos os 12 plugins, `.mcp.json` onde havia conector US-específico configurado, e nos SKILL.md com exemplos de citação.

**Adaptado por plugin:** `employment-legal` (CLT licenças, CCT/base territorial, dispensa coletiva, prescrição trabalhista 2/5 anos, worker-classification reescrito para CLT art. 3º/pejotização), `legal-clinic` (estagiário NPJ/OAB), `ip-legal` (INPI/LPI, agente da propriedade industrial, fto-triage reescrito para anuidades/vigência LPI e sem multiplicador de willfulness), `litigation-legal` (PJe por tribunal — TJ/TRF, sem endpoint único; claim-chart reescrito para LPI arts. 8/51/56/57/210, perícia técnica em vez de Markman), `privacy-legal` (LGPD/ANPD, RIPD), `regulatory-legal` (DOU/gov.br, consulta pública), `corporate-legal` (Ltda./S.A./CVM, LSA), `product-legal` (setores employment/government), `commercial-legal` (Código Civil, CDC, Lei de Arbitragem/CAM-CCBC, foro de eleição CPC Art. 63), `ai-governance-legal` (PL 2338/2023, LGPD Art. 20, ANPD), `law-student` (OAB/vade mecum/acórdãos STF-STJ), `legal-builder-hub` (índice/roteamento cross-plugin).

**Gaps fechados:** `employment-legal/agents/leave-tracker.md` reescrito BR-first (licença-maternidade/paternidade, auxílio-doença/acidentário INSS, estabilidade provisória, Lei 11.770/2008, eSocial S-2230), com FMLA/USERRA/ADA mantidos só como fallback gated para subsidiária/força de trabalho US.

**Placeholders conhecidos, tag `[verify]`:** URLs/domínios exatos de API JusBrasil/Escavador/PJe (não confirmados contra documentação real — nenhum conector MCP público conhecido hoje), estrutura de portal por agência gov.br (ANPD/BCB/ANVISA/ANATEL/ANEEL/ANS/CADE), granularidade de PJe por tribunal (cada TJ/TRF roda instância própria, sem endpoint federado).
