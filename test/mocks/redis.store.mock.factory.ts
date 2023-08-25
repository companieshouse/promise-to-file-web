/**
 * This factory will override the redis store constructor and prevent a redis connection attempt
 * To use this in the tests:
 * jest.mock("../../src/session/store/redis.store", () => import("../mocks/redis.store.mock.factory"));
 * Paths may be different depending on location
 */
export default () => {
    return {
        default: {}
    };
};
