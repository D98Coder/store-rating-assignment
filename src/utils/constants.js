export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  OWNER: 'OWNER',
};



export const PAGE_SIZE = 1;

export const DBRoles = {
  SYSTEM_ADMIN : 'SYSTEM_ADMIN',
  NORMAL_USER : 'NORMAL_USER',
  STORE_OWNER : 'STORE_OWNER',
}

export const ROLE_LABELS = {
  [DBRoles.SYSTEM_ADMIN]: 'System Administrator',
  [DBRoles.NORMAL_USER]: 'Normal User',
  [DBRoles.STORE_OWNER]: 'Store Owner',
};


export const pageRoutes = {
  adminDashboard: "/admin",
  adminStore: '/admin/stores',
  login: '/login',
  changePassowrd: '/change-password'
}

export const HOME_BY_ROLE = {
  [DBRoles.SYSTEM_ADMIN]: pageRoutes.adminDashboard,
  [DBRoles.NORMAL_USER]: '/user',
  [DBRoles.STORE_OWNER]: '/owner',
};

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

// ratings
export const ratingsSize = 22;
export const maxRatings = 5;

// colors
export const GOLD = "#f5a623";
export const EMPTY = "#d1d5db";
