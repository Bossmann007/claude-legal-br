---
name: crypto-asset-triage
description: >
  Triage de ativo virtual — Lei 14.478/2022 (Marco Legal dos Criptoativos), VASP
  (prestadora de serviços), classificação como valor mobiliário (CVM), custody,
  AML/PLD (Lei 9.613/1998). Pergunta pelo ativo, retorna classificação e gaps.
user-invocable: true
argument-hint: "[nome-do-ativo-ou-descrição]"
---

# Crypto-Asset Classification Triage

## Matter context

This skill helps classify a digital asset (cryptocurrency, token, stablecoin, etc.) under Brazilian law: Is it regulated by BCB as a virtual asset (VASP rules apply)? Is it a security under CVM jurisdiction? Does it require specific custody or AML treatment? It does not give you a legal opinion; it surfaces the questions a lawyer should answer.

Read `## Organization profile` in `~/.claude/plugins/config/claude-for-legal/banking-fintech-legal/CLAUDE.md` first to see if you've pre-recorded positions on which assets/cryptocurrencies you accept or plan to support.

---

## Purpose

Brazil's regulatory framework for crypto-assets is evolving `[model knowledge — verify]`. Three regimes intersect:

1. **Lei 14.478/2022 (Marco Legal dos Criptoativos)** — establishes VASP (prestadora de serviços de ativo virtual) framework `[model knowledge — verify]`
2. **BCB oversight** — VASP registration, AML/PLD rules, custody standards `[model knowledge — verify]`
3. **CVM oversight** — if the token is a security (valor mobiliário under Lei 6.385/1976), separate rules apply `[model knowledge — verify]`

The critical question: **Is this asset a virtual asset (VASP-regulated) or a security (CVM-regulated) or both?** The answer determines what your compliance, custody, and operational obligations are.

## Jurisdiction assumption / Premissa de jurisdição (Brasil)

- **Lei 14.478/2022** — Marco Legal dos Criptoativos; defines "ativo virtual" (Art. 2º) and VASP obligations `[model knowledge — verify]`
- **BCB regulation** — BCB is the VASP supervisor (resolutions pending or recently issued) `[model knowledge — verify]`
- **Lei 6.385/1976** — Lei do Mercado de Capitais; defines "valor mobiliário" (security); CVM regulates securities `[model knowledge — verify]`
- **Lei 9.613/1998** — Lei de Prevenção à Lavagem de Dinheiro (AML/PLD); applies to VASP operators `[model knowledge — verify]`

---

## Load the playbook

Read `~/.claude/plugins/config/claude-for-legal/banking-fintech-legal/CLAUDE.md` → `## Playbook` → `### Crypto-Assets (VASP)`. Your playbook should record:
- **VASP registration status:** You are / are not registered as VASP
- **Acceptable cryptocurrencies:** whitelist of assets you support (Bitcoin, Ethereum, etc.)
- **Token classification rules:** how you decide if a token is a security (checklist or decision process)
- **Custody model:** self-custodial, custodian, hybrid
- **AML/PLD approach:** KYC requirements, enhanced due diligence for high-risk jurisdictions

If blank, I'll flag what you need to decide with a lawyer before onboarding any asset.

---

## Analysis

### 1. Is this a virtual asset (VASP-regulated)?

**Lei 14.478/2022 definition** `[model knowledge — verify]`: An "ativo virtual" is a representation of value in digital format, not issued by a central bank, used as medium of exchange or investment, and transferable via distributed ledger technology.

**Examples:**
- ✓ Bitcoin, Ethereum, and major cryptocurrencies
- ✓ Layer-2 tokens (Polygon, Arbitrum) — if not securitized
- ✓ Stablecoins (USDC, USDT) — even though backed by USD
- ? Custom tokens issued by a company — depends on whether they're securities (see below)

**If it's a virtual asset:** VASP registration with BCB is required if you operate as a VASP (providing wallet, exchange, custody, etc.). See your playbook for your VASP status.

### 2. Is it also a security (CVM-regulated)?

A token can be both a virtual asset (VASP-regulated) AND a security (CVM-regulated). The triage:

**A token is a security if it represents** `[model knowledge — verify]`:
- Ownership interest in a company (equity-like)
- Debt obligation (bond-like)
- Profit-sharing or yield (similar to investment contract)
- Governance rights with value
- An option, futures, or derivative

**A token is NOT a security if it is** `[model knowledge — verify]`:
- A pure utility token (grants access to a service, like a voucher; no profit expectation)
- A medium of exchange with no yield (pure currency-like, e.g., Bitcoin held for spending)

