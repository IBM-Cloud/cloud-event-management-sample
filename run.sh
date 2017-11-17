#!/bin/sh

SCRIPTDIR=`dirname "$0"`
SCRIPTDIR=`cd "$SCRIPTDIR"; pwd`

export NODE_ENV=development

# Update this command if you move a copy of this script elsewhere
cd "$SCRIPTDIR/src"

npm run "${NPMSCRIPT:-start}"