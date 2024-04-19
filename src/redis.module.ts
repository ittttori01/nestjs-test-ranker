import {
  DynamicModule,
  FactoryProvider,
  Module,
  ModuleMetadata,
  Logger,
} from '@nestjs/common';

import { IORedisKey } from 'src/utils/interfaces/redis.interface';
import IORedis, { Redis, RedisOptions } from 'ioredis';

//useFactory에의 해서 Return 될 값들
type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  //callback fucntion
  onClientReady?: (client: Redis) => void;
};

type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
//redismodule을 인스턴스화 하기 위해서 DynamicModule
export class RedisModule {
  private readonly logger = new Logger(RedisModule.name);

  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider = {
      provide: IORedisKey,
      useFactory: async (...args) => {
        const { connectionOptions, onClientReady } = await useFactory(...args);
        const client = await new IORedis(connectionOptions);
        onClientReady(client);
        //callback에 넘겨줄  client
        return client;
      },
      inject,
    };
    return {
      module: RedisModule,
      imports,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
