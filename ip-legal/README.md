# Plugin de Propriedade Intelectual (Brasil)

Prática de propriedade intelectual: marca, direito autoral, patente, segredo industrial e software livre. Redige e triagem notificações extrajudiciais e takedowns de conteúdo (enviando e respondendo), roda busca de anterioridade/colidência de marca e triagem de liberdade para operar (FTO), revisa cláusulas de PI em contratos, acompanha registros e prazos de renovação no INPI, e checa conformidade de licença open source. Construído em torno de um perfil de prática escrito no cold-start interview — o plugin aprende *sua* postura de enforcement, seu portfólio e sua matriz de aprovação, não uma genérica. Framework: Lei da Propriedade Industrial (Lei 9.279/1996), Lei de Direitos Autorais (Lei 9.610/1998), Lei do Software (Lei 9.609/1998), INPI, Decreto 10.033/2019 (adesão do Brasil ao Protocolo de Madri), Estatuto OAB (Lei 8.906/1994).

**Todo output é um rascunho para revisão do advogado — citado, sinalizado e com gate — não é uma conclusão jurídica.** O plugin faz o trabalho: lê os documentos, aplica seu playbook, encontra os problemas, redige o memorando. O advogado revisa, verifica e decide. Citações são marcadas por fonte para saber quais vieram de ferramenta de pesquisa e quais precisam de checagem. Marcadores de sigilo profissional são aplicados de forma conservadora para que nada seja perdido por acidente. Ações consequentes — protocolar no INPI, enviar, executar — ficam com gate atrás de confirmação explícita.

## Who this is for

| Role | Primary workflows |
|---|---|
| **Advogado(a) de PI in-house** | Decisões de enforcement, revisão de cláusula, supervisão de portfólio, triagem de FTO |
| **Paralegal/especialista de PI** | Acompanhamento de portfólio e renovação no INPI, primeira passada de colidência, intake de matéria |
| **Gerente de proteção de marca** | Notificações extrajudiciais, takedowns, follow-up de serviço de monitoramento |
| **Responsável por prosecução (marca/direito autoral)** | Colidência, revisão de cláusula, manutenção de portfólio — *não redação de reivindicações de patente* |
| **Associado(a) de PI em escritório** | Workspace por cliente, colidência e triagem de FTO, revisão de cláusula |
| **Legal ops de portfólio de PI** | Registro de processos INPI, prazos de renovação, checagem de conformidade OSS |

Este plugin **não** redige reivindicações de patente. Prosecução de patente com estratégia de reivindicação é ofício de especialista — exige agente da propriedade industrial ou advogado especializado, e não deve ser terceirizado para uma ferramenta generalista. O trabalho de patente aqui se limita a triagem de FTO (este produto está bloqueado por patente de terceiro?), revisão de cláusula de PI em contratos, acompanhamento de renovação de portfólio e triagem de infração.

## First run: cold-start interview

No primeiro uso, o plugin entrevista você — dez a quinze minutos, em conversa — para aprender como sua prática realmente funciona. Pergunta sobre seu mix de áreas de PI, sua pegada de jurisdição (Brasil, Mercosul, internacional via Madri), sua postura de enforcement, sua matriz de aprovação e seus gatilhos de escalonamento. Depois pede sua lista de portfólio, diretrizes de marca, modelos de notificação extrajudicial, playbook de enforcement e política de OSS — o que você tiver — para extrair em vez de fazer você digitar tudo de novo.

Grava o que aprende em `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md` — um documento em português simples sobre sua prática que todo outro skill lê antes de fazer qualquer coisa. Você edita o documento, não um arquivo de config.

```
/ip-legal:cold-start-interview
```

**Mix de áreas de PI.** Cedo na configuração, você será perguntado em quais áreas de PI você realmente atua — marca, patente, direito autoral, segredo industrial, open source, ou todas. O plugin pula perguntas em áreas que você não pratica. Sua configuração pode conter múltiplas áreas em paralelo, e cada skill pergunta qual área se aplica quando não é óbvio pelo que você colou.

**Postura de enforcement.** Você será perguntado onde você se posiciona no espectro agressivo / moderado / conservador para enviar notificações extrajudiciais, e quem aprova o envio de cada tipo de notificação. A postura inverte os padrões dos skills de notificação extrajudicial, takedown e triagem de infração.

## Commands

