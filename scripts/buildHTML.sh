#!/bin/sh

# Build with Docker
# docker run --rm -u $(id -u):$(id -g) --volume $(pwd):/documents/ asciidoctor/docker-asciidoctor:latest bash -c ./scripts/buildHTML.sh

if [ -z "${REVNUMBER}" ]; then
    REVNUMBER=$(git describe --first-parent --tags --dirty)
fi

if [ -z "${REVDATE}" ]; then
    REVDATE=$(date +%F)
fi

asciidoctor \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --destination-dir=out \
    --attribute revnumber=$REVNUMBER \
    --attribute revdate=$REVDATE \
    --backend=html5 \
    docs/*.adoc