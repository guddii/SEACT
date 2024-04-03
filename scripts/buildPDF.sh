#!/bin/sh

# Build with Docker
# docker run --rm -u $(id -u):$(id -g) --volume $(pwd):/documents/ asciidoctor/docker-asciidoctor:latest bash -c ./scripts/buildPDF.sh

if [ -z "${REVNUMBER}" ]; then
    REVNUMBER=$(git describe --first-parent --tags --dirty)
fi

if [ -z "${REVDATE}" ]; then
    REVDATE=$(date +%F)
fi

asciidoctor-pdf \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --destination-dir=out \
    --theme docs/resources/themes/basic.yml \
    --attribute revnumber=$REVNUMBER \
    --attribute revdate=$REVDATE \
    --backend=pdf \
    docs/*.adoc