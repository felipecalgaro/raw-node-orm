#!/usr/bin/env tsx

import fs from "node:fs";
import { spawn } from "child_process";

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];
const options = args.slice(2).reduce((prev, curr, index, array) => {
  if (
    index % 2 === 0 &&
    typeof array[index + 1] === "string" &&
    curr.startsWith("-")
  ) {
    prev[curr] = array[index + 1] as string;
  }

  return prev;
}, {} as Record<string, string>);

function generateFile({
  content,
  createDirectories,
  successMessage,
}: {
  content: string;
  createDirectories?: () => void;
  successMessage: string;
}) {
  createDirectories?.();

  fs.writeFile("raw/generated/schema-definition.ts", content, (err) => {
    if (err) throw err;
    console.log(successMessage);
  });
}

const scripts = {
  migrate: {
    start: (options: Record<string, string>) => {
      const filePath = options["-f"];

      const fileContent = `import { migrator } from "${
        filePath ? `../../${filePath.replace(".ts", "")}` : "../../src/lib/raw"
      }";\n\n// Define your schema here\nmigrator.defineSchema({\n  User: {\n    name: {\n      type: "VARCHAR",\n      nullable: true\n    }\n  },\n  Post: {\n    title: "VARCHAR"\n  }\n});\n\nmigrator.migrate();`;

      generateFile({
        content: fileContent,
        createDirectories: () => {
          if (!fs.existsSync("raw")) {
            fs.mkdirSync("raw");
          }

          if (!fs.existsSync("raw/generated")) {
            fs.mkdirSync("raw/generated");
          }
        },
        successMessage:
          "🎉 Database schema is ready to be defined at raw/generated/schema-definition.ts.",
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
  help: () => {
    console.log(`Usage:
      raw init                                       # Generate lib file
      raw migrate start [-f] [path to Raw instance]  # Generate migration file 
      raw migrate up                                 # Apply migrations
      raw help                                       # Show all commands`);
  },
  init: () => {
    const fileContent = `import { Raw } from "raw-node-orm";\n\n// Define the configuration for database connection here\nconst raw = new Raw({\n\n});\n\nconst client = raw.Client;\nconst migrator = raw.Migrator;\n\nexport { client, migrator };`;

    generateFile({
      content: fileContent,
      createDirectories: () => {
        if (!fs.existsSync("src")) {
          fs.mkdirSync("src");
        }

        if (!fs.existsSync("src/lib")) {
          fs.mkdirSync("src/lib");
        }
      },
      successMessage: "🎉 Raw instance is ready to be used at src/lib/raw.ts",
    });
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
