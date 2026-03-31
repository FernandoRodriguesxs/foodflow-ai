#!/bin/bash

# Recebe dados do hook via stdin (JSON)
INPUT=$(cat)

# Extrai file_path do JSON de input
file_path=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$file_path" ] || [ "$file_path" = "null" ]; then
  exit 0
fi

if ! echo "$file_path" | grep -qE '\.(ts|tsx|js|jsx|json)$'; then
  exit 0
fi

if ! [ -f "$file_path" ]; then
  exit 0
fi

bunx biome check --write "$file_path" 2>&1
exit 0
