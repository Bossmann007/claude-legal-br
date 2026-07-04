# Aviso, Riscos e Limitação de Responsabilidade

**Leia antes de usar.** Este documento descreve o que o `claude-legal-br` é, o que **não** é, os riscos de cada componente, e de quem é a responsabilidade por cada um. Ao instalar, configurar ou usar qualquer parte deste projeto — plugins, skills, cookbooks ou conectores — você declara ter lido e aceito integralmente os termos abaixo.

---

## 1. Natureza do software

`claude-legal-br` é um conjunto de ferramentas de **apoio a fluxo de trabalho jurídico** que roda sobre o Claude Code / Claude API. Ele **não é**, e não pretende ser:

- um escritório de advocacia, nem advogado(a);
- uma fonte oficial de prazos, publicações ou andamentos processuais;
- um substituto do controle de prazos, do sistema oficial do tribunal (PJe, e-SAJ, Projudi, Domicílio Judicial Eletrônico) ou do julgamento de um(a) advogado(a) inscrito(a) na OAB;
- um serviço com garantia de disponibilidade, exatidão, atualidade ou adequação a qualquer finalidade.

**Toda saída é rascunho para revisão de advogado(a) habilitado(a) antes de embasar qualquer decisão, petição, prazo ou aconselhamento.** A responsabilidade final por qualquer ato jurídico é, sempre e exclusivamente, do(a) profissional que o pratica.

---

## 2. Fornecido "COMO ESTÁ" — sem garantia

O software é fornecido **"como está" e "conforme disponível"**, sem garantia de qualquer natureza, expressa ou implícita, incluindo — sem limitação — garantias de comerciabilidade, adequação a um fim específico, exatidão jurídica, atualidade da legislação, ou não violação.

O(s) autor(es) e contribuidor(es) **não garantem** que:

- as citações legais, súmulas, artigos, prazos ou cálculos estejam corretos ou vigentes;
- os conectores retornem dados completos, atuais ou livres de erro;
- o software esteja livre de defeitos, interrupções ou falhas de segurança.

---

## 3. Limitação de responsabilidade

Na máxima extensão permitida pela lei aplicável, **o(s) autor(es) e contribuidor(es) não serão responsáveis** por qualquer dano — direto, indireto, incidental, especial, consequencial, moral, ou lucros cessantes — decorrente de ou relacionado ao uso, à impossibilidade de uso, ou aos resultados do software, incluindo, sem limitação:

- **perda de prazo** processual ou material;
- **citação legal incorreta, desatualizada ou fabricada** utilizada em peça, parecer ou decisão;
- **vazamento, exposição ou tratamento indevido de dados pessoais** de clientes ou terceiros;
- **decisão profissional** tomada com base em qualquer saída do software;
- **indisponibilidade, lentidão, bloqueio (rate-limit) ou erro** de qualquer API pública de terceiros (CNJ/DataJud, DJEN, ou outras).

O uso é feito **por conta e risco exclusivo do(a) usuário(a)**. A responsabilidade por verificar, validar e assumir qualquer saída é integralmente do(a) advogado(a) ou profissional que a utiliza.

---

## 4. Responsabilidades do(a) usuário(a)

Ao usar este software, você assume a responsabilidade por:

- **Verificar toda citação legal** contra a fonte primária (Planalto, DJe do tribunal, JusBrasil/Escavador) antes de confiar. As tags de proveniência (`[model knowledge — verify]`, `[settled — data]`, `[JusBrasil]`, etc.) descrevem **de onde veio** a informação, **não** que ela está correta.
- **Manter o controle oficial de prazos** no sistema do tribunal. Este software é rede de segurança adicional, **nunca** a fonte da verdade.
- **Proteger os dados pessoais** que trafegam ou ficam armazenados na sua máquina (ver §5.3), em conformidade com a LGPD (Lei 13.709/2018) — você é o **controlador** desses dados.
- **Confirmar a base legal** e o segredo de justiça antes de colar ou processar qualquer dado sensível ou sigiloso.
- **Manter chaves e credenciais** próprias seguras e fora de versionamento.

---

## 5. Riscos por componente

