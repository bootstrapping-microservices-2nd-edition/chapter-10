#
# Builds, publishes and deploys all microservices to a production Kubernetes instance.
#
# Usage:
#
#   ./scripts/production-kub/deploy.sh
#

set -u # or set -o nounset
: "$CONTAINER_REGISTRY"

#
# Build Docker images.
#
docker build -t $CONTAINER_REGISTRY/metadata:1 --file ../../metadata/Dockerfile-prod ../../metadata
docker push $CONTAINER_REGISTRY/metadata:1

docker build -t $CONTAINER_REGISTRY/history:1 --file ../../history/Dockerfile-prod ../../history
docker push $CONTAINER_REGISTRY/history:1

docker build -t $CONTAINER_REGISTRY/mock-storage:1 --file ../../mock-storage/Dockerfile-prod ../../mock-storage
docker push $CONTAINER_REGISTRY/mock-storage:1

docker build -t $CONTAINER_REGISTRY/history:1 --file ../../history/Dockerfile-prod ../../history
docker push $CONTAINER_REGISTRY/history:1

docker build -t $CONTAINER_REGISTRY/video-streaming:1 --file ../../video-streaming/Dockerfile-prod ../../video-streaming
docker push $CONTAINER_REGISTRY/video-streaming:1

docker build -t $CONTAINER_REGISTRY/video-upload:1 --file ../../video-upload/Dockerfile-prod ../../video-upload
docker push $CONTAINER_REGISTRY/video-upload:1

docker build -t $CONTAINER_REGISTRY/gateway:1 --file ../../gateway/Dockerfile-prod ../../gateway
docker push $CONTAINER_REGISTRY/gateway:1

# 
# Deploy containers to Kubernetes.
#
# Don't forget to change kubectl to your production Kubernetes instance
#
kubectl apply -f rabbit.yaml
kubectl apply -f mongodb.yaml 
envsubst < metadata.yaml | kubectl apply -f -
envsubst < history.yaml | kubectl apply -f -
envsubst < mock-storage.yaml | kubectl apply -f -
envsubst < video-streaming.yaml | kubectl apply -f -
envsubst < video-upload.yaml | kubectl apply -f -
envsubst < gateway.yaml | kubectl apply -f -