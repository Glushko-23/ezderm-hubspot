const sass = require("sass");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const postcss = require("postcss");
const discardComments = require("postcss-discard-comments");

const srcFolder = "./scss";
const outFolder = "./css";

// === Flag: --once ===
const runOnce = process.argv.includes("--once");

async function compileFile(filePath) {
    const relativePath = path.relative(srcFolder, filePath);
    const outPath = path.join(outFolder, relativePath.replace(/\.scss$/, ".css"));
    const outDir = path.dirname(outPath);

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    try {
        const result = await sass.compileAsync(filePath, {
            style: "expanded",
            loadPaths: [srcFolder],
            sourceComments: false
        });

        const postcssResult = await postcss([
            discardComments({ removeAll: true })
        ]).process(result.css, { from: undefined });

        fs.writeFileSync(outPath, postcssResult.css + '\n');
        console.log(`✅ Compiled: ${filePath} → ${outPath}`);
    } catch (err) {
        console.error(`❌ Error compiling ${filePath}:`, err.message);
    }
}

async function compileAll(folder) {
    const files = fs.readdirSync(folder);
    for (const file of files) {
        const fullPath = path.join(folder, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await compileAll(fullPath);
        } else if (file.endsWith(".scss")) {
            await compileFile(fullPath);
        }
    }
}

// === Mode: compile once ===
if (runOnce) {
    console.log("Compiling all SCSS files once...");
    compileAll(srcFolder).then(() => {
        console.log("✅ Done! All files compiled.");
        process.exit(0);
    });
    return;
}

// === Mode: watch (default) ===
console.log("Watching SCSS files for changes...");

const watcher = chokidar.watch(srcFolder, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: true,
});

watcher.on("all", async (event, filePath) => {
    if (filePath.endsWith(".scss")) {
        console.log(`🌀 Change detected: ${filePath}`);
        await compileFile(filePath);
    }
});