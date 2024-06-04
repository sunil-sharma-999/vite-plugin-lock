import { build } from "esbuild";
import { context } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";

/** @type {import('esbuild').BuildOptions} */
const config = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    packages: "external",
    outdir: "dist",
    tsconfig: "tsconfig.json",
    plugins: [dtsPlugin()],
    format: "esm",
    logLevel: "info",
    minify: true,
}

console.log()
if (process.argv[process.argv.length - 1] === "--watch") {
    context({ ...config, logLevel: "debug" }).then(ctx => {
        ctx.watch()
    })
} else {
    await build(config)
}

