# Plugin Assessor Jurídico — Direito Bancário, Fintech, Finanças e Criptoativos — Jurisdição Brasileira

Fluxos jurídicos especializados em operações bancárias, fintech, instrumentos financeiros e ativos virtuais sob as normas do Banco Central do Brasil (BCB), Lei das Instituições de Pagamento (Lei 12.865/2013), Open Finance Brasil (Resolução BCB 32/2020 e posteriores), Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), e Marco Legal dos Criptoativos (Lei 14.478/2022). Rastreamento de compliance regulatória, análise de contratos bancários, revisão de estruturas de pagamento e triage de riscos VASP (Prestadora de Serviço de Ativo Virtual).

Construído em torno de um perfil de prática da equipe escrito por uma entrevista de inicialização fria — o plugin aprende *seu* manual de procedimentos para operações financeiras, limites de risco, posições de compliance e escalação, não um genérico.

**Toda saída é um rascunho para revisão de advogado — citado, sinalizado e aprovado — não uma conclusão legal.** O plugin faz o trabalho: lê os documentos, aplica seu manual de procedimentos, identifica os problemas, redige o memorando. Um advogado revisa, verifica e decide. Citações são marcadas pela fonte para você saber quais vieram de uma ferramenta de pesquisa e quais precisam de verificação. Marcadores de sigilo são aplicados conservadoramente para que nada seja renunciado acidentalmente.

## Quem deve usar

| Função | Fluxos primários |
|---|---|
| **Assessor jurídico bancário / Fintech** | Análise de contratos de crédito, compliance de instituição de pagamento, revisão de Open Finance, triage de ativos virtuais |
| **Compliance / Risco** | Rastreamento de requisitos BCB, audit de conformidade regulatória, matriz de risco VASP |
| **Produto / Operações** | Estrutura de contrato bancário, avaliação de permissibilidade antes de lançar novo produto |
| **Diretoria / GC** | Decisões sobre escopo de negócio (instituição de pagamento vs. arranjo de pagamento), exposição criptográfica |

## Primeira execução: a entrevista de inicialização

Na primeira utilização, o plugin o entrevista — conversacional — para aprender como sua equipe realmente funciona. Pergunta sobre:

- Estrutura da organização (banco, fintech, exchange, OTC, custody, outra)
- Segmentos de negócio (pessoa física, pessoa jurídica, micro-empreendedor)
- Produtos (crédito, transferência, pagamento instantâneo, Pix, staking, corretagem, etc.)
- Limites de risco e thresholds de escalação
- Integrações e reguladores que você rastreia (BCB, CVM, ANPD, se houver)

Escreve o que aprende em `~/.claude/plugins/config/claude-for-legal/banking-fintech-legal/CLAUDE.md` — um documento em português claro sobre sua equipe que cada outra skill lê antes de fazer qualquer coisa. Você edita o documento, não um arquivo de configuração.

```
/banking-fintech-legal:cold-start-interview
```

## Comandos

| Comando | Função |
|---|---|
| `/banking-fintech-legal:cold-start-interview` | Executar (ou re-executar) a entrevista de inicialização |
| `/banking-fintech-legal:payment-institution-compliance [documento]` | Análise de conformidade — instituição de pagamento vs. arranjo de pagamento, requisitos BCB, Lei 12.865 |
| `/banking-fintech-legal:open-finance-review [documento]` | Revisão de estrutura Open Finance, consentimento, LGPD, compartilhamento de dados |
| `/banking-fintech-legal:crypto-asset-triage [documento]` | Triage de ativo virtual — é um valor mobiliário? Regra VASP, custody, AML/PLD |
| `/banking-fintech-legal:credit-contract-review [documento]` | Análise de contrato de crédito — juros, CET, capitalização, tarifas, CDC, súmulas STJ |

## Skills

| Skill | Função |
|---|---|
| **cold-start-interview** | Entrevista de primeira execução que escreve `~/.claude/plugins/config/claude-for-legal/banking-fintech-legal/CLAUDE.md` |
| **payment-institution-compliance** | Análise de conformidade — Lei 12.865/2013, Resoluções BCB do SPB, instituição de pagamento vs. arranjo de pagamento |
| **open-finance-review** | Revisão de estruturas Open Finance, consentimento, LGPD, interplay com direito de acesso e portabilidade |
| **crypto-asset-triage** | Triage de prestadora de serviços de ativo virtual (VASP), Lei 14.478/2022, CVM/BCB, custody, AML/PLD |
| **credit-contract-review** | Revisão de contrato bancário/crédito — juros, CET, capitalização, tarifas, crédito consignado, CDC, súmulas STJ |

## Integrações

**Sem conector automático PJe/BCB no momento.** Skills funcionam com entrada manual de documentos e números de resolução. Você cola o texto da Resolução BCB ou Download do DOU; o plugin não extrai automaticamente. Se tiver acesso a JusBrasil/Escavador e desejar conectar, as citações ganham provenance tags — leia a seção `## Outputs` em `CLAUDE.md` para detalhes.

Conectores opcionais (configure em `.mcp.json` se estiverem disponíveis):

- **JusBrasil / Escavador** — pesquisa de decisões e jurisprudência
- **Google Drive** — leitura de documentos, pareceres, resoluções
- **Slack** — alertas de compliance e roteamento

Com uma ferramenta de pesquisa conectada: citações de Resoluções BCB e decisões judiciais ganham source tags; sem ela, todas as citações são marcadas `[model knowledge — verify]` e a nota do revisor acima de cada entregável registra que fontes não foram verificadas. Skills funcionam de qualquer forma; uma ferramenta de pesquisa só tira o trabalho de verificação do seu prato.

## Quick start

```bash
# 1. Executar a entrevista de primeira execução
/banking-fintech-legal:cold-start-interview

# 2. Revisar um contrato de instituição de pagamento
/banking-fintech-legal:payment-institution-compliance <caminho-do-documento>

# 3. Analisar conformidade Open Finance
/banking-fintech-legal:open-finance-review <documento>

# 4. Triage de um novo ativo virtual
/banking-fintech-legal:crypto-asset-triage <documento-ou-descrição>

# 5. Revisar contrato de crédito
/banking-fintech-legal:credit-contract-review <contrato>
```

---

**Nota importante:** Este plugin produz rascunhos para revisão de advogado. Decisões de regulamentação, classificação de instrumento (é um valor mobiliário? é um ativo virtual?), limites de risco do negócio, e submissões a órgãos reguladores (BCB, CVM, ANPD) devem ser validadas por um advogado licenciado antes de implementação ou envio. Cada skill inclui um portão de ação consequente para operações que alteram o posicionamento legal da empresa.

---

*Para re-executar a entrevista: `/banking-fintech-legal:cold-start-interview --redo`*
