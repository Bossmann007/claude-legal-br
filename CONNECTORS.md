# Conectores

## Como funcionam as referências de ferramentas

Os arquivos do plugin usam `~~categoria` como placeholder para a ferramenta que o usuário conectar naquela categoria. Por exemplo, `~~armazenamento em nuvem` pode significar Box, Egnyte ou qualquer outro provedor com servidor MCP.

Os plugins são **agnósticos de ferramenta** — descrevem fluxos em termos de categorias (armazenamento em nuvem, chat, suíte de escritório etc.) em vez de produtos específicos. O `.mcp.json` pré-configura servidores MCP específicos, mas qualquer servidor MCP daquela categoria funciona.

## Conector local: DataJud (CNJ)

Diferente dos demais (servidores HTTP de terceiros), o **DataJud** é um conector MCP **local e próprio**, em `connectors/datajud/` — Node puro, sem dependências, já registrado no `.mcp.json` da raiz. Dá acesso read-only aos metadados de processos públicos da API pública do CNJ (capa, movimentos, pesquisa filtrada para jurimetria). Sem barreira de autenticação paga: usa a chave pública do CNJ (sobreponível via `DATAJUD_API_KEY`). Ver `connectors/datajud/README.md`. Ferramentas: `datajud_buscar_processo`, `datajud_pesquisar`.

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
