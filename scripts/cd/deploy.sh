#
# Deploys a microservice to Kubernetes.
#
# Assumes the image has already been built and published to the container registry.
#
# Environment variables:
#
#   CONTAINER_REGISTRY - The hostname of your container registry.
#   NAME - The name of the microservice to deploy.
#   VERSION - The version of the microservice being deployed.
#
# Usage:
#
#   ./scripts/cd/deploy.sh
#

set -u # or set -o nounset
: "$CONTAINER_REGISTRY"
: "$NAME"
: "$VERSION"

envsubst < ./scripts/cd/${NAME}.yaml | kubectl apply -f -