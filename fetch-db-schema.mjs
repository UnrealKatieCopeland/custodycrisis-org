import { execSync } from 'child_process';

const DB_URL = 'https://app.notion.com/p/9483eb539bc845e0bba4b5be3b33f399';

const mcpInput = JSON.stringify({
  url: DB_URL
});

console.log('Fetching database schema...');

try {
  const result = execSync(
    `manus-mcp-cli tool call notion-fetch --server notion --input '${mcpInput.replace(/'/g, "'\\''")}'`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );

  console.log('Schema fetched!');
  console.log(result);
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
