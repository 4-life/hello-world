import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';

let adapter: KeyvAdapter | null = null;

export function getApolloCache(): KeyvAdapter {
  if (!adapter) {
    const store = new KeyvRedis(process.env.REDIS_URL ?? 'redis://redis:6379');
    adapter = new KeyvAdapter(new Keyv({ store }));
  }
  return adapter;
}
