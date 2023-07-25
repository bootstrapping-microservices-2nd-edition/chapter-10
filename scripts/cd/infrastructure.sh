#
# Deploy infrastructure
#
# Usage:
#
#   ./scripts/cd/infrastructure.sh
#

kubectl apply -f rabbit.yaml
kubectl apply -f mongodb.yaml