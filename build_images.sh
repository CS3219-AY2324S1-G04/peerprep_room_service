#!/bin/bash

### Constants ###
cr="ghcr.io/cs3219-ay2324s1-g04/"
export_dir="./docker_build"

image_keys=(api database_initialiser expired_room_deleter)

declare -A images=(
  [api_name]=${cr}peerprep_room_service_api
  [api_docker_file]="./dockerfiles/api.dockerfile"
  [api_should_build]=0

  [database_initialiser_name]=${cr}peerprep_room_service_database_initialiser
  [database_initialiser_docker_file]="./dockerfiles/database_initialiser.dockerfile"
  [database_initialiser_should_build]=0

  [expired_room_deleter_name]=${cr}peerprep_room_service_expired_room_deleter
  [expired_room_deleter_docker_file]="./dockerfiles/expired_room_deleter.dockerfile"
  [expired_room_deleter_should_build]=0
)

image_keys_str=""
for k in ${image_keys[@]}; do
  if [[ $image_keys_str == "" ]]; then
    image_keys_str="\"${k}\""
  else
    image_keys_str="${image_keys_str}, or \"${k}\""
  fi
done

instructions="\n
Usage: build_images.sh [-h] [-e] [-p] [-i IMAGE] [-t TAG]\n
\n
This script builds Docker images, exports them to \"./docker_build\", then pushes them to the container registry. The default configuration builds all images and does not push them to the container registry. Arguments can be specified to change the script behaviour.\n
\n
Arguments:\n
-h\t\t     Prints the help message.\n
-e\t\t     Enables exporting the images to the directory \"${export_dir}\".\n
-p\t\t     Enables pushing to the container registry after building.\n
-i IMAGE\t Specifies the image to build and push. Value can be ${image_keys_str}. This argument can be specified multiple times to include multiple images.\n
-t TAG\t\t Tags the images built with \"TAG\".
"

### Functions ###
build_image () {
  dockerfile=$1
  image_name=$2

  export_file="$export_dir/$2.tar"

  echo "Building $image_name ..."

  docker image build . --tag=$image_name --file $dockerfile

  if [[ $? -ne 0 ]]; then
    echo "Build failed."
    exit 1
  fi

  echo "Build successful."

  if [[ $should_export == 0 ]]; then
    return 0
  fi

  echo "Exporting image ..."

  mkdir -p $(dirname $export_file)
  docker image save --output=$export_file $image_name

  if [[ $? -ne 0 ]]; then
    echo "Export failed."
    exit 1
  fi

  echo "Exported image to $export_file"
}

push_image() {
  image_name=$1

  echo "Pushing $image_name to the container registry ..."

  docker image push $image_name

  if [[ $? -ne 0 ]]; then
    echo "Push failed."
    exit 1
  fi

  echo "Push successful."
}

### Parse CLI Arguments ###
should_export=0
should_push=0
image_tag=':latest'

while getopts hepi:t: flag
do
  case "${flag}" in
    h)
      echo -e $instructions
      exit 0
      ;;
    e)
      should_export=1
      ;;
    p)
      should_push=1
      ;;
    i)
      images[${OPTARG}_should_build]=1
      ;;
    t)
      image_tag=":$OPTARG"
  esac
done

for k in ${image_keys[@]}; do
  images[${k}_name]=${images[${k}_name]}${image_tag}
done

should_build_all=1
for k in ${image_keys[@]}; do
  if [[ ${images[${k}_should_build]} == 1 ]]; then
    should_build_all=0
  fi
done

if [[ ${should_build_all} == 1 ]]; then
  for k in ${image_keys[@]}; do
    images[${k}_should_build]=1
  done
fi

### Transpile Typescript ###
echo "Transpiling Typescript ..."

npm run build

if [[ $? -ne 0 ]]; then
  echo "Transpile failed."
  exit 1
fi

echo "Transpile successful."

### Build Images ###
for k in ${image_keys[@]}; do
  if [[ ${images[${k}_should_build]} == 1 ]]; then
    build_image ${images[${k}_docker_file]} ${images[${k}_name]}
  fi
done

### Push Images to the Container Registry ###
if [[ $should_push == 0 ]]; then
  exit 0
fi

for k in ${image_keys[@]}; do
  if [[ ${images[${k}_should_build]} == 1 ]]; then
    push_image ${images[${k}_name]}
  fi
done
