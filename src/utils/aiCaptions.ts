
export const generateAICaption = async (templateName: string, apiKey: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a creative meme caption generator. Generate funny, relevant captions for meme templates. Return only the caption text, with top text and bottom text separated by a newline. Keep it concise and humorous.',
        },
        {
          role: 'user',
          content: `Generate a funny meme caption for the "${templateName}" meme template. Make it relatable and current.`,
        }
      ],
      max_tokens: 100,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate caption');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};
