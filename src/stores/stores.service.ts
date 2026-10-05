import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { buildMeta, isUniqueViolation, likePattern, resolveSort } from '../common/utils/query.utils';
import { Rating } from '../ratings/rating.entity';
import { UsersService } from '../users/users.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { Store } from './store.entity';

const STORE_SORT: Record<string, string> = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'rating', // alias of the AVG() select
  createdAt: 's.createdAt',
};

const RATER_SORT: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  rating: 'r.rating',
  ratedAt: 'r.updatedAt',
};

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
    private readonly users: UsersService,
  ) {}

  async create(dto: CreateStoreDto) {
    if (dto.ownerId) {
      const owner = await this.users.findById(dto.ownerId);
      if (!owner || owner.role !== Role.STORE_OWNER) {
        throw new BadRequestException('ownerId must reference an existing user with role STORE_OWNER');
      }
    }
    try {
      return await this.storeRepo.save(
        this.storeRepo.create({
          name: dto.name,
          email: dto.email,
          address: dto.address,
          ownerId: dto.ownerId ?? null,
        }),
      );
    } catch (e: any) {
      if (isUniqueViolation(e)) {
        const detail: string = e?.detail ?? '';
        throw new ConflictException(
          detail.includes('owner_id') || detail.includes('ownerId')
            ? 'This owner already has a store'
            : 'Store email is already registered',
        );
      }
      throw e;
    }
  }

  findById(id: string) {
    return this.storeRepo.findOne({ where: { id } });
  }

  findByOwnerId(ownerId: string) {
    return this.storeRepo.findOne({ where: { ownerId } });
  }

  async getAverageRating(storeId: string): Promise<number | null> {
    const row = await this.ratingRepo
      .createQueryBuilder('r')
      .select('ROUND(AVG(r.rating)::numeric, 1)', 'avg')
      .where('r.storeId = :storeId', { storeId })
      .getRawOne();
    return row?.avg == null ? null : Number(row.avg);
  }

  private applyFilters(qb: SelectQueryBuilder<Store>, q: ListStoresQueryDto, isAdmin: boolean) {
    if (q.name) qb.andWhere('s.name ILIKE :name', { name: likePattern(q.name) });
    if (q.address) qb.andWhere('s.address ILIKE :address', { address: likePattern(q.address) });
    if (isAdmin && q.email) qb.andWhere('s.email ILIKE :email', { email: likePattern(q.email) });
    return qb;
  }

  /**
   * One query (LEFT JOIN + AVG, no N+1).
   * Admin: name, email, address, rating. Normal user: name, address, overall rating, own rating.
   */
  async findAll(q: ListStoresQueryDto, opts: { userId?: string; isAdmin: boolean }) {
    try {

      const sortExpr = resolveSort(q.sortBy, STORE_SORT, 'name');

    const qb = this.storeRepo
      .createQueryBuilder('s')
      .leftJoin(Rating, 'r', 'r.storeId = s.id')
      .select('s.id', 'id')
      .addSelect('s.name', 'name')
      .addSelect('s.address', 'address')
      .addSelect('s.email', 'email')
      .addSelect('ROUND(AVG(r.rating)::numeric, 1)', 'rating')
      .addSelect('COUNT(r.id)', 'totalRatings')
      .groupBy('s.id');

    if (opts.userId) {
      qb.addSelect(
        '(SELECT mr.rating FROM ratings mr WHERE mr.store_id = s.id AND mr.user_id = :uid)',
        'myRating',
      ).setParameter('uid', opts.userId);
    }

    this.applyFilters(qb, q, opts.isAdmin);

    const total = await this.applyFilters(this.storeRepo.createQueryBuilder('s'), q, opts.isAdmin).getCount();

    const rows = await qb
      .orderBy(sortExpr, q.order, 'NULLS LAST')
      .addOrderBy('s.id', 'ASC')
      .offset((q.page - 1) * q.limit)
      .limit(q.limit)
      .getRawMany();

    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      ...(opts.isAdmin ? { email: r.email } : {}),
      address: r.address,
      rating: r.rating == null ? null : Number(r.rating),
      totalRatings: Number(r.totalRatings),
      ...(opts.userId ? { myRating: r.myRating == null ? null : Number(r.myRating) } : {}),
    }));

    return { data, meta: buildMeta(total, q.page, q.limit) };
      
    } catch (error) {
      console.log(`Error while fetching stores: ${error.message}`)
      throw error;
    }
    
  }

    /** Store owner dashboard: average rating + list of users who rated the store. */
    async ownerDashboard(ownerId: string, q: PaginationQueryDto) {
      const store = await this.findByOwnerId(ownerId);
  
      // Owner exists but no store is linked yet: return an empty dashboard, not an error
      if (!store) {
        return {
          store: null,
          averageRating: null,
          totalRatings: 0,
          raters: [],
          meta: buildMeta(0, q.page, q.limit),
        };
      }
  
      const sortExpr = resolveSort(q.sortBy, RATER_SORT, 'ratedAt');
  
      const stats = await this.ratingRepo
        .createQueryBuilder('r')
        .select('ROUND(AVG(r.rating)::numeric, 1)', 'avg')
        .addSelect('COUNT(r.id)', 'count')
        .where('r.storeId = :storeId', { storeId: store.id })
        .getRawOne();
  
      const rows = await this.ratingRepo
        .createQueryBuilder('r')
        .innerJoin('r.user', 'u')
        .select('u.id', 'userId')
        .addSelect('u.name', 'name')
        .addSelect('u.email', 'email')
        .addSelect('u.address', 'address')
        .addSelect('r.rating', 'rating')
        .addSelect('r.updatedAt', 'ratedAt')
        .where('r.storeId = :storeId', { storeId: store.id })
        .orderBy(sortExpr, q.order)
        .addOrderBy('r.id', 'ASC')
        .offset((q.page - 1) * q.limit)
        .limit(q.limit)
        .getRawMany();
  
      const totalRatings = Number(stats?.count ?? 0);
  
      return {
        stores: [
          {
            id: store.id, name: store.name, email: store.email, address: store.address,
            averageRating: stats?.avg == null ? null : Number(stats.avg),
            totalRatings,
            raters: rows.map((r) => ({
              userId: r.userId,
              name: r.name,
              email: r.email,
              address: r.address,
              rating: Number(r.rating),
              ratedAt: r.ratedAt,
            })),
            meta: buildMeta(totalRatings, q.page, q.limit),
          }
        ]
      };
    }
}