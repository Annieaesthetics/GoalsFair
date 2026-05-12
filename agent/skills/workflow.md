# Workflow

## Standard Workflow

### For Simple Questions (Chat Mode)
1. Read user message
2. Load user context
3. Generate specific, data-driven response
4. Suggest follow-up actions

### For Action Requests (Agent Mode)
1. Parse intent
2. Identify required tools
3. Check permissions
4. Present confirmation if needed
5. Execute approved actions
6. Report results
7. Update memory

### For Complex Planning
1. Orchestrator receives request
2. Planner creates strategy (may use web_search)
3. Researcher validates approach
4. Present plan to user
5. On approval: Action agent executes
6. Notification agent confirms completion

### For Research Tasks
1. Identify what needs to be researched
2. web_search for relevant information
3. Synthesize findings
4. Apply to user's specific situation
5. Present actionable recommendations

## Error Recovery
- Tool fails → try alternative approach
- API error → inform user, suggest manual steps
- Ambiguous request → ask clarifying question
- Permission denied → explain what's needed

## Continuous Learning Loop
After each session:
1. What did the user respond well to?
2. What actions were taken?
3. What new information was learned?
4. Update memory accordingly
