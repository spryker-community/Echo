import { ContentItem, Team } from '../../types';
import { teams } from '../../config/teams';
import { PROHIBITED_PHRASES } from '../../config/prohibited-phrases';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

async function makeOpenRouterRequest(messages: Array<{ role: string; content: string }>) {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('API Key missing:', { 
        hasKey: !!apiKey,
        envMode: import.meta.env.MODE,
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD
      });
      throw new Error('OpenRouter API key is missing. Please check your environment variables.');
    }

    const requestBody = {
      model: import.meta.env.VITE_AI_MODEL || 'anthropic/claude-3-haiku',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    };

    console.log('Making OpenRouter request:', {
      url: `${OPENROUTER_BASE_URL}/chat/completions`,
      model: requestBody.model,
      messageCount: messages.length
    });

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Community Echo'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error Response:', errorText);
      throw new Error(`OpenRouter API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('OpenRouter API Response:', responseData);
    return responseData;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw new Error('Failed to generate message. Please try again.');
  }
}

export async function analyzeAudience(item: ContentItem): Promise<Team[]> {
  const testPrompt = `Please analyze this title and return 1-2 relevant teams from this list: ${teams.join(', ')}

Title: "${item.title}"

Return only the team names as a comma-separated list, nothing else.`;

  try {
    console.log('Starting audience analysis for:', item.title);
    const response = await makeOpenRouterRequest([
      { role: 'system', content: 'You are a helpful assistant that analyzes content and identifies relevant teams. Always respond with just the team names as a comma-separated list.' },
      { role: 'user', content: testPrompt }
    ]);

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const suggestedTeams = response.choices[0].message.content
      .split(',')
      .map((team: string) => team.trim())
      .filter((team: string) => teams.includes(team as Team)) as Team[];

    if (suggestedTeams.length === 0) {
      return [teams[0]];
    }

    console.log('Analyzed teams:', suggestedTeams);
    return suggestedTeams;
  } catch (error) {
    console.error('Team analysis error:', error);
    throw error;
  }
}

export async function generatePost(item: ContentItem, targetAudiences: Team[]): Promise<string> {
  const prompt = `Create an engaging internal post about this community content:
Title: ${item.title}
Description: ${item.description}
Source: ${item.source}
URL: ${item.url}

Target audience: ${targetAudiences.join(', ')}

Guidelines:
- Keep it concise and engaging
- Include relevant emojis
- Maintain a friendly, informal tone
- Include the URL
- Highlight why it's relevant for the target audience

Note: The following phrases should be avoided in AI-generated content: ${PROHIBITED_PHRASES.join(', ')}

Format the post in a way that's ready to be copied and shared internally.`;

  try {
    console.log('Starting post generation for:', item.title);
    const response = await makeOpenRouterRequest([
      { 
        role: 'system', 
        content: 'You are a helpful assistant that creates engaging internal posts about community content. ' +
                 'Write in a natural, conversational tone while avoiding common AI filler phrases and unprofessional language.'
      },
      { role: 'user', content: prompt }
    ]);

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const content = response.choices[0].message.content;
    console.log('Generated content:', content);
    return content;
  } catch (error) {
    console.error('Post generation error:', error);
    throw error;
  }
}
