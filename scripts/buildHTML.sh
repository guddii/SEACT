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
    --base-dir docs \
    --attribute revnumber=$REVNUMBER \
    --attribute revdate=$REVDATE \
    --backend=html5 \
    --destination-dir=out \
    docs/*.adoc