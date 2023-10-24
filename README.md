# PeerPrep Matching Service

Handles the queuing and matching of users.

## Quickstart Guide

1. Clone this repository.
2. Modify the `.env` file as per needed. Refer to [Environment Variables](#environment-variables) for a list of configs.
3. Build the docker images by running: `./run.sh`
4. `peerprep_room_service_mongo_init` is meant to exit after sending some information to mongo. You may delete the instance after it has completed its execution. 
5. For most functions, you will require user-service to be up.

## Environment Variables

### MONGO

While it is possible to have the room-service share a mongo database with another service, it is not recommended. 

- `RS_MONGO_USER` - Username of the Mongo database
- `RS_MONGO_PASS` - Password of the Mongo database
- `RS_MONGO_PORT` - Port of the Mongo database
- `RS_MONGO_DB` - Name of the database.

### APP

- `RS_EXPRESS_PORT` - Port of the Express server.
- `RS_ROOM_EXPIRY` -  Suggested time in milliseconds (i.e. 5 * 60 * 1000 = 300000) for when the document should be deleted from MongoDB upon creation. This application uses MongoDB's expire-At to delete the collection, which means the actual time it is deleted, is 1 minute after the specified time. 

## REST API

## Notice

There is no input validation for most parts of this server.

This is because room service is expected to be used with a gateway that prevents unauthorized access, and that authorized parties would send valid data (i.e. validation is done on their side)

## Endpoints

### Check if a user is in a room.

> [get] `/room-service/room/user`

This is for the user to check if they are in a room.
As such, user-service must be contactable. 

**Cookie**

- `session-token` - ID of the user to query

**Returns**

- `200` - If the user is in a room. Returns the following json
  - ```{
    'room-id': string,
    users: [string],
    'questions-id': string,
    'expire-at': date,
  }
    ```
- `401` - If session is invalid or missing `session-token``
- `404` - If the user is not in a room.
- `500` - For any sever error

### Check what room a user belongs to and the info regarding it

> [post] `/room-service/room/user`

For services, this is probably the preferred way to check.

**Path Parameters**

Either parameters suffice, however `user-id` takes precedence 
- `user-id` - ID of the user to query (does not query user-service)
- `session-token` - session token to query (requires user-service to be up)

**Returns**

- `200` - If the user is in a room and the details
  ```
  {
    'room-id': string,
    users: [string],
    'questions-id': string,
    'expire-at': date,
  }
  ```
- `401` - If provided session-token is invalid or if neither `user-id` and `session-token` are provided.
- `404` - If the user is not in a room.
- `500` - For any sever error

### Check if the user's room is still alive.

> [get] `/room-service/room/user/alive`

Same as without `/room-service/room/user`, except does not return room data contents. 
As such, user-service must be contactable. 

**Cookie**

- `session-token` - Session token of the user

**Returns**

- `200` - If the user is in a room. 
- `401` - If session is invalid or missing `session-token`
- `404` - If the user is not in a room.
- `500` - For any sever error

### Keeps the room alive

> [PUT] `/room-service/room/user/keep-alive`

Extends the room's lifespan by mongoRoomExtend milliseconds.

Requires access to user-service.

**Cookie**

- `session-token` - Session token of the user

**Returns**

- `200` - If the user is in a room. 
- `401` - If session is invalid or missing `session-token`
- `404` - If the user is not in a room.
- `500` - For any sever error

### Create room

> [post] `/room-service/create`

This is primarily for matching service. It is assumed that the provided data is correct and without errors.

Currently it allows > 2 users to be added. 

**Parameters**

Json formatted

```
{
  "users" : string[],
  "questions-id" : string,
}
```

**Returns**

- `200` - On success

  ```
  {
    "room-id" : string,
    'expire-at': room.expireAt,
  }
  ```

- `500` - For any sever errors

### Delete room

> [Delete] `/room-service/room/:rid`

This is used for testing to delete from mongoDB.

**Path Parameters**

- `rid` - Room ID

**Returns**

- `200` - On delete success
- `404` - Room does not exist
- `500` - For any sever error

### Leave room

> [put] `/room-service/room/leave-room`

This is used by users to leave the room.

By default, a room will get deleted after some time if keep-alive messages is not sent by the users.

Requires access to user-service.

**Cookies**

- `session-token` - Session Token of the user

**Returns**

- `200` - On leave success
- `401` - If session-token is invalid or missing
- `404` - If room with the particular room id does not exist
- `500` - For any sever error

### Retrieve room info

> [get] `/room-service/room/:rid/info`

This is for the services to retrieve information about the room they are in.

**Path Parameters**

- `rid` - ID of the room to query

**Returns**

- `200` - On success and the following json
  ```
  {
    'room-id': string,
    users: [string],
    'questions-id': string,
    'expire-at': date,
  }
  ```

- `404` - If room id is not found
- `500` - For any sever errors