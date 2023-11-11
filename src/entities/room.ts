/**
 * @file Defines {@link Room}.
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Entity in the database for storing room info. */
@Entity({ name: 'room' })
export default class Room {
  /** Room ID. */
  @PrimaryColumn({ name: 'room_id' })
  public roomId: string;

  /** User ID of users in the room. */
  @Column({ name: 'user_ids', type: 'int', array: true, nullable: false })
  public userIds: number[];

  /** Question ID of the question assigned to the room. */
  @Column({ name: 'question_id', nullable: false })
  public questionId: string;

  /** Question language slug of the question assigned to the room. */
  @Column({ name: 'question_lang_slug', nullable: false })
  public questionLangSlug: string;

  /** Room expiry. */
  @Column({ name: 'room_expiry', nullable: false })
  public roomExpiry: Date;

  private constructor(
    roomId: string,
    userIds: number[],
    questionId: string,
    questionLangSlug: string,
    roomExpiry: Date,
  ) {
    this.roomId = roomId;
    this.userIds = userIds;
    this.questionId = questionId;
    this.questionLangSlug = questionLangSlug;
    this.roomExpiry = roomExpiry;
  }
}
