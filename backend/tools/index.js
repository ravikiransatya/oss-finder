/**
 * Agent Tools
 * Six tools the AI agent uses to inspect and modify the project
 */

const fs = require("fs").promises;
const path = require("path");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  ".cache",
]);

const CODE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".json",
  ".env",
  ".md",
  ".sql",
  ".graphql",
  ".prisma",
]);

async function safeReadFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ─── 1. ProjectScannerTool ────────────────────────────────────────────────────

const ProjectScannerTool = {
  name: "project_scanner",

  async execute({ rootPath = "src", depth = 4, includeContent = false, projectRoot = process.cwd() }) {
    const scanRoot = path.resolve(projectRoot, rootPath);
    const tree = { path: rootPath, type: "directory", children: [] };
    const allFiles = [];

    async function scanDir(dirPath, node, currentDepth) {
      if (currentDepth > depth) return;

      let entries;
      try {
        entries = await fs.readdir(dirPath, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;

        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.relative(projectRoot, fullPath);

        if (entry.isDirectory()) {
          const childNode = { path: relPath, name: entry.name, type: "directory", children: [] };
          node.children.push(childNode);
          await scanDir(fullPath, childNode, currentDepth + 1);
        } else {
          const ext = path.extname(entry.name);
          const fileNode = {
            path: relPath,
            name: entry.name,
            type: "file",
            extension: ext,
            isCode: CODE_EXTENSIONS.has(ext),
          };

          if (includeContent && CODE_EXTENSIONS.has(ext)) {
            const content = await safeReadFile(fullPath);
            if (content) {
              fileNode.preview = content.slice(0, 300) + (content.length > 300 ? "..." : "");
              fileNode.lines = content.split("\n").length;
            }
          }

          node.children.push(fileNode);
          allFiles.push(relPath);
        }
      }
    }

    await scanDir(scanRoot, tree, 1);

    // Also scan common project dirs from root
    const projectDirs = ["src", "backend", "server", "api", "components", "pages", "hooks", "services", "routes"];
    const foundDirs = [];
    for (const dir of projectDirs) {
      const dirPath = path.join(projectRoot, dir);
      if (await fileExists(dirPath)) foundDirs.push(dir);
    }

    // Check package.json for framework info
    const pkgJson = await safeReadFile(path.join(projectRoot, "package.json"));
    let frameworks = {};
    if (pkgJson) {
      try {
        const pkg = JSON.parse(pkgJson);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        frameworks = {
          react: !!allDeps.react,
          nextjs: !!allDeps.next,
          express: !!allDeps.express,
          typescript: !!allDeps.typescript,
          prisma: !!allDeps["@prisma/client"],
          mongoose: !!allDeps.mongoose,
          postgres: !!(allDeps.pg || allDeps.postgres),
          tailwind: !!allDeps.tailwindcss,
          router: !!(allDeps["react-router-dom"] || allDeps["react-router"]),
          redux: !!(allDeps.redux || allDeps["@reduxjs/toolkit"]),
          zustand: !!allDeps.zustand,
          jwt: !!(allDeps.jsonwebtoken || allDeps["@auth/core"]),
        };
      } catch {}
    }

    return {
      success: true,
      tree,
      allFiles,
      foundDirs,
      frameworks,
      totalFiles: allFiles.length,
      summary: `Scanned ${allFiles.length} files in ${foundDirs.join(", ") || rootPath}`,
    };
  },
};

// ─── 2. FileReaderTool ────────────────────────────────────────────────────────

const FileReaderTool = {
  name: "file_reader",

  async execute({ filePath, projectRoot = process.cwd() }) {
    const fullPath = path.resolve(projectRoot, filePath);

    const content = await safeReadFile(fullPath);
    if (content === null) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const ext = path.extname(filePath);
    const lines = content.split("\n");

    return {
      success: true,
      filePath,
      content,
      lines: lines.length,
      extension: ext,
      size: content.length,
      // Extract imports for context
      imports: lines
        .filter((l) => l.trim().startsWith("import ") || l.trim().startsWith("require("))
        .slice(0, 20),
      // Extract exports
      exports: lines
        .filter((l) => l.includes("export ") || l.includes("module.exports"))
        .slice(0, 10),
    };
  },
};

// ─── 3. CodeSearchTool ───────────────────────────────────────────────────────

const CodeSearchTool = {
  name: "code_search",

  async execute({ query, searchType = "any", projectRoot = process.cwd() }) {
    const results = [];

    async function searchDir(dirPath) {
      let entries;
      try {
        entries = await fs.readdir(dirPath, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await searchDir(fullPath);
        } else {
          const ext = path.extname(entry.name);
          if (!CODE_EXTENSIONS.has(ext)) continue;

          const content = await safeReadFile(fullPath);
          if (!content) continue;

          const lines = content.split("\n");
          const matches = [];

          lines.forEach((line, idx) => {
            const lower = line.toLowerCase();
            const queryLower = query.toLowerCase();

            let isMatch = false;
            if (searchType === "component") {
              isMatch =
                lower.includes(`function ${queryLower}`) ||
                lower.includes(`const ${queryLower}`) ||
                lower.includes(`class ${queryLower}`);
            } else if (searchType === "hook") {
              isMatch = lower.includes(`use${queryLower.replace(/^use/i, "")}`);
            } else if (searchType === "route") {
              isMatch =
                lower.includes(`path="${queryLower}"`) ||
                lower.includes(`path='${queryLower}'`) ||
                lower.includes(`"/${queryLower}"`);
            } else {
              isMatch = lower.includes(queryLower);
            }

            if (isMatch) {
              matches.push({
                line: idx + 1,
                content: line.trim(),
                context: lines.slice(Math.max(0, idx - 1), idx + 3).join("\n"),
              });
            }
          });

          if (matches.length > 0) {
            results.push({
              filePath: path.relative(projectRoot, fullPath),
              matches: matches.slice(0, 5),
            });
          }
        }
      }
    }

    await searchDir(projectRoot);

    return {
      success: true,
      query,
      searchType,
      results: results.slice(0, 20),
      totalMatches: results.reduce((sum, r) => sum + r.matches.length, 0),
      summary: `Found "${query}" in ${results.length} files`,
    };
  },
};

// ─── 4. CodeGeneratorTool ─────────────────────────────────────────────────────

const CodeGeneratorTool = {
  name: "code_generator",

  async execute({ task, framework = "React", context = "", filePath }) {
    // This tool is a planning helper — actual code generation
    // happens in the LLM's response. This returns generation guidance.
    const ext = path.extname(filePath);
    const isTS = ext === ".ts" || ext === ".tsx";
    const isReact = ext === ".jsx" || ext === ".tsx";
    const isBackend = filePath.includes("server") || filePath.includes("backend") || filePath.includes("routes") || filePath.includes("api");

    return {
      success: true,
      task,
      filePath,
      guidance: {
        isTypeScript: isTS,
        isReact,
        isBackend,
        framework,
        conventions: isTS
          ? ["Use TypeScript interfaces", "Export types", "No any types"]
          : ["Use JSDoc comments", "PropTypes or no-prop approach"],
        patterns: isReact
          ? ["Functional components", "Custom hooks for logic", "Named exports"]
          : ["Express route handlers", "async/await", "Error middleware"],
        shouldInclude: [
          "Full file content",
          "All imports",
          "Error handling",
          "Loading states (if React)",
        ],
      },
      context: context.slice(0, 500),
    };
  },
};

// ─── 5. FileModifierTool ──────────────────────────────────────────────────────

const FileModifierTool = {
  name: "file_modifier",

  async execute({ filePath, operation, content, description, projectRoot = process.cwd() }) {
    const fullPath = path.resolve(projectRoot, filePath);
    const dir = path.dirname(fullPath);

    try {
      switch (operation) {
        case "create": {
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(fullPath, content || "", "utf-8");
          return {
            success: true,
            operation,
            filePath,
            description: description || `Created ${filePath}`,
            bytesWritten: (content || "").length,
          };
        }

        case "update": {
          await fs.mkdir(dir, { recursive: true });
          const previousContent = await safeReadFile(fullPath);
          await fs.writeFile(fullPath, content || "", "utf-8");
          return {
            success: true,
            operation,
            filePath,
            description: description || `Updated ${filePath}`,
            previousLines: previousContent ? previousContent.split("\n").length : 0,
            newLines: (content || "").split("\n").length,
          };
        }

        case "append": {
          await fs.appendFile(fullPath, "\n" + (content || ""), "utf-8");
          return {
            success: true,
            operation,
            filePath,
            description: description || `Appended to ${filePath}`,
          };
        }

        case "delete": {
          const exists = await fileExists(fullPath);
          if (exists) await fs.unlink(fullPath);
          return {
            success: true,
            operation,
            filePath,
            description: description || `Deleted ${filePath}`,
            existed: exists,
          };
        }

        default:
          return { success: false, error: `Unknown operation: ${operation}` };
      }
    } catch (err) {
      return {
        success: false,
        operation,
        filePath,
        error: err.message,
      };
    }
  },
};

// ─── 6. DependencyManagerTool ─────────────────────────────────────────────────

const DependencyManagerTool = {
  name: "dependency_manager",

  async execute({ feature, packages = [], checkOnly = false, projectRoot = process.cwd() }) {
    const pkgPath = path.join(projectRoot, "package.json");
    const pkgContent = await safeReadFile(pkgPath);
    let existingDeps = {};
    let existingDevDeps = {};

    if (pkgContent) {
      try {
        const pkg = JSON.parse(pkgContent);
        existingDeps = pkg.dependencies || {};
        existingDevDeps = pkg.devDependencies || {};
      } catch {}
    }

    const allExisting = { ...existingDeps, ...existingDevDeps };

    // Feature → suggested packages map
    const FEATURE_PACKAGES = {
      auth: ["jsonwebtoken", "bcryptjs", "passport"],
      jwt: ["jsonwebtoken", "jose"],
      redis: ["redis", "ioredis"],
      "dark mode": ["@mui/material", "styled-components"],
      pagination: ["react-paginate"],
      forms: ["react-hook-form", "zod", "yup"],
      typescript: ["typescript", "@types/react", "@types/node"],
      testing: ["jest", "@testing-library/react", "vitest"],
      upload: ["multer", "formidable"],
      email: ["nodemailer", "resend"],
      "state management": ["zustand", "@reduxjs/toolkit"],
      animation: ["framer-motion", "react-spring"],
      charts: ["recharts", "chart.js"],
      date: ["date-fns", "dayjs"],
      i18n: ["i18next", "react-i18next"],
    };

    const featureLower = feature.toLowerCase();
    const suggested = [];
    for (const [key, pkgs] of Object.entries(FEATURE_PACKAGES)) {
      if (featureLower.includes(key)) {
        suggested.push(...pkgs);
      }
    }

    const toCheck = packages.length > 0 ? packages : suggested;
    const installed = [];
    const notInstalled = [];

    for (const pkg of toCheck) {
      if (allExisting[pkg]) {
        installed.push({ name: pkg, version: allExisting[pkg] });
      } else {
        notInstalled.push(pkg);
      }
    }

    return {
      success: true,
      feature,
      installed,
      notInstalled,
      installCommand: notInstalled.length > 0 ? `npm install ${notInstalled.join(" ")}` : null,
      devInstallCommand: null,
      message:
        notInstalled.length > 0
          ? `Install required: ${notInstalled.join(", ")}`
          : "All dependencies already installed",
    };
  },
};

module.exports = {
  ProjectScannerTool,
  FileReaderTool,
  CodeSearchTool,
  CodeGeneratorTool,
  FileModifierTool,
  DependencyManagerTool,
};
