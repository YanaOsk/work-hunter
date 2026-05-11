const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'app', 'api', 'advisor');

const AUTH_IMPORT = `import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";`;

const AUTH_CHECK = `  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('getServerSession')) return 'skipped';

  // Insert imports after the last import line
  const lines = content.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('export const maxDuration')) {
      lastImportIdx = i;
    }
  }
  lines.splice(lastImportIdx + 1, 0, AUTH_IMPORT);
  content = lines.join('\n');

  // Add auth check before 'try {' in POST handler
  content = content.replace(
    /(export async function POST\([^)]*\) \{\n)(  try \{)/,
    (_, fnStart, tryLine) => fnStart + AUTH_CHECK + tryLine
  );

  fs.writeFileSync(filePath, content, 'utf8');
  return 'patched';
}

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (entry.name === 'route.ts') results.push(full);
  }
  return results;
}

const files = walk(dir);
for (const f of files) {
  const rel = f.replace(dir, '').replace(/\\/g, '/');
  const result = processFile(f);
  console.log(result + ': ' + rel);
}
console.log('Done.');
