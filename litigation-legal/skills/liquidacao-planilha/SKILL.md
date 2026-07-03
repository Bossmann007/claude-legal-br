---
name: liquidacao-planilha
description: Estrutura uma planilha de liquidação com verbas trabalhistas (aviso prévio, 13º, férias, FGTS, horas extras) ou cíveis (principal, danos) — filas, bases de cálculo, incidências e índices de correção (TR até 2021, IPCA-E/SELIC pós-EC 113/2021) — pronto para o advogado/contador preencher. Não computa valores finais. Use quando o usuário pede "estrutura a planilha de liquidação" ou "monta o rascunho da liquidação" para uma condenação.
user-invocable: true
argument-hint: "[--trabalhista | --civil] [--audiencia-una | --vara | --juizado] [--tipo <verba,verba>]"
---

# /liquidacao-planilha

1. Load `~/.claude/plugins/config/claude-for-legal/litigation-legal/CLAUDE.md` → jurisdição, postura, cabeçalho de work product.
2. Entrevista de escopo: causador (trabalhista ou cível), tipo de verba.
3. Estruture a planilha com filas de verba, base de cálculo, incidências, índice.
4. Output = markdown table + CSV block para copiar na PJe-Calc / planilha.
5. Heavy disclaimer: índices e termos iniciais mudam por jurisprudência — advogado confirma.

---

# Planilha de Liquidação

## Matter context

Liquidação de sentença é a fase final de execução, onde a condenação abstrata vira números concretos. Esta skill não computa — estrutura. O advogado ou contador preenche as linhas, e você revisa para gaps.

**Important:** Liquidação de sentença pode ser (1) por **cálculo simples** (CPC art. 509, §1º) — o tribunal calcula direto; (2) por **liquidação de verba ilíquida** (CPC arts. 509, §2º, e 514-524) — a condenação é certa, mas o valor não (p.ex., condenação em "perdas e danos a ser liquidado") — neste caso a planilha estrutura os elementos; ou (3) por **execução de sentença** (CPC arts. 513-527) contra devedor que não segue obrigação liquefeita. A skill assume caso 2: condenação existe, cálculo é o trabalho. Confirme qual antes de estruturar.

---

## Purpose

Montar uma **estrutura de planilha** que o advogado/contador preenche com:
- Verbas concretas (trabalhistas: aviso prévio, 13º, férias+1/3, FGTS+40%, horas extras+reflexos, dano moral; cíveis: principal, danos materiais/morais)
- Base de cálculo por verba (salário, salário + horas, valor de referência, quantum indenizatório)
- Incidências: o que incide FGTS, o que incide INSS, o que incide IR (e em que período — antes/depois da Lei 14.065/2020)
- Índice de correção monetária: qual usar e desde quando (TR até 31.12.2020 per EC 106/2010 e Lei 11.960/2009; IPCA-E para períodos posteriores; SELIC para condemnações de obrigação de fazer/não fazer; juros de mora a 1% a.m. antes da Lei 10.406/2002, após: CC arts. 406-408)
- Termo inicial de juros e correção (actio nata)

**Output:** markdown table + CSV pronto para copiar na PJe-Calc ou Excel. Sem cálculos, só scaffolding. Advogado confirma índices e valores.

---

## Jurisdiction assumption / Premissa de jurisdição (Brasil)

- **Lei aplicável:** CLT (Lei 5.452/1943) para causas trabalhistas; Código Civil (Lei 10.406/2002), CDC (Lei 8.078/1990), ou Lei específica para cíveis.
- **Índices de correção monetária:**
  - TR (Taxa Referencial): obrigatória até 31.12.2020 por Lei 11.960/2009 / EC 106/2010 `[model knowledge — verify]`
  - **IPCA-E (Índice de Preços ao Consumidor Amplo — Especial):** após 1º.01.2021 por EC 113/2021 (Tema 1.191 STF) `[model knowledge — verify]`
  - **SELIC:** em casos de obrigações de fazer/não fazer
  - **Juros moratórios:** 1% a.m. até Lei 10.406/2002, após: CC art. 406 (SELIC a.a./12) ou CC art. 408 (6% a.a.) `[model knowledge — verify]`
- **Incidências FGTS:** Lei 8.036/1990 art. 15 — incide sobre parcelas de remuneração (aviso prévio indenizado, férias, 13º, extras); não incide sobre indenizações puras ou FGTS já recolhido.
- **INSS:** Lei 8.212/1991 art. 28 — contribuição sobre verba salarial.
- **Imposto de Renda:** Lei 10.741/2003, Lei 10.833/2003 — regimes próprios para verbas rescisórias `[model knowledge — verify]`.

