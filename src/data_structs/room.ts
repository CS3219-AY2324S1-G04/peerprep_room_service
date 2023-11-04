import {
  questionIdKey,
  roomExpiryKey,
  roomIdKey,
  userIdsKey,
} from '../utils/parameter_keys';
import ClientSpecifiedRoom from './client_specified_room';
import RoomId from './room_id';

export default interface Room extends ClientSpecifiedRoom {
  readonly roomId: RoomId;
  readonly roomExpiry: Date;
}

export function createJsonCompatibleRoom(room: Room) {
  return {
    [roomIdKey]: room.roomId.toString(),
    [userIdsKey]: room.userIds.map((id) => id.toNumber()),
    [questionIdKey]: room.questionId.toString(),
    [roomExpiryKey]: room.roomExpiry.toISOString(),
  };
}
