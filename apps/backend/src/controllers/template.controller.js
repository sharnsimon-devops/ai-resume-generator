import { getSupabaseForUser } from '../lib/supabaseForRequest.js';

export async function uploadTemplate(req, res) {
  const { name, content } = req.body;
  
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  const { data, error } = await getSupabaseForUser(req.accessToken)
    .from('templates')
    .insert({
      user_id: req.user.id,
      name,
      content,
    })
    .select('*')
    .single();

  if (error) {
    // If table doesn't exist, return a mock response for now to allow UI testing
    if (error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST106') {
      return res.status(201).json({ template: { id: 'mock-id', name, content, user_id: req.user.id } });
    }
    throw error;
  }

  res.status(201).json({ template: data });
}

export async function listTemplates(req, res) {
  const { data, error } = await getSupabaseForUser(req.accessToken)
    .from('templates')
    .select('id, name, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST106') {
      return res.json({ templates: [] }); // Return empty array if table missing
    }
    throw error;
  }

  res.json({ templates: data });
}

export async function getTemplate(req, res) {
  const { data, error } = await getSupabaseForUser(req.accessToken)
    .from('templates')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST106') {
       return res.status(404).json({ error: 'Template not found' });
    }
    throw error;
  }
  
  if (!data) return res.status(404).json({ error: 'Template not found' });

  res.json({ template: data });
}
