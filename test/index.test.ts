import pg from "pg";
import test, { describe } from "node:test";
import assert from "node:assert";
import { Table } from "../table";

const client = new pg.Client({
  connectionString: "postgres://docker:docker@localhost:5432/raw-orm-test",
});

describe("table business logic", () => {
  const users = new Table("users");

  test("generates correct query without any config", () => {
    const query = users.find();

    assert.strictEqual(query, "SELECT * FROM users");
  });

  test("generates correct query with SELECT", () => {
    const query = users.find({
      select: {
        id: true,
        name: true,
        age: false,
      },
    });

    assert.strictEqual(query, "SELECT id, name FROM users");
  });

  test("generates correct query with WHERE", () => {
    const query = users.find({
      where: {
        id: "1",
        name: "john",
      },
    });

    assert.strictEqual(
      query,
      "SELECT * FROM users WHERE id = 1 AND name = john"
    );
  });

  test("generates correct query with SELECT and WHERE", () => {
    const query = users.find({
      select: { name: true, age: true, id: false },
      where: { id: "1", name: "john" },
    });

    assert.strictEqual(
      query,
      "SELECT name, age FROM users WHERE id = 1 AND name = john"
    );
  });

  test("generates correct query with SELECT, WHERE and ORDER BY", () => {
    const query = users.find({
      select: { name: true, age: true, id: false },
      where: { id: "1", name: "john" },
      orderBy: {
        name: "ASC",
      },
    });

    assert.strictEqual(
      query,
      "SELECT name, age FROM users WHERE id = 1 AND name = john ORDER BY name ASC"
    );
  });

  test("generates correct query with LIMIT and OFFSET", () => {
    const query = users.find({
      limit: 10,
      offset: 2,
    });

    assert(query, "SELECT * FROM users LIMIT 10 OFFSET 2");
  });
});

describe("database", async () => {
  test("connect to database", async () => {
    await client.connect();

    client.on("error", (err) => {
      assert.ifError(err);
    });
  });
});
