import express, { NextFunction, Request, Response } from 'express';

import Config from '../../dataStructs/config';
import {
  isValidSessionCookie,
  isValidSessionParam,
} from '../../helper/session';
import { roomInfoModel } from '../../mongoModels/roomInfo';

const router = express.Router();
const config = Config.getInstance();

/**
 * For user to query if they have a room.
 *
 * Requires a cookie called session-token.
 * Requires access to user-service.
 *
 * Returns
 * 200: If they have a room and the following json
 * {
    'room-id': string,
    users: [string],
    'questions-id': string,
    'expire-at': date,
  }
 * 401: If session is invalid
 * 404: If they don't have a room
 * 500: Sever errors
 */
router.get('/', isValidSessionCookie, checkIdInRoom);

/**
 * For collab service to query if a particular session-token is in a room.
 *
 * Requires either parameter `session-token` or `user-id`
 * If only session-token is given, then requires access to user-service
 * 
 * Returns
 * 200: if the specified session-token has a room, and return the details in json format
 * {
 * 'room-id': string,
 * users: [string],
 * 'questions-id': string,
 * 'expire-at': date,
 * }
 * 401: if session is invalid
 * 404: if they don't have a room
 * 500: sever errors
 */
router.post('/', isValidSessionParam, checkIdInRoom);

async function checkIdInRoom(req: Request, res: Response, next: NextFunction) {
  const uid = res.locals['user-id'];

  try {
    const room = await roomInfoModel
      .findOne({ userIDs: { $in: [uid] } })
      .exec();
    if (room) {
      res.status(200).json({
        status: 200,
        message: 'user already has a room',
        data: {
          'room-id': room._id,
          users: room.userIDs,
          'questions-id': room.questionID,
          'expire-at': room.expireAt,
        }
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'User does not have a room',
        data: undefined,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Sever error',
      data: undefined,
    });
  }
}

/**
 * GET QUERY ROOM ALIVE
 * Returns whether a particular room is alive or not.
 * 
 * Requires a cookie called session-token.
 * Requires access to user-service.
 * 
 * RETURN
 * 200: If room exists
 * 401: If session-token is invalid
 * 404: If room does not exist
 * 500: For any server error
 */
router.get('/alive', isValidSessionCookie, async (req, res) => {
  const uid = res.locals['user-id'];

  try {
    const room = await roomInfoModel
      .findOne({ userIDs: { $in: [uid] } })
      .exec();
    if (room) {
      res.status(200).json({
        status: 200,
        message: 'Room is alive',
        data: undefined,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'Room not found',
        data: undefined,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Sever error',
      data: undefined,
    });
  }
});

/**
 * PUT EXTEND ROOM LIFESPAN
 *
 * Mongo expires the room after a certain amount of time.
 * This route is to extend the user's by mongoRoomExpiry miliseconds from now.
 *
 * Requires access to user-service
 * 
 * Returns:
 * 200 - Room exists and expiry value is updated.
 * 401 - Unauthorized
 * 404 - User is not in a room
 * 500 - Other server errors
 */
router.put('/keep-alive', isValidSessionCookie, async (req, res) => {
  const uid = res.locals['user-id'];

  try {
    const room = await roomInfoModel
      .findOneAndUpdate(
        { userIDs: { $in: [uid] } },
        { $set: { expireAt: new Date(Date.now() + config.mongoRoomExtend) } },
        { new: true, useFindAndModify: false },
      )
      .exec();

    if (room) {
      res.status(200).json({
        status: 200,
        message: 'Room lifespan extended',
        data: undefined,
      });
    }
    res.status(404).json({
      status: 404,
      message: 'Room not found',
      data: undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Sever Error',
      data: undefined,
    });
  }
});

export default router;
