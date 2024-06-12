#!/bin/bash

REVDATE=$(date +%F)

if [[ $GITHUB_REF_NAME = v* ]]
then
  REVNUMBER=$GITHUB_REF_NAME+$GITHUB_RUN_ID
else
  REVNUMBER=${GITHUB_SHA:0:7}
fi

asciidoctor \
    --require asciidoctor-bibtex \
    --require asciidoctor-mathematical \
    --require asciidoctor-diagram \
    --destination-dir=out \
    --attribute mathematical-format=svg \
    --attribute asciidoctor-bibtex-version=$ASCIIDOCTOR_BIBTEX_VERSION \
    --attribute asciidoctor-diagram-version=$ASCIIDOCTOR_DIAGRAM_VERSION \
    --attribute asciidoctor-version=$ASCIIDOCTOR_VERSION \
    --attribute github-ref-name=$GITHUB_REF_NAME \
    --attribute github-repository=$GITHUB_REPOSITORY \
    --attribute github-run-id=$GITHUB_RUN_ID \
    --attribute github-server-url=$GITHUB_SERVER_URL \
    --attribute github-sha=$GITHUB_SHA \
    --attribute ostype=$OSTYPE \
    --attribute revdate=$REVDATE \
    --attribute revnumber=$REVNUMBER \
    --backend=html5 \
    docs/index.adoc docs/*.research.adoc docs/*.dev.adoc

mv docs/stem-*.svg out

mkdir -p out/resources/
cp -r docs/resources/views out/resources/