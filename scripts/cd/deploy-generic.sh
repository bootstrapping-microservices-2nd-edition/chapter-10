#
# Deploys a microservice to Kubernetes.
#
# Assumes the image has already been built and published to the container registry.
#
# Environment variables:
#
#   CONTAINER_REGISTRY - The hostname of your container registry.
#   VERSION - The version number of the image to deploy.
#   NAME - The name of the microservice to deploy.
#
# Usage:
#
#   ./scripts/cd/deploy-generic.sh
#

set -u # or set -o nounset
: "$CONTAINER_REGISTRY"
: "$VERSION"
: "$NAME"

envsubst < ./scripts/cd/deploy-generic.yaml | kubectl apply -f -