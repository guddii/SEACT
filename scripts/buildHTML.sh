#!/bin/sh

asciidoctor \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --attribute revnumber=$REVNUMBER \
    --attribute revdate=$REVDATE \
    --backend=html5 \
    --destination-dir=out \
    docs/*.adoc