/**
 * Used for inquiring
 * @file Used to retrieve user-id from user-service using session-token
 */
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';

const config = Config.getInstance();

/**
 * Middleware to check if 'user-id' param exist.
 * if not it checks for 'session-token' param before passing to _isValidSession.
 *
 * Primarily for room-service or testing use.
 * 
 * @param req
 * @param res
 * @param next
 *
 * Responses with
 * next() on success
 * 401 if unable to find session-token
 *
 * @see isValidSessionCookie
 */
export async function isValidSessionParam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.query['user-id'] !== undefined) {
    res.locals['user-id'] = req.query['user-id'];
    next();
  } else if (req.query['session-token'] !== undefined) {
    res.locals['session-token'] = req.query['session-token'];
    _isValidSession(req, res, next);
  } else {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized',
      data: undefined
    })
  }
}

/**
 * Middleware to call _isValidSession after checking if 'session-token' cookie
 * exists.
 *
 * @param req
 * @param res
 * @param next
 *
 * Responses with
 * next() on success
 * 401 if unable to find session-token
 *
 * @see _isValidSession
 */
export async function isValidSessionCookie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = req.cookies['session-token'];

  if (!session) { //missing cookies
    res.status(401).json({
      status: 401,
      message: 'Unauthorized',
      data: undefined
    });
  }

  res.locals['session-token'] = session;
  _isValidSession(req, res, next);
}

/**
 * Middleware which retrieves user-id based on session-token that is
 * stored in res.locals['session-token']
 * 
 * Requires user-service to be up.
 *
 * @param req The Request
 * @param res The Response
 * @param next The NextFunction
 *
 * Responses with
 * next() on success, stores user-id in res.locals['user-id']
 * 401 on invalid session-token
 * 500 on server error
 */
async function _isValidSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const url = config.userServiceURI + '/user-service/user/identity';
  const param = '?session-token=' + res.locals['session-token'];

  try {
    await axios
      .get(url + param)
      .then((response) => {
        const data = response.data;
        const uid = data['user-id'];
        if (response.data) {
          res.locals['user-id'] = uid;
          delete res.locals['session-token'];
          next();
        } else {
          console.error('Warning: user service not acting as expected.');
          res.status(500).json({
            status: 500,
            message: 'Server error',
            data: undefined
          });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          res.status(401).json({
            status: 401,
            message: 'Unauthorized',
            data: undefined
          });
        } else if (error.response && error.response.status === 500) {
          console.error('Warning: user service returning 500');
          res.status(500).json({
            status: 500,
            message: 'Server Error',
            data: undefined
          });
        } else {
          console.error(error);
          res.status(500).json({
            status: 500,
            message: 'Server Error',
            data: undefined
          });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: undefined
    });
  }
}
