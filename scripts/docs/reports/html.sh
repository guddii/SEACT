#!/bin/bash

FILES="./tests/benchmark/data/reports/*"
for source_file in $FILES
do
  # Build JMeter Report
  source_file_filename_no_ext=${source_file%.*}
  out=${source_file_filename_no_ext##*/}
  mkdir ./out/${out}
  jmeter -g $source_file -o ./out/${out}
  # Update HTML Entry
  echo "${out},https://www.guddii.de/SEACT/${out}/" >> ./docs/reports.csv
done
