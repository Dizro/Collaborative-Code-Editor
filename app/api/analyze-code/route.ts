import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const GIGACHAT_AUTH_KEY = process.env.GIGACHAT_AUTHORIZATION_KEY;

const OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const COMPLETIONS_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  if (!GIGACHAT_AUTH_KEY) {
    throw new Error('GigaChat Authorization Key not configured');
  }

  const response = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': uuidv4(),
      'Authorization': `Basic ${GIGACHAT_AUTH_KEY}`,
    },
    body: 'scope=GIGACHAT_API_PERS',
    // FIX: Удалена строка с agent, так как проблема решается через NODE_TLS_REJECT_UNAUTHORIZED
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("GigaChat Auth Error:", errorData);
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiresAt = data.expires_at - 60000;

  return accessToken!;
}

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'Code is required for analysis' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();

    const prompt = `
      Проанализируй следующий код. Дай краткий обзор его назначения, найди возможные ошибки, предложи улучшения по стилю и производительности.
      Ответ должен быть на русском языке и отформатирован с использованием Markdown.

      Вот код для анализа:
      \`\`\`
      ${code}
      \`\`\`
    `;

    const response = await fetch(COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages: [
          {
            role: "user",
            content: prompt,
          }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GigaChat API Error:", errorData);
      return NextResponse.json({ error: errorData.detail || 'Failed to get response from GigaChat' }, { status: response.status });
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || "Не удалось получить анализ от ИИ.";

    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error("Error calling GigaChat API:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
