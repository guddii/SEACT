#!/bin/sh

if [ -z "${REVNUMBER}" ]; then
    REVNUMBER=$(git describe --first-parent --tags --dirty)
fi

if [ -z "${REVDATE}" ]; then
    REVDATE=$(date +%F)
fi

asciidoctor-pdf \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --theme docs/resources/themes/basic.yml \
    --attribute revnumber=$REVNUMBER \
    --attribute revdate=$REVDATE \
    --backend=pdf \
    --destination-dir=out \
    docs/*.adoc