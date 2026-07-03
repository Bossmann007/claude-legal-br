# Plugin Estudante de Direito

Modo aprendizado, não modo resposta. Sabatina socrática que faz PERGUNTAS a
você e contesta raciocínio frouxo. Resumo de julgados, montagem de esquema,
flashcards, correção de peça/dissertação, prep para arguição em sala,
feedback de redação que nunca reescreve por você, e prognóstico de prova a
partir de provas antigas do mesmo professor. Calibrado a você — suas
disciplinas, seu objetivo no Exame de Ordem, se você quer ser sabatinado ou
receber explicação.

**Este plugin não inclui conector automático para PJe/e-SAJ/Projudi/DataJud; os dados são inseridos manualmente (colados ou enviados como upload).**


**Toda saída é um andaime de estudo, não uma resposta modelo. O plugin
estrutura seu raciocínio, sabatina socraticamente, e sinaliza o que você
errou. Ele não escreve o esquema, o resumo, ou a peça por você — isso
derrotaria o propósito. Citações em material de estudo são marcadas para
verificação.**

## Para quem é

Estudantes de Direito. Do 1º período à preparação para o Exame de Ordem.

## Primeira execução: configuração inicial

Isso é sobre você, não sobre um escritório. Suas disciplinas, seu objetivo no
Exame de Ordem, seu estilo de aprendizado — sabatina vs. explicação. Traga
materiais: resumos antigos, peças/dissertações com feedback, provas antigas
(especialmente do mesmo professor), simulados de 1ª fase comentados, planos
de ensino, trabalhos. Dez a vinte itens é a meta; abaixo disso o perfil de
prática é sinalizado `DADOS LIMITADOS` e as habilidades a jusante ficam mais
rasas até que mais material seja adicionado.

```
/law-student:cold-start-interview
```

## Habilidades

Toda habilidade é invocada como `/law-student:<nome-da-habilidade>`.

| Habilidade | Faz |
|---|---|
| `/law-student:cold-start-interview` | Entrevista sobre você + captação de materiais — disciplinas, Exame de Ordem, estilo de aprendizado, materiais |
| `/law-student:socratic-drill [matéria]` | Sabatina socrática — ela pergunta, você responde, ela contesta. Não dá a resposta. |
| `/law-student:case-brief [julgado]` | Resumo de julgado no seu formato preferido |
| `/law-student:outline-builder [matéria]` | Monta ou estende um esquema no seu formato a partir do material de aula |
| `/law-student:bar-prep-questions [matéria]` | Questões de Exame de Ordem, 1ª fase (objetiva) ou 2ª fase (peça/discursiva) — sinaliza súmula/entendimento dominante vs. divergência |
| `/law-student:flashcards [matéria]` | Gera ou sabatina flashcards; buckets estilo Leitner; markdown por matéria; modo `--session <n>` |
| `/law-student:study-plan` | Monta ou atualiza um plano de estudo de longo prazo — fases, matérias por fraqueza, cronograma adaptativo a partir do histórico de sessões |
| `/law-student:session <matéria> <n>` | Sessão focada de N questões numa matéria; atualiza o plano com os resultados |
| `/law-student:irac-practice` | Corrige sua peça/dissertação — estrutura, questões jurídicas, fundamentação, conclusão. Rastreia padrões entre sessões. |
| `/law-student:cold-call-prep [julgado]` | Prep para arguição em sala — prevê perguntas do professor e sabatina |
| `/law-student:legal-writing [caminho-ou-cola]` | Feedback estrutural sobre qualquer rascunho — nunca reescreve |
| `/law-student:exam-forecast [disciplina]` | Analisa provas antigas do mesmo professor; prognostica a próxima |

## O que significa "modo aprendizado"

Várias habilidades aqui (socratic-drill, case-brief em modo sabatina,
cold-call-prep, irac-practice, legal-writing) são deliberadamente construídas
para *não* dar a resposta ou escrever a coisa por você. O ponto é que você
aprende fazendo. Se você quer uma resposta ou um rascunho, use outra
ferramenta. Este plugin é para o esforço.

**legal-writing é a mais rígida.** Ela lê seu rascunho e diz o que está
fraco, mas não reescreve. Pedir para reescrever retorna uma recusa educada
mais uma oferta de feedback estrutural mais específico. Isso é intencional.

**outline-builder e case-brief seguem a mesma regra numa forma mais suave.**
Outline builder monta andaime — árvore de tópicos, slots de subtópico,
espaços para julgados — e faz perguntas socráticas enquanto você preenche as
regras a partir das suas próprias anotações e da doutrina. Ele não gera um
esquema preenchido a partir só de um plano de ensino. Case brief funciona do
mesmo jeito em todo modo (sabatina e explicação): a habilidade dá o template
e contesta o que você escreveu; ela não resume o julgado por você. Se você
colar o texto do acórdão, ela pode extrair a linguagem literal do tribunal
para os campos — isso é apontar para a fonte, não escrever por você.

## Integridade acadêmica

Antes de usar este plugin em qualquer trabalho avaliado — provas em casa,
trabalhos avaliados, artigos, monografias — cheque o código de ética
acadêmica da sua faculdade e a política de IA do seu professor no plano de
ensino. Muitas faculdades brasileiras proíbem ou restringem uso de IA em
trabalho avaliado, e as regras variam por disciplina e professor. Este
plugin é desenhado para estudo e prática; usá-lo onde sua faculdade proíbe é
violação do código de ética, e a consequência é sua, não da ferramenta.
Na dúvida, pergunte ao professor por escrito.

