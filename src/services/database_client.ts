/**
 * @file Defines {@link DatabaseClient}.
 */
import Room from '../data_structs/room';
import RoomId from '../data_structs/room_id';
import UserId from '../data_structs/user_id';

/** Client for performing database operations. */
export default interface DatabaseClient {
  /** Initialises the client. */
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

  /**
   * @param userIds - User IDs.
   * @returns True if any user whose user ID is in {@link userIds} is currently
   * in a room.
   */
  areAnyUsersInRoom(userIds: UserId[]): Promise<boolean>;

  /**
   * Fetches information on the room whose room ID is {@link roomId} .
   * @param roomId - Room ID..
   * @returns Information on the room whose room ID is {@link roomId}, if a room
   * with said room ID exist. Otherwise, returns undefined.
   */
  fetchRoomFromRoomId(roomId: RoomId): Promise<Room | undefined>;

  /**
   * Fetches information on the room which contains the user whose user ID is
   * {@link userId}.
   * @param userId - User ID.
   * @returns Information on the room which contains the user whose room ID is
   * {@link userId}, if the user is in a room. Otherwise, returns undefined.
   */
  fetchRoomFromUserId(userId: UserId): Promise<Room | undefined>;

  /**
   * Fetches information on all rooms that are expired.
   * @returns Array of room information for rooms that are expired.
   */
  fetchExpiredRooms(): Promise<Room[]>;

  /**
   * Creates a room using information in {@link room}.
   * @param room - Information about the room.
   */
  createRoom(room: Room): Promise<void>;

  /**
   * Updates the room expiry of the room which the user, whose user ID is
   * {@link userId}, is in.
   * @param userId - User ID.
   * @param expiry - Updated room expiry.
   * @returns True if the room expiry is updated successfully. Otherwise,
   * returns false. This can be caused by the user not being in any room.
   */
  updateRoomExpiry(userId: UserId, expiry: Date): Promise<boolean>;

  /**
   * Removes the user, whose user ID is {@link userID}, from the room he/she is
   * in.
   * @param userId - User ID.
   * @returns True if the user is removed successfully. Otherwise, returns
   * false. This can be caused by the user not being in any room.
   */
  removeRoomUser(userId: UserId): Promise<boolean>;

  /**
   * Deletes the room whose room ID is {@link roomId}.
   * @param roomId - Room ID.
   * @returns True if a room is deleted successfully. Otherwise, returns false.
   * This can be caused by the room ID not belonging to any room.
   */
  deleteRoom(roomId: RoomId): Promise<boolean>;

  /**
   * Deletes all rooms whose room ID is in {@link roomIds}.
   *
   * The number of rooms deleted might not match the number of room IDs in
   * {@link roomIds}. This is because some room IDs specified in
   * {@link roomIds} may not belong to any rooms. Some room ID in
   * {@link roomIds} may also be duplicates.
   * @param roomId - Room ID.
   * @returns True if at least one room is deleted successfully. Otherwise,
   * returns false.
   */
  deleteRooms(roomIds: RoomId[]): Promise<boolean>;

  /**
   * @param err - The error to check.
   * @returns True if {@link err} is an {@link Error} caused by a violation of
   * a unique constraint.
   */
  isUniqueConstraintViolated(err: unknown): boolean;
}
