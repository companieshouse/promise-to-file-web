import * as msgpack from "msgpack5";
import * as redis from "redis";
import {promisify} from "util";
import logger from "../../logger";
import {CACHE_SERVER} from "../../properties";
import Session from "../session";
import {IMap} from "../types";
import IStore from "./store";

export interface IRedisStoreOptions {
  url: string;
}

const REDIS_URL_PREFIX: string = "redis://";
const REDIS_PROBLEM: string = "There is a problem with redis: ";

export class RedisStore implements IStore {

  private readonly client: redis.RedisClient;

  constructor(config: IRedisStoreOptions) {
    this.client = redis.createClient({url: REDIS_URL_PREFIX + config.url});

    this.client.on("error", (error) => {
      logger.error(REDIS_PROBLEM, error);
    });
  }

  public async getData(key: string): Promise<IMap<any>> {
    const getAsync = promisify(this.client.get).bind(this.client);
    try {
      const data = await getAsync(key);
      if (data) {
        const raw = Buffer.from(data, "base64");
        return msgpack().decode(raw);
      }
    } catch (e) {
      throw e;
    }
    return {};
  }

  public async saveData(key: string, data: IMap<any>) {
    const set = promisify(this.client.set).bind(this.client);
    const encoded = msgpack().encode(data).toString("base64");
    await set(key, encoded);
  }

  public async deleteData(key: string) {
    const del = promisify(this.client.del).bind(this.client);
    await del(key);
  }

  public async expire(key: string, secs: number) {
    const expire = promisify(this.client.expire).bind(this.client);
    await expire(key, secs);
  }

  public async exists(key: string): Promise<boolean> {
    return await this.getData(key) !== null;
  }

  public async save(session: Session): Promise<void> {
    await this.saveData(session.sessionKey(), session.data);
  }

  public async load(session: Session): Promise<Session> {
    session.data = this.getData(session.sessionKey());
    return session;
  }
}

const redisStore = new RedisStore({url: CACHE_SERVER});
export default redisStore;
