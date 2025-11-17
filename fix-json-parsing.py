#!/usr/bin/env python3
"""
Script para corrigir chamadas inseguras de response.json() no codebase.
Adiciona validação de content-type e error handling adequado.
"""

import re
import os
from pathlib import Path

# Lista de arquivos a serem corrigidos
FILES_TO_FIX = [
    "apps/web/components/task-details.tsx",
    "apps/web/components/file-browser.tsx",
    "apps/web/components/terminal.tsx",
    "apps/web/components/file-editor.tsx",
    "apps/web/components/repo-selector.tsx",
    "apps/web/components/task-form.tsx",
    "apps/web/components/api-keys-dialog.tsx",
    "apps/web/components/task-sidebar.tsx",
    "apps/web/components/repo-commits.tsx",
    "apps/web/components/repo-issues.tsx",
    "apps/web/components/repo-pull-requests.tsx",
    "apps/web/components/sandboxes-dialog.tsx",
    "apps/web/components/create-pr-dialog.tsx",
    "apps/web/components/merge-pr-dialog.tsx",
    "apps/web/components/revert-commit-dialog.tsx",
    "apps/web/components/auth/github-auth.tsx",
    "apps/web/lib/hooks/use-task.ts",
    "apps/web/lib/github-stars.ts",
]


def add_safeJson_import(content: str, filepath: str) -> str:
    """Adiciona o import do safeJson se ainda não existir."""
    if "safeJson" in content:
        return content

    # Procura por um import de '@/lib/' para inserir próximo
    import_pattern = r"(import .* from ['\"]@/lib/[^'\"]+['\"])"
    match = re.search(import_pattern, content)

    if match:
        # Insere após o último import de @/lib/
        last_import = match.group(0)
        import_pos = content.rfind(last_import) + len(last_import)
        return (
            content[:import_pos]
            + "\nimport { safeJson } from '@/lib/utils/fetch-json'"
            + content[import_pos:]
        )

    # Se não encontrou imports de @/lib/, adiciona após toast
    toast_pattern = r"(import .* from ['\"]sonner['\"])"
    match = re.search(toast_pattern, content)

    if match:
        last_import = match.group(0)
        import_pos = content.rfind(last_import) + len(last_import)
        return (
            content[:import_pos]
            + "\nimport { safeJson } from '@/lib/utils/fetch-json'"
            + content[import_pos:]
        )

    # Fallback: adiciona no início após 'use client'
    if "'use client'" in content or '"use client"' in content:
        client_pos = content.find("'use client'")
        if client_pos == -1:
            client_pos = content.find('"use client"')

        # Encontra o fim da linha
        newline_pos = content.find("\n", client_pos)
        if newline_pos != -1:
            # Pula linhas vazias
            while content[newline_pos + 1 : newline_pos + 2] == "\n":
                newline_pos += 1

            return (
                content[: newline_pos + 1]
                + "\nimport { safeJson } from '@/lib/utils/fetch-json'\n"
                + content[newline_pos + 1 :]
            )

    return content


def fix_unsafe_json_calls(content: str) -> str:
    """
    Substitui chamadas inseguras de .json() por safeJson().
    Mantém a estrutura do código intacta.
    Captura todas as variações: response, fetchResponse, res, etc.
    """

    # Padrão 1: const variable = await VARNAME.json()
    pattern1 = r"const\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)"
    content = re.sub(pattern1, r"const \1 = await safeJson(\2)", content)

    # Padrão 2: let variable = await VARNAME.json()
    pattern2 = r"let\s+(\w+)\s*=\s*await\s+(\w+)\.json\(\)"
    content = re.sub(pattern2, r"let \1 = await safeJson(\2)", content)

    # Padrão 3: variable = await VARNAME.json() (reassignment)
    pattern3 = r"(\w+)\s*=\s*await\s+(\w+)\.json\(\)"
    content = re.sub(pattern3, r"\1 = await safeJson(\2)", content)

    # Padrão 4: return await VARNAME.json()
    pattern4 = r"return\s+await\s+(\w+)\.json\(\)"
    content = re.sub(pattern4, r"return await safeJson(\1)", content)

    return content


def process_file(filepath: str) -> tuple[bool, str]:
    """
    Processa um arquivo aplicando as correções.
    Retorna (sucesso, mensagem).
    """
    full_path = Path(filepath)

    if not full_path.exists():
        return False, f"Arquivo não encontrado: {filepath}"

    try:
        # Lê o arquivo
        with open(full_path, "r", encoding="utf-8") as f:
            original_content = f.read()

        # Aplica correções
        content = add_safeJson_import(original_content, filepath)
        content = fix_unsafe_json_calls(content)

        # Verifica se houve mudanças
        if content == original_content:
            return True, f"✓ {filepath} - Nenhuma mudança necessária"

        # Escreve o arquivo corrigido
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)

        # Conta quantas substituições foram feitas
        changes = content.count("safeJson") - original_content.count("safeJson")

        return True, f"✓ {filepath} - {changes} chamadas corrigidas"

    except Exception as e:
        return False, f"✗ {filepath} - Erro: {str(e)}"


def main():
    """Processa todos os arquivos da lista."""
    print("🔧 Iniciando correção de chamadas JSON inseguras...\n")

    success_count = 0
    error_count = 0

    for filepath in FILES_TO_FIX:
        success, message = process_file(filepath)
        print(message)

        if success:
            success_count += 1
        else:
            error_count += 1

    print(f"\n📊 Resumo:")
    print(f"  ✓ Sucesso: {success_count} arquivos")
    print(f"  ✗ Erros: {error_count} arquivos")

    if error_count == 0:
        print("\n✅ Todas as correções foram aplicadas com sucesso!")
        return 0
    else:
        print("\n⚠️  Alguns arquivos tiveram problemas. Revise os erros acima.")
        return 1


if __name__ == "__main__":
    exit(main())
