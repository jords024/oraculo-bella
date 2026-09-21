import { query } from '../dashboard/db.js';

async function main() {
  const res = await query("SELECT messages FROM library_chats WHERE user_email = 'aryarajmarketing@gmail.com'");
  if (res.rows.length) {
    const msgs = res.rows[0].messages;
    console.log('Total msgs in DB:', msgs.length);
    msgs.forEach((m, i) => {
      console.log(`[${i}] role=${m.role}, type=${m.type}, content=${m.content?.substring(0, 35)}, filename=${m.filename}, prompt=${m.generatedPrompt?.substring(0, 50)}`);
    });
  }
  process.exit(0);
}

main();
