export interface AIGenerateRequest {
  prompt: string;
}

export interface AIGenerateResponse {
  text: string;
  error?: string;
}

export const generateAIContent = async (
  prompt: string
): Promise<AIGenerateResponse> => {
  try {
    const response = await fetch('/api/generate-diet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.text || 'No content generated' };
  } catch (error) {
    console.error('Error generating AI content:', error);
    return {
      text: '',
      error:
        error instanceof Error ? error.message : 'Failed to generate content',
    };
  }
};
