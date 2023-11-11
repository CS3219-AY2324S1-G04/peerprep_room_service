/**
 * @file Keys for query parameters, path parameters, and cookies.
 */

/** Access token key. */
export const accessTokenKey: string = 'access-token';
/** Room ID key. */
export const roomIdKey: string = 'room-id';
/** User IDs key. */
export const userIdsKey: string = 'user-ids';
/** Question ID key. */
export const questionIdKey: string = 'question-id';
/** Question language slug key. */
export const questionLangSlugKey: string = 'question-lang-slug';
/** Room expiry key. */
export const roomExpiryKey: string = 'expire-at';

// This is needed as express does not allow path parameters with hyphens
/** Room ID key for path parameters. */
export const roomIdPathKey: string = 'roomId';

export default {
  roomIdKey,
  userIdsKey,
  questionIdKey,
  questionLangSlugKey,
  roomExpiryKey,
};
