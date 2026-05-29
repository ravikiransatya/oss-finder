/**
 * ProjectBuilderAgent.js
 * Agentic AI Development Assistant
 * Uses Claude Haiku for speed + cost efficiency
 * Implements: Planner → Analyzer → Implementer → Responder pipeline
 */

const Anthropic = require("@anthropic-ai/sdk");

const {
  ProjectScannerTool,
  FileReaderTool,
  CodeSearchTool,
  CodeGeneratorTool,
  FileModifierTool,
  DependencyManagerTool,
} = require("../tools");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Tool Registry ────────────────────────────────────────────────────────────

const TOOL_DEFINITIONS = [
  {
    name: "project_scanner",
    description:
      "Scans the project directory structure and returns a tree of all source files, their types, and relationships. Always call this first to understand the codebase.",
    input_schema: {
      type: "object",
      properties: {
        rootPath: {
          type: "string",
          description:
            "Root path to scan (default: src/). Use '.' for full project.",
        },
        depth: {
          type: "number",
          description: "How many levels deep to scan (default: 4)",
        },
        includeContent: {
          type: "boolean",
          description:
            "Whether to include file content previews (default: false)",
        },
      },
      required: [],
    },
  },
  {
    name: "file_reader",
    description:
      "Reads the full content of a specific file. Use this to inspect existing implementations before modifying them.",
    input_schema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file to read",
        },
      },
      required: ["filePath"],
    },
  },
  {
    name: "code_search",
    description:
      "Searches the codebase for specific symbols, components, functions, hooks, or patterns. Returns locations and context.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search term (component name, function, CSS class, import, etc.)",
        },
        searchType: {
          type: "string",
          enum: [
            "component",
            "function",
            "hook",
            "route",
            "import",
            "pattern",
            "any",
          ],
          description: "Type of symbol to search for",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "code_generator",
    description:
      "Generates complete, production-ready code for new files or modifications. Returns the full code content.",
    input_schema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "What to generate (e.g., 'React login component')",
        },
        framework: {
          type: "string",
          description: "Framework/language (e.g., React, Node.js, TypeScript)",
        },
        context: {
          type: "string",
          description: "Existing code context or dependencies to consider",
        },
        filePath: {
          type: "string",
          description: "Target file path for the generated code",
        },
      },
      required: ["task", "filePath"],
    },
  },
  {
    name: "file_modifier",
    description:
      "Creates or modifies files in the project. Supports create, update, append, and delete operations.",
    input_schema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Path of the file to create or modify",
        },
        operation: {
          type: "string",
          enum: ["create", "update", "append", "delete"],
          description: "Operation to perform",
        },
        content: {
          type: "string",
          description: "New file content (for create/update) or text to append",
        },
        description: {
          type: "string",
          description: "Human-readable description of what this change does",
        },
      },
      required: ["filePath", "operation"],
    },
  },
  {
    name: "dependency_manager",
    description:
      "Suggests npm packages to install and generates the install commands. Also checks if a package is already in package.json.",
    input_schema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          description: "Feature that needs packages (e.g., 'JWT auth')",
        },
        packages: {
          type: "array",
          items: { type: "string" },
          description: "Specific package names to check or add",
        },
        checkOnly: {
          type: "boolean",
          description: "Only check if packages exist, don't suggest new ones",
        },
      },
      required: ["feature"],
    },
  },
];

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert Agentic AI Development Assistant embedded in OSSFinder, a React + Node/Express + PostgreSQL application.

Your job is to understand what the developer wants to build or change, then actively implement it by scanning the project, reading relevant files, generating code, and returning complete implementation plans with actual code changes.

## Your Workflow (always follow this order):
1. Scan the project structure first to understand the codebase
2. Search for and read relevant existing files
3. Identify all files that need to change
4. Generate the implementation plan
5. Generate actual code for each file change
6. Return a clear, structured response

## Response Format:
Always structure your final response as follows:

### 🔍 Understanding
Brief summary of what you're implementing and why.

### 📁 Affected Files
List every file that will be created or modified.

### 📋 Implementation Plan
Numbered steps of what needs to happen.

### 💻 Code Changes

For each file, use this exact format:
---FILE: path/to/file.jsx---
\`\`\`jsx
// full file content here
\`\`\`
---END FILE---

### 📦 Dependencies (if needed)
\`\`\`bash
npm install package-name
\`\`\`

### ✅ Next Steps
What to do after applying these changes.

## Rules:
- ALWAYS call project_scanner before anything else
- Read existing files before modifying them
- Generate complete file contents, not just snippets
- Follow the existing project's code style and patterns
- Use the framework and patterns you find in the codebase
- If you see TypeScript, generate TypeScript. If you see JSX, generate JSX.
- Never leave TODO comments — always implement fully
- Maintain backward compatibility with existing features`;

