# Conectores

## Como funcionam as referências de ferramentas

Os arquivos do plugin usam `~~categoria` como placeholder para a ferramenta que o usuário conectar naquela categoria. Por exemplo, `~~armazenamento em nuvem` pode significar Box, Egnyte ou qualquer outro provedor com servidor MCP.

Os plugins são **agnósticos de ferramenta** — descrevem fluxos em termos de categorias (armazenamento em nuvem, chat, suíte de escritório etc.) em vez de produtos específicos. O `.mcp.json` pré-configura servidores MCP específicos, mas qualquer servidor MCP daquela categoria funciona.

## Conectores locais (CNJ): DataJud + DJEN

Diferente dos demais (servidores HTTP de terceiros), o **DataJud** e o **DJEN** são conectores MCP **locais e próprios**, em `connectors/` — Node puro, sem dependências, já registrados no `.mcp.json` da raiz.

- **DataJud** (`connectors/datajud/`) — metadados de processos públicos da API pública do CNJ (capa, movimentos, pesquisa filtrada para jurimetria). Usa a chave pública do CNJ (sobreponível via `DATAJUD_API_KEY`). Ferramentas: `datajud_buscar_processo`, `datajud_pesquisar`. Ver `connectors/datajud/README.md`.
- **DJEN** (`connectors/djen/`) — comunicações/intimações do Diário de Justiça Eletrônico Nacional via API pública Comunica do CNJ, por OAB / nome do advogado / processo. Base do watcher de intimações; combina com `/litigation-legal:djen-watcher` e `/litigation-legal:prazos-cpc`. Sem chave. Ferramentas: `djen_consultar`, `djen_por_processo`. Ver `connectors/djen/README.md`.

## Conectores deste plugin

| Categoria | Placeholder | Servidores incluídos | Outras opções |
|----------|-------------|-----------------|---------------|
| Agenda | `~~agenda` | Google Calendar | Microsoft 365 |
| Chat | `~~chat` | Slack | Microsoft Teams |
| Armazenamento em nuvem | `~~armazenamento em nuvem` | Box, Egnyte | Dropbox, SharePoint, Google Drive |
| CLM (gestão de contratos) | `~~CLM` | — | Ironclad, Agiloft |
| CRM | `~~CRM` | — | Salesforce, HubSpot |
| E-mail | `~~e-mail` | Gmail | Microsoft 365 |
| Assinatura eletrônica | `~~assinatura eletrônica` | ICP-Brasil / Gov.br | DocuSign, Clicksign, D4Sign, Adobe Sign |
| Suíte de escritório | `~~suíte de escritório` | Microsoft 365 | Google Workspace |
| Gestão de projetos | `~~gestão de projetos` | Atlassian (Jira/Confluence) | Linear, Asana |
