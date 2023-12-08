#!/bin/sh

asciidoctor \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --attribute revnumber=$1 \
    --attribute revdate=$2 \
    --backend=html5 \
    --destination-dir=out \
    docs/*.adoc