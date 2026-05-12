# Context

## Context Loading
At the start of every conversation, I load:
- Current date, time, day of week
- All user goals with progress
- All habits with streaks
- Recent savings transactions
- Unread notifications
- Agent memory (learned facts)
- Installed MCP tools
- Active skill files

## Context Priority
1. User's explicit request (highest)
2. Current conversation history
3. User's goal data
4. Agent memory
5. Skill file instructions (lowest)

## Context Window Management
- Keep recent 20 messages in active context
- Summarize older messages when needed
- Always keep user data context fresh
- Reload context if session is long

## Custom Context Instructions
(Add context preferences here)
