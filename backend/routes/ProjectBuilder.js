/**
 * routes/projectBuilder.js
 * REST + SSE endpoints for the AI Project Builder
 */

const express = require("express");
const router = express.Router();
const { runProjectBuilderAgentStream } = require("../agents/ProjectBuilderAgent");

// ─── In-memory conversation store (replace with DB/Redis in production) ───────
const conversations = new Map();

function getConversation(sessionId) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  return conversations.get(sessionId);
}

function addToConversation(sessionId, role, content) {
  const history = getConversation(sessionId);
  history.push({ role, content, timestamp: new Date().toISOString() });
  // Keep last 20 messages to avoid token overflow
  if (history.length > 20) history.splice(0, history.length - 20);
}

// ─── POST /api/project-builder/chat (SSE streaming) ──────────────────────────

router.post("/chat", async (req, res) => {
  const { message, sessionId = "default", projectRoot = process.cwd() } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const sendEvent = (eventType, data) => {
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const history = getConversation(sessionId);

    // Add user message to history
    addToConversation(sessionId, "user", message);

    sendEvent("start", { message: "Agent started", sessionId });

    const gen = runProjectBuilderAgentStream({
      userMessage: message,
      conversationHistory: history.slice(0, -1), // exclude current message
      projectRoot,
    });

    let fullResponse = "";

    for await (const chunk of gen) {
      switch (chunk.type) {
        case "text":
          fullResponse += chunk.content;
          sendEvent("text", { content: chunk.content });
          break;

        case "tool_start":
          sendEvent("tool_start", {
            tool: chunk.tool,
            input: sanitizeToolInput(chunk.input),
            label: getToolLabel(chunk.tool, chunk.input),
          });
          break;

        case "tool_end":
          sendEvent("tool_end", {
            tool: chunk.tool,
            summary: summarizeToolResult(chunk.tool, chunk.result),
          });
          break;

        case "file_change":
          sendEvent("file_change", {
            filePath: chunk.change.filePath,
            operation: chunk.change.operation,
            description: chunk.change.description,
          });
          break;

        case "done":
          // Save assistant response to history
          if (fullResponse.trim()) {
            addToConversation(sessionId, "assistant", fullResponse);
          }
          sendEvent("done", {
            fileChanges: chunk.fileChanges,
            totalChanges: chunk.fileChanges.length,
          });
          break;
      }
    }
  } catch (err) {
    console.error("Agent error:", err);
    sendEvent("error", {
      message: err.message || "Agent encountered an error",
      code: err.code || "AGENT_ERROR",
    });
  } finally {
    res.end();
  }
});

// ─── GET /api/project-builder/history/:sessionId ──────────────────────────────

router.get("/history/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const history = getConversation(sessionId);
  res.json({ sessionId, messages: history, count: history.length });
});

// ─── DELETE /api/project-builder/history/:sessionId ──────────────────────────

router.delete("/history/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  conversations.delete(sessionId);
  res.json({ success: true, message: "Conversation cleared" });
});

// ─── GET /api/project-builder/scan ────────────────────────────────────────────

router.get("/scan", async (req, res) => {
  const { projectRoot = process.cwd(), path: scanPath = "src" } = req.query;
  const { ProjectScannerTool } = require("../tools");

  try {
    const result = await ProjectScannerTool.execute({
      rootPath: scanPath,
      depth: 3,
      includeContent: false,
      projectRoot,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeToolInput(input) {
  // Remove large content fields from UI display
  const sanitized = { ...input };
  if (sanitized.content && sanitized.content.length > 100) {
    sanitized.content = sanitized.content.slice(0, 100) + "...";
  }
  return sanitized;
}

function getToolLabel(tool, input) {
  const labels = {
    project_scanner: `Scanning project structure...`,
    file_reader: `Reading ${input.filePath}`,
    code_search: `Searching for "${input.query}"`,
    code_generator: `Planning ${input.task}`,
    file_modifier: `${capitalize(input.operation || "modifying")} ${input.filePath}`,
    dependency_manager: `Checking dependencies for ${input.feature}`,
  };
  return labels[tool] || `Running ${tool}`;
}

function summarizeToolResult(tool, result) {
  if (!result.success) return `Failed: ${result.error}`;
  const summaries = {
    project_scanner: `Found ${result.totalFiles} files in ${result.foundDirs?.join(", ") || "project"}`,
    file_reader: `Read ${result.lines} lines from ${result.filePath}`,
    code_search: result.summary || "Search complete",
    code_generator: `Generated plan for ${result.task}`,
    file_modifier: result.description || `${result.operation} complete`,
    dependency_manager: result.message || "Dependency check complete",
  };
  return summaries[tool] || "Done";
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

module.exports = router;
