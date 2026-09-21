async function test() {
  const loginRes = await fetch('http://localhost:3131/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'aryarajmarketing@gmail.com', password: '123456' })
  });
  const { token } = await loginRes.json();
  const keysRes = await fetch('http://localhost:3131/api/settings/keys', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await keysRes.json();
  console.log('--- RELATÓRIO DE SEGURANÇA DE CHAVES DE API ---');
  let leakedCount = 0;
  data.keys.forEach(k => {
    if (k.value && !['ACTIVE_IMAGE_PROVIDER', 'COPY_GENERATION_MODEL'].includes(k.key)) {
      console.error(`❌ VAZAMENTO DETECTADO em ${k.label}: ${k.value}`);
      leakedCount++;
    } else {
      console.log(`✅ ${k.label}: [PROTEGIDA] | masked='${k.masked}' | set=${k.set}`);
    }
  });

  if (leakedCount === 0) {
    console.log('\n🔒 100% DAS CHAVES ESTÃO CRIPTOGRAFADAS/MASCARADAS E NUNCA EXPOSTAS AO CLIENTE!');
  }
}
test();