As habilidades de modo aprendizado aqui (socratic-drill, irac-practice,
legal-writing, cold-call-prep) são deliberadamente desenhadas para não dar a
resposta ou escrever a coisa por você — essa é a pedagogia. Não contorne os
guardrails.

## Marcadores de confiança

Habilidades geradoras de conteúdo sinalizam sua confiança inline. Uma
afirmação de regra ou card sem marcador é algo em que a habilidade está
confiante (mas ainda não substitui checar sua própria fonte antes da prova).
Marcadores usados no plugin:

- `[VERIFICAR: afirmação — checar fonte]` — declarado como provavelmente
  correto, mas você deve confirmar contra seu esquema, doutrina, cursinho, ou
  fonte primária antes de confiar. Usado liberalmente em bar-prep-questions,
  case-brief, flashcards, legal-writing, irac-practice.
- `[INCERTO: motivo específico]` — a habilidade não está confiante nesta
  chamada específica (entendimento minoritário, issue-spot discutível,
  matéria que a habilidade não domina bem). Faça seu próprio julgamento;
  cheque a fonte.
- `[LACUNA — preencher com anotação de aula]` — marcador do outline-builder
  para um tópico onde a habilidade não tem fonte confiável e não vai inventar
  uma regra. Você preenche com suas anotações.
- `[FALTA JULGADO — regra afirmada mas sem julgado ilustrativo]` — marcador
  do outline-builder onde a regra está lá mas falta o julgado que ilustra.
- `[CHECAR ANOTAÇÃO DE AULA — professor pode ter enfatizado algo aqui]` —
  marcador do outline-builder para áreas onde ênfase específica do professor
  importa e a habilidade não pode saber.
- `[EXCEÇÃO OBSCURA — doutrina menciona uma exceção, encontrar a regra]` —
  marcador do outline-builder para uma exceção conhecida com detalhe não
  resolvido.
- `[INCERTO — enquadramento]` — marcador do exam-forecast anotando que um
  prognóstico é uma ponderação de tempo de estudo, não uma previsão.

Confie mais nas sinalizações do que na ausência delas — uma regra não
sinalizada é algo em que a habilidade está confiante, mas a preparação para a
prova ainda exige checar a fonte.

## Conectores e verificação de citação

**Conecte uma ferramenta de pesquisa primeiro — os guardrails de citação
dependem disso.** Sem uma, toda citação é marcada `[verificar]` e a nota do
revisor acima de cada entregável registra que fontes não foram verificadas.
O plugin funciona de qualquer jeito; ele só faz mais da verificação por você
quando uma ferramenta de pesquisa está conectada.

Os conectores de pesquisa jurídica neste plugin não são só fontes de dado —
são a diferença entre uma citação verificada e uma citação que você precisa
checar. Uma citação recuperada via **JusBrasil** (jurisprudência de todos os
tribunais, súmulas, informativos) ou diretamente do site do **STF** / **STJ**
(inteiro teor, repercussão geral, recursos repetitivos) é marcada com a fonte
e pode ser rastreada de volta. Uma citação do conhecimento do modelo ou de
busca na web é marcada `[verificar]` e deve ser checada contra fonte primária
antes de alguém confiar nela. O plugin escalona suas citações para que seu
tempo de verificação vá para onde importa.

## Armazenamento

Seu perfil de prática fica em
`~/.claude/plugins/config/claude-for-legal/law-student/CLAUDE.md` e
sobrevive a atualizações do plugin. O resto fica no diretório de trabalho:

```
law-student/
├── flashcards/
│   └── [matéria]/cards.md              # decks de flashcard por matéria
├── irac-sessions/
│   └── [aluno]/
│       ├── [data]-[tema].md            # feedback de sessão individual
│       └── tracker.md                  # rastreio de padrão entre sessões
├── writing-feedback/
│   └── [aluno]/
│       ├── [data]-[trabalho].md        # feedback de sessão individual
│       └── tracker.md                  # rastreio de padrão entre sessões
└── exam-forecasts/
    └── [disciplina]/
        └── forecast-[AAAA-MM-DD].md    # prognósticos versionados
```

## Como aprende

Seu perfil de estudo em
`~/.claude/plugins/config/claude-for-legal/law-student/CLAUDE.md` não é
estático — melhora conforme você usa o plugin. Habilidades avisam quando uma
saída usou um padrão que você deveria ajustar. Você pode rodar a
configuração de novo, editar o arquivo direto, ou pedir a uma habilidade para
registrar uma nova posição.

## Notas

- Sabatina vs. explicação é definido na configuração inicial; troque por
  sessão.
- Resumos de julgado e esquemas usam SEU formato. Se você já tem esquemas,
  aponte a configuração inicial para eles.
- A preparação de Exame de Ordem tem como alvo suas disciplinas fracas de
  `~/.claude/plugins/config/claude-for-legal/law-student/CLAUDE.md`. Vai
  continuar voltando a elas.
- Toda habilidade geradora de conteúdo sinaliza quando está incerta. Confie
  mais nas sinalizações do que na ausência delas — uma regra não sinalizada é
  algo em que estou confiante; cheque sua fonte mesmo assim antes da prova.
</content>
