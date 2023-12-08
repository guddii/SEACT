#!/bin/sh

asciidoctor-pdf \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --theme resources/themes/basic.yml \
    --attribute revnumber=$REVNUMBER \
    --attribute revdate=$REVDATE \
    --backend=pdf \
    --destination-dir=out \
    docs/*.adoc