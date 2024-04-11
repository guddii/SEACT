#!/bin/bash

REVDATE=$(date +%F)

if [[ $GITHUB_REF_NAME = v* ]]
then
  REVNUMBER=$GITHUB_REF_NAME+$GITHUB_RUN_ID
else
  REVNUMBER=$GITHUB_SHA
fi

asciidoctor \
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
    --backend=html5 \
    docs/*.adoc