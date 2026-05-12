export type MCPServer = {
  id: string
  name: string
  description: string
  url: string
  category: string
  tools: string[]
  installed: boolean
  configRequired?: string[]
}

// Featured MCP servers from the registry
export const MCP_REGISTRY: MCPServer[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Access repos, issues, PRs, and code',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    category: 'Development',
    tools: ['search_repos', 'create_issue', 'get_file', 'list_commits'],
    installed: false,
    configRequired: ['GITHUB_TOKEN'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Read and create calendar events',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-calendar',
    category: 'Productivity',
    tools: ['list_events', 'create_event', 'update_event', 'delete_event'],
    installed: false,
    configRequired: ['GOOGLE_CALENDAR_TOKEN'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read and send emails',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gmail',
    category: 'Communication',
    tools: ['read_emails', 'send_email', 'search_emails', 'create_draft'],
    installed: false,
    configRequired: ['GMAIL_TOKEN'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Read and write Notion pages and databases',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/notion',
    category: 'Productivity',
    tools: ['search_pages', 'create_page', 'update_page', 'query_database'],
    installed: false,
    configRequired: ['NOTION_TOKEN'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and read channels',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    category: 'Communication',
    tools: ['send_message', 'list_channels', 'read_messages'],
    installed: false,
    configRequired: ['SLACK_TOKEN'],
  },
  {
    id: 'filesystem',
    name: 'File System',
    description: 'Read and write local files',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    category: 'System',
    tools: ['read_file', 'write_file', 'list_directory', 'search_files'],
    installed: false,
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web search via Brave',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    category: 'Research',
    tools: ['web_search', 'news_search'],
    installed: false,
    configRequired: ['BRAVE_API_KEY'],
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query PostgreSQL databases',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    category: 'Database',
    tools: ['query', 'list_tables', 'describe_table'],
    installed: false,
    configRequired: ['DATABASE_URL'],
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation and web scraping',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    category: 'Automation',
    tools: ['navigate', 'screenshot', 'click', 'fill_form', 'extract_text'],
    installed: false,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Project management and issue tracking',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/linear',
    category: 'Development',
    tools: ['list_issues', 'create_issue', 'update_issue'],
    installed: false,
    configRequired: ['LINEAR_API_KEY'],
  },
]

export const MCP_CATEGORIES = [...new Set(MCP_REGISTRY.map(s => s.category))]
