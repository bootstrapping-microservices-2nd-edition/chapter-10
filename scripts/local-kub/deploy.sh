#
# Builds and deploys all microservices to a local Kubernetes instance.
#
# Usage:
#
#   ./scripts/local-kub/deploy.sh
#

#
# Build Docker images.
#
docker build -t metadata:1 --file ../../metadata/Dockerfile-prod ../../metadata
docker build -t history:1 --file ../../history/Dockerfile-prod ../../history
docker build -t mock-storage:1 --file ../../mock-storage/Dockerfile-prod ../../mock-storage
docker build -t history:1 --file ../../history/Dockerfile-prod ../../history
docker build -t video-streaming:1 --file ../../video-streaming/Dockerfile-prod ../../video-streaming
docker build -t video-upload:1 --file ../../video-upload/Dockerfile-prod ../../video-upload
docker build -t gateway:1 --file ../../gateway/Dockerfile-prod ../../gateway

# 
# Deploy containers to Kubernetes.
#
# Don't forget to change kubectl to your local Kubernetes instance, like this:
#
#   kubectl config use-context docker-desktop
#
kubectl apply -f rabbit.yaml
kubectl apply -f mongodb.yaml 
kubectl apply -f metadata.yaml
kubectl apply -f history.yaml
kubectl apply -f mock-storage.yaml
kubectl apply -f video-streaming.yaml
kubectl apply -f video-upload.yaml
kubectl apply -f gateway.yaml