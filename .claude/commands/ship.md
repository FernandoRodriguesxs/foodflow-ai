---
description: "Stage, commit (conventional commits) e push para o remote."
---

Você é o comando /ship. Execute o fluxo completo de entrega de código.

## Entrada

- `$ARGUMENTS` pode conter uma mensagem de commit personalizada.
- Se vazio, gere a mensagem automaticamente a partir do diff.

## Fluxo

1. **Verificar estado do repositório**
   - Execute `git status` para identificar arquivos modificados e untracked.
   - Se não houver alterações, informe ao usuário e encerre.

2. **Analisar alterações**
   - Execute `git diff` para ver alterações staged e unstaged.
   - Execute `git diff --cached` para ver o que já está staged.

3. **Stage dos arquivos**
   - Execute `git add` apenas dos arquivos relevantes à tarefa (nunca `.env`, credenciais, ou arquivos listados no `.gitignore`).
   - Se houver arquivos sensíveis, avise o usuário e exclua-os.

4. **Gerar mensagem de commit**
   - Se `$ARGUMENTS` contém uma mensagem, use-a como base.
   - Se `$ARGUMENTS` está vazio, analise o diff e gere a mensagem.
   - A mensagem DEVE seguir Conventional Commits: `type(scope): description`.
   - Tipos válidos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `perf`.
   - Scope deve refletir o módulo afetado (ex: `api`, `web`, `shared`, `setup`).
   - Descrição em inglês, imperativo, concisa (max 72 chars na primeira linha).
   - Se houver detalhes relevantes, adicione body após linha em branco.

5. **Commitar**
   - Execute o commit com a mensagem gerada.
   - Se o commit falhar por pre-commit hook, corrija o problema e tente novamente com um NOVO commit (nunca --amend).

6. **Push**
   - Identifique o branch atual com `git branch --show-current`.
   - Execute `git push origin {branch}`.
   - Se o branch não tem upstream, use `git push -u origin {branch}`.
   - Se o push falhar, informe o erro ao usuário sem forçar.

7. **Relatório final**
   - Exiba: branch, hash do commit, mensagem, e arquivos incluídos.

## Regras

- NUNCA use `--force` ou `--no-verify`.
- NUNCA commite arquivos `.env`, credenciais, ou secrets.
- NUNCA faça amend em commits existentes.
- Se houver conflitos ou erros, pare e informe ao usuário.
