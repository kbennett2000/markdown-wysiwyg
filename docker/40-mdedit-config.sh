#!/bin/sh
# Runs at container start (the nginx image executes /docker-entrypoint.d/*.sh).
# Writes the app's runtime config.js from environment variables, so the same
# prebuilt image can be configured per-deployment without rebuilding.
set -e

html_dir="/usr/share/nginx/html"

# Escape backslashes and double quotes for safe embedding in a JS string literal.
escaped=$(printf '%s' "${GDRIVE_CLIENT_ID:-}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')

cat > "${html_dir}/config.js" <<EOF
// Generated at container start from environment variables. Do not edit by hand.
window.MDEDIT_GDRIVE_CLIENT_ID = "${escaped}";
EOF

echo "mdedit: wrote config.js (GDRIVE_CLIENT_ID ${GDRIVE_CLIENT_ID:+set}${GDRIVE_CLIENT_ID:-empty})"
