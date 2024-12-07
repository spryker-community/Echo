import { ContentItem, Team } from '../../types';
import { teams } from '../../config/teams';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

async function makeOpenRouterRequest(messages: Array<{ role: string; content: string }>) {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: import.meta.env.AI_MODEL || 'anthropic/claude-3.5-haiku-20241022',
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeAudience(item: ContentItem): Promise<Team[]> {
  const prompt = `Given this content from our community:
Title: ${item.title}
Description: ${item.description}
Source: ${item.source}

Analyze which internal teams would benefit most from this information. Available teams:
${teams.join(', ')}

Return only the most relevant teams (maximum 3) as a comma-separated list.`;

  const response = await makeOpenRouterRequest([
    { role: 'user', content: prompt }
  ]);

  const suggestedTeams = response.choices[0].message.content?.split(',')
    .map((team: string) => team.trim())
    .filter((team: string) => teams.includes(team as Team)) as Team[];

  return suggestedTeams;
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

Format the post in a way that's ready to be copied and shared internally.`;

  const response = await makeOpenRouterRequest([
    { role: 'user', content: prompt }
  ]);

  return response.choices[0].message.content || '';
}
