const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(__dirname, "..", "src");
const outDir = path.resolve(__dirname, "..", "dist");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyHtmlFiles(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip work-item-picker.html
    if (entry.name === "work-item-picker.html") {
      continue;
    }

    if (entry.isDirectory()) {
      copyHtmlFiles(srcPath, destPath);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
      console.log(
        `copied: ${path.relative(process.cwd(), srcPath)} -> ${path.relative(
          process.cwd(),
          destPath
        )}`
      );
    }
  }
}

ensureDir(outDir);
copyHtmlFiles(srcDir, outDir);
console.log("HTML asset copy complete");
