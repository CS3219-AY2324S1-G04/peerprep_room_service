/**
 * @file Defined {@link Room}.
 */
import {
  questionIdKey,
  questionLangSlugKey,
  roomExpiryKey,
  roomIdKey,
  userIdsKey,
} from '../utils/parameter_keys';
import ClientSpecifiedRoom from './client_specified_room';
import RoomId from './room_id';

/** Room. */
export default interface Room extends ClientSpecifiedRoom {
  /** Room ID. */
  readonly roomId: RoomId;
  /** Room expiry. */
  readonly roomExpiry: Date;
}

/**
 * Create a JSON compatible object using the contents of {@link room}. The key
 * names of the object uses the REST API parameter names.
 * @param room - Room.
 * @returns JSON compatible object containing the contents of the room
 * {@link userIdentity}.
 */
export function createJsonCompatibleRoom(room: Room) {
  return {
    [roomIdKey]: room.roomId.toString(),
    [userIdsKey]: room.userIds.map((id) => id.toNumber()),
    [questionIdKey]: room.questionId.toString(),
    [questionLangSlugKey]: room.questionLangSlug.toString(),
    [roomExpiryKey]: room.roomExpiry.toISOString(),
  };
}
