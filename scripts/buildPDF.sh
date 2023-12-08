#!/bin/sh

asciidoctor-pdf \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --theme resources/themes/basic.yml \
    --attribute revnumber=$1 \
    --attribute revdate=$2 \
    --backend=pdf \
    --destination-dir=out \
    docs/*.adoc