/**
 * @file Defines {@link DatabaseClient}.
 */
import Room from '../data_structs/room';
import RoomId from '../data_structs/room_id';
import UserId from '../data_structs/user_id';

/** Client for performing database operations. */
export default interface DatabaseClient {
  /** Initialise the client. */
  initialise(): Promise<void>;

  /** Synchronises the entities on the database to match that of the client. */
  synchronise(): Promise<void>;

  /** Disconnects from the database. */
  disconnect(): Promise<void>;

  /**
   * @returns True if one or more of the entities exist. Else, returns false.
   */
  doEntitiesExist(): Promise<boolean>;

  /** Deletes all known entities. */
  deleteEntities(): Promise<void>;

  areAnyUsersInRoom(userIds: UserId[]): Promise<boolean>;

  fetchRoomFromRoomId(roomId: RoomId): Promise<Room | undefined>;

  fetchRoomFromUserId(userId: UserId): Promise<Room | undefined>;

  /**
   *aCreates a room using information in {@link room}.
   * @param room - Information about the room.
   */
  createRoom(room: Room): Promise<void>;

  updateRoomExpiry(userId: UserId, expiry: Date): Promise<boolean>;

  removeRoomUser(userId: UserId): Promise<boolean>;

  deleteRoom(roomId: RoomId): Promise<boolean>;

  /**
   * @param err - The error to check.
   * @returns True if {@link err} is an {@link Error} caused by a violation of
   * a unique constraint.
   */
  isUniqueConstraintViolated(err: unknown): boolean;
}
