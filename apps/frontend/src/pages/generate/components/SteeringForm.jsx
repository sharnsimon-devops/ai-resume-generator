import { Select } from '../../../components/ui/Select.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';

export function SteeringForm({ steering, onChange, renderEngine, setRenderEngine, templateId, setTemplateId, templates }) {
  function set(key, value) {
    onChange({ ...steering, [key]: value });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: 'var(--text-h3)', margin: '0 0 0.25rem 0' }}>Steering (optional)</h3>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Guide the AI without breaking the guardrails.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
          Target role
          <input 
            value={steering.targetRole || ''} 
            onChange={(e) => set('targetRole', e.target.value)} 
            placeholder="e.g. Senior Frontend Engineer"
            style={{ padding: '0.5rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}
          />
        </label>
        
        <Select
          label="Tone"
          value={steering.tone || ''}
          onChange={(e) => set('tone', e.target.value || undefined)}
          options={[
            { value: '', label: 'Default' },
            { value: 'formal', label: 'Formal' },
            { value: 'plain', label: 'Plain' },
            { value: 'impact-focused', label: 'Impact-focused' },
          ]}
        />
        
        <Select
          label="Seniority framing"
          value={steering.seniority || ''}
          onChange={(e) => set('seniority', e.target.value || undefined)}
          options={[
            { value: '', label: 'Default' },
            { value: 'entry', label: 'Entry' },
            { value: 'mid', label: 'Mid' },
            { value: 'senior', label: 'Senior' },
            { value: 'lead', label: 'Lead' },
          ]}
        />
        
        <Textarea
          label="Emphasize"
          value={steering.emphasis || ''}
          onChange={(e) => set('emphasis', e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. Focus on my React and performance optimization experience."
          hint="Reprioritizes your existing profile content — cannot add new claims."
        />
        
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Render Engine"
            value={renderEngine}
            onChange={(e) => setRenderEngine(e.target.value)}
            options={[
              { value: 'html', label: 'HTML to PDF (Default)' },
              { value: 'latex', label: 'LaTeX (Advanced)' },
            ]}
          />
          
          {renderEngine === 'latex' && (
            <Select
              label="LaTeX Template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              options={
                templates?.length > 0 
                  ? templates.map(t => ({ value: t.id, label: t.name }))
                  : [{ value: '', label: 'No templates available. Please upload one in Settings.' }]
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
