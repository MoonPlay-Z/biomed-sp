#!/bin/bash
# Script para subir cambios a biomed-sp automáticamente

if [ -z "$1" ]; then
  echo "Error: Debes proporcionar un mensaje de commit."
  echo "Uso: ./auto-biomed.sh \"Mensaje del cambio\""
  exit 1
fi

# Configurar para usar la llave de MoonPlay
git config core.sshCommand "ssh -i ~/.ssh/id_ed25519_moonplay -F /dev/null"

echo "🚀 Preparando subida a biomed-sp..."
git add .
git commit -m "$1"
git push biomed main

echo "✅ ¡Cambios subidos a GitHub!"
