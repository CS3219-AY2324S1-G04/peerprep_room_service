FROM node:lts-hydrogen

COPY ./build /peerprep_room_service_expired_room_deleter/
COPY package.json /peerprep_room_service_expired_room_deleter/
COPY package-lock.json /peerprep_room_service_expired_room_deleter/

WORKDIR /peerprep_room_service_expired_room_deleter

RUN npm install --omit=dev -y

CMD node ./jobs/expired_room_deleter/expired_room_deleter.js
