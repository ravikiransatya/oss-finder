const express = require('express');
const { runProjectBuilderAgent } = require('../agents/ProjectBuilderAgent');
const path = require('path');

const router = express.Router();

// Store conversation history in memory (in production, use Redis or database)
const conversationStore = new Map();

// ─── Intelligent AI Project Builder Endpoint ─────────────────────────────────

router.post('/ai-chat', async (req, res) => {
  try {
    const { userMessage, projectId, conversationId } = req.body;
    
    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    const convId = conversationId || `conv_${Date.now()}`;
    const conversationHistory = conversationStore.get(convId) || [];
    
    // Project root path (adjust as needed)
    const projectRoot = path.resolve(__dirname, '../../');
    
    // Set up Server-Sent Events for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const fileChanges = [];
    let fullResponse = '';

    // Run the Agentic AI system
    await runProjectBuilderAgent({
      userMessage: userMessage.trim(),
      conversationHistory,
      projectRoot,
      
      // Stream text chunks to frontend
      onChunk: (chunk) => {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ 
          type: 'text', 
          content: chunk 
        })}\\n\\n`);
      },
      
      // Notify frontend of tool usage
      onToolUse: (toolInfo) => {
        res.write(`data: ${JSON.stringify({ 
          type: 'tool_start', 
          tool: toolInfo.tool,
          input: toolInfo.input 
        })}\\n\\n`);
      },
      
      // Notify frontend of file changes
      onFileChange: (change) => {
        fileChanges.push(change);
        res.write(`data: ${JSON.stringify({ 
          type: 'file_change', 
          change 
        })}\\n\\n`);
      }
    });

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: fullResponse }
    );
    
    // Keep only last 10 messages to prevent memory issues
    if (conversationHistory.length > 10) {
      conversationHistory.splice(0, conversationHistory.length - 10);
    }
    
    conversationStore.set(convId, conversationHistory);

    // Send completion event
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      conversationId: convId,
      fileChanges 
    })}\\n\\n`);
    
    res.end();

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Send error event
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error.message 
    })}\\n\\n`);
    
    res.end();
  }
});

// ─── Get Conversation History ─────────────────────────────────────────────────

router.get('/conversation/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const history = conversationStore.get(conversationId) || [];
  
  res.json({ 
    conversationId, 
    messages: history 
  });
});

// ─── Clear Conversation ───────────────────────────────────────────────────────

router.delete('/conversation/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  conversationStore.delete(conversationId);
  
  res.json({ 
    success: true, 
    message: 'Conversation cleared' 
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    agent: 'ProjectBuilderAgent',
    conversations: conversationStore.size 
  });
});

module.exports = router;