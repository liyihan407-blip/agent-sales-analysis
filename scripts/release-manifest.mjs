import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skip = new Set(['node_modules', 'target', 'dist', 'unpackage', '.git', '.idea', '.vscode', '.codex', '.agents', '.aws', 'private'])
const entries = []
function walk(relative) {
  const absolute = path.join(root, relative)
  for (const item of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (skip.has(item.name) || /^application-local\./.test(item.name) ||
      (item.name.startsWith('.env') && item.name !== '.env.example') || /\.(log|pem|key|zip)$/.test(item.name)) continue
    const name = `${relative}/${item.name}`
    if (item.isDirectory()) walk(name)
    else if (item.isFile()) add(name)
  }
}
function add(relative) {
  const buffer = fs.readFileSync(path.join(root, relative))
  const content = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  entries.push({ path: relative, mode: '100644', type: 'blob', content })
}
for (const file of ['README.md', '.gitignore', '.dockerignore', '.env.example', 'compose.yaml']) add(file)
for (const dir of ['jc-sales-agent', 'jc-sales-agent-front', 'jc-sales-agent-uniapp', 'deploy', 'docs', 'scripts']) walk(dir)

const localConfig = path.join(root, 'jc-sales-agent/src/main/resources/application-local.yml')
const privateValues = fs.existsSync(localConfig) ? [...fs.readFileSync(localConfig, 'utf8').matchAll(/^\s*(?:password|api-key|host|url):\s*(.+)$/gm)]
  .map(match => match[1].trim().replace(/^['"]|['"]$/g, ''))
  .filter(value => value.length >= 8 && !value.includes('${')) : []
const findings = []
for (const entry of entries) {
  for (const [index, line] of entry.content.split(/\r?\n/).entries()) {
    if (/\bsk-[A-Za-z0-9_-]{16,}|\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(line) ||
        privateValues.some(value => line.includes(value))) findings.push(`${entry.path}:${index + 1}`)
  }
}
if (findings.length) {
  console.error('发布被阻止：疑似私有配置或凭据（仅列出位置）：\n' + findings.join('\n'))
  process.exit(1)
}
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(entries))
else console.log(JSON.stringify({ files: entries.length, bytes: entries.reduce((sum, entry) => sum + Buffer.byteLength(entry.content), 0), sensitiveMatches: 0 }, null, 2))
