export function validateEnv(config: Record<string, any>) {
  const required = [
    'DATABASE_HOST',
    'DATABASE_PORT',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'JWT_SECRET',
    'ADMIN_NAME',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
  ];
  const missing = required.filter((k) => !config[k]);
  if (missing.length)
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);

  return config;
}
