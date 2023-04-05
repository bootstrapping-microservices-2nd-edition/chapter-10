# 
# Remove containers from Kubernetes.
#
# Environment variables:
#
#   NAME - The name of the microservice to delete.
#
# Usage:
#
#   ./scripts/local-kub/delete.sh
#

kubectl delete -f rabbit.yaml
kubectl delete -f mongodb.yaml
kubectl delete -f metadata.yaml
kubectl delete -f history.yaml
kubectl delete -f mock-storage.yaml
kubectl delete -f video-streaming.yaml
kubectl delete -f video-upload.yaml
kubectl delete -f gateway.yaml