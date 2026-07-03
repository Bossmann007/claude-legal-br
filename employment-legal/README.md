# Plugin de Direito do Trabalho (Brasil)

Fluxos de trabalho de assessoria trabalhista in-house: revisão de contratação, revisão
de rescisão, redação de políticas, atualização de regulamento interno, e consultas de
jornada/remuneração sensíveis à base territorial (CCT do sindicato). Construído em
torno de um mapa de abrangência territorial aprendido no cold-start — o plugin sabe em
quais estados/bases sindicais você tem empregados e o que muda em cada uma. Framework:
CLT (Decreto-Lei 5.452/1943, com as alterações da Reforma Trabalhista Lei 13.467/2017),
Constituição Federal art. 7º-11, FGTS (Lei 8.036/1990), eSocial, jurisprudência do TST,
e Convenções/Acordos Coletivos de Trabalho (CCT/ACT) por categoria e base territorial.

**Este plugin não inclui conector automático para PJe/e-SAJ/Projudi/DataJud; os dados são inseridos manualmente (colados ou enviados como upload).**


**Todo output é um rascunho para revisão do advogado — citado, sinalizado e com gate — não é uma conclusão jurídica.** O plugin faz o trabalho: lê os documentos, aplica seu playbook, encontra os problemas, redige o memorando. O advogado revisa, verifica e decide. Citações são marcadas por fonte para saber quais vieram de ferramenta de pesquisa e quais precisam de checagem. Marcadores de sigilo profissional são aplicados de forma conservadora para que nada seja perdido por acidente. Ações consequentes — protocolar, enviar, executar — ficam com gate atrás de confirmação explícita.

## Who this is for

| Role | Primary workflows |
|---|---|
| **Advogado(a) trabalhista** | Revisão de rescisão, redação de políticas, análise de jornada/remuneração |
| **Business partners de RH** | Revisão de contratação, dúvidas de regulamento interno, primeira linha de jornada/remuneração |
| **Diretoria jurídica** | Destinatário de escalonamento para termos de alto risco e dispensas em massa/PDV |

## First run: cold-start

Pergunta em quais estados e países você tem empregados, lê seu regulamento interno e três
memorandos recentes de rescisão, constrói uma tabela de escalonamento sensível à base
territorial/CCT.

```
/employment-legal:cold-start-interview
```

Sua configuração fica em `~/.claude/plugins/config/claude-for-legal/employment-legal/CLAUDE.md` e sobrevive a atualizações do plugin.

## Prerequisites

- **Caminho de dados persistente.** O registro de licenças/afastamentos, logs de investigação e rastreadores de expansão são gravados em `~/.claude/plugins/config/claude-for-legal/employment-legal/`, um caminho independente de versão que sobrevive a atualizações do plugin. Esses arquivos contêm informação sigilosa e sensível de pessoal — garanta que esse diretório tem backup e controle de acesso.
- **Acesso a pesquisa jurídica.** Os skills deste plugin propositalmente não armazenam regras jurídicas substantivas (pisos salariais por CCT, entendimento de estabilidade, prazos de rescisão, exigibilidade de cláusula de não-concorrência, regras de expatriação, etc.). Cada regra específica de base territorial/categoria é pesquisada e citada no momento da revisão. Garanta que a sessão tenha acesso às ferramentas de pesquisa que você usa (busca web, integrações internas de pesquisa jurídica, materiais de referência da equipe).
- **Advogado externo.** Nenhum parecer específico de jurisdição estrangeira (expansão internacional) é produzido sem envolvimento de escritório correspondente local em qualquer questão de fronteira ou nova jurisdição.

## Skills

| Skill | Does |
|---|---|
| `/employment-legal:cold-start-interview` | Entrevista de cold-start — aprende abrangência territorial + regras de escalonamento a partir do regulamento interno + memorandos de rescisão |
| `/employment-legal:hiring-review` | Revisão de carta-proposta/contrato + cláusula de não-concorrência, checagem de base territorial |
| `/employment-legal:termination-review` | Revisão de rescisão com detecção de flags de alto risco (estabilidades) |
| `/employment-legal:policy-drafting [tópico]` | Rascunho de política com adendos regionais/CCT onde necessário |
| `/employment-legal:wage-hour-qa [pergunta]` | Perguntas sobre jornada/remuneração, sensível à base territorial/CCT |
| `/employment-legal:worker-classification` | Classifica uma contratação proposta e sinaliza risco de pejotização/vínculo empregatício |
| `/employment-legal:expansion-kickoff [país]` | Inicia o planejamento de expansão internacional para um novo país |
| `/employment-legal:expansion-update [país]` | Atualiza um rastreador de expansão em andamento |
| `/employment-legal:investigation-open` | Abre uma nova investigação interna (ex.: assédio) |
| `/employment-legal:investigation-add` | Adiciona documentos, notas de entrevista ou observações a uma investigação aberta |
| `/employment-legal:investigation-query` | Faz perguntas contra o log de uma investigação aberta |
| `/employment-legal:investigation-memo` | Rascunha ou atualiza o memorando sigiloso da investigação |
| `/employment-legal:investigation-summary` | Rascunha um resumo específico para a audiência a partir do memorando da investigação |
| `/employment-legal:leave-tracker` | Verifica licenças/afastamentos abertos para alertas de prazo e decisões necessárias |
| `/employment-legal:log-leave` | Adiciona uma nova licença/afastamento ao registro |
| `/employment-legal:matter-workspace` | Gerencia workspaces de matéria (só para prática multi-cliente) — new, list, switch, close, none |
| **handbook-updates** | Compara mudanças propostas contra o regulamento interno atual, sinaliza impacto em adendos regionais/CCT |

Skills de referência `internal-investigation` e `international-expansion` carregam os
frameworks e templates detalhados — os skills operacionais acima os carregam conforme
necessário.

## Interactive skills vs. scheduled agents

Os skills acima rodam quando você os invoca — para quando você está trabalhando em uma
matéria. Os agents abaixo rodam em agenda — para o que se move enquanto você não está
olhando:

| Agent | What it watches | Default cadence |
|---|---|---|
| **leave-tracker** | Licenças/afastamentos abertos com prazos legais rígidos — auxílio-doença/acidente (INSS), licença-maternidade (120 dias, CF art. 7º XVIII), licença-paternidade, estabilidade acidentária (Lei 8.213/1991 art. 118); dispara alertas de ponto de decisão antes que prazos sejam perdidos | Semanal (segunda-feira) |

## How it learns

Seu perfil de prática em `~/.claude/plugins/config/claude-for-legal/employment-legal/CLAUDE.md` não é estático — melhora conforme você usa o plugin. Skills avisam quando um output usou um padrão que você deveria ajustar. Você pode rodar o setup de novo, editar o arquivo diretamente, ou pedir a um skill para registrar uma nova posição.

## Notes

- Sensibilidade à base territorial/CCT é o ponto central. O plugin sabe que a assistência sindical na rescisão pode ser exigida por CCT em uma categoria e não em outra, e que o piso salarial varia por convenção coletiva.
- Revisão de rescisão NÃO substitui a conversa com RH e o gestor. É um checklist que pega o que todo mundo esqueceu — principalmente estabilidades (gestante, CIPA, acidentária, dirigente sindical).
- Perguntas de jornada/remuneração citam a regra mas sinalizam casos de fronteira para revisão humana. Decisões de classificação (CLT vs. PJ) têm consequências — inclusive de reconhecimento de vínculo retroativo com todos os reflexos trabalhistas e previdenciários.
