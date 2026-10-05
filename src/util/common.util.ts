import { ConfigService } from '@nestjs/config';

type GetConfigOptions = {
  config?: ConfigService,
  defaultValue?: any
}
export const getConfig = (configKey: string, options: GetConfigOptions = {} ): string => {
  console.log(`Fetching config value for key: ${configKey} with defaultValue=${options.defaultValue}`)
  // if (options.config) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  //   return options.config.get<string>(configKey) ?? options.defaultValue;
  // }

  return (process.env[configKey] as string)  ?? options.defaultValue;
};
