#!/usr/bin/env bash

set -e

echo "-> Building new Docker image"
docker build -t utlegg.tihlde.org .

echo "-> Stopping and removing old container"
docker rm -f utlegg.tihlde.org || true

echo "-> Starting new container"
docker run --env-file .env -p 2000:3000 --name utlegg.tihlde.org --restart unless-stopped -d utlegg.tihlde.org

