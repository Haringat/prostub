#!/usr/bin/env node

import {mkdir, readFile, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {createReadStream, createWriteStream} from "node:fs";
import {finished} from "node:stream/promises";
import {execFile} from "node:child_process";

async function writePackageJson() {
    const packageJson = JSON.parse(await readFile(join(import.meta.dirname, "package.json"), "utf-8"));

    await writeFile(
        join(import.meta.dirname, "dist", "package.json"),
        JSON.stringify(
            {
                ...Object.fromEntries(
                    Object.entries(packageJson).filter(([key]) => ["name", "version", "description", "license", "author", "repository", "type"].includes(key))
                ),
                peerDependencies: {
                    ...(packageJson.dependencies ?? {}),
                    ...(packageJson.peerDependencies ?? {})
                },
                main: "index.js",
                types: "index.d.ts",
                scripts: {
                    test: "echo \"If you read this, all tests succeeded in the pipeline. Refer to the source-code repository to verify.\""
                }
            },
            null,
            4
        )
    );
    console.log("Written package.json");
}

async function writeReadme() {
    const copyStream = createReadStream(join(import.meta.dirname, "README.md"))
        .pipe(createWriteStream(join(import.meta.dirname, "dist", "README.md")));
    await finished(copyStream);
    console.log("Written README.md");
}

async function writeLicense() {
    const copyStream = createReadStream(join(import.meta.dirname, "LICENSE.txt"))
        .pipe(createWriteStream(join(import.meta.dirname, "dist", "LICENSE.txt")));
    await finished(copyStream);
    console.log("Written LICENSE.txt");
}

function build() {
    return new Promise((resolve, reject) => {
        const rollup = execFile("npx", ["rollup", "-c", "rollup.config.mjs"], {cwd: import.meta.dirname})
            .on("exit", (code) => {
                if (code === 0) {
                    console.log("Build completed successfully");
                    resolve();
                } else {
                    reject(new Error(`Rollup process exited with code ${code}`));
                }
            })
            .on("error", (err) => {
                reject(err);
            });
        rollup.stdout.pipe(process.stdout);
        rollup.stderr.pipe(process.stderr);
    });
}

await mkdir(join(import.meta.dirname, "dist"), {recursive: true});

await Promise.all([
    writePackageJson(),
    writeReadme(),
    writeLicense(),
    build()
]);
