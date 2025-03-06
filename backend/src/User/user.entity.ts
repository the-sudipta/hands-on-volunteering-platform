import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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
