#!/bin/sh

asciidoctor-pdf \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --base-dir docs \
    --theme resources/themes/basic.yml \
    --backend=pdf \
    docs/*.adoc