// ─── Tool Executor ─────────────────────────────────────────────────────────────

async function executeTool(toolName, toolInput, projectRoot) {
  switch (toolName) {
    case "project_scanner":
      return await ProjectScannerTool.execute({
        ...toolInput,
        projectRoot,
      });

    case "file_reader":
      return await FileReaderTool.execute({
        ...toolInput,
        projectRoot,
      });

    case "code_search":
      return await CodeSearchTool.execute({
        ...toolInput,
        projectRoot,
      });

    case "code_generator":
      return await CodeGeneratorTool.execute(toolInput);

    case "file_modifier":
      return await FileModifierTool.execute({
        ...toolInput,
        projectRoot,
      });

    case "dependency_manager":
      return await DependencyManagerTool.execute({
        ...toolInput,
        projectRoot,
      });

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// ─── Main Agent Function (Streaming) ─────────────────────────────────────────

async function runProjectBuilderAgent({
  userMessage,
  conversationHistory,
  projectRoot,
  onChunk,
  onToolUse,
  onFileChange,
}) {
  const messages = [
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const fileChanges = [];
  let iterationCount = 0;
  const MAX_ITERATIONS = 10;

  // ── Agentic Loop ────────────────────────────────────────────────────────────
  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Collect all content blocks
    const textBlocks = [];
    const toolUseBlocks = [];

    for (const block of response.content) {
      if (block.type === "text") {
        textBlocks.push(block.text);
      } else if (block.type === "tool_use") {
        toolUseBlocks.push(block);
      }
    }

    // Stream any text content
    if (textBlocks.length > 0) {
      const combinedText = textBlocks.join("");
      if (onChunk && combinedText.trim()) {
        onChunk(combinedText);
      }
    }

    // If no tool calls, we're done
    if (response.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
      break;
    }

    // Execute tools and collect results
    const toolResults = [];

    for (const toolBlock of toolUseBlocks) {
      // Notify UI of tool usage
      if (onToolUse) {
        onToolUse({
          tool: toolBlock.name,
          input: toolBlock.input,
          id: toolBlock.id,
        });
      }

      const result = await executeTool(
        toolBlock.name,
        toolBlock.input,
        projectRoot
      );

      // Track file changes
      if (toolBlock.name === "file_modifier" && result.success) {
        const change = {
          filePath: toolBlock.input.filePath,
          operation: toolBlock.input.operation,
          description:
            toolBlock.input.description || `${toolBlock.input.operation} file`,
          content: toolBlock.input.content,
        };
        fileChanges.push(change);
        if (onFileChange) onFileChange(change);
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolBlock.id,
        content: JSON.stringify(result),
      });
    }

    // Add assistant message and tool results to history
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  return { fileChanges };
}

// ─── Streaming Version ────────────────────────────────────────────────────────

async function* runProjectBuilderAgentStream({
  userMessage,
  conversationHistory,
  projectRoot,
}) {
  const messages = [
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const fileChanges = [];
  let iterationCount = 0;
  const MAX_ITERATIONS = 10;

  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    // Use streaming for text, but we need tool results too
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages,
      stream: false, // Tools + streaming requires careful handling
    });

    const toolUseBlocks = [];

    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) {
        // Yield text in chunks for streaming effect
        const words = block.text.split(" ");
        let chunk = "";
        for (const word of words) {
          chunk += word + " ";
          if (chunk.length > 50) {
            yield { type: "text", content: chunk };
            chunk = "";
            await new Promise((r) => setTimeout(r, 10)); // simulate stream
          }
        }
        if (chunk.trim()) {
          yield { type: "text", content: chunk };
        }
      } else if (block.type === "tool_use") {
        toolUseBlocks.push(block);
      }
    }

    if (response.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
      break;
    }

    const toolResults = [];

    for (const toolBlock of toolUseBlocks) {
      yield {
        type: "tool_start",
        tool: toolBlock.name,
        input: toolBlock.input,
      };

      const result = await executeTool(
        toolBlock.name,
        toolBlock.input,
        projectRoot
      );

      yield {
        type: "tool_end",
        tool: toolBlock.name,
        result: result,
      };

      if (toolBlock.name === "file_modifier" && result.success) {
        const change = {
          filePath: toolBlock.input.filePath,
          operation: toolBlock.input.operation,
          description:
            toolBlock.input.description || `${toolBlock.input.operation} file`,
          content: toolBlock.input.content,
        };
        fileChanges.push(change);
        yield { type: "file_change", change };
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolBlock.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  yield { type: "done", fileChanges };
}

module.exports = {
  runProjectBuilderAgent,
  runProjectBuilderAgentStream,
};