Ranqueados por dano potencial real.

### 5.1 🔴 Conectores CNJ — falso-negativo → prazo perdido

Os conectores **DataJud** e **DJEN** consultam índices públicos federados do CNJ. **A indexação atrasa e é incompleta.** Se uma intimação ou movimentação ainda não foi indexada, o `/bom-dia` pode exibir "nada novo" — sem que isso signifique que nada ocorreu.

> **Ausência de resultado não é prova de ausência de prazo.** Missar uma intimação por confiar apenas neste software pode configurar perda de prazo. O controle oficial (PJe / Domicílio Judicial Eletrônico) é a única fonte da verdade. A responsabilidade por essa verificação é integralmente do(a) usuário(a).

### 5.2 🟠 Segredo de justiça — filtro não é parede

O conector DataJud filtra processos com `nivelSigilo > 0` do lado do cliente. É uma proteção adicional sobre uma API que já deveria não retornar sigilosos — **não é garantia**. Processos em segredo de justiça geralmente **não aparecem**; não confunda a ausência deles com inexistência. Não há garantia de que nenhum dado sigiloso jamais seja retornado por falha de reindexação da fonte pública.

### 5.3 🟠 LGPD — dados pessoais na sua máquina

O DJEN retorna **nome, número de OAB e o texto de intimações**. O watcher armazena isso localmente em `intimacoes-vistas.yaml` (para deduplicação). Isso é **dado pessoal** (LGPD art. 37). O arquivo está no `.gitignore`, mas:

- **não sincronize** esse arquivo para nuvem compartilhada nem o versione;
- você é o **controlador** desses dados e responde por seu tratamento;
- para dev/teste, use dados anonimizados.

### 5.4 🟡 Rate-limit / throughput

O DataJud usa, por padrão, a **chave pública compartilhada** do CNJ, sujeita a limitação de requisições (HTTP 429). Sob volume, o `/bom-dia` pode bater o limite e **pular processos**. O backoff é limitado. Não assuma cobertura total de uma varredura; para volume, use uma chave própria via `DATAJUD_API_KEY` e limite o número de processos por rodada.

### 5.5 🟡 Dado é metadado, não mérito

Os conectores retornam **movimentação e capa** — não autos, não peças, não decisão de mérito. Um movimento processual é metadado; **não conclua procedência, resultado ou estratégia** a partir dele.

### 5.6 🟡 Conteúdo de terceiros / prompt-injection

O texto de intimações e movimentos é escrito por terceiros (inclusive a parte adversária). O software o trata como **dado, não instrução** (envelope in-band + plugin `anti-injection`). Essa é uma **camada de detecção**, não uma parede — não confie cegamente em nenhum texto retornado.

### 5.7 🟡 Exatidão e vigência das citações

As bases legais evoluem. Uma citação correta na data de escrita pode estar revogada, modulada ou superada por jurisprudência depois. O software **não versiona a legislação**; ele reflete o conhecimento do modelo mais o que foi verificado manualmente, com as ressalvas tagueadas. **Confirme a vigência antes de protocolar.**

---

## 6. APIs e serviços de terceiros

Os conectores acessam APIs públicas de terceiros (CNJ/DataJud, DJEN/Comunica). O(s) autor(es) deste projeto **não controlam, não operam e não respondem** por essas APIs — sua disponibilidade, exatidão, termos de uso, políticas de dados ou mudanças. O uso dessas APIs sujeita-se aos termos dos respectivos provedores, cuja observância é responsabilidade do(a) usuário(a).

---

## 7. Sem relação advogado-cliente

O uso deste software **não estabelece** qualquer relação advogado-cliente entre o(a) usuário(a) e o(s) autor(es), nem entre o(a) usuário(a) e a Anthropic. O(s) autor(es) não prestam serviço jurídico.

---

## 8. Aceitação

Se você não concorda com qualquer termo acima, **não use** este software. O uso continuado constitui aceitação integral destes termos e a assunção de todos os riscos aqui descritos.

---

*Este documento é um aviso de risco e limitação de responsabilidade do software, não um parecer jurídico. Última revisão: 2026-07-03.*