---

## Load context

Load `~/.claude/plugins/config/claude-for-legal/litigation-legal/CLAUDE.md` → decision posture, work-product header.

If `[PLACEHOLDER]` appears, suggest `/litigation-legal:cold-start-interview` (2 minutes).

---

## Workflow

### Step 1: Escopo

- **Causa:** trabalhista (CLT) ou cível (CC/CDC)?
- **Tipo de verba:** aviso prévio, 13º, férias, FGTS+40%, horas extras+reflexos, dano moral (trabalhista) — ou dano material, lucros cessantes, dano moral (cível)?
- **Período:** admissão/lesão até rescisão/sentença?
- **Base de cálculo clara?** (Salário conforme folha de pagamento, tabela de horas, quantum na sentença.)

Confirme antes de estruturar.

### Step 2: Estrutura de verba

Cada verba recebe uma fila com colunas:

| Verba | Base de Cálculo | Período | Incidências (FGTS/INSS/IR) | Índice Correção | Termo Inicial Juros | Observação |
|---|---|---|---|---|---|---|
| [Nome] | [Qual] | [De/até] | [Sim/Não por tipo] | [TR até 31.12.2020; IPCA-E pós] | [Lei/jurisprudência] | |

---

#### Trabalhista — Aviso Prévio Indenizado (CLT art. 487)
- **Base:** salário mensal integral
- **Período:** um mês contado da notificação
- **Incidências:** FGTS ✓, INSS ✓, IR conforme regime
- **Índice:** TR até 31.12.2020; IPCA-E após
- **Termo inicial juros:** data rescisão + 30 dias (mora presumida)
- **Nota:** Súmula 105 TST — verba salarial `[model knowledge — verify]`

#### Trabalhista — 13º Salário (CLT art. 159 / CF art. 7º VIII)
- **Base:** salário mensal integral
- **Período:** proporcional aos meses do ano; rescisão: 13º do exercício (Lei 4.749/1965)
- **Incidências:** FGTS ✓, INSS ✓, IR retido na fonte
- **Índice:** TR até 31.12.2020; IPCA-E após
- **Termo inicial juros:** vencimento legal (20.dez ou rescisão art. 159 CLT)

#### Trabalhista — Férias + 1/3 (CLT arts. 130, 140 / CF art. 7º XVII)
- **Base:** salário mensal integral
- **Período:** 30 dias por 12 meses; proporcionais na rescisão (Lei 10.090/2000)
- **Incidências:** FGTS ✓, INSS ✓, IR retido
- **Bônus 1/3:** obrigatório (CF art. 7º XVII) — mesmas incidências
- **Índice:** TR até 31.12.2020; IPCA-E após
- **Termo inicial juros:** vencimento da férias (última concessão ou data devida)
- **Nota:** Cálculo = (salário × 30/30 × 1/3) × períodos aquisitivos

#### Trabalhista — FGTS + 40% (Lei 8.036/1990 arts. 18, 20)
- **Base:** saldo FGTS (depósitos + correção pela Caixa)
- **Complementação 40%:** art. 18, §1º (rescisão sem justa causa) — é indenização
- **Período:** toda vigência do vínculo
- **Incidências:** FGTS já recolhido; complementação 40% não incide FGTS/INSS/IR
- **Índice:** saldo FGTS: TR até 31.12.2020, IPCA-E após; complementação 40%: idem
- **Termo inicial juros:** art. 18, §2º Lei 8.036 — data rescisão + 30 dias
- **Nota:** Exigir extrato FGTS; descontar saques/bloqueios já feitos

#### Trabalhista — Horas Extras + Reflexos (CLT arts. 59-61 / CF art. 7º XVI)
- **Base:** hora normal (salário/30/8) × 50% (ou % da sentença)
- **Período:** conforme sentença (tabular por períodos: Jan/2022, Fev/2022, etc.)
- **Reflexos:** adicional incide sobre aviso prévio, 13º, férias — cada é uma linha
- **Incidências:** FGTS ✓, INSS ✓, IR conforme regime
- **Índice:** TR até 31.12.2020; IPCA-E após
- **Termo inicial juros:** data de cada hora extra trabalhada (1% a.m. ou SELIC)
- **Nota:** Multiplicadores: 1,5× para horas (50% de adicional) + reflexos

#### Trabalhista — Dano Moral (CLT art. 483 / CC arts. 186, 927)
- **Base:** quantum condenado na sentença
- **Período:** valor único (não periódico)
- **Incidências:** NENHUMA (indenização pura, extrapatrimonial)
- **Índice:** correção monetária desde sentença (CC art. 404; TR até 31.12.2020, IPCA-E após)
- **Termo inicial juros:** prolação da sentença (Tema 905 STJ) `[model knowledge — verify]`
- **Nota:** Não compõe base para outras verbas

