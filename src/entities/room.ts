import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'room' })
export default class Room {
  @PrimaryColumn({ name: 'room_id' })
  public roomId: string;

  @Column({ name: 'user_ids', type: 'int', array: true, nullable: false })
  public userIds: number[];

  @Column({ name: 'question_id', nullable: false })
  public questionId: string;

  @Column({ name: 'room_expiry', nullable: false })
  public roomExpiry: Date;

  public constructor(
    roomId: string,
    userIds: number[],
    questionId: string,
    roomExpiry: Date,
  ) {
    this.roomId = roomId;
    this.userIds = userIds;
    this.questionId = questionId;
    this.roomExpiry = roomExpiry;
  }
}
