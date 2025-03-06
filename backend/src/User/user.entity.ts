import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  // OneToOne,
  // JoinColumn,
  // ManyToOne,
  // OneToMany,
  // OneToOne,
  // JoinColumn,
} from 'typeorm';

/**
 * USER TABLE
 * - Each user can create multiple events
 * - Each user can create multiple help requests
 */
@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string; // 'admin' | 'volunteer'
}

/**
 * PROFILE TABLE
 * - Each user has one profile (One-to-One Relationship)
 */
@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ unique: true })
  nid: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
