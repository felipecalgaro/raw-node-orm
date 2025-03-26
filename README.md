# ⚡ Raw ORM

[![npm version](https://img.shields.io/npm/v/raw-node-orm)](https://www.npmjs.com/package/raw-node-orm)

**Raw ORM** is a modern, flexible, type-safe ORM for Node.js, inspired by Prisma architecture. Types for database models are automatically generated after every migration and are supported in any query to the database. Currently, only PostgreSQL is implemented as option for database management system.

## 📖 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- ⚡ **Queries** - Intuitive API for database queries.
- 🔄 **Migrations** - Simple CLI-based schema migration management.
- 🌱 **Type-Safe Queries** - Auto-generated types for your database models.
- 🔭 **Flexibility** - Designed to support any future SQL-based database.

## 📦 Installation

Install **Raw ORM** via npm or yarn:

```sh
npm install raw-node-orm
# or
yarn add raw-node-orm
```

## 🚀 Usage

### 1. Intialize Raw ORM

Type this command to generate the initialization file:

```sh
npx raw init
```

Provide configuration for database connection inside the generated file:

```js
// src/lib/raw.ts

const raw = new Raw({
  DBMS: "PostgreSQL",
  connectionString: "postgresql://user:password@localhost:5432/database",
});
```

### 2. Define the database schema

Type this command to generate the schema definition file:

```sh
npx raw migrate start
# or
npx raw migrate start -f path/to/raw.ts
```

Alter the schema to a desired one:

```js
// raw/generated/schema-definition.ts

migrator.defineSchema({
  User: {
    id: {
      type: "INT",
      primaryKey: true,
    },
    name: "VARCHAR",
    email: {
      type: "VARCHAR",
      unique: true,
    },
  },
  Post: {
    id: "INT",
    title: "VARCHAR",
    authorId: {
      type: "INT",
      foreignKeyOptions: {
        fieldReference: "id",
        tableReference: "User",
      },
    },
  },
});
```

### 3. Apply the migration

Type this command:

```sh
npx raw migrate up
```

This will update the database schema and generate the following files:

- SQL file

  ```sql
  DROP TABLE IF EXISTS "User", "Post" CASCADE;

  CREATE TABLE "User"("id" INT NOT NULL, "name" VARCHAR NOT NULL, "email" VARCHAR NOT NULL, CONSTRAINT "User_PK" PRIMARY KEY ("id"));

  CREATE TABLE "Post"("id" INT NOT NULL, "title" VARCHAR NOT NULL, "authorId" INT NOT NULL);

  ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_FK" FOREIGN KEY ("authorId") REFERENCES "User"("id");

  CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
  ```

- Types file

  ```ts
  export type UserData = {
    id: number;
    name: string;
    email: string;
  };

  export type PostData = {
    id: number;
    title: string;
    authorId: number;
  };

  export type PostRelations = {
    User?: UserData;
  };
  ```

- Mappers file
  ```ts
  export const RELATIONS_MAPPER = [
    {
      tableName: "Post",
      fieldName: "authorId",
      fieldReference: "id",
      tableReference: "User",
    },
  ];
  ```

### 4. Write queries to the database

You can use the generated types to help you while writing queries:

```ts
await client.table<UserData>("User").create({
  data: {
    id: 1,
    name: "example",
    email: "example1@gmail.com",
  },
});

const users = await client.table<UserData>("User").find();

await client.table<PostData>("Post").create({
  data: {
    id: 2,
    title: "Example title",
    authorId: 1,
  },
});

const posts = await client.table<PostData, PostRelations>("Post").find({
  select: {
    title: true,
    id: true,
  },
  include: {
    User: {
      id: true,
      email: true,
    },
  },
});

console.log("Posts: ", posts, "\n\nUsers: ", users);

await client.disconnect();
```

Output:

```ts
Posts: [
  {
    title: "Example title",
    id: 2,
    User: {
      id: 1,
      email: "example1@gmail.com",
    },
  },
];

Users: [
  {
    id: 1,
    name: "example",
    email: "example1@gmail.com",
  },
];
```

## 📚 API Reference

### Client

- `Client.table<TableType, RelationsType>(tableName)` returns a _Table_.

  - `Table.find(findConfig?)` returns rows from the database.
  - `Table.create(createConfig)` creates rows in the database.
  - `Table.update(updateConfig)` updates rows in the database.
  - `Table.delete(deleteConfig?)` deletes rows in the database.
  - `Table.count(countConfig?)` returns amount of rows in the database.

- `Client.disconnect()` ends pool connection.

### Migrator

- `Migrator.defineSchema(schema)` defines schema to be migrated to the database.

- `Migrator.migrate()` applies migration to the database.

## ⚙️ Architecture

<img width="3020" alt="ORM (1)" src="https://github.com/user-attachments/assets/ed5c1436-ffbe-4a69-88e0-c9a113b3d447" />

## 🛠️ Roadmap

- Add support for MySQL and SQLite
- Implement transactions
- Implement method for selecting only unique fields

## 🎯 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo.
2. Create a new branch `(git checkout -b feature-name)`.
3. Commit your changes `(git commit -m "feat: add new feature")`.
4. Push and submit a PR.

## 📃 License

This project is licensed under the MIT License.
