import { query } from '../dashboard/db.js';

async function main() {
  const res = await query("SELECT user_email, jsonb_array_length(generated_images) as cnt, generated_images FROM library_chats WHERE user_email = 'aryarajmarketing@gmail.com'");
  if (res.rows.length) {
    console.log('Count:', res.rows[0].cnt);
    const imgs = res.rows[0].generated_images;
    console.log('First 6 items:');
    imgs.slice(0, 6).forEach(i => {
      console.log(' - Title:', (i.prompt || i.generatedPrompt || '').substring(0, 30), '| url:', i.imageUrl, '| filename:', i.filename);
    });
  }
  process.exit(0);
}

main();
