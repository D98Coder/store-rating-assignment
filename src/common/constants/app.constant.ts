export const DEFAULT_PORT = 3000;

export const corsOptions = {
  origin: process.env.allow_origin || '*',
  credentials: true,
};
