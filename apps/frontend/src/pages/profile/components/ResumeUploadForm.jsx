import { useState } from 'react';

export function ResumeUploadForm({ onExtract, submitting }) {
  const [file, setFile] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (file) onExtract(file);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Upload a resume (PDF or DOCX, max 5MB)
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </label>
      <button type="submit" disabled={submitting || !file}>
        {submitting ? 'Extracting…' : 'Upload & extract'}
      </button>
    </form>
  );
}
