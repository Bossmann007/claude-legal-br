# Quick Start

**60 seconds.** This gets you to using your plugins.

## Install in Claude Cowork
1. [Install Claude Desktop](https://claude.com/download)
2. Get access to Claude Cowork
3. Follow the instructions in the video below:

https://github.com/user-attachments/assets/51394f0a-5277-4fe2-b81c-5c5e9ac876b5

## Install in Claude Code

1. **Baixe este repositório.** Na página do GitHub, clique no botão verde **`Code` → `Download ZIP`**. Salve na Área de Trabalho e **descompacte** (dois cliques no arquivo `.zip`). Você terá uma pasta `claude-legal-br`.

   *(Quem usa git: `git clone https://github.com/Bossmann007/claude-legal-br.git`.)*

   **Pré-requisito para os conectores CNJ (DataJud/DJEN):** o `/bom-dia` e a consulta a processos rodam em Node. Se `node --version` no terminal der erro, instale o [Node.js LTS](https://nodejs.org) (instalador padrão, next-next-finish) antes de usar esses comandos. Os demais plugins funcionam sem Node.

2. **Open Claude Code** (in your terminal) or **Claude Cowork** (the desktop app). Not sure which you have? If you have a terminal window open with Claude in it, that's Claude Code.

3. **Add the marketplace.** In Claude Code, type `/plugin marketplace add ` (with a space at the end), then **drag the unzipped `claude-legal-br` folder onto the terminal window** — it'll fill in the path. Then press Enter.

   (Or type the full path: `/plugin marketplace add /Users/you/Desktop/claude-legal-br`)

4. **Install your plugin.** Pick the one that matches your work from the table below, then:
   ```
   /plugin install privacy-legal@claude-legal-br
   ```

5. **⚠️ Restart Claude Code.** Close and reopen. This step is not optional — the plugin isn't live until you restart.

6. **Run setup.** Takes 2 minutes (quick start) or 10-15 minutes (full).
   ```
   /privacy-legal:cold-start-interview
   ```
   *(Opcional — cada skill já roda genérico de cara; o setup só calibra ao seu perfil.)*

7. **Connect a research tool.** Citations are flagged unverified without one. In Cowork: Settings → Connectors → add JusBrasil/Escavador/PJe (or INPI for IP matters). In Claude Code: the plugin already lists the research MCP in its config; you'll be prompted to authorize it the first time a skill needs it.

## Install user-scoped, not project-scoped

When you run `/plugin install`, you may be asked whether to install for this project only or for all projects (user scope). **Pick user scope.**

It's counterintuitive: project scope feels safer. But project scope blocks the plugin from reading files outside the project folder — your outlines in Downloads, your contract in Documents, your client file in Dropbox. Most skills need to read your files. User scope doesn't give the plugin any extra access to your files — the plugin can only read files you explicitly point it at or that are in the current directory. It just means the plugin works from any folder instead of one.

If you already installed project-scoped and want to switch: `/plugin uninstall <plugin>`, then `/plugin install <plugin>@claude-legal-br` from your home directory.

## Qual sua área? Instale só o que precisa

```
/plugin install litigation-legal@claude-legal-br
```

| Sua área | Instale | Primeiro comando |
|---|---|---|
| Contencioso / advocacia geral | `litigation-legal`, `commercial-legal` | `/litigation-legal:matter-intake` |
| Trabalhista | `employment-legal`, `litigation-legal` | `/employment-legal:wage-hour-qa` |
| Privacidade / LGPD | `privacy-legal`, `digital-ecommerce-legal` | `/privacy-legal:use-case-triage` |
| Digital / e-commerce / startup | `digital-ecommerce-legal`, `product-legal` | `/digital-ecommerce-legal:cold-start-interview` |
| Médico / saúde | `health-medical-legal` | `/health-medical-legal:cold-start-interview` |
| Bancário / fintech / cripto | `banking-fintech-legal` | `/banking-fintech-legal:cold-start-interview` |
| Corporativo / M&A / regulatório | `corporate-legal`, `regulatory-legal`, `ai-governance-legal` | `/corporate-legal:diligence-issue-extraction` |
| Propriedade intelectual / marcas | `ip-legal` | `/ip-legal:clearance` |
| Estudante / clínica / faculdade | `law-student`, `legal-clinic` | `/law-student:cold-start-interview` |

**Recomendado para todos:** instale também `anti-injection@claude-legal-br` — camada de detecção que rotula texto de terceiros (peças da contraparte, e-mails, PDFs) como dado, não instrução.

**Conectores CNJ (DataJud/DJEN):** já vêm no `.mcp.json` da raiz do repositório — consulta pública read-only de processos e intimações. Não precisam de install separado; o Claude Code os detecta ao abrir o repositório. Veja `CONNECTORS.md`.

**Não instale tudo.** Cada plugin carregado gasta contexto. Instale sua área; adicione outra depois se precisar — `/plugin install <nome>@claude-legal-br`.

## What you're installing

Each plugin learns your playbook through a setup interview, writes it to a practice profile file (`~/.claude/plugins/config/claude-for-legal/<plugin>/CLAUDE.md`), and every skill reads from it. The profile is yours — edit it, re-run setup, or tell a skill to update it.

**Every output is a draft for attorney review.** The plugins flag what they're unsure about, mark citations by source, and gate anything irreversible. A lawyer reviews, verifies, and takes responsibility. They make that review faster; they don't replace it.

## What's in the box

16 plugins (12 áreas de prática + 4 originais BR, incluindo `anti-injection`), managed-agent cookbooks, e 2 conectores CNJ locais (DataJud, DJEN). A referência completa está no [README.md](README.md).

## Stuck?

- **"Command not found"** after install → you forgot step 5. Restart Claude Code.
- **"Run setup first"** → run `/<plugin>:cold-start-interview` before any other command.
- **`/bom-dia` ou consulta de processo falha / conector "não conecta"** → falta Node. Rode `node --version`; se der erro, instale o [Node.js LTS](https://nodejs.org) e reabra o Claude Code (passo 1).
- **Citations flagged `[verify]`** → connect a research tool (step 7). Without one, every cite is from training data, not a current database.
- **"I can't read [file]"** → most often this means the plugin is project-scoped and the file is outside the project folder. See "Install user-scoped, not project-scoped" above — reinstall user-scoped or move the file into the project folder.
- **The plugin doesn't do X** → run `/legal-builder-hub:related-skills-surfacer` to find a better match, or check the plugin's README for "What this plugin does not do."
