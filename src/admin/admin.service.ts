import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { Rating } from '../ratings/rating.entity';
import { Store } from '../stores/store.entity';
import { StoresService } from '../stores/stores.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
    private readonly users: UsersService,
    private readonly stores: StoresService,
  ) {}

  async dashboard() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.userRepo.count(),
      this.storeRepo.count(),
      this.ratingRepo.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }

  /** Name, Email, Address, Role (+ Rating when the user is a Store Owner). */
  async userDetails(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const base = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    };
    if (user.role !== Role.STORE_OWNER) return base;

    const store = await this.stores.findByOwnerId(user.id);
    return {
      ...base,
      rating: store ? await this.stores.getAverageRating(store.id) : null,
      store: store ? { id: store.id, name: store.name } : null,
    };
  }
}