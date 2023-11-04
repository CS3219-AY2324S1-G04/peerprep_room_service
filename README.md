# PeerPrep Room Service

Handles the storing and retrieving of room information.

## Table of Contents

- [Quickstart Guide](#quickstart-guide)
- [Environment Variables](#environment-variables)
  - [API](#api)
  - [Database Initialiser](#database-initialiser)
  - [Expired Room Deleter](#expired-room-deleter)
- [REST API](#rest-api)
  - [Create a Room](#create-a-room)
  - [Get a Room by Room ID](#get-a-room-by-room-id)
  - [Get a Room by User ID](#get-a-room-by-user-id)
  - [Extend the Lifespan of a Room](#extend-the-lifespan-of-a-room)
  - [Remove a User from a Room](#remove-a-user-from-a-room)
  - [Delete a Room](#delete-a-room)
- [MQ Events](#mq-events)
  - [Create Room](#create-room)
  - [Delete Room](#delete-room)
  - [Remove User from Room](#remove-user-from-room)

## Quickstart Guide

Note that Room Service relies on User Service. Please ensure that User Service is up and running before attempting to start Room Service.

1. Clone this repository.
2. Build the docker images by running: `./build_images.sh`
3. Modify the ".env" file as per needed. Refer to [Docker Images](#docker-images) for the list of environment variables.
4. Create the docker containers by running: `docker compose up`

## Environment Variables

### API

**Name:** ghcr.io/cs3219-ay2324s1-g04/peerprep_room_service_api

**Description:** This docker image contains the REST API.

**Environment Variables:**

- `DATABASE_USER` - User on the database host.
- `DATABASE_PASSWORD` - Password of the database.
- `DATABASE_HOST` - Address of the database host. (no need to specify if using "compose.yaml")
- `DATABASE_PORT` - Port the database is listening on. (no need to specify if using "compose.yaml")
- `DATABASE_NAME` - Name of the database.
- `DATABASE_CONNECTION_TIMEOUT_MILLIS` - Number of milliseconds for a database client to connect to the database before timing out.
- `DATABASE_MAX_CLIENT_COUNT` - Max number of database clients.
- `MQ_USER` - User on the MQ host.
- `MQ_PASSWORD` - Password of the MQ.
- `MQ_HOST` - Address of the MQ host. (no need to specify if using "compose.yaml")
- `MQ_PORT` - Port the MQ is listening on. (no need to specify if using "compose.yaml")
- `MQ_EXCHANGE_NAME` - Name of the MQ exchange.
- `USER_SERVICE_HOST` - Address of the User Service host.
- `USER_SERVICE_PORT` - Port the User Service is listening on.
- `ROOM_EXPIRE_MILLIS` - Number of milliseconds a room can live for since the last expiry date and time extension.
- `PORT` - Port to listen on. (no need to specify if using "compose.yaml")
- `NODE_ENV` - Sets the mode the app is running in ("development" or "production")

### Database Initialiser

**Name:** ghcr.io/cs3219-ay2324s1-g04/peerprep_room_service_database_initialiser

**Description:** This docker image initialises the database by creating the necessary entities.

**Environment Variables:**

- `DATABASE_USER` - User on the database host.
- `DATABASE_PASSWORD` - Password of the database.
- `DATABASE_HOST` - Address of the database host. (no need to specify if using "compose.yaml")
- `DATABASE_PORT` - Port the database is listening on. (no need to specify if using "compose.yaml")
- `DATABASE_NAME` - Name of the database.
- `DATABASE_CONNECTION_TIMEOUT_MILLIS` - Number of milliseconds for a database client to connect to the database before timing out.
- `DATABASE_MAX_CLIENT_COUNT` - Max number of database clients.
- `SHOULD_FORCE_INITIALISATION` - Set to "true" if initialisation should be done even if entities already exist. Do not set to "true" in production as it might cause loss of data.

### Expired Room Deleter

**Name:** ghcr.io/cs3219-ay2324s1-g04/peerprep_room_service_expired_room_deleter

**Description:** This docker image periodically deletes expired rooms from the database and published an appropriate event on the MQ.

**Environment Variables:**

- `DATABASE_USER` - User on the database host.
- `DATABASE_PASSWORD` - Password of the database.
- `DATABASE_HOST` - Address of the database host. (no need to specify if using "compose.yaml")
- `DATABASE_PORT` - Port the database is listening on. (no need to specify if using "compose.yaml")
- `DATABASE_NAME` - Name of the database.
- `DATABASE_CONNECTION_TIMEOUT_MILLIS` - Number of milliseconds for a database client to connect to the database before timing out.
- `DATABASE_MAX_CLIENT_COUNT` - Max number of database clients.
- `MQ_USER` - User on the MQ host.
- `MQ_PASSWORD` - Password of the MQ.
- `MQ_HOST` - Address of the MQ host. (no need to specify if using "compose.yaml")
- `MQ_PORT` - Port the MQ is listening on. (no need to specify if using "compose.yaml")
- `MQ_EXCHANGE_NAME` - Name of the MQ exchange.
- `ROOM_DELETION_INTERVAL_MILLIS` - Number of milliseconds between database searches for expired rooms.

## REST API

### Create a Room

> [POST] `/room-service/rooms`

Creates a new room.

WARNING: This endpoint is potentially abusable. It should be inaccessible by the frontend.

**Body**

The body must be of JSON format. It contains the IDs of the users who are in the room and the ID of the question assigned to the room.

Example request body:

```json
{
  "user-ids": [1, 2],
  "question-id": "5241ec50-b884-4278-98cf-4c91519eaad5"
}
```

**Response**

- `201` - Room created. The response body contains the ID of the room.
  - Example response body:
    ```json
    { "room-id": "bb9d89c6-7b02-448d-9948-79ff753d73bd" }
    ```
- `400` - Body is not a valid JSON object or one or more parameter are invalid. The reason for the error is provided in the response body.
  - Example response body:
    ```json
    {
      "user-ids": "User ID must be an integer.",
      "question-id": "Question ID cannot be empty."
    }
    ```
- `500` - Unexpected error occurred on the server.

### Get a Room by Room ID

> [GET] `/room-service/rooms/:room-id`

Gets information about the room whose room ID was specified.

**Path Parameters**

- `room-id` - Room ID.

**Response**

- `200` - Success. The response will contain information about the room.
  - Example response body:
    ```json
    {
      "room-id": "bb9d89c6-7b02-448d-9948-79ff753d73bd",
      "user-ids": [1, 2],
      "question-id": "5241ec50-b884-4278-98cf-4c91519eaad5",
      "expire-at": "2023-11-04T03:03:49.692Z"
    }
    ```
- `400` - One or more path parameters are invalid. The reason for the error is provided in the response body.
  - Example response body:
    ```json
    { "room-id": "Room ID cannot be empty." }
    ```
- `404` - No room was found that has the specified room ID.
- `500` - Unexpected error occurred on the server.

### Get a Room by User ID

> [GET] `/room-service/room`

Gets information about the room which contains the user who owns the specified access token.

**Cookies**

- `access-token` - Access token.

**Response**

- `200` - Success. The response will contain information about the room.
  - Example response body:
    ```json
    {
      "room-id": "bb9d89c6-7b02-448d-9948-79ff753d73bd",
      "user-ids": [1, 2],
      "question-id": "5241ec50-b884-4278-98cf-4c91519eaad5",
      "expire-at": "2023-11-04T03:03:49.692Z"
    }
    ```
- `401` - Access token was not provided or is invalid.
- `404` - User who owns the access token does not belong in any room.
- `500` - Unexpected error occurred on the server.

### Extend the Lifespan of a Room

> [PATCH] `/room-service/room/keep-alive`

Extends the lifespan of the room which contains the user who owns the specified access token.

**Cookies**

- `access-token` - Access token.

**Response**

- `200` - Success. The response will contain the updated expiry of the room.
  - Example response body:
    ```json
    { "expire-at": "2023-11-04T03:03:49.692Z" }
    ```
- `401` - Access token was not provided or is invalid.
- `404` - User who owns the access token does not belong in any room.
- `500` - Unexpected error occurred on the server.

### Remove a User from a Room

> [DELETE] `/room-service/room/user`

Removes the user who owns the specified access token from the room said user is in.

**Cookies**

- `access-token` - Access token.

**Response**

- `200` - Success.
- `401` - Access token was not provided or is invalid.
- `404` - User who owns the access token does not belong in any room.
- `500` - Unexpected error occurred on the server.

### Delete a Room

> [DELETE] `/room-service/rooms/:room-id`

Deletes the room whose room ID was specified.

WARNING: This endpoint is only available during development. It will not be accessible during production.

**Path Parameters**

- `room-id` - ID of the room.

**Response**

- `200` - Success.
- `400` - One or more path parameters are invalid. The reason for the error is provided in the response body.
  - Example response body:
    ```json
    { "room-id": "Room ID cannot be empty." }
    ```
- `404` - No room was found that has the specified room ID.
- `500` - Unexpected error occurred on the server.

## MQ Events

Room Service utilises an MQ that support AMQP. Events are published to a fanout exchange which services may bind queues to in order to obtain information about changes made to a room.

Each event message uses the JSON format. The message contains an `event-type` field which describes the type of event and additional fields which stores information about said event.

This section describes these events.

### Create Room

> `create`

Published when a room is created.

The message contains the information about the room that was created.

**Example:**

```json
{
  "event-type": "create",
  "room": {
    "room-id": "bb9d89c6-7b02-448d-9948-79ff753d73bd",
    "user-ids": [1, 2],
    "question-id": "5241ec50-b884-4278-98cf-4c91519eaad5"
  }
}
```

### Delete Room

> `delete`

Published when a room is deleted.

The message contains the information about the room that was deleted.

**Example:**

```json
{
  "event-type": "delete",
  "room": {
    "room-id": "bb9d89c6-7b02-448d-9948-79ff753d73bd",
    "user-ids": [2],
    "question-id": "5241ec50-b884-4278-98cf-4c91519eaad5"
  }
}
```

### Remove User from Room

> `remove-user`

Published when a user leaves a room.

The message contains the information about the updated room as well as the user ID of the user that was removed.

**Example:**

```json
{
  "event-type": "remove-user",
  "room": {
    "room-id": "bb9d89c6-7b02-448d-9948-79ff753d73bd",
    "user-ids": [2],
    "question-id": "5241ec50-b884-4278-98cf-4c91519eaad5"
  },
  "removed-user-id": 1
}
```