---

#### Cível — Dano Emergente (CC art. 402)
- **Base:** aquilo que efetivamente se deixou de lucrar / gastos diretos
- **Período:** desde lesão até liquidação
- **Incidências:** nenhuma (restitutório)
- **Índice:** correção desde evento danoso (CC art. 404)
- **Termo inicial juros:** sentença condenatória (Tema 905 STJ — flag para advogado confirmar) `[model knowledge — verify]`
- **Nota:** Se valor não discriminado na sentença → laudo de contador

#### Cível — Lucros Cessantes (CC art. 402)
- **Base:** "aquilo que a pessoa efetivamente deixou de lucrar"
- **Período:** desde lesão até liquidação (ou data determinada)
- **Incidências:** nenhuma
- **Índice:** correção desde lesão (CC art. 404)
- **Termo inicial juros:** sentença condenatória
- **Nota:** Altamente factual; exigir laudo econômico se não discriminado

#### Cível — Dano Moral (CC arts. 11, 186, 927)
- **Base:** quantum condenado
- **Período:** valor único
- **Incidências:** nenhuma
- **Índice:** correção desde sentença (CC art. 404)
- **Termo inicial juros:** prolação da sentença `[model knowledge — verify]`

---

### Step 3: CSV para import

```csv
Verba,Base de Cálculo,Período Inicial,Período Final,Incide FGTS,Incide INSS,Incide IR,Índice Correção,Termo Inicial Juros,Observação
Aviso Prévio Indenizado,[Salário mensal integral],[Data demissão],[Data demissão + 30],Sim,Sim,Conforme regime,TR até 31.12.2020; IPCA-E após,Art. 7º XXVI CF; data rescisão + 30d,Súmula 105 TST
13º Salário,[Salário mensal × meses/12],[01.01.20XX],[31.12.20XX],Sim,Sim,Tabela mensal,TR até 31.12.2020; IPCA-E após,20.dez ou rescisão,Lei 4.749/1965
Férias + 1/3,[Salário × 30/30 × 1,33],[Período aquisitivo],[Rescisão],Sim,Sim,Tabela mensal,TR até 31.12.2020; IPCA-E após,Vencimento da férias,Lei 10.090/2000
FGTS + 40%,[Saldo FGTS + complementação],[Admissão],[Rescisão],FGTS conforme recolhimento,Não,Não,"FGTS: TR até 31.12.2020, IPCA-E após; compl. 40%: idem",Art. 18 §2º Lei 8.036,Exigir extrato Caixa atualizado
Horas Extras + Reflexos,[Hora normal × 1,5],[Conforme apuração],[Conforme apuração],Sim,Sim,Conforme regime,TR até 31.12.2020; IPCA-E após,Data de cada hora (1% a.m. ou SELIC),"Tabular por período; reflexos: linhas separadas"
Dano Moral,[Quantum sentença],[Único],[Único],Não,Não,Não,TR até 31.12.2020; IPCA-E após,Prolação da sentença (Tema 905 STJ),Não compõe base para outras verbas
```

**Pronto para copiar na PJe-Calc ou Excel.**

---

## Consequential-action gate

Uma planilha de liquidação vira **base de execução forçada**. Erros aqui multiplicam-se em execução.

**Check Role:**
- **Lawyer:** proceda — este é draft de work product.
- **Non-lawyer:** "A liquidação deve ser revista e assinada por advogado OAB antes de qualquer protocolo. Erros de cálculo são erros de execução."

**Antes de aceitar para archivo:**
- Advogado valida termo inicial de juros (cada um conforme jurisprudência recente)
- Advogado valida mudança de índice em 01.01.2021 (TR → IPCA-E)
- Advogado confirma incidências FGTS/INSS/IR conforme lei de cada período

---

## No silent supplement

Se jurisprudência muda (novo Tema STJ, OJ TST), avise — não preenche de modelo sem avisar. Exemplo: "Uso Tema 905 STJ para termo inicial de juros, mas pode ter mudado — advogado confirma com jurisprudência recente."

---

## What this skill does not do

- **Não computa** valores finais. Você estrutura; contador preenche.
- **Não opina sobre índices.** A tabela aponta a Lei — jurisprudência muda.
- **Não valida condenação.** Assume sentença final; seu trabalho é decompor elementos.
- **Não substitui perícia.** Se verba ilíquida (lucros cessantes), rota para contador/perito.

