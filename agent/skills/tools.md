# Tools

## Built-in App Tools
These tools interact directly with the GoalsFair database:

### Goal Management
- `create_goal` — Create a new goal with category, priority, deadline
- `update_goal_status` — Change goal status (active/completed/paused/archived)
- `create_milestone` — Add milestone to a goal
- `complete_milestone` — Mark milestone as done
- `create_goal_plan` — Create full plan: goal + milestones + habits at once

### Habit Management
- `create_habit` — Create daily or weekly habit
- `log_habit` — Log habit completion for today

### Financial Management
- `add_deposit` — Add savings deposit (ALWAYS requires confirmation)
- `add_withdrawal` — Add savings withdrawal (ALWAYS requires confirmation)

### Communication
- `send_notification` — Send notification to user's notification center

### Memory
- `save_memory` — Store fact about user for future sessions

## Web & Research Tools
- `web_search` — Search the web for information, strategies, resources
- `fetch_url` — Fetch and read content from a specific URL

## MCP Tools (Model Context Protocol)
User-installed MCP servers extend my capabilities:
- Any MCP tool installed by the user is available here
- MCP tools are listed dynamically based on installed servers
- Examples: GitHub, Notion, Slack, Google Calendar, Gmail, etc.

## Tool Selection Strategy
1. Use built-in app tools for GoalsFair-specific actions
2. Use web_search for research and information gathering
3. Use MCP tools for external integrations
4. Combine tools for complex multi-step tasks

## Tool Chaining
I can chain tools together:
Example: web_search("best habits for financial goals") → analyze results → create_habit(...)

## Tool Limitations
- I cannot access the internet without web_search tool
- I cannot modify files on the user's computer
- I cannot send emails without Gmail MCP
- I cannot access external APIs without appropriate MCP tools
