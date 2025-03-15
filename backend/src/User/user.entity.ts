import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;


  //region Relationships
  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];

  @OneToMany(() => OtpEntity, (otp) => otp.user)
  otp: OtpEntity[];

  @OneToMany(() => EventEntity, (event) => event.user)
  event: EventEntity[];

  @OneToMany(() => Community_Help_RequestEntity, (community_help_request) => community_help_request.user)
  community_help_request: Community_Help_RequestEntity[];

  @OneToMany(() => AttendeeEntity, (attendee) => attendee.user)
  attendee: AttendeeEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comment: CommentEntity[];

  @OneToMany(() => TeamEntity, (team) => team.user)
  team: TeamEntity[];

 @OneToMany(() => CertificateEntity, (certificate) => certificate.user)
 certificate: CertificateEntity[];



  //endregion Relationships


}

@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  nid: string;

  @Column()
  gender: string;

  @Column()
  age: string;

  @Column()
  address: string;

  // @Column({ unique: true })
  @Column()
  phone: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}

@Entity('session')
export class SessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // user_id: number;

  @Column()
  jwt_token: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  expiration_date: string | null;



  @ManyToOne(() => UserEntity, (user) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}

@Entity('otp')
export class OtpEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  otp: string;

  @Column({ nullable: true })
  expiration_date: string;

  @ManyToOne(() => UserEntity, (user) => user.otp)
  user: UserEntity;
}


@Entity('event')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column()
  location: string;

  @Column()
  description: string;

  @Column()
  time: string;

  @ManyToOne(() => UserEntity, (user) => user.event)
  user: UserEntity;

  @OneToMany(() => AttendeeEntity, (attendee) => attendee.event)
  attendee: AttendeeEntity[];

}

@Entity('community_help_request')
export class Community_Help_RequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  status: string;

  @Column()
  description: string;


  @ManyToOne(() => UserEntity, (user) => user.community_help_request)
  user: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.community_help_request)
  comment: CommentEntity[];


}

@Entity('attendee')
export class AttendeeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  start_time: string;

  @Column()
  end_time: string;


  @ManyToOne(() => UserEntity, (user) => user.attendee)
  user: UserEntity;

  @ManyToOne(() => EventEntity, (event) => event.attendee)
  event: EventEntity;
}

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  time: string;


  @ManyToOne(() => UserEntity, (user) => user.comment)
  user: UserEntity;

  @ManyToOne(() => Community_Help_RequestEntity, (community_help_request) => community_help_request.comment)
  community_help_request: Community_Help_RequestEntity;
}

@Entity('team')
export class TeamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  task_description: string;


  @ManyToOne(() => UserEntity, (user) => user.team)
  user: UserEntity;
}

@Entity('certificate')
export class CertificateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;


  @ManyToOne(() => UserEntity, (user) => user.certificate)
  user: UserEntity;
}