| Command | Does |
|---|---|
| `/ip-legal:cold-start-interview` | Roda (ou re-roda) a entrevista de cold-start |
| `/ip-legal:cease-desist [contexto]` | Notificação extrajudicial — envia, ou faz triagem de uma recebida, com o roteamento de aprovação que seu CLAUDE.md exige |
| `/ip-legal:takedown [contexto]` | Takedown de conteúdo — envia, responde a notificação recebida, ou redige contranotificação |
| `/ip-legal:clearance [marca]` | Primeira passada de busca de colidência de marca — anterioridade + análise de confusão, advogado ainda assina |
| `/ip-legal:fto-triage [produto / escopo de reivindicação]` | Triagem de liberdade para operar — sinaliza referências bloqueantes para revisão do advogado |
| `/ip-legal:invention-intake [divulgação]` | Primeira passada de triagem de invenção — novidade, atividade inventiva, aplicação industrial, prazos de prioridade, detectabilidade, valor estratégico |
| `/ip-legal:infringement-triage [contexto]` | Triagem de infração — vale a pena perseguir, e como |
| `/ip-legal:ip-clause-review [arquivo]` | Revisa cláusulas de PI em contrato — cessão, licenciamento, indenização de PI, declarações OSS |
| `/ip-legal:oss-review [repositório / lista de arquivos]` | Checagem de conformidade de licença open source — obrigações copyleft, atribuição, compatibilidade de licença |
| `/ip-legal:portfolio` | Registro de processos INPI e rastreador de renovação — o que vence, o que foi protocolado, o que precisa de ação |
| `/ip-legal:matter-workspace` | Gerencia workspaces de matéria (só para prática multi-cliente) — new, list, switch, close, none |

## Skills

| Skill | Purpose |
|---|---|
| **cold-start-interview** | Entrevista de primeiro uso que grava `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md` |
| **cease-desist** | Redige ou faz triagem de notificação extrajudicial; passa pela matriz de aprovação antes de enviar |
| **takedown** | Notificação de retirada de conteúdo, resposta a takedown recebido, ou contranotificação |
| **clearance** | Busca de anterioridade + primeira passada de risco de confusão para marca proposta |
| **fto-triage** | Triagem de FTO — sinaliza referências que um advogado deve ler antes do lançamento |
| **invention-intake** | Primeira passada de patenteabilidade para divulgação de invenção — novidade, atividade inventiva, aplicação industrial, prazos de prioridade, detectabilidade, valor estratégico |
| **infringement-triage** | Dada uma aparente infração, decide: ignorar / notificação branda / notificação extrajudicial / ajuizar |
| **ip-clause-review** | Revisa cláusulas de PI em MSAs, SOWs, licenças, contratos de prestação de serviço |
| **oss-review** | Checa licenças open source em um repositório contra a política de OSS |
| **portfolio** | Registro de processos INPI, prazos de renovação, dashboard de status |
| **matter-workspace** | Cria, lista, alterna e fecha workspaces de matéria para práticas multi-cliente; isola cada cliente/matéria para que o contexto não vaze entre eles |

## Interactive commands vs. scheduled agents

Os comandos acima rodam quando você os invoca — para quando você está trabalhando em uma matéria. Os agents abaixo rodam em agenda — para o que se move enquanto você não está olhando:

| Agent | What it watches | Default cadence |
|---|---|---|
| **ip-renewal-watcher** | Registro de portfólio — calcula o que vence (renovações, cumprimento de exigências, pagamento de anuidades) nos próximos 90 dias e posta relatório de prazos ranqueado | Semanal |

## Connectors and citation verification

**Conecte uma ferramenta de pesquisa primeiro — os guardrails de citação dependem disso.** Sem uma, toda citação é marcada `[busca web — verificar]` ou `[conhecimento do modelo — verificar]`, e a nota de revisão acima de cada entregável registra que as fontes não foram verificadas. O plugin funciona de qualquer forma; só faz mais da verificação para você quando uma ferramenta de pesquisa está conectada.

Os conectores de pesquisa jurídica deste plugin não são só fontes de dados — são a diferença entre uma citação verificada e uma citação que você precisa checar. Uma citação obtida via **JusBrasil** (jurisprudência brasileira, INPI, doutrina) é marcada com sua fonte e pode ser rastreada de volta. Uma citação do conhecimento do modelo ou de busca web é marcada `[busca web — verificar]` ou `[conhecimento do modelo — verificar]` e deve ser checada contra fonte primária antes de qualquer decisão. O plugin escalona suas citações para que seu tempo de verificação vá para onde importa.

