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

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];

  @OneToMany(() => OtpEntity, (otp) => otp.user)
  otp: OtpEntity[];
}

@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  nid: string;

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
