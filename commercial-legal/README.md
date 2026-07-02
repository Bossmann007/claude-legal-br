# Plugin Assessor de Contratos Comerciais — Jurisdição Brasileira

Fluxos de contratos comerciais em-house: análise de acordos com fornecedores, triagem de NDAs, análise de assinaturas SaaS, rastreamento de renovações, roteamento de escalações e resumos para stakeholders comerciais. Construído em torno de um perfil de prática da equipe escrito por uma entrevista de inicialização fria — o plugin aprende *seu* manual de procedimentos, não um genérico.

**Toda saída é um rascunho para revisão de advogado — citado, sinalizado e aprovado — não uma conclusão legal.** O plugin faz o trabalho: lê os documentos, aplica seu manual de procedimentos, identifica os problemas, redige o memorando. Um advogado revisa, verifica e decide. Citações são marcadas pela fonte para você saber quais vieram de uma ferramenta de pesquisa e quais precisam de verificação. Marcadores de sigilo são aplicados conservadoramente para que nada seja renunciado acidentalmente. Ações consequentes — arquivamento, envio, execução — são controladas atrás de confirmação explícita.

## Quem deve usar

| Função | Fluxos primários |
|---|---|
| **Assessor jurídico comercial** | Análise de acordos com fornecedores, roteamento de escalações, resumos para stakeholders |
| **Gerenciador de contratos / advogado assistente** | Triagem de NDAs, rastreamento de renovações, primeira análise |
| **Compras / Procurement** | Awareness de renovações, resumos para stakeholders como destinatários |
| **Vendas / Desenvolvimento comercial** | Triagem de NDAs autossuficiente antes de escalar para jurídico |

## Primeira execução: a entrevista de inicialização

Na primeira utilização, o plugin o entrevista — dez minutos, conversacional — para aprender como sua equipe realmente funciona. Pergunta sobre as posições do seu manual de procedimentos, suas regras de escalação e aquilo que o faz gemer quando chega à sua mesa. Em seguida, pede 5-10 acordos assinados recentemente (quanto mais, melhor; 20 fornece um padrão mais claro) para que possa ver suas posições na prática.

Escreve o que aprende em `~/.claude/plugins/config/claude-for-legal/commercial-legal/CLAUDE.md` — um documento em português claro sobre sua equipe que cada outra skill lê antes de fazer qualquer coisa. Você edita o documento, não um arquivo de configuração.

```
/commercial-legal:cold-start-interview
```

**Lado do manual.** No início da configuração, você será perguntado se deve construir um manual **de venda** (você vende seu produto/serviço; você é o fornecedor; geralmente seu contrato), um manual **de compra** (você compra de fornecedores; você é o cliente; geralmente seu contrato), ou ambos. A resposta inverte quase todas as posições do manual — limites de responsabilidade, direção de indenização, direitos de rescisão, propriedade intelectual — então importa desde o início. Se escolher ambos, a configuração constrói o lado de venda primeiro; execute `/commercial-legal:cold-start-interview --side purchasing` depois para construir o outro. Sua configuração mantém ambos em paralelo, e as skills de análise verificam qual lado se aplica antes de ler o manual.

## Comandos

| Comando | Função |
|---|---|
| `/commercial-legal:cold-start-interview` | Executar (ou re-executar) a entrevista de inicialização |
| `/commercial-legal:review [arquivo]` | Analisar um acordo com fornecedor, NDA ou assinatura SaaS em relação ao seu manual |
| `/commercial-legal:renewal-tracker` | O que está vencendo nos próximos 90 dias e quais são os prazos de cancelamento |
| `/commercial-legal:escalation-flagger` | Rotear um problema para o aprovador correto e rascunhar o pedido |
| `/commercial-legal:amendment-history [arquivo(s)]` | Rastrear como um contrato mudou em seu acordo base e todas as emendas |
| `/commercial-legal:review-proposals` | Revisar propostas de atualização do manual pendentes do agente monitor |
| `/commercial-legal:matter-workspace` | Gerenciar espaços de trabalho (apenas prática privada multi-cliente) — novo, listar, alternar, fechar, nenhum |

## Skills

| Skill | Função |
|---|---|
| **cold-start-interview** | Entrevista de primeira execução que escreve `~/.claude/plugins/config/claude-for-legal/commercial-legal/CLAUDE.md` |
| **vendor-agreement-review** | Análise completa de desvio manual-vs-contrato com redlines, citando Código Civil (Arts. 421-480) e CDC quando aplicável |
| **nda-review** | Triagem rápida VERDE/AMARELO/VERMELHO para jurídico ler só os NDAs que precisam |
| **saas-msa-review** | Camada específica de assinatura: renovação automática, escalonamento de preço, saída de dados, SLAs, cláusula de tratamento de dados (LGPD) |
| **renewal-tracker** | Registro de prazos de cancelamento, mostra o que está vencendo |
| **escalation-flagger** | Mapeia problemas à matriz de escalação, rascunha o pedido ao aprovador |
| **stakeholder-summary** | Tradução de negócio em dois parágrafos de uma revisão legal |
| **amendment-history** | Resume mudanças em um contrato base e seus aditivos, ou rastreia uma cláusula específica até sua redação vigente |
| **matter-workspace** | Cria, lista, alterna e fecha espaços de trabalho para práticas multi-cliente; isola cada cliente/matéria para não vazar contexto |

