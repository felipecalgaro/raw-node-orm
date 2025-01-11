import test, { describe } from "node:test";
import assert from "node:assert";
import { Table } from "../table";
import { Raw } from "../raw";
import { Schema } from "../schema";
import { SQLMigrationWriter } from "../sql-migration-writer";

describe("queries", () => {
  const users = new Table("users");

  test("generates correct query without any config", () => {
    const query = users.find();

    assert.strictEqual(query, `SELECT * FROM "users";`);
  });

  test("generates correct query with SELECT", () => {
    const query = users.find({
      select: {
        id: true,
        name: true,
        age: false,
      },
    });

    assert.strictEqual(query, `SELECT "id", "name" FROM "users";`);
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
      `SELECT * FROM "users" WHERE "id" = '1' AND "name" = 'john';`
    );
  });

  test("generates correct query with SELECT and WHERE", () => {
    const query = users.find({
      select: { name: true, age: true, id: false },
      where: { id: "1", name: "john" },
    });

    assert.strictEqual(
      query,
      `SELECT "name", "age" FROM "users" WHERE "id" = '1' AND "name" = 'john';`
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
      `SELECT "name", "age" FROM "users" WHERE "id" = '1' AND "name" = 'john' ORDER BY "name" ASC;`
    );
  });

  test("generates correct query with LIMIT and OFFSET", () => {
    const query = users.find({
      limit: 10,
      offset: 2,
    });

    assert(query, `SELECT * FROM "users" LIMIT 10 OFFSET 2;`);
  });

  test("generates correct query with INSERT", () => {
    const query = users.create({
      data: {
        name: "john",
        age: 20,
      },
    });

    assert.strictEqual(
      query,
      `INSERT INTO "users"("name", "age") VALUES ('john', '20');`
    );
  });

  test("generates correct query with UPDATE", () => {
    const query = users.update({
      data: {
        name: "john",
        age: 24,
      },
      where: {
        id: 10,
      },
    });

    assert.strictEqual(
      query,
      `UPDATE "users" SET "name" = 'john', "age" = '24' WHERE "id" = '10';`
    );
  });

  test("generates correct query with DELETE", () => {
    const query = users.delete({
      where: {
        name: "john",
        age: 24,
      },
    });

    assert.strictEqual(
      query,
      `DELETE FROM "users" WHERE "name" = 'john' AND "age" = '24';`
    );
  });
});

describe("migrations", () => {
  const raw = new Raw();

  test("cannot migrate without schema", () => {
    assert.throws(() => {
      raw.migrate();
    });
  });

  test("create tables correctly", () => {
    const schema = new Schema();

    schema.define({
      User: {
        id: {
          type: "VARCHAR",
          primaryKey: true,
        },
        name: "VARCHAR",
        age: "INT",
      },
      Post: {
        title: {
          type: "VARCHAR",
          unique: true,
        },
        created_at: "TIMESTAMP",
      },
    });

    schema.define({
      Test: {
        hello: "FLOAT",
      },
    });

    const expectedResult = `CREATE TABLE "User"("id" VARCHAR NOT NULL, "name" VARCHAR NOT NULL, "age" INT NOT NULL, CONSTRAINT "User_PK" PRIMARY KEY ("id"));CREATE TABLE "Post"("title" VARCHAR NOT NULL, "created_at" TIMESTAMP NOT NULL);CREATE TABLE "Test"("hello" FLOAT NOT NULL);CREATE UNIQUE INDEX "Post_title_key" ON "Post"("title");`;

    assert.strictEqual(
      SQLMigrationWriter.generateCreateTableClause(schema.get()).trim(),
      expectedResult
    );
  });

  test("create tables with relations correctly", () => {
    const schema = new Schema();

    schema.define({
      User: {
        id: {
          type: "VARCHAR",
          primaryKey: true,
        },
        name: "VARCHAR",
        age: "INT",
      },
      Post: {
        title: "VARCHAR",
        created_at: {
          type: "TIMESTAMP",
          nullable: true,
        },
        authorId: {
          type: "VARCHAR",
          foreignKeyOptions: {
            fieldReference: "id",
            tableReference: "User",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
        },
      },
    });

    const expectedResult = `CREATE TABLE "User"("id" VARCHAR NOT NULL, "name" VARCHAR NOT NULL, "age" INT NOT NULL, CONSTRAINT "User_PK" PRIMARY KEY ("id"));CREATE TABLE "Post"("title" VARCHAR NOT NULL, "created_at" TIMESTAMP, "authorId" VARCHAR NOT NULL);ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_FK" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`;

    assert.strictEqual(
      SQLMigrationWriter.generateCreateTableClause(schema.get()).trim(),
      expectedResult
    );
  });
});
