import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoresService } from '../stores/stores.service';
import { Rating } from './rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating) private readonly repo: Repository<Rating>,
    private readonly stores: StoresService,
  ) {}

  /** POST = create or update (upsert). PATCH = modify only if a rating already exists. */
  async submit(userId: string, storeId: string, rating: number, requireExisting = false) {
    if (!(await this.stores.findById(storeId))) throw new NotFoundException('Store not found');

    if (requireExisting && !(await this.repo.exists({ where: { userId, storeId } }))) {
      throw new NotFoundException('You have not rated this store yet');
    }

    await this.repo.upsert({ userId, storeId, rating }, ['userId', 'storeId']);

    return {
      storeId,
      myRating: rating,
      overallRating: await this.stores.getAverageRating(storeId),
    };
  }

    /** Deletes the logged-in user's rating for a store. */
    async remove(userId: string, storeId: string) {
      if (!(await this.stores.findById(storeId))) throw new NotFoundException('Store not found');
  
      const result = await this.repo.delete({ userId, storeId });
      if (!result.affected) throw new NotFoundException('You have not rated this store');
  
      return {
        message: 'Rating deleted successfully',
        storeId,
        myRating: null,
        overallRating: await this.stores.getAverageRating(storeId),
      };
    }
}