import Room from '../data_structs/room';
import UserId from '../data_structs/user_id';
import { questionIdKey, roomIdKey, userIdsKey } from '../utils/parameter_keys';

export default interface MqClient {
  initialise(): Promise<void>;

  disconnect(): Promise<void>;

  publishCreateRoomEvent(room: Room): Promise<void>;

  publishRemoveUserEvent(room: Room, removedUserId: UserId): Promise<void>;

  publishDeleteRoomEvent(room: Room): Promise<void>;
}

export class RoomEvent {
  private static _eventTypeKey: string = 'event-type';
  private static _roomInfoKey: string = 'room';

  public readonly eventType: EventType;
  public readonly room: Room;

  public constructor(eventType: EventType, room: Room) {
    this.eventType = eventType;
    this.room = room;
  }

  public toJsonCompatibleObject(): object {
    return {
      [RoomEvent._eventTypeKey]: this.eventType.toString(),
      [RoomEvent._roomInfoKey]: {
        [roomIdKey]: this.room.roomId.toString(),
        [userIdsKey]: this.room.userIds.map((id) => id.toNumber()),
        [questionIdKey]: this.room.questionId.toString(),
      },
    };
  }
}

export class RemoveUserRoomEvent extends RoomEvent {
  private static _removedUserIdKey: string = 'removed-user-id';

  public readonly removedUserId: UserId;

  public constructor(room: Room, removedUserId: UserId) {
    super(EventType.removeUser, room);
    this.removedUserId = removedUserId;
  }

  public override toJsonCompatibleObject(): object {
    return {
      ...super.toJsonCompatibleObject(),
      [RemoveUserRoomEvent._removedUserIdKey]: this.removedUserId.toNumber(),
    };
  }
}

export enum EventType {
  create = 'create',
  delete = 'delete',
  removeUser = 'remove-user',
}
