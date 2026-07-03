# Conector DataJud (CNJ) — MCP

Acesso **read-only** aos metadados de processos públicos da [API Pública do DataJud/CNJ](https://datajud-wiki.cnj.jus.br/api-publica/acesso/). Servidor MCP local em Node, **sem dependências** (implementa o transporte stdio do MCP à mão) — roda com `node`, sem `npm install`.

## Ferramentas

| Ferramenta | O que faz |
|---|---|
| `datajud_buscar_processo` | Busca um processo pelo número CNJ (com ou sem máscara) num tribunal → capa (classe, assuntos, órgão julgador, data de ajuizamento, valor da causa) + timeline de movimentos. |
| `datajud_pesquisar` | Pesquisa por filtros (classe, assunto, órgão julgador, grau, faixa de data) — base para **jurimetria**. Aceita `agregacoes` (aggregations Elasticsearch) para contagens/estatísticas. |

## Configuração

Já registrado no `.mcp.json` da raiz do repositório:

```json
"datajud": { "type": "stdio", "command": "node", "args": ["connectors/datajud/server.mjs"] }
```

Ou registre manualmente no Claude Code:

```bash
claude mcp add datajud -- node /caminho/para/connectors/datajud/server.mjs
```

### Variáveis de ambiente (todas opcionais)

| Var | Padrão | Uso |
|---|---|---|
| `DATAJUD_API_KEY` | chave pública do CNJ (embutida) | A chave pública é **aberta** e publicada na wiki do CNJ; o CNJ pode rotacioná-la a qualquer momento. Se receber HTTP 401/403, pegue a chave atual em https://datajud-wiki.cnj.jus.br/api-publica/acesso/ e defina esta var. |
| `DATAJUD_BASE_URL` | `https://api-publica.datajud.cnj.jus.br` | Sobrepõe a base (testes/mock). |
| `DATAJUD_TIMEOUT_MS` | `20000` | Timeout por requisição. |

## Siglas de tribunal

`tjsp`, `tjpr`, `tjrj`, … (27 TJs) · `trf1`–`trf6` · `trt1`–`trt24` · `tre<uf>` · `stj`, `tst`, `tse`, `stm`. Siglas fora desse conjunto são rejeitadas (proteção contra SSRF no path da URL).

## Limites

- **Só metadados públicos.** Processos em **segredo de justiça** não são retornados.
- Não substitui a consulta oficial (PJe/tribunal) — confirme dados críticos (prazos, partes) na fonte antes de agir.
- O DataJud é Elasticsearch; pode retornar **HTTP 429** transiente sob carga — repita a chamada.

## Teste

```bash
node test.mjs      # self-check offline (sem rede)
npm test           # idem
```

O `test.mjs` cobre validação de sigla (guard SSRF), montagem de query, e parsing de resposta com campos ausentes/sigilosos.
