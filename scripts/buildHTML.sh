#!/bin/sh

asciidoctor \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --backend=html5 \
    docs/*.adoc