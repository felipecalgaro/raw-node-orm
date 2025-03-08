#!/usr/bin/env tsx

import { existsSync, mkdirSync, writeFile } from "node:fs";
import { spawn } from "child_process";

const args = process.argv.slice(2);
const command = args[0];

let subcommand: string | null;
let optionsStartingIndex: number;
if (!args[1]?.startsWith("-")) {
  subcommand = args[1];
  optionsStartingIndex = 2;
} else {
  subcommand = null;
  optionsStartingIndex = 1;
}

const options = args
  .slice(optionsStartingIndex)
  .reduce((prev, curr, index, array) => {
    if (
      index % 2 === 0 &&
      typeof array[index + 1] === "string" &&
      curr.startsWith("-")
    ) {
      prev[curr] = array[index + 1];
    }

    return prev;
  }, {} as Record<string, string>);

const scripts = {
  migrate: {
    start: (options: Record<string, string>) => {
      const rawInstanceFilePath = options["-f"];

      const filePath = "raw/generated/schema-definition.ts";
      const fileContent = `import { migrator } from "${
        rawInstanceFilePath
          ? `../../${rawInstanceFilePath.replace(".ts", "")}`
          : "../../src/lib/raw"
      }";\n\n// Define your schema here\nmigrator.defineSchema({\n  User: {\n    name: {\n      type: "VARCHAR",\n      nullable: true\n    }\n  },\n  Post: {\n    title: "VARCHAR"\n  }\n});\n\nmigrator.migrate();`;

      if (!existsSync("raw")) {
        mkdirSync("raw");
      }

      if (!existsSync("raw/generated")) {
        mkdirSync("raw/generated");
      }

      writeFile(filePath, fileContent, (err) => {
        if (err) throw err;
        console.log(`🎉 Database schema is ready to be defined at ${filePath}`);
      });
    },
    up: () => {
      const child = spawn(
        "npx",
        ["tsx", "./raw/generated/schema-definition.ts"],
        {
          stdio: "inherit",
          shell: true,
        }
      );

      child.on("error", (err) => {
        console.log("Error running file: ", err.message);
      });
    },
  },
  init: () => {
    const filePath = "src/lib/raw.ts";
    const fileContent = `import { Raw } from "raw-node-orm";\n\n// Define the configuration for database connection here\nconst raw = new Raw({\n\n});\n\nconst client = raw.Client;\nconst migrator = raw.Migrator;\n\nexport { client, migrator };`;

    if (!existsSync("src")) {
      mkdirSync("src");
    }

    if (!existsSync("src/lib")) {
      mkdirSync("src/lib");
    }

    writeFile(filePath, fileContent, (err) => {
      if (err) throw err;
      console.log(`🎉 Raw instance is ready to be used at ${filePath}`);
    });
  },
  help: () => {
    console.log(`Usage:
      raw init                                       # Generate lib file
      raw migrate start [-f] [path to Raw instance]  # Generate migration file 
      raw migrate up                                 # Apply migrations
      raw help                                       # Show all commands`);
  },
};

if (command && command in scripts) {
  const scriptCommand = scripts[command as keyof typeof scripts];

  if (
    subcommand &&
    typeof scriptCommand !== "function" &&
    subcommand in scriptCommand
  ) {
    scriptCommand[subcommand as keyof typeof scriptCommand](options);
  } else if (typeof scriptCommand === "function") {
    scriptCommand();
  } else {
    scripts.help();
  }
} else {
  scripts.help();
}
