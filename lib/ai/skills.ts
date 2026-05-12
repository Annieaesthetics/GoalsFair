import fs from 'fs'
import path from 'path'

const SKILLS_DIR = path.join(process.cwd(), 'agent', 'skills')

// Load order matters — defines agent personality hierarchy
const BASE_SKILLS = [
  'identity', 'soul', 'mission', 'principles',
  'personality', 'communication', 'style',
  'tools', 'workflow', 'reasoning', 'planning',
  'reflection', 'constraints', 'safety',
  'memory', 'goals', 'context', 'agent', 'system',
]

export function loadSkill(skillName: string): string {
  try {
    const filePath = path.join(SKILLS_DIR, `${skillName}.md`)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8')
    }
    return ''
  } catch {
    return ''
  }
}

export function loadAllSkills(compact = false): string {
  const skills = BASE_SKILLS.map(name => {
    const content = loadSkill(name)
    if (!content) return ''
    if (compact) {
      // Only take first 3 lines of each skill to save tokens
      const summary = content.split('\n').slice(0, 4).join(' ').replace(/#+/g, '').trim().slice(0, 200)
      return `[${name}]: ${summary}`
    }
    return `\n## SKILL: ${name.toUpperCase()}\n${content}`
  }).filter(Boolean)

  if (compact) return skills.join('\n')
  return skills.join('\n\n---\n')
}

export function loadCustomSkills(): string {
  try {
    if (!fs.existsSync(SKILLS_DIR)) return ''
    const files = fs.readdirSync(SKILLS_DIR)
    const customFiles = files.filter(f =>
      f.endsWith('.md') && !BASE_SKILLS.includes(f.replace('.md', ''))
    )
    return customFiles.map(f => {
      const content = fs.readFileSync(path.join(SKILLS_DIR, f), 'utf-8')
      return `\n## CUSTOM SKILL: ${f.replace('.md', '').toUpperCase()}\n${content}`
    }).join('\n\n---\n')
  } catch {
    return ''
  }
}

export function listSkills(): { name: string; isBase: boolean; size: number; lastModified: Date }[] {
  try {
    if (!fs.existsSync(SKILLS_DIR)) return []
    const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.md'))
    return files.map(f => {
      const filePath = path.join(SKILLS_DIR, f)
      const stats = fs.statSync(filePath)
      const name = f.replace('.md', '')
      return {
        name,
        isBase: BASE_SKILLS.includes(name),
        size: stats.size,
        lastModified: stats.mtime,
      }
    }).sort((a, b) => {
      const ai = BASE_SKILLS.indexOf(a.name)
      const bi = BASE_SKILLS.indexOf(b.name)
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  } catch {
    return []
  }
}

export function saveSkill(skillName: string, content: string): void {
  if (!fs.existsSync(SKILLS_DIR)) fs.mkdirSync(SKILLS_DIR, { recursive: true })
  fs.writeFileSync(path.join(SKILLS_DIR, `${skillName}.md`), content, 'utf-8')
}

export function deleteSkill(skillName: string): boolean {
  if (BASE_SKILLS.includes(skillName)) return false // Can't delete base skills
  const filePath = path.join(SKILLS_DIR, `${skillName}.md`)
  if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); return true }
  return false
}
