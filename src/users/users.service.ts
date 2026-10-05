import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/browser';
import { Role } from '../common/enums/role.enum';
import { buildMeta, isUniqueViolation, likePattern, resolveSort } from '../common/utils/query.utils';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { User } from './user.entity';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
}

const USER_SORT: Record<string, string> = {
  name: 'name',
  email: 'email',
  address: 'address',
  role: 'role',
  createdAt: 'createdAt',
};

// Average rating of the store owned by this user (NULL for non-owners / no ratings)
const OWNER_RATING_SQL = `(
  SELECT ROUND(AVG(r.rating)::numeric, 1)
  FROM stores st
  JOIN ratings r ON r.store_id = st.id
  WHERE st.owner_id = u.id
)`;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  hashPassword(plain: string) {
    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS', 10));
    return bcrypt.hash(plain, rounds);
  }

  verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  async create(input: CreateUserInput) {
    const passwordHash = await this.hashPassword(input.password);
    try {
      const saved = await this.repo.save(
        this.repo.create({
          name: input.name,
          email: input.email,
          address: input.address,
          role: input.role,
          passwordHash,
        }),
      );
      const { passwordHash: _omit, ...safe } = saved;
      return safe;
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('Email is already registered');
      throw e;
    }
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email })
      .getOne();
  }

  findByIdWithPassword(id: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id })
      .getOne();
  }

  async updatePassword(id: string, newPlain: string) {
    await this.repo.update(id, { passwordHash: await this.hashPassword(newPlain) });
  }

  // async findAll(q: ListUsersQueryDto) {
  //   const sortKey = resolveSort(q.sortBy, USER_SORT, 'createdAt');
  //   const where: FindOptionsWhere<User> = {};
  //   if (q.name) where.name = ILike(likePattern(q.name));
  //   if (q.email) where.email = ILike(likePattern(q.email));
  //   if (q.address) where.address = ILike(likePattern(q.address));
  //   if (q.role) where.role = q.role;

  //   const [data, total] = await this.repo.findAndCount({
  //     where,
  //     order: { [sortKey]: q.order } as FindOptionsOrder<User>,
  //     skip: (q.page - 1) * q.limit,
  //     take: q.limit,
  //   });
  //   return { data, meta: buildMeta(total, q.page, q.limit) };
  // }

  private applyFilters(qb: SelectQueryBuilder<User>, q: ListUsersQueryDto) {
    if (q.name) qb.andWhere('u.name ILIKE :name', { name: likePattern(q.name) });
    if (q.email) qb.andWhere('u.email ILIKE :email', { email: likePattern(q.email) });
    if (q.address) qb.andWhere('u.address ILIKE :address', { address: likePattern(q.address) });
    if (q.role) qb.andWhere('u.role = :role', { role: q.role });
    return qb;
  }

  /** Name, Email, Address, Role (+ rating for Store Owners). */
  async findAll(q: ListUsersQueryDto) {
    const sortExpr = resolveSort(q.sortBy, USER_SORT, 'createdAt');

    const qb = this.repo
      .createQueryBuilder('u')
      .select('u.id', 'id')
      .addSelect('u.name', 'name')
      .addSelect('u.email', 'email')
      .addSelect('u.address', 'address')
      .addSelect('u.role', 'role')
      .addSelect('u.createdAt', 'createdAt')
      .addSelect(OWNER_RATING_SQL, 'rating');

    this.applyFilters(qb, q);

    const total = await this.applyFilters(this.repo.createQueryBuilder('u'), q).getCount();

    const rows = await qb
      .orderBy(sortExpr, q.order, 'NULLS LAST')
      .addOrderBy('u.id', 'ASC')
      .offset((q.page - 1) * q.limit)
      .limit(q.limit)
      .getRawMany();

    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      address: r.address,
      role: r.role,
      createdAt: r.createdAt,
      // only present for store owners; null = owner has no store or no ratings yet
      ...(r.role === Role.STORE_OWNER
        ? { rating: r.rating == null ? null : Number(r.rating) }
        : {}),
    }));

    return { data, meta: buildMeta(total, q.page, q.limit) };
  }
}