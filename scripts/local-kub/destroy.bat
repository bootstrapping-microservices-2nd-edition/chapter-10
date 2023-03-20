:: 
:: Remove containers from Kubernetes.
::
:: Don't forget to change kubectl to your local Kubernetes instance, like this:
::
::  kubectl config use-context docker-desktop
::
kubectl delete -f rabbit.yaml
kubectl delete -f mongodb.yaml
kubectl delete -f metadata.yaml
kubectl delete -f history.yaml
kubectl delete -f mock-storage.yaml
kubectl delete -f video-streaming.yaml
kubectl delete -f video-upload.yaml
kubectl delete -f gateway.yaml