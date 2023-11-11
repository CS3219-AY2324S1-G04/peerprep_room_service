/**
 * @file Defines {@link MqClient} and events related to the MQ.
 */
import Room from '../data_structs/room';
import UserId from '../data_structs/user_id';
import {
  questionIdKey,
  questionLangSlugKey,
  roomIdKey,
  userIdsKey,
} from '../utils/parameter_keys';

/** Client for performing MQ operations. */
export default interface MqClient {
  /** Initialises the client. */
  initialise(): Promise<void>;

  /** Disconnects from the MQ. */
  disconnect(): Promise<void>;

  /**
   * Publishes a "create room" event to the MQ.
   * @param room - Room information.
   */
  publishCreateRoomEvent(room: Room): Promise<void>;

  /**
   * Publishes a "remove user from room" event to the MQ.
   * @param room - Room information.
   * @param removedUserId - User ID of the user that is removed.
   */
  publishRemoveUserEvent(room: Room, removedUserId: UserId): Promise<void>;

  /**
   * Publishes a "delete room" event to the MQ.
   * @param room - Room information.
   */
  publishDeleteRoomEvent(room: Room): Promise<void>;
}

/** Room event. */
export class RoomEvent {
  private static _eventTypeKey: string = 'event-type';
  private static _roomInfoKey: string = 'room';

  /** Type of event. */
  public readonly eventType: EventType;
  /** Room information. */
  public readonly room: Room;

  /**
   * @param eventType - Type of event.
   * @param room - Room information.
   */
  public constructor(eventType: EventType, room: Room) {
    this.eventType = eventType;
    this.room = room;
  }

  /**
   * Create a JSON compatible object using the contents of this event.
   *
   * The key names of the object uses the REST API and MQ parameter names.
   * @returns Created JSON compatible object.
   */
  public toJsonCompatibleObject(): object {
    return {
      [RoomEvent._eventTypeKey]: this.eventType.toString(),
      [RoomEvent._roomInfoKey]: {
        [roomIdKey]: this.room.roomId.toString(),
        [userIdsKey]: this.room.userIds.map((id) => id.toNumber()),
        [questionIdKey]: this.room.questionId.toString(),
        [questionLangSlugKey]: this.room.questionLangSlug.toString(),
      },
    };
  }
}

/** Event that occurs when a user is removed from a room. */
export class RemoveUserRoomEvent extends RoomEvent {
  private static _removedUserIdKey: string = 'removed-user-id';

  /** User ID of the user who was removed. */
  public readonly removedUserId: UserId;

  /**
   * @param room - Updated room information.
   * @param removedUserId - User ID of the user who was removed.
   */
  public constructor(room: Room, removedUserId: UserId) {
    super(EventType.removeUser, room);
    this.removedUserId = removedUserId;
  }

  /** @inheritdoc */
  public override toJsonCompatibleObject(): object {
    return {
      ...super.toJsonCompatibleObject(),
      [RemoveUserRoomEvent._removedUserIdKey]: this.removedUserId.toNumber(),
    };
  }
}

/** Types of events the MQ can contain. */
export enum EventType {
  create = 'create',
  delete = 'delete',
  removeUser = 'remove-user',
}
