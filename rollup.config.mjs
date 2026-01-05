import rollupPluginTypescript from "@rollup/plugin-typescript";
import rollupPluginTerser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

export default [{
    input: "src/index.ts",
    output: [{ dir: "dist", format: "esm" }],
    plugins: [rollupPluginTypescript({ tsconfig: "./tsconfig.json", noForceEmit: false }), rollupPluginTerser()]
}, { input: "src/index.ts", output: [{ dir: "dist", format: "esm" }], plugins: [dts()] }];
