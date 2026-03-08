/**
 * Script to delete all telephony credentials from database
 * Run: node delete-telephony-creds.js
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '.data', 'agent-player.db');
const db = new Database(dbPath);

try {
  console.log('🗑️  Deleting all telephony credentials...');

  // Count before deletion
  const beforeCount = db.prepare(`SELECT COUNT(*) as count FROM credentials WHERE name LIKE 'telephony.%'`).get();
  console.log(`📊 Found ${beforeCount.count} telephony credentials`);

  // Delete all telephony credentials
  const result = db.prepare(`DELETE FROM credentials WHERE name LIKE 'telephony.%'`).run();
  console.log(`✅ Deleted ${result.changes} credentials`);

  // Count after deletion
  const afterCount = db.prepare(`SELECT COUNT(*) as count FROM credentials WHERE name LIKE 'telephony.%'`).get();
  console.log(`📊 Remaining telephony credentials: ${afterCount.count}`);

  console.log('\n✨ Done! You can now test adding credentials again.');
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
