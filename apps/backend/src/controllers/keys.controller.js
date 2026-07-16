import * as keyService from '../services/keyService.js';

export async function getStatus(req, res) {
  const status = await keyService.getKeyStatus(req.user.id);
  res.json(status);
}

export async function saveKey(req, res) {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'apiKey_required' });
  }
  const status = await keyService.saveKey(req.user.id, apiKey);
  res.json(status);
}

export async function rotateKey(req, res) {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'apiKey_required' });
  }
  const status = await keyService.saveKey(req.user.id, apiKey);
  res.json(status);
}

export async function deleteKey(req, res) {
  const status = await keyService.deleteKey(req.user.id);
  res.json(status);
}