**Ambiguous cases:**
- ✗ Staking rewards tied to the token: could make it a security (profit-sharing)
- ✗ APY/yield from lending platform: could be security-like
- ✗ DAO tokens with governance + profit share: likely a security
- ✓ Community token with no yield, used only in a game: likely utility

**If it's a security:** CVM registration required before you offer it to Brazilian customers. Separate framework from VASP. Do NOT proceed without CVM legal review.

### 3. Custody and safekeeping

**Lei 14.478/2022 custody requirement** `[model knowledge — verify]`: If you hold customer assets in custody, you must:
- Segregate customer assets from your own
- Hold keys/credentials in secure storage (hardware wallet, multi-sig, custodian bank)
- Have insurance or bonding for loss/theft
- Maintain audit trail

**Your custody model:** Are you:
- **Self-custodial:** Customer holds their own keys; you only facilitate transactions (lower custody risk)
- **Custodian:** You hold keys on behalf of customers (high custody responsibility; insurance/bonding required)
- **Hybrid:** Customer can choose

Check your playbook for your custody model. If blank, decide with a lawyer before accepting customer assets.

### 4. AML/PLD (Lei 9.613/1998)

Any VASP operator handling customer funds must comply with AML/PLD:

- **Know Your Customer (KYC):** Identify customer, verify beneficial ownership, understand source of funds `[model knowledge — verify]`
- **Customer Due Diligence (CDD):** Ongoing monitoring for suspicious activity (rapid large transfers, structuring, high-risk jurisdictions) `[model knowledge — verify]`
- **Suspicious Activity Reporting (SAR):** Report to COAF (Conselho de Controle de Atividades Financeiras) if suspicion of money laundering `[model knowledge — verify]`

**Your AML/PLD program:** Do you have KYC workflows? Do you flag high-risk jurisdictions? Do you have a process to file SARs? Check your playbook. If blank, this is mandatory for any VASP — non-negotiable.

### 5. No silent supplement

If your playbook doesn't address crypto assets yet (you haven't decided which ones to support or whether to be a VASP), I'll flag and ask: "Your playbook doesn't record a crypto asset strategy. Options: (1) you plan to offer crypto — tell me which assets and I'll triage each; (2) you don't plan to offer crypto — no triage needed; (3) decision pending." Do not onboard a token/crypto without a triage.

---

## Consequential-action gate

**Before registering as a VASP with BCB, deciding to offer a token, or accepting any crypto-asset:**

Read `## Who's using this` in `~/.claude/plugins/config/claude-for-legal/banking-fintech-legal/CLAUDE.md`. If the Role is **Non-lawyer**:

> Registering as a VASP or offering a crypto-asset in Brazil has material regulatory and custody implications. VASP registration commits you to BCB supervision, KYC/AML, custody safeguards, and reporting requirements. Token classification (is it a security?) determines whether CVM registration is required. These decisions should be reviewed with an attorney. Have you discussed your crypto strategy with legal counsel?
>
> If yes, proceed. If no, here's what to bring to them:
>
> - Business model: are you a VASP (exchange, wallet, custody, lending)? Or a token issuer?
> - Asset list: which cryptocurrencies or tokens you plan to support (with brief description of each)
> - For each token: does it have yield, governance, or profit-sharing? (might be a security)
> - Custody: how will you hold customer assets (self-custodial, you're custodian, third-party custodian)?
> - AML/PLD: do you have KYC workflows and SAR processes in place?
>
> (If you need a lawyer: OAB Brasil by estado; search "especialista em criptoativos" or "especialista em direito financeiro".)

Do not register with BCB or launch without legal sign-off.

---

## What this skill does not do

- **Does not advise on US/international crypto regulation.** If your users include US persons or you operate cross-border, FinCEN/SEC/other regulators apply — separate review.
- **Does not draft VASP registration applications.** Triage identifies requirements; a lawyer and regulatory consultant draft the BCB filing.
- **Does not audit your KYC/AML program.** Full AML audit is a separate engagement; this skill confirms you have the program.
- **Does not value the token or advise on investment merit.** Economic value or price is not legal analysis.
- **Does not cover DeFi (decentralized finance).** If your product is a smart contract (no central operator), regulation is unclear — escalate to a specialized lawyer.

---

*For BCB guidance on VASP: www.bcb.gov.br (search "ativo virtual"). For CVM on securities: www.cvm.gov.br.*
