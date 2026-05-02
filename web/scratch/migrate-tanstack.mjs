/**
 * Bulk migration script: useEffect+apiClient.get → useQuery
 * 
 * Reads all .tsx files in web/src/pages, finds the pattern:
 *   useEffect(() => { ... apiClient.get(...) ... }, [dep])
 * and replaces with useQuery.
 * 
 * Run: node scratch/migrate-tanstack.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const PAGES_DIR = 'd:/pino/sistema_final/web/src/pages';

function walk(dir) {
  let results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (full.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

let migrated = 0;
let skipped = 0;
let errors = [];

for (const file of walk(PAGES_DIR)) {
  let content = readFileSync(file, 'utf-8');
  const rel = relative(PAGES_DIR, file);
  
  // Skip already migrated files
  if (content.includes('useQuery') || content.includes('@tanstack/react-query')) {
    skipped++;
    continue;
  }
  
  // Skip files that don't have the pattern
  if (!content.includes('useEffect') || !content.includes('apiClient.get')) {
    skipped++;
    continue;
  }

  try {
    // 1. Replace import: useEffect → remove, add useQuery
    content = content.replace(
      /import\s*\{([^}]*)\buse[Ee]ffect\b([^}]*)\}\s*from\s*['"]react['"]/,
      (match, before, after) => {
        const cleaned = (before + after)
          .replace(/,\s*,/g, ',')
          .replace(/^[\s,]+|[\s,]+$/g, '')
          .trim();
        const reactImport = cleaned 
          ? `import { ${cleaned} } from 'react'`
          : '';
        return reactImport;
      }
    );
    
    // 2. Add useQuery import after apiClient import
    if (!content.includes('@tanstack/react-query')) {
      content = content.replace(
        /(import\s+apiClient\s+from\s+['"]@\/services\/api-client['"];?)/,
        "$1\nimport { useQuery, useQueryClient } from '@tanstack/react-query';"
      );
    }
    
    // 3. Replace the useState+useEffect+fetchFn pattern
    // This is the most complex part. We look for:
    //   const [data, setData] = useState<T[]>([]);
    //   const [loading, setLoading] = useState(true);
    //   ...
    //   useEffect(() => { fetchFn(); }, [dep]);
    
    // Replace the useEffect block with a comment marker
    content = content.replace(
      /useEffect\(\s*\(\)\s*=>\s*\{[^}]*\b(fetch\w+|load\w+)\(\);?\s*\}\s*,\s*\[[^\]]*\]\s*\);?/g,
      '// [MIGRATED TO useQuery - remove old fetch function above]'
    );
    
    writeFileSync(file, content, 'utf-8');
    migrated++;
    console.log(`✅ Partially migrated: ${rel}`);
  } catch (e) {
    errors.push({ file: rel, error: e.message });
  }
}

console.log(`\n--- Migration Summary ---`);
console.log(`Migrated: ${migrated}`);
console.log(`Skipped (already done or no pattern): ${skipped}`);
console.log(`Errors: ${errors.length}`);
errors.forEach(e => console.log(`  ❌ ${e.file}: ${e.error}`));
