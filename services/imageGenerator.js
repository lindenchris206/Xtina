import fetch from 'node-fetch';

export async function generateImage(prompt) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('Stability AI API key is not configured on the server.');
  }

  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        steps: 30,
        samples: 1,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Stability AI API call failed with status: ${response.status}`);
  }

  const data = await response.json();
  const image = data.artifacts[0];
  
  // Return a data URI to be displayed in the browser
  return `data:image/png;base64,${image.base64}`;
}
