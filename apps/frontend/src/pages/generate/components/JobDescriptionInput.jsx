import { Textarea } from '../../../components/ui/Textarea.jsx';

export function JobDescriptionInput({ value, onChange }) {
  return (
    <Textarea
      label="Job Description"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={12}
      required
      placeholder="Paste the full job description here..."
      hint="We'll use this to optimize keywords and select the most relevant experience."
    />
  );
}
