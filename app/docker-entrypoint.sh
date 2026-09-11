#!/bin/sh
set -eu

printf '%s\n' 'Applying database migrations...'
./node_modules/.bin/prisma migrate deploy

printf '%s\n' 'Starting PhonoTrail Studio...'
exec npm run start
