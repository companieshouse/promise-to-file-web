import {IMap} from "../types";

export default interface IStore {

  /**
   * Get data from the store.
   */
  getData(key: string): IMap<any>;

  /**
   * Save data to the store.
   */
  saveData(key: string, data: IMap<any>): void;

  /**
   * Delete data in the store.
   */
  deleteData(key: string): void;

  /**
   * Set an expiry time for the data in the store.
   */
  expire(key: string, seconds: number): void;

  /**
   * Check to see if data exists in the store.
   */
  exists(key: string): Promise<boolean>;
}
