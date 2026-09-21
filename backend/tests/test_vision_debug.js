import fs from 'fs';
import path from 'path';

let apiKey = process.env.OPENAI_API_KEY;
if (!apiKey && fs.existsSync('backend/.env')) {
  const envContent = fs.readFileSync('backend/.env', 'utf-8');
  const match = envContent.match(/OPENAI_API_KEY=(.*)/);
  if (match) apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
}
const storageDir = path.resolve('backend/storage/library');

async function testVision() {
  const filename = 'gen_1787332234171_bfdhn.png';
  const filePath = path.join(storageDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return;
  }

  const fileData = fs.readFileSync(filePath);
  const base64Data = `data:image/png;base64,${fileData.toString('base64')}`;

  const prompt = 'troque o cabelo para platinado';

  const sysPrompt = `You are an expert AI Art Director and prompt engineer for photorealistic digital photography.
Your goal is to write a detailed, highly specific DALL-E prompt capturing the full composition, subject features, pose, clothing, and environment shown in the reference image, incorporating the user's styling modification.
Observe and specify in the prompt:
1. Subject & Pose: gender (man/woman), age group, facial structure (defined jawline, short stubble beard), camera angle (close-up selfie from car driver seat), head tilt and gaze.
2. Wardrobe & Details: exact clothing (casual black cotton crewneck t-shirt, NOT a collared or button-down shirt), jewelry (thin silver chain necklace, small silver earring).
3. Environment & Setting: exact setting (sitting in black car driver seat, leather headrest behind head, side window with daylight, NOT a studio or bedroom).
4. Modification: exact requested color/styling change (e.g. platinum blonde hair).
Return ONLY the final English prompt.`;

  const userContent = [
    {
      type: 'text',
      text: `User request: "${prompt}".\nDescribe a photorealistic photographic portrait maintaining this visual scene's composition, young man subject with defined jawline and light stubble, car interior driver seat setting, black crewneck t-shirt, silver chain necklace, and natural window lighting, featuring the requested platinum blonde hair.`
    },
    {
      type: 'image_url',
      image_url: { url: base64Data, detail: 'low' }
    }
  ];

  console.log('Enviando para Vision...');
  const modelName = process.env.COPY_GENERATION_MODEL || 'gpt-4o';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: userContent }
      ],
      max_completion_tokens: 500
    })
  });

  const data = await res.json();
  console.log('Resultado Vision (Status ' + res.status + '):', data.choices?.[0]?.message?.content || data);
}

testVision();
