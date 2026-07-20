export function ResumePreview({ resume, onChange }) {
  if (!resume) return null;

  function update(key, value) {
    onChange({ ...resume, [key]: value });
  }

  function updateArrayItem(key, index, field, value) {
    const newArray = [...(resume[key] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    update(key, newArray);
  }

  // Styles for editable inputs
  const inputStyle = { 
    width: '100%', 
    border: '1px solid transparent', 
    background: 'transparent', 
    outline: 'none', 
    fontFamily: 'inherit', 
    color: 'inherit' 
  };
  
  const getFocusProps = () => ({
    onFocus: (e) => (e.target.style.border = '1px dashed var(--color-border)'),
    onBlur: (e) => (e.target.style.border = '1px solid transparent'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-family-sans)' }}>
      {/* Header / Contact */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
        <input
          value={resume.contact?.name || ''}
          onChange={(e) => update('contact', { ...resume.contact, name: e.target.value })}
          style={{ ...inputStyle, fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}
          {...getFocusProps()}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          <input 
            value={resume.contact?.email || ''} 
            onChange={(e) => update('contact', { ...resume.contact, email: e.target.value })} 
            style={{ ...inputStyle, textAlign: 'center', minWidth: '150px' }} 
            {...getFocusProps()} 
            placeholder="Email"
          />
          <span>•</span>
          <input 
            value={resume.contact?.phone || ''} 
            onChange={(e) => update('contact', { ...resume.contact, phone: e.target.value })} 
            style={{ ...inputStyle, textAlign: 'center', minWidth: '120px' }} 
            {...getFocusProps()} 
            placeholder="Phone"
          />
          <span>•</span>
          <input 
            value={resume.contact?.location || ''} 
            onChange={(e) => update('contact', { ...resume.contact, location: e.target.value })} 
            style={{ ...inputStyle, textAlign: 'center', minWidth: '120px' }} 
            {...getFocusProps()} 
            placeholder="Location"
          />
        </div>
      </div>

      {/* Summary */}
      {resume.summary !== undefined && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Professional Summary</h4>
          <textarea
            value={resume.summary}
            onChange={(e) => update('summary', e.target.value)}
            rows={5}
            style={{ ...inputStyle, padding: '0.25rem', resize: 'vertical', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
            {...getFocusProps()}
          />
        </div>
      )}
          
      {/* Skills */}
      {resume.skills !== undefined && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Skills</h4>
          <textarea
            value={(resume.skills || []).join('\n')}
            onChange={(e) => update('skills', e.target.value.split('\n').filter(s => s.trim()))}
            rows={(resume.skills || []).length || 3}
            style={{ ...inputStyle, padding: '0.25rem', resize: 'vertical', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
            {...getFocusProps()}
            placeholder="Enter skills (one per line)"
          />
        </div>
      )}
      
      {/* Experience */}
      {resume.workHistory !== undefined && resume.workHistory.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Experience</h4>
          {(resume.workHistory || []).map((work, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                 onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'}
                 onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
                <input 
                  value={work.title || ''} 
                  onChange={(e) => updateArrayItem('workHistory', i, 'title', e.target.value)} 
                  style={{ ...inputStyle, fontWeight: 'bold' }} 
                  {...getFocusProps()} 
                  placeholder="Job Title" 
                />
                <span style={{ color: 'var(--color-text-secondary)' }}>at</span>
                <input 
                  value={work.organization || ''} 
                  onChange={(e) => updateArrayItem('workHistory', i, 'organization', e.target.value)} 
                  style={{ ...inputStyle, fontWeight: 'bold' }} 
                  {...getFocusProps()} 
                  placeholder="Company" 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                <input 
                  value={work.startDate || ''} 
                  onChange={(e) => updateArrayItem('workHistory', i, 'startDate', e.target.value)} 
                  style={{ ...inputStyle, width: '100px' }} 
                  {...getFocusProps()} 
                  placeholder="Start Date" 
                />
                <span>-</span>
                <input 
                  value={work.endDate || ''} 
                  onChange={(e) => updateArrayItem('workHistory', i, 'endDate', e.target.value)} 
                  style={{ ...inputStyle, width: '100px' }} 
                  {...getFocusProps()} 
                  placeholder="End Date" 
                />
              </div>
              <textarea
                value={(work.bullets || []).join('\n')}
                onChange={(e) => updateArrayItem('workHistory', i, 'bullets', e.target.value.split('\n').filter(b => b.trim()))}
                rows={(work.bullets || []).length || 3}
                style={{ ...inputStyle, padding: '0.25rem', resize: 'vertical', fontSize: '0.875rem', minHeight: '60px', color: 'var(--color-text-primary)' }}
                {...getFocusProps()}
                placeholder="Job description bullets (one per line)"
              />
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education !== undefined && resume.education.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Education</h4>
          {resume.education.map((edu, i) => (
             <div key={i} style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
             >
               <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                 <input 
                   value={edu.credential || ''} 
                   onChange={(e) => updateArrayItem('education', i, 'credential', e.target.value)} 
                   style={{ ...inputStyle, fontWeight: 'bold' }} 
                   {...getFocusProps()} 
                   placeholder="Degree/Credential" 
                 />
                 <input 
                   value={edu.field || ''} 
                   onChange={(e) => updateArrayItem('education', i, 'field', e.target.value)} 
                   style={inputStyle} 
                   {...getFocusProps()} 
                   placeholder="Field of Study" 
                 />
               </div>
               <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--color-text-primary)' }}>
                 <input 
                   value={edu.institution || ''} 
                   onChange={(e) => updateArrayItem('education', i, 'institution', e.target.value)} 
                   style={inputStyle} 
                   {...getFocusProps()} 
                   placeholder="Institution" 
                 />
               </div>
               <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  <input 
                    value={edu.startDate || ''} 
                    onChange={(e) => updateArrayItem('education', i, 'startDate', e.target.value)} 
                    style={{ ...inputStyle, width: '100px' }} 
                    {...getFocusProps()} 
                    placeholder="Start Date" 
                  />
                  <span>-</span>
                  <input 
                    value={edu.endDate || ''} 
                    onChange={(e) => updateArrayItem('education', i, 'endDate', e.target.value)} 
                    style={{ ...inputStyle, width: '100px' }} 
                    {...getFocusProps()} 
                    placeholder="End Date" 
                  />
               </div>
             </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {resume.achievements !== undefined && resume.achievements.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Achievements</h4>
          <textarea
            value={(resume.achievements || []).join('\n')}
            onChange={(e) => update('achievements', e.target.value.split('\n').filter(a => a.trim()))}
            rows={(resume.achievements || []).length || 2}
            style={{ ...inputStyle, padding: '0.25rem', resize: 'vertical', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
            {...getFocusProps()}
            placeholder="Enter achievements (one per line)"
          />
        </div>
      )}

      {/* Additional Sections */}
      {resume.additionalSections !== undefined && resume.additionalSections.length > 0 && (
        <div>
          {resume.additionalSections.map((section, i) => (
             <div key={i} style={{ marginBottom: '1.5rem', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
             >
                <input 
                  value={section.title || ''} 
                  onChange={(e) => updateArrayItem('additionalSections', i, 'title', e.target.value)}
                  style={{ ...inputStyle, margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}
                  {...getFocusProps()}
                  placeholder="Section Title"
                />
                <textarea
                  value={(section.items || []).join('\n')}
                  onChange={(e) => updateArrayItem('additionalSections', i, 'items', e.target.value.split('\n').filter(item => item.trim()))}
                  rows={(section.items || []).length || 2}
                  style={{ ...inputStyle, padding: '0.25rem', resize: 'vertical', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
                  {...getFocusProps()}
                  placeholder="Enter items (one per line)"
                />
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
