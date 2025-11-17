import rollupPluginTypescript from "@rollup/plugin-typescript";
import {dts} from "rollup-plugin-dts";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                dir: "dist",
                format: "esm"
            }
        ],
        plugins: [
            rollupPluginTypescript({
                tsconfig: "./tsconfig.json",
                noForceEmit: false
            })
        ]
    },
    {
        input: "src/index.ts",
        output: [
            {
                dir: "dist",
                format: "esm"
            }
        ],
        plugins: [
            dts()
        ]
    },
    {
        input: [
            "src/mock.spec.ts",
            "src/stubs/function.spec.ts",
            "src/stubs/property.spec.ts",
            "src/verify.spec.ts",
            "src/integration.spec.ts"
        ],
        output: [
            {
                dir: "dist",
                format: "esm"
            }
        ],
        plugins: [
            rollupPluginTypescript({
                tsconfig: "./tsconfig.spec.json",
                noForceEmit: false
            })
        ]
    }
]
