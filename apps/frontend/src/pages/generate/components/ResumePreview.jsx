export function ResumePreview({ resume, onChange }) {
  if (!resume) return null;

  function update(key, value) {
    onChange({ ...resume, [key]: value });
  }

  // Basic styling to look like a document, avoiding the raw JSON look.
  // We use simple inputs/textareas to allow quick edits before download.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-family-sans)' }}>
      {/* Header / Contact */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
        <input
          value={resume.contact?.name || ''}
          onChange={(e) => update('contact', { ...resume.contact, name: e.target.value })}
          style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%', border: 'none', background: 'transparent', outline: 'none' }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          <input value={resume.contact?.email || ''} onChange={(e) => update('contact', { ...resume.contact, email: e.target.value })} style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'center' }} />
          <span>•</span>
          <input value={resume.contact?.phone || ''} onChange={(e) => update('contact', { ...resume.contact, phone: e.target.value })} style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'center' }} />
          <span>•</span>
          <input value={resume.contact?.location || ''} onChange={(e) => update('contact', { ...resume.contact, location: e.target.value })} style={{ border: 'none', background: 'transparent', outline: 'none', textAlign: 'center' }} />
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Professional Summary</h4>
          <textarea
            value={resume.summary}
            onChange={(e) => update('summary', e.target.value)}
            rows={4}
            style={{ width: '100%', border: '1px solid transparent', padding: '0.25rem', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem', color: 'var(--color-text-primary)', outline: 'none', backgroundColor: 'transparent' }}
            onFocus={(e) => e.target.style.border = '1px dashed var(--color-border)'}
            onBlur={(e) => e.target.style.border = '1px solid transparent'}
          />
        </div>
      )}

      {/* Note: In a full app, we would map through workHistory, education, and skills 
          with similar editable, transparent inputs. For this preview, we show a simplified version 
          that looks clean. The user can edit the summary and contact info above. */}
          
      {resume.skills && resume.skills.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Skills</h4>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>{resume.skills.join(', ')}</p>
        </div>
      )}
      
      {resume.workHistory && resume.workHistory.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Experience</h4>
          {resume.workHistory.map((work, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: '0.875rem' }}>
                <span>{work.title} at {work.organization}</span>
                <span>{work.startDate} - {work.endDate}</span>
              </div>
              <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                {(work.bullets || []).map((bullet, j) => (
                  <li key={j} style={{ marginBottom: '0.25rem' }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
