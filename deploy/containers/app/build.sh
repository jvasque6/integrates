#!/usr/bin/env bash

# Enable debugging.
if [ -n "$VERBOSE" ]; then
  set -x
fi

# Exit immediately if any command returns different from zero.
set -e

SERVER="integrates"
CI_COMMIT_REF_NAME=$1

# Start message.
echo "---### [${SERVER}] Compilando contenedor."

python -c 'import integrates_version; integrates_version.create_integrates_version()'
FI_VERSION=$(cat /usr/local/share/FI_version.txt)
# Build the image.
cp -a deploy/containers/common deploy/containers/integrates
docker build --no-cache \
  --build-arg ci_commit_ref_name="$CI_COMMIT_REF_NAME" \
  --build-arg gitlab_login="$FI_GITLAB_LOGIN" \
  --build-arg gitlab_password="$FI_GITLAB_PASSWORD" \
  --build-arg drive_authorization="$FI_DRIVE_AUTHORIZATION" \
  --build-arg drive_authorization_client="$FI_DRIVE_AUTHORIZATION_CLIENT" \
  --build-arg documentroot="$FI_DOCUMENTROOT" \
  --build-arg ssl_key="$FI_SSL_KEY" \
  --build-arg ssl_cert="$FI_SSL_CERT" \
  --build-arg vault_env="$ENV_FULL" \
  --build-arg fi_version="$FI_VERSION" \
  -t "fluid-docker.jfrog.io/integrates:$CI_COMMIT_REF_NAME" \
  deploy/containers/integrates/
rm -rf common
