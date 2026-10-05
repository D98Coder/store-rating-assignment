import {
    Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from 'typeorm';
import { Store } from '../stores/store.entity';
import { User } from '../users/user.entity';
  
  @Entity('ratings')
  @Unique('uq_ratings_user_store', ['userId', 'storeId'])
  @Check('"rating" BETWEEN 1 AND 5')
  export class Rating {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Index()
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;
  
    @Index()
    @Column({ name: 'store_id', type: 'uuid' })
    storeId: string;
  
    @Column({ type: 'smallint' })
    rating: number;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }