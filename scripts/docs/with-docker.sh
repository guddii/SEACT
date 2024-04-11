#!/bin/bash

docker run \
  --env GITHUB_SHA='local' \
  --env GITHUB_RUN_ID='0' \
  --rm \
  --user $(id -u):$(id -g) \
  --volume $(pwd):/documents/ \
  \asciidoctor/docker-asciidoctor:latest \
  bash -c "$@"