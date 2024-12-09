import pg from "pg";
import test, { describe } from "node:test";
import assert from "node:assert";

const client = new pg.Client({
  connectionString: "postgres://docker:docker@localhost:5432/raw-orm-test",
});

describe("database", async () => {
  test("connect to database", async () => {
    await client.connect();

    client.on("error", (err) => {
      assert.ifError(err);
    });
  });
});
