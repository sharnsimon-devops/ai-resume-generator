import { supabase } from './supabaseClient.js';
import { API_BASE_URL } from './apiClient.js';

export async function downloadGenerationPdf(generationId) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  const res = await fetch(`${API_BASE_URL}/api/generations/${generationId}/pdf`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume-${generationId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
