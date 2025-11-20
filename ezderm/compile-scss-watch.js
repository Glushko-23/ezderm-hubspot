const sass = require("sass");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

const srcFolder = "./scss";
const outFolder = "./css";

// Compile a single SCSS file using the new JS API
async function compileFile(filePath) {
    const relativePath = path.relative(srcFolder, filePath);
    const outPath = path.join(outFolder, relativePath.replace(/\.scss$/, ".css"));
    const outDir = path.dirname(outPath);

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    try {
        const result = await sass.compileAsync(filePath, {
            style: "expanded",
            loadPaths: [srcFolder],
        });

        fs.writeFileSync(outPath, result.css);
        console.log(`✅ Compiled: ${filePath} → ${outPath}`);
    } catch (err) {
        console.error(`❌ Error compiling ${filePath}:`, err.message);
    }
}

// Recursively compile all SCSS files
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

// Initial compile
compileAll(srcFolder);

// Setup watcher
const watcher = chokidar.watch(srcFolder, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true,
});

watcher.on("change", async (filePath) => {
    if (filePath.endsWith(".scss")) {
        console.log("🌀 Detected change:", filePath);
        await compileFile(filePath);
    }
});

watcher.on("add", async (filePath) => {
    if (filePath.endsWith(".scss")) {
        console.log("➕ New SCSS file:", filePath);
        await compileFile(filePath);
    }
});

console.log("👀 Watching SCSS files for changes...");