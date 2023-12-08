#!/bin/sh

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