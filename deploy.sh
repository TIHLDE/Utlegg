#!/usr/bin/env bash

set -e

COMMIT_HASH=$(git rev-parse --short HEAD)

echo "-> Building new Docker image"
docker build --no-cache -t utlegg.tihlde.org:$COMMIT_HASH .

echo "-> Stopping and removing old container"
docker rm -f utlegg.tihlde.org || true

echo "-> Starting new container"
docker run --env-file .env -p 2000:3000 --name utlegg.tihlde.org --restart unless-stopped -d utlegg.tihlde.org:$COMMIT_HASH

