const redis = require("async-redis");
const { default: mongoose } = require("mongoose");
const { RedisContainer } = require("@testcontainers/redis");
const { MongoDBContainer } = require("@testcontainers/mongodb");
const listen = require("./consumer");

jest.setTimeout(30000);

describe("consumer test", () => {
  let mongoContainer;
  let redisContainer;
  let redisClient;
  let mongoClient;
  let counterCollection;

  beforeAll(async () => {
    mongoContainer = await new MongoDBContainer("mongo:6.0.1")
      .withExposedPorts(27017)
      .start();

    redisContainer = await new RedisContainer()
      .withExposedPorts(6379)
      .start();

    mongoClient = mongoose.createConnection(mongoContainer.getConnectionString(), { directConnection: true });

    redisClient = redis.createClient(
      redisContainer.getMappedPort(6379),
      redisContainer.getHost(),
    );

    counterCollection = mongoClient.collection("counters");
    await counterCollection.insertOne({ count: 0 });

  });

  afterAll(async () => {
    await redisClient.quit();
    await redisContainer.stop();
    await mongoose.disconnect();
    await mongoContainer.stop();
  });

  it("works", async () => {
    listen(redisClient, mongoClient);
    await redisContainer.executeCliCmd("publish", ["__keyevent@0__:expired", "message"]);
    await redisContainer.executeCliCmd("publish", ["__keyevent@0__:expired", "message"]);
    await redisContainer.executeCliCmd("publish", ["__keyevent@0__:expired", "message"]);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const obj = await counterCollection.findOne({})
    expect(obj).toBeDefined();
    expect(obj.count).toBe(3);

  });
});
