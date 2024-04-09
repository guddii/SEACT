#!/bin/sh

# Build with Docker
# docker run --rm -u $(id -u):$(id -g) --volume $(pwd):/documents/ asciidoctor/docker-asciidoctor:latest bash -c ./scripts/buildSlides.sh

if [ -z "${REVNUMBER}" ]; then
    REVNUMBER=$(git describe --first-parent --tags --dirty)
fi

if [ -z "${REVDATE}" ]; then
    REVDATE=$(date +%F)
fi

asciidoctor-revealjs \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --destination-dir=out \
    --attribute revnumber=$REVNUMBER \
    --attribute revdate=$REVDATE \
    --attribute revealjsdir=https://cdn.jsdelivr.net/npm/reveal.js@4.1.2 \
    docs/*.slides.adoc
