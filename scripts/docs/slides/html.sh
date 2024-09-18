#!/bin/bash

REVDATE=$(date +%F)

if [[ $GITHUB_REF_NAME = v* ]]
then
  REVNUMBER=$GITHUB_REF_NAME+$GITHUB_RUN_ID
else
  REVNUMBER=${GITHUB_SHA:0:7}
fi

asciidoctor-revealjs \
    --require asciidoctor-bibtex \
    --require asciidoctor-diagram \
    --destination-dir=out \
    --attribute github-ref-name=$GITHUB_REF_NAME \
    --attribute github-repository=$GITHUB_REPOSITORY \
    --attribute github-run-id=$GITHUB_RUN_ID \
    --attribute github-server-url=$GITHUB_SERVER_URL \
    --attribute github-sha=$GITHUB_SHA \
    --attribute revdate=$REVDATE \
    --attribute revnumber=$REVNUMBER \
    --attribute revealjsdir=https://cdn.jsdelivr.net/npm/reveal.js@4.6.1 \
    docs/*.slides.adoc

mkdir -p out/resources/
cp -r docs/resources/views out/resources/