import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendChatMessage = async (messages: ChatMessage[]) => {
  try {
    const completion = await client.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:free",
      messages: messages as any,
      max_tokens: 800,
      temperature: 0.8,
      top_p: 0.9,
    }, {
      headers: {
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Arabic School Management",
      }
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error; // Laissez le composant gérer l'erreur
  }
};

export const checkLoginCommand = (message: string): boolean => {
  const loginCommands = ['لوحة التحكم', 'dashboard', 'login', 'دخول', 'تحكم', 'control panel'];
  return loginCommands.some(cmd => 
    message.toLowerCase().includes(cmd.toLowerCase())
  );
}; 