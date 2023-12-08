#!/bin/sh

asciidoctor-pdf \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --theme resources/themes/basic.yml \
    --attribute revnumber=$(git describe --first-parent --tags --dirty) \
    --attribute revdate=$(date +%F) \
    --backend=pdf \
    --destination-dir=out \
    docs/*.adoc