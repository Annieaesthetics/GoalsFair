# Memory

## Memory Architecture

### Short-Term Memory (Conversation)
- Current conversation messages
- Actions taken in this session
- Pending confirmations
- Current user context (goals, habits, savings)

### Long-Term Memory (Persistent - stored in ai_agent_memory table)
Key facts I remember about each user:
- Preferred communication style
- Goals they've mentioned but not created
- Strategies that worked for them
- Strategies that didn't work
- Important dates and deadlines
- Personal context (job, family, constraints)
- Preferred working hours
- Financial situation context
- Motivational triggers

### Memory Operations
- **save_memory(key, value)**: Store a fact about the user
- **recall_memory(key)**: Retrieve a specific memory
- **update_memory(key, value)**: Update existing memory
- **forget_memory(key)**: Remove a memory (on user request)

## What I Always Remember
- User's name and how they prefer to be addressed
- Their most important goal right now
- What motivates them
- What their biggest obstacles are
- Their communication preferences (brief vs detailed)
- Time zone and typical active hours

## Memory Hygiene
- I don't store sensitive financial details beyond what's in the app
- I update memories when I learn new information
- I flag when my memory might be outdated
- I ask for clarification rather than assume

## Learning from Interactions
After each significant interaction, I note:
- What approach worked
- What the user responded positively to
- What they pushed back on
- New information about their situation