## Comandos interativos vs. agentes programados

Os comandos acima rodam quando você invoca — para quando está trabalhando numa matéria. Os agentes abaixo rodam em cronograma — para o que se move enquanto você não está olhando:

| Agente | O que observa | Cadência padrão |
|---|---|---|
| **renewal-watcher** | Registro de renovação — posta o que vence nos próximos 90 dias, com escalação de alerta para janelas de cancelamento em 0–13 dias | Semanal (segunda) |
| **deal-debrief** | Acordos assinados recentemente em busca de desvios do manual; solicita ao advogado registrar contexto enquanto a memória está fresca | Semanal (segunda) |
| **playbook-monitor** | Log de desvio — propõe atualizações do manual quando uma cláusula foi sobreposta 5+ vezes numa janela móvel de 12 meses | Disparado por dados (após cada deal-debrief) |

## Integrações

**Conecte uma ferramenta de pesquisa primeiro — as garantias de citação dependem disso.** Sem uma, toda citação é marcada `[verify]` e a nota do revisor acima de cada entregável registra que fontes não foram verificadas. Skills funcionam de qualquer forma; uma ferramenta de pesquisa (JusBrasil, Escavador, PJe) só tira o trabalho de verificação do seu prato.

Vem com conectores configurados em `.mcp.json`:

- **Ironclad** — gestão de ciclo de vida de contrato
- **DocuSign** — status de assinatura e rastreamento de envelope
- **Slack** — busca mensagens, lê canais, encontra discussões (bucket geral)
- **Google Drive** — busca, lê e busca documentos (bucket geral)

Com um [CLM] conectado: revisões checam acordos anteriores com o mesmo fornecedor, carregam o registro de renovação em massa, criam registros com memorandos de revisão anexados.

Com DocuSign conectado: rastreia status de assinatura, roteia envelopes na ordem do aprovador.

## Quick start

### 1. Fazer a entrevista

```
/commercial-legal:cold-start-interview
```

Dez minutos. Tenha 5-10 acordos assinados recentemente prontos para compartilhar (mais é melhor, 20 dá um padrão mais claro).

Sua configuração fica salva em `~/.claude/plugins/config/claude-for-legal/commercial-legal/CLAUDE.md` e sobrevive a atualizações do plugin.

### 2. Revisar um contrato

```
/commercial-legal:review vendor-msa.pdf
```

Saída: memorando desvio-a-desvio contra seu manual, com linguagem de redline específica e aprovador nomeado. Cláusula de foro é checada contra Art. 63 CPC; cláusula de responsabilidade/indenização é checada contra Código Civil Arts. 389-405 e, se houver parte consumidora, nulidade de cláusulas abusivas (Art. 51 CDC).

### 3. Ver o que está renovando

```
/commercial-legal:renewal-tracker
```

Saída: tudo com prazo de cancelamento nos próximos 90 dias, agrupado por urgência.

## Como o plugin aprende

Seu perfil de prática em `~/.claude/plugins/config/claude-for-legal/commercial-legal/CLAUDE.md` não é estático — melhora conforme você usa o plugin. As skills avisam quando uma saída usou um padrão que você deveria ajustar. O agente `playbook-monitor` propõe atualizações quando sua prática diverge do manual. Você pode reexecutar o setup, editar o arquivo diretamente, ou pedir a uma skill que registre uma nova posição.

## File structure

```
commercial-legal/
├── .claude-plugin/plugin.json
├── .mcp.json
├── CLAUDE.md                    # Your team practice profile — written by cold-start, edited by you
├── README.md
├── agents/
│   ├── renewal-watcher.md
│   ├── deal-debrief.md
│   └── playbook-monitor.md
├── skills/
│   ├── cold-start-interview/
│   ├── review/
│   ├── review-proposals/
│   ├── vendor-agreement-review/
│   ├── nda-review/
│   ├── saas-msa-review/
│   ├── renewal-tracker/
│   │   └── references/renewal-register.yaml
│   ├── escalation-flagger/
│   ├── amendment-history/
│   ├── matter-workspace/
│   └── stakeholder-summary/
└── hooks/hooks.json
```

## Notas

- O plugin assume que você é o **comprador** na maioria das revisões. Quando você é o fornecedor, sinalize e a revisão inverte a polaridade do manual.
- Triagem de NDA é feita para autoatendimento por não-advogados. VERDE significa "encaminhar para assinatura." Não negocia.
- Rastreamento de renovação só conhece contratos revisados por este plugin ou carregados em massa do [CLM]. Contratos assinados antes de instalar isso precisam de uma varredura única.
- **Foro e lei aplicável:** toda cláusula de eleição de foro é checada contra Art. 63 CPC (validade da cláusula) e Art. 63 §3º (nulidade quando há parte hipossuficiente e a cláusula dificulta o acesso à justiça). Cláusula de lei estrangeira aplicável a contrato executado no Brasil é sinalizada `[review]` — pode ser inválida se a relação envolver consumidor (CDC, cogente) ou ordem pública brasileira.
