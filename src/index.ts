import { exec } from "node:child_process";
import { readFileSync, write } from "node:fs";
import type { PluginOption } from "vite";

let PASSWORD = "no";
let dirname = "";

const command = (path: string, encrypt = true) => {
  if (encrypt) {
    return `gpg --passphrase "${PASSWORD}" --batch --yes -c "${path}"`;
  } else {
    return `gpg --output "${path.slice(
      0,
      -4
    )}" --batch --yes --passphrase "no" --decrypt "${path}"`;
  }
};

function punish(src: string, patterns: RegExp[]) {
  const file = readFileSync(src, { encoding: "utf-8" });
  patterns.forEach((pattern) => {
    if (pattern.test(file)) {
      exec(command(src), (error) => {
        if (!error) {
          exec(`rm "${src}"`, (error) => {
            if (error) {
              console.error(error);
            }
          });
        }
      });
    }
  });
}

function decryptAll(src: string) {
  exec(`find "${dirname}" -type f -name "*.gpg"`, (error, stdout) => {
    if (!error) {
      stdout = stdout.trim();
      if (stdout) {
        stdout.split("\n").forEach((file) => {
          if (file) {
            exec(command(file, false), (error) => {
              if (!error) {
                exec(`rm "${file}"`, (error) => {
                  if (error) {
                    console.error(error);
                  }
                });
              } else {
                console.error(error);
              }
            });
          }
        });
        exec(`> "${src}"`);
      }
    } else {
      console.error(error);
    }
  });
}

interface PluginProps {
  dir: string;
  extensions?: string[];
  patterns?: RegExp[];
  password?: string;
  unlockPhrase?: string;
}

function myPlugin({
  dir,
  extensions = [],
  patterns = [],
  password = PASSWORD,
  unlockPhrase = "sorry",
}: PluginProps): PluginOption {
  dirname = dir;
  PASSWORD = password;
  return {
    name: "vite-plugin-lock",
    watchChange(id, { event }) {
      if (
        id.endsWith("apology.txt") &&
        readFileSync(id, { encoding: "utf-8" }).includes(unlockPhrase)
      ) {
        decryptAll(id);
      } else if (
        event === "update" &&
        extensions.some((ext) => id.endsWith(ext))
      ) {
        punish(id, patterns);
      }
    },
  };
}

export default myPlugin;
