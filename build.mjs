#!/usr/bin/env node

import { execFile } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { finished } from "node:stream/promises";

async function writePackageJson() {
    const packageJson = JSON.parse(await readFile(join(import.meta.dirname, "package.json"), "utf-8"));

    await writeFile(
        join(import.meta.dirname, "dist", "package.json"),
        JSON.stringify(
            {
                ...Object.fromEntries(
                    Object
                        .entries(packageJson)
                        .filter(([key]) =>
                            ["name", "version", "description", "license", "author", "repository", "type"].includes(key)
                        )
                ),
                peerDependencies: {
                    ...Object.fromEntries(
                        Object
                            .entries(packageJson.dependencies ?? {})
                            .filter(([name]) => name !== "tslib")
                    ),
                    ...(packageJson.peerDependencies ?? {})
                },
                main: "index.js",
                types: "index.d.ts",
                scripts: {
                    test:
                        "echo \"If you read this, all tests succeeded in the pipeline. Refer to the source-code repository to verify.\""
                }
            },
            null,
            4
        )
    );
    console.log("Written package.json");
}

async function writeReadme() {
    const copyStream = createReadStream(join(import.meta.dirname, "README.md")).pipe(
        createWriteStream(join(import.meta.dirname, "dist", "README.md"))
    );
    await finished(copyStream);
    console.log("Written README.md");
}

async function writeLicense() {
    const copyStream = createReadStream(join(import.meta.dirname, "LICENSE.txt")).pipe(
        createWriteStream(join(import.meta.dirname, "dist", "LICENSE.txt"))
    );
    await finished(copyStream);
    console.log("Written LICENSE.txt");
}

function build() {
    return new Promise((resolve, reject) => {
        const rollup = execFile("npx", ["rollup", "-c", "rollup.config.mjs"], { cwd: import.meta.dirname })
            .on("exit", code => {
                if (code === 0) {
                    console
                        .log("Build completed successfully");
                    resolve();
                } else {
                    reject(new Error(`Rollup process exited with code ${code}`));
                }
            })
            .on("error", err => {
                reject(err);
            });
        rollup.stderr.pipe(process.stderr);
    });
}

function detectVersionType() {
    return new Promise((resolve, reject) => {
        const compareApi = execFile("./node_modules/.bin/change-detector", [
            "./previous-version/index.d.ts",
            "./src/index.ts",
            "--json"
        ], { cwd: import.meta.dirname })
            .on("exit", code => {
                if (code !== 0) {
                    reject(new Error(`compare-api process exited with code ${code}`));
                }
            });
        compareApi.stderr.pipe(process.stderr);
        compareApi.stdout.toArray().then(it => resolve(JSON.parse(it.join("")).releaseType)).catch(reject);
    });
}

async function bundleSize() {
    const terser = execFile("npx", ["terser", "dist/index.js", "--compress", "--mangle"], { cwd: import.meta.dirname, encoding: "buffer" });
    terser.stderr.pipe(process.stderr);
    const gzip = execFile("gzip", ["-9"], { cwd: import.meta.dirname, encoding: "buffer" });
    gzip.stderr.pipe(process.stderr);
    terser.stdout.pipe(gzip.stdin);
    const output = await gzip.stdout.toArray();
    return Buffer.concat(output).length;
}

await mkdir(join(import.meta.dirname, "dist"), { recursive: true });

await Promise.all([writePackageJson(), writeReadme(), writeLicense(), build()]);

console.log(`Bundle size (gzip): ${await bundleSize()} bytes`);

const versionType = await detectVersionType();
console.log(`Recommended Version bump: ${versionType}`);
