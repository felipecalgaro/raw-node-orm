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

function generateSchemaDefinitionFile(path?: string) {
  const fileContent = `import { raw } from "${
    path ? `../../${path}` : "../../src/lib/raw"
  }";\n\nraw.Migrator().then((migrator) => {\n  // Define your schema here\n  migrator.defineSchema({\n    User: {\n      name: {\n        type: "VARCHAR",\n        nullable: true\n      }\n    },\n    Post: {\n      title: "VARCHAR"\n    }\n  });\n\n  migrator.migrate();\n});`;

  if (!fs.existsSync("raw")) {
    fs.mkdirSync("raw");
  }

  if (!fs.existsSync("raw/generated")) {
    fs.mkdirSync("raw/generated");
  }

  fs.writeFile("raw/generated/schema-definition.ts", fileContent, (err) => {
    if (err) throw err;
    console.log(
      "🎉 Database schema is ready to be defined at ./schema-definition.ts."
    );
  });
}

const scripts = {
  migrate: {
    start: (options: Record<string, string>) => {
      const filePath = options["-f"];

      generateSchemaDefinitionFile(filePath?.replace(".ts", ""));
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
      raw migrate start [-f] [path to Raw instance]  # Generate migration file 
      raw migrate up                                 # Apply migrations`);
  },
};

if (command && command in scripts) {
  const scriptCommand = scripts[command as keyof typeof scripts];

  if (
    subcommand &&
    subcommand in scriptCommand &&
    typeof scriptCommand !== "function"
  ) {
    scriptCommand[subcommand as keyof typeof scriptCommand](options);
  } else {
    scripts.help();
  }
} else {
  scripts.help();
}
