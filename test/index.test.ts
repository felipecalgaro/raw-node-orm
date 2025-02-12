import test, { describe } from "node:test";
import assert from "node:assert";
import { RelationsMapper, Table } from "../table";
import { Schema } from "../schema";
import { SQLMigrationWriter } from "../sql-migration-writer";
import { Migrator } from "../migrator";

describe("queries", async () => {
  const userRelations: RelationsMapper = [
    {
      tableName: "users",
      fieldName: "carId",
      tableReference: "cars",
      fieldReference: "id",
    },
    {
      tableName: "users",
      fieldName: "groupId",
      tableReference: "groups",
      fieldReference: "id",
    },
  ];
  const users = new Table("users", userRelations, async (query) => query);

  test("generates correct query without any config", async () => {
    const query = await users.find();

    assert.strictEqual(query, `SELECT * FROM "users";`);
  });

  test("generates correct query with SELECT", async () => {
    const query = await users.find({
      select: {
        id: true,
        name: true,
        age: false,
      },
    });

    assert.strictEqual(query, `SELECT "id", "name" FROM "users";`);
  });

  test("generates correct query with JOIN", async () => {
    const query = await users.find({
      include: {
        cars: {
          color: true,
        },
      },
    });

    assert.strictEqual(
      query,
      `SELECT "users".*, "cars"."color" FROM "users" LEFT JOIN "cars" ON "users"."carId" = "cars"."id";`
    );
  });

  test("generates correct query with multiple JOINS", async () => {
    const query = await users.find({
      include: {
        cars: true,
        groups: true,
      },
    });

    assert.strictEqual(
      query,
      `SELECT "users".*, "cars".*, "groups".* FROM "users" LEFT JOIN "cars" ON "users"."carId" = "cars"."id" LEFT JOIN "groups" ON "users"."groupId" = "groups"."id";`
    );
  });

  test("cannot generate JOIN query with wrong relation data", async () => {
    assert.rejects(async () => await users.find({ include: { bikes: true } }));
  });

  test("cannot generate JOIN query with no relation data", async () => {
    assert.rejects(async () =>
      new Table("posts", undefined, async (query) => query).find({
        include: { likes: true },
      })
    );
  });

  test("generates correct query with WHERE", async () => {
    const query = await users.find({
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

  test("generates correct query with SELECT and WHERE", async () => {
    const query = await users.find({
      select: { name: true, age: true, id: false },
      where: { id: "1", name: "john" },
    });

    assert.strictEqual(
      query,
      `SELECT "name", "age" FROM "users" WHERE "id" = '1' AND "name" = 'john';`
    );
  });

  test("generates correct query with SELECT, WHERE and ORDER BY", async () => {
    const query = await users.find({
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

  test("generates correct query with LIMIT and OFFSET", async () => {
    const query = await users.find({
      limit: 10,
      offset: 2,
    });

    assert(query, `SELECT * FROM "users" LIMIT 10 OFFSET 2;`);
  });

  test("generates correct query with INSERT", async () => {
    const query = await users.create({
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

  test("generates correct query with UPDATE", async () => {
    const query = await users.update({
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

  test("generates correct query with DELETE", async () => {
    const query = await users.delete({
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

  test("generates correct query with COUNT", async () => {
    const query = await users.count({
      by: "name",
    });

    assert.strictEqual(query, `SELECT COUNT("name") FROM "users";`);
  });

  test("generates correct query with COUNT and DISTINCT", async () => {
    const query = await users.count({
      by: {
        field: "name",
        distinct: true,
      },
      where: {
        name: "john",
      },
    });

    assert.strictEqual(
      query,
      `SELECT COUNT(DISTINCT "name") FROM "users" WHERE "name" = 'john';`
    );
  });
});

describe("migrations", async () => {
  test("cannot migrate without schema", async () => {
    assert.rejects(
      new Migrator(async () => {
        return;
      }).migrate()
    );
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

  test("cannot create table with wrong relation data", () => {
    const schema = new Schema();

    assert.throws(() =>
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
              tableReference: "WRONG_TABLE",
              onDelete: "CASCADE",
              onUpdate: "CASCADE",
            },
          },
        },
      })
    );

    assert.throws(() =>
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
              fieldReference: "WRONG_FIELD",
              tableReference: "User",
              onDelete: "CASCADE",
              onUpdate: "CASCADE",
            },
          },
        },
      })
    );
  });
});
