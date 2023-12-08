#!/bin/sh

asciidoctor \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --attribute revnumber=$(git describe --first-parent --tags --dirty) \
    --attribute revdate=$(date +%F) \
    --backend=html5 \
    --destination-dir=out \
    docs/*.adoc