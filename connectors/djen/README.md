# Conector DJEN (CNJ) — MCP

Acesso **read-only** às comunicações/intimações do **DJEN** (Diário de Justiça Eletrônico Nacional) via [API pública Comunica do CNJ](https://comunicaapi.pje.jus.br/api/v1/comunicacao). Servidor MCP local em Node, **sem dependências** (transporte stdio implementado à mão) — mesma arquitetura do conector `datajud/`.

**API pública, sem chave de autenticação.**

## Ferramentas

| Ferramenta | O que faz |
|---|---|
| `djen_consultar` | Consulta intimações por OAB (`numeroOab`+`ufOab`), nome do advogado, e/ou intervalo de datas de disponibilização (+ filtro por tribunal). Base do "watcher" de intimações. |
| `djen_por_processo` | Intimações de um processo específico pelo número CNJ. |

Exige ao menos um filtro identificador (OAB, nome, ou processo) — senão a API recusaria (retornaria o diário nacional inteiro).

## Configuração

Já registrado no `.mcp.json` da raiz:

```json
"djen": { "type": "stdio", "command": "node", "args": ["connectors/djen/server.mjs"] }
```

Ou manualmente:

```bash
claude mcp add djen -- node /caminho/para/connectors/djen/server.mjs
```

### Variáveis de ambiente (opcionais)

| Var | Padrão | Uso |
|---|---|---|
| `DJEN_BASE_URL` | `https://comunicaapi.pje.jus.br/api/v1/comunicacao` | Sobrepõe a base (testes/mock). |
| `DJEN_TIMEOUT_MS` | `45000` | Timeout por requisição. |

## Prazo (importante)

A **data de disponibilização** (`dataDisponibilizacao`) inicia a contagem do prazo. A intimação considera-se realizada no **dia útil seguinte** à disponibilização, e o prazo começa a correr no dia útil seguinte a esse (Lei 11.419/2006, art. 4º §§3º-4º `[model knowledge — verify]`). Combine com `/litigation-legal:prazos-cpc` para calcular a data-limite em dias úteis (CPC art. 219).

## Limites

- Só comunicações **públicas**. Processos em segredo de justiça não aparecem.
- **A API é lenta e instável** sob carga — queries amplas (nome comum, janela grande) podem dar timeout. Reduza a janela/refine o filtro e **repita**.
- Não substitui a consulta oficial (PJe/Domicílio Judicial Eletrônico) — confirme antes de agir sobre um prazo.

## Teste

```bash
node test.mjs   # self-check offline (sem rede)
```

Cobre validação de UF/OAB, montagem de query (filtro obrigatório, clamp de página), e parsing de comunicação com campos snake/camel mistos.
