import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';

export function ResumePasteForm({ onExtract, submitting }) {
  const [rawText, setRawText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onExtract(rawText);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Textarea
        label="Paste your existing resume text"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={12}
        required
        placeholder="Paste your full resume text here..."
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" isLoading={submitting} disabled={rawText.trim().length === 0}>
          Extract profile
        </Button>
      </div>
    </form>
  );
}
