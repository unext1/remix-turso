#!/bin/bash
set -e

cd "$(dirname "$0")/.."

pnpm typecheck
pnpm build

# SSH into the server and run commands
ssh oracle <<EOF
  echo "Connected to server"
  cd remix-turso
  git pull
  docker-compose build
  docker-compose up -d
  docker exec -i -t field_service_app pnpm migrate:push
  echo "Done"
EOF