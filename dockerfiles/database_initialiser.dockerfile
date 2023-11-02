FROM node:lts-hydrogen

COPY ./build /peerprep_room_service_database_initialiser/
COPY package.json /peerprep_room_service_database_initialiser/
COPY package-lock.json /peerprep_room_service_database_initialiser/

WORKDIR /peerprep_room_service_database_initialiser

RUN npm install --omit=dev -y

CMD node ./jobs/database_initialiser/database_initialiser.js
