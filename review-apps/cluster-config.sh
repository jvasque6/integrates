#!/usr/bin/env bash

# This scripts manages the deployment of the Review Apps,
# which allow to view a live site through a public IP with the
# changes introduced by the developer, before accepting changes into
# production.

# Prepare manifests by replacing the value of Environmental Variables
envsubst < review-apps/ingress.yaml > ingress.yaml && mv ingress.yaml review-apps/ingress.yaml
envsubst < review-apps/deploy-integrates.yaml > deploy-integrates.yaml && mv deploy-integrates.yaml review-apps/deploy-integrates.yaml

# Replace variables in secret manifest
sed -i 's#$FI_SSL_KEY#'"$FI_SSL_KEY"'#; s#$FI_SSL_CERT#'"$FI_SSL_CERT"'#; s#$RA_SSL_KEY#'"$RA_SSL_KEY"'#; s#$RA_SSL_CERT#'"$RA_SSL_CERT"'#; s#$K8_ENV_SECRET#'"$K8_ENV_SECRET"'#; s#$K8_SSL_SECRET#'"$K8_SSL_SECRET"'#; s#$FI_DEBUG#'"$(echo -n True | base64)"'#' review-apps/variables.yaml

# Replace environmental variables with their base64 value
# to pass to the container
IFS=$'\n' read -d '' -r -a lines < <(grep -o '^FI[^=]*' env.list)
lines+=("CI_COMMIT_SHA")
lines+=("CI_COMMIT_REF_NAME")
for line in "${lines[@]}"; do
  sed -i 's#$'"$line"'#'"$(echo -n ${!line} | base64 | tr -d '\n')"'#' review-apps/variables.yaml;
done

# Check if namespace for project exists
# if ! kubectl get namespaces | grep -q "$CI_PROJECT_NAME"; then
#   echo "Creating namespace for project..."
#   kubectl create namespace "$CI_PROJECT_NAME"
# fi

# Set namespace preference for kubectl commands
echo "Setting namespace preferences..."
kubectl config set-context "$(kubectl config current-context)" --namespace=gitlab-managed-apps

# Check secret to pull images from Gitlab Registry and set if not present
if ! kubectl get secret | grep -q "$K8_REG_SECRET"; then
  echo "Creating secret to access Gitlab Registry..."
  kubectl create secret docker-registry "$K8_REG_SECRET" --docker-server="$CI_REGISTRY" \
  --docker-username="$DOCKER_USER" --docker-password="$DOCKER_PASS" --docker-email="$DOCKER_EMAIL"
fi

# Check secret to pass env variables to container
if ! kubectl get secret | grep -q "$K8_ENV_SECRET"; then
  echo "Creating secrets to pass Environmental Variables and enable TLS communication..."
  kubectl create -f review-apps/variables.yaml
fi

# Delete previous deployments and services of the same branch, if present
if kubectl get deployments | grep -q "$CI_PROJECT_NAME-$CI_COMMIT_REF_SLUG"; then
  echo "Erasing previous deployments..."
  kubectl delete deployment "review-$CI_PROJECT_NAME-$CI_COMMIT_REF_SLUG"
  kubectl delete service "service-$CI_PROJECT_NAME-$CI_COMMIT_REF_SLUG";
  kubectl get ingress "ingress-$CI_PROJECT_NAME" -o yaml | sed '/host: '"$CI_COMMIT_REF_SLUG.$CI_PROJECT_NAME"'/,+5d' | sed '/-\ '"$CI_COMMIT_REF_SLUG.$CI_PROJECT_NAME"'/d' > current-ingress.yaml
fi

# Update current ingress resource if it exists, otherwise create it from zero.
if kubectl get ingress | grep "$CI_PROJECT_NAME"; then
  if [ ! -f current-ingress.yaml ]; then
    echo "Getting current ingress manifest..."
    kubectl get ingress "ingress-$CI_PROJECT_NAME" -o yaml > current-ingress.yaml;
  fi
  echo "Updating ingress manifest..."
  sed -n '/spec:/,/status:/p' current-ingress.yaml | head -n -5 | tail -n +3 >> review-apps/ingress.yaml
  kubectl delete ingress "ingress-$CI_PROJECT_NAME"
  kubectl create -f review-apps/ingress.yaml;
else
  kubectl create -f review-apps/ingress.yaml;
fi

# Deploy pod and service
echo "Deploying latest image..."
kubectl create -f review-apps/deploy-integrates.yaml
sleep 120
kubectl exec $(kubectl get pods | grep -o ".*$CI_COMMIT_REF_SLUG[^ ]*") -- sed -i 's#/usr/share>#/usr/src/app>#' /etc/apache2/apache2.conf
kubectl exec $(kubectl get pods | grep -o ".*$CI_COMMIT_REF_SLUG[^ ]*") -- apache2ctl restart

# Erase file with keys
rm review-apps/variables.yaml