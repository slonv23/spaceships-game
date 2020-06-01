#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROTO_DIR=$(readlink -f "$DIR/../../common/proto")

echo "Creating bundle for proto files from $PROTO_DIR"

FILES=$(find $PROTO_DIR -type f -name "*.proto")

function join_by { local d=$1; shift; echo -n "$1"; shift; printf "%s" "${@/#/$d}"; }

OUTPUT_FILEPATH="${PROTO_DIR}/bundle.json"

npx pbjs -t json $(join_by " " $FILES) > $OUTPUT_FILEPATH

echo "Output filepath $OUTPUT_FILEPATH"