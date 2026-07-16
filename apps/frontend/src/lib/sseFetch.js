import { supabase } from './supabaseClient.js';
import { API_BASE_URL } from './apiClient.js';

// Parses SSE-formatted frames off a streamed fetch() POST response body.
// Native EventSource can't be used here — it only supports GET and can't
// carry the Authorization header this API requires.
export async function sseFetch(path, body, { onEvent }) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop();

    for (const frame of frames) {
      const eventLine = frame.split('\n').find((l) => l.startsWith('event: '));
      const dataLine = frame.split('\n').find((l) => l.startsWith('data: '));
      if (!eventLine || !dataLine) continue;

      const event = eventLine.slice('event: '.length);
      const data = JSON.parse(dataLine.slice('data: '.length));
      onEvent(event, data);
    }
  }
}
