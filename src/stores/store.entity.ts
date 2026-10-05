import {
    Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
  
  @Entity('stores')
  export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Index()
    @Column({ type: 'varchar', length: 60 })
    name: string;
  
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;
  
    @Column({ type: 'varchar', length: 400 })
    address: string;
  
    /** One owner <-> one store (OneToOne adds a UNIQUE constraint on owner_id). */
    @Column({ name: 'owner_id', type: 'uuid', nullable: true })
    ownerId: string | null;
  
    @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'owner_id' })
    owner: User | null;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  