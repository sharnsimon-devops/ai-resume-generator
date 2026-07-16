import styles from '../Profile.module.css';
import { Button } from '../../../components/ui/Button.jsx';

function updateAt(array, index, value) {
  const next = array.slice();
  next[index] = value;
  return next;
}

function removeAt(array, index) {
  return array.filter((_, i) => i !== index);
}

function StringListEditor({ label, items, onChange, placeholder }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.inputGroup}>
        {items.map((item, i) => (
          <div key={i} className={styles.flexRow}>
            <input
              className={styles.editorInput}
              value={item}
              placeholder={placeholder}
              onChange={(e) => onChange(updateAt(items, i, e.target.value))}
            />
            <Button variant="ghost" size="sm" type="button" onClick={() => onChange(removeAt(items, i))}>
              Remove
            </Button>
          </div>
        ))}
        <div>
          <Button variant="secondary" size="sm" type="button" onClick={() => onChange([...items, ''])}>
            + Add
          </Button>
        </div>
      </div>
    </fieldset>
  );
}

function WorkHistoryEditor({ entries, onChange }) {
  function updateEntry(i, patch) {
    onChange(updateAt(entries, i, { ...entries[i], ...patch }));
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Work history</legend>
      {entries.map((entry, i) => (
        <div key={i} className={styles.entryCard}>
          <div className={styles.flexRow}>
            <input
              className={styles.editorInput}
              placeholder="Organization"
              value={entry.organization || ''}
              onChange={(e) => updateEntry(i, { organization: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="Title"
              value={entry.title || ''}
              onChange={(e) => updateEntry(i, { title: e.target.value })}
            />
          </div>
          <div className={styles.flexRow}>
            <input
              className={styles.editorInput}
              placeholder="Location"
              value={entry.location || ''}
              onChange={(e) => updateEntry(i, { location: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="Start date"
              value={entry.startDate || ''}
              onChange={(e) => updateEntry(i, { startDate: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="End date"
              value={entry.endDate || ''}
              onChange={(e) => updateEntry(i, { endDate: e.target.value })}
            />
          </div>
          <StringListEditor
            label="Bullets"
            items={entry.bullets || []}
            onChange={(bullets) => updateEntry(i, { bullets })}
            placeholder="Achievement or responsibility"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" type="button" onClick={() => onChange(removeAt(entries, i))}>
              Remove entry
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={() =>
          onChange([...entries, { organization: '', title: '', startDate: '', endDate: '', location: '', bullets: [] }])
        }
      >
        + Add work history entry
      </Button>
    </fieldset>
  );
}

function EducationEditor({ entries, onChange }) {
  function updateEntry(i, patch) {
    onChange(updateAt(entries, i, { ...entries[i], ...patch }));
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Education</legend>
      {entries.map((entry, i) => (
        <div key={i} className={styles.entryCard}>
          <div className={styles.flexRow}>
            <input
              className={styles.editorInput}
              placeholder="Institution"
              value={entry.institution || ''}
              onChange={(e) => updateEntry(i, { institution: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="Credential (e.g. BSN, BSc)"
              value={entry.credential || ''}
              onChange={(e) => updateEntry(i, { credential: e.target.value })}
            />
          </div>
          <div className={styles.flexRow}>
            <input
              className={styles.editorInput}
              placeholder="Field"
              value={entry.field || ''}
              onChange={(e) => updateEntry(i, { field: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="Start date"
              value={entry.startDate || ''}
              onChange={(e) => updateEntry(i, { startDate: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="End date"
              value={entry.endDate || ''}
              onChange={(e) => updateEntry(i, { endDate: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" type="button" onClick={() => onChange(removeAt(entries, i))}>
              Remove entry
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={() => onChange([...entries, { institution: '', credential: '', field: '', startDate: '', endDate: '' }])}
      >
        + Add education entry
      </Button>
    </fieldset>
  );
}

function AdditionalSectionsEditor({ sections, onChange }) {
  function updateSection(i, patch) {
    onChange(updateAt(sections, i, { ...sections[i], ...patch }));
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Additional sections</legend>
      {sections.map((section, i) => (
        <div key={i} className={styles.entryCard}>
          <div className={styles.inputGroup}>
            <input
              className={styles.editorInput}
              placeholder="Section title"
              value={section.title || ''}
              onChange={(e) => updateSection(i, { title: e.target.value })}
            />
          </div>
          <StringListEditor
            label="Items"
            items={section.items || []}
            onChange={(items) => updateSection(i, { items })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" type="button" onClick={() => onChange(removeAt(sections, i))}>
              Remove section
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondary" size="sm" type="button" onClick={() => onChange([...sections, { title: '', items: [] }])}>
        + Add section
      </Button>
    </fieldset>
  );
}

export function ProfileSectionEditor({ profile, onChange }) {
  function set(key, value) {
    onChange({ ...profile, [key]: value });
  }

  const contact = profile.contact || {};

  return (
    <div>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Contact</legend>
        <div className={styles.inputGroup}>
          <div className={styles.flexRow}>
            <input
              className={styles.editorInput}
              placeholder="Name"
              value={contact.name || ''}
              onChange={(e) => set('contact', { ...contact, name: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="Email"
              value={contact.email || ''}
              onChange={(e) => set('contact', { ...contact, email: e.target.value })}
            />
          </div>
          <div className={styles.flexRow}>
            <input
              className={styles.editorInput}
              placeholder="Phone"
              value={contact.phone || ''}
              onChange={(e) => set('contact', { ...contact, phone: e.target.value })}
            />
            <input
              className={styles.editorInput}
              placeholder="Location"
              value={contact.location || ''}
              onChange={(e) => set('contact', { ...contact, location: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Professional summary</legend>
        <textarea
          className={styles.editorTextarea}
          value={profile.summary || ''}
          onChange={(e) => set('summary', e.target.value)}
          rows={3}
        />
      </fieldset>

      <WorkHistoryEditor entries={profile.workHistory || []} onChange={(v) => set('workHistory', v)} />

      <StringListEditor
        label="Skills"
        items={profile.skills || []}
        onChange={(v) => set('skills', v)}
        placeholder="Skill"
      />

      <EducationEditor entries={profile.education || []} onChange={(v) => set('education', v)} />

      <StringListEditor
        label="Achievements"
        items={profile.achievements || []}
        onChange={(v) => set('achievements', v)}
        placeholder="Achievement"
      />

      <AdditionalSectionsEditor
        sections={profile.additionalSections || []}
        onChange={(v) => set('additionalSections', v)}
      />
    </div>
  );
}
