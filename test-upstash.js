import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: 'https://foo',
  token: 'bar'
});
console.log(redis);
