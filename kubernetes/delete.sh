#!/bin/bash

kubectl delete -f ./config_maps/database_client.yaml
kubectl delete -f ./secrets/database_client.yaml

kubectl delete -f ./config_maps/mq_client.yaml
kubectl delete -f ./secrets/mq_client.yaml

kubectl delete -f ./jobs/database_initialiser.yaml

kubectl delete -f ./config_maps/expired_room_deleter.yaml
kubectl delete -f ./deployments/expired_room_deleter.yaml

kubectl delete -f ./config_maps/api.yaml
kubectl delete -f ./deployments/api.yaml
kubectl delete -f ./services/api.yaml
kubectl delete -f ./hpas/api.yaml
