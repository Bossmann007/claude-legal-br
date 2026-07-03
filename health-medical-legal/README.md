# Direito Médico e da Saúde — Plugin Jurídico Brasileiro

Fluxos para gestão legal em clínicas, hospitais e relacionamento com operadoras de planos de saúde. Cobre três sub-práticas: implementação de programa de privacidade de dados em saúde (LGPD Art. 11 + sigilo médico), defesa em responsabilidade civil por erro médico, e triagem de negativas de cobertura / disputas com operadoras.

**Toda saída é rascunho para revisão de advogado** — citada, sinalizada, e não substitui pareceres jurídicos. O plugin estrutura a análise; um advogado revisa, verifica e decide. Citações são marcadas por fonte para você saber quais vieram de pesquisa e quais precisam ser verificadas. Recomendações sobre sigilo médico e dados de saúde são conservadoras — nenhuma divulgação silenciosa de material protegido.

## Quem deve usar

| Função | Fluxos primários |
|---|---|
| **Assessor jurídico em saúde** | Implementação de RIPD/Plano de Privacidade, defesa em erro médico, triagem de negativa de operadora |
| **Compliance / DPO de clínica/hospital** | Avaliação de risco em privacidade, levantamento de dados sensíveis, gestão de consentimento |
| **Médico/Hospital em litígio** | Triagem de ação por erro médico, coleta de defensivas, resposta a demanda |
| **Paciente / consumidor** | Triagem de negativa de cobertura, opções de resposta, escalação a órgão regulador |

## Conector automático

**Sem conector automático** — este plugin consome documentos fornecidos pelo usuário (estatutos, contatos de operadora, processos, prontuários reduzidos) ou pesquisa manual. A pesquisa jurídica é feita contra JusBrasil/Escavador quando disponível; toda citação é marcada pela fonte.

## Primeira execução: entrevista de configuração

```
/health-medical-legal:cold-start-interview
```

Breve entrevista conversacional (5 minutos) para aprender seu contexto: você é clínica/hospital, solo practitioner em saúde, advogado de paciente? Quais são seus maiores riscos? Quem é o responsável por privacidade / compliança?

Escreve sua configuração em `~/.claude/plugins/config/claude-for-legal/health-medical-legal/CLAUDE.md` — um documento em português claro sobre sua prática que cada skill lê antes de fazer qualquer coisa.

## Comandos

| Comando | Função |
|---|---|
| `/health-medical-legal:cold-start-interview` | Executar (ou re-executar) a entrevista de configuração |
| `/health-medical-legal:clinic-privacy-implementation [descrição]` | Estruturar Plano de Privacidade / RIPD para clínica/hospital (dados sensíveis, sigilo médico, LGPD Art. 11) |
| `/health-medical-legal:medical-liability-defense [contexto]` | Triagem de ação por erro médico, defesa estratégica, quesitos periciais |
| `/health-medical-legal:health-plan-denial [negativa ou termo]` | Triagem de negativa de operadora, análise de rol ANS, opções de resposta |

## Skills

| Skill | Função |
|---|---|
| **cold-start-interview** | Entrevista de primeira execução que escreve `~/.claude/plugins/config/claude-for-legal/health-medical-legal/CLAUDE.md` |
| **clinic-privacy-implementation** | Estruturação de Plano de Privacidade e Proteção de Dados sob LGPD Art. 11 e sigilo médico (CFM/CEM), guarda de prontuário, consentimento em saúde, fluxo de dados, riscos |
| **medical-liability-defense** | Triagem de ação por erro médico, análise de obrigação de meio vs. resultado, nexo causal, termo de consentimento informado, quesitos periciais, defesa estratégica |
| **health-plan-denial** | Triagem de negativa de operadora: cobertura, rol ANS, cancelamento unilateral, reajuste abusivo, Lei 9.656/1998, CDC, opções de resposta, urgência, tutela |

## Avisos legais e limitações

- **Dados de saúde são sensíveis** — tratados sob Art. 11 LGPD, sigilo médico (Código de Ética Médica CFM), e, em alguns casos, regulação específica (ANS para planos de saúde). Toda análise é rascunho para revisão de advogado.
- **Não é parecer clínico** — este plugin não oferece diagnóstico, recomendação terapêutica, ou prognóstico. Analisa risco legal e questões regulatórias.
- **Não é consulta médico-legal** — para produzir parecer médico-legal que possa ser usado em judicial, consulte perito ou médico-legista inscrito no tribunal.
- **Sigilo médico é inviolável** — qualquer saída contendo dados de prontuário ou informações que identifiquem paciente é marcada `SIGILO PROFISSIONAL` e não deve ser compartilhada sem consentimento expresso do paciente ou ordem judicial.

## Integrações

Sem MCP pré-configurados. A pesquisa jurídica é manual contra JusBrasil/Escavador quando disponível.

---

*Para re-rodar a entrevista: `/health-medical-legal:cold-start-interview --redo`*