## Integrations

Vem com conectores configurados em `.mcp.json`:

- **Solve Intelligence** — busca de patente e literatura não-patente, padrões técnicos SEP, anterioridade, análise de reivindicação
- **JusBrasil** — jurisprudência brasileira, decisões do INPI, precedentes de PI, doutrina
- **Slack** — busca mensagens, lê canais, encontra discussões
- **Google Drive** — busca, lê e recupera documentos

Com pesquisa de patente conectada: skills de FTO e anterioridade puxam referências automaticamente em vez de depender de listas fornecidas pelo usuário.

Com ferramenta de jurisprudência conectada: skills de colidência e triagem de infração verificam precedente e checam se decisão citada ainda está vigente.

Com Drive ou Slack conectados: exportações de portfólio, modelos de notificação extrajudicial e atualizações de log de enforcement são roteadas pelo canal apontado.

## Quick start

### 1. Faça a entrevista

```
/ip-legal:cold-start-interview
```

Dez a quinze minutos. Tenha sua lista de portfólio, diretrizes de marca (se houver), um modelo de notificação extrajudicial (se houver) e sua política de OSS (se houver) prontos para compartilhar.

Sua configuração fica em `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md` e sobrevive a atualizações do plugin.

### 2. Faça a colidência de uma marca

```
/ip-legal:clearance "APEXLEAF"
```

Output: lista de resultados de busca de anterioridade, análise de fatores de risco de confusão (Lei 9.279/1996 art. 124, 125, 126), sinalizações para revisão do advogado. Não é um go/no-go.

### 3. Veja o que vence

```
/ip-legal:portfolio
```

Output: registros com prazo de renovação, cumprimento de exigência, ou pagamento de anuidade nos próximos 90 dias, agrupados por urgência.

## File structure

```
ip-legal/
├── .claude-plugin/plugin.json
├── .mcp.json
├── CLAUDE.md                    # Seu perfil de prática — escrito pelo cold-start, editado por você
├── README.md
├── agents/
│   └── ip-renewal-watcher.md
├── skills/
│   ├── cold-start-interview/
│   ├── cease-desist/
│   ├── takedown/
│   ├── clearance/
│   ├── fto-triage/
│   ├── invention-intake/
│   ├── infringement-triage/
│   ├── ip-clause-review/
│   ├── oss-review/
│   ├── portfolio/
│   └── matter-workspace/
└── hooks/hooks.json
```

## Configuration

O plugin lê a configuração específica do usuário de:

```
~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md
```

Esse caminho sobrevive a atualizações do plugin. O `CLAUDE.md` que vem com o plugin é um template — é substituído a cada atualização. A entrevista de cold-start grava sua versão preenchida no caminho de config acima; a partir daí, edite esse arquivo diretamente quando algo mudar.

## How it learns

Seu perfil de prática em `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md` não é estático — melhora conforme você usa o plugin. Skills avisam quando um output usou um padrão que você deveria ajustar. O agent `ip-renewal-watcher` acompanha o registro de portfólio e sinaliza prazos de renovação na sua cadência. Você pode rodar o setup de novo, editar o arquivo diretamente, ou pedir a um skill para registrar uma nova posição.

## Notes

- Todo skill lê o perfil de prática primeiro. Se encontra placeholders, para e diz para rodar `/ip-legal:cold-start-interview`. Não há fallback genérico — uma postura de PI genérica é pior que nenhuma postura.
- Enviar notificação extrajudicial inicia um conflito (Lei 9.279/1996 art. 129, 189-210). O skill `/ip-legal:cease-desist` não envia nada sozinho; redige, sinaliza a entrada da matriz de aprovação, e espera o aprovador.
- `/ip-legal:clearance` e `/ip-legal:fto-triage` são triagem de **primeira passada**. O output é um pacote de pesquisa para o advogado, não um parecer de colidência. O skill avisa isso a cada execução.
- `/ip-legal:oss-review` sinaliza obrigações e incompatibilidades de licença (Lei 9.609/1998 — Lei do Software, Lei 9.610/1998 — Direitos Autorais). Não abençoa decisão de uso comercial — engenharia e jurídico decidem isso juntos.
- Redação de reivindicação de patente é propositalmente fora de escopo. Este plugin funciona bem ao lado de um especialista em prosecução de patente/agente da propriedade industrial; não substitui um.
