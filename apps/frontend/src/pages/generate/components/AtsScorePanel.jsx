import { Card } from '../../../components/ui/Card.jsx';

export function AtsScorePanel({ atsResult }) {
  if (!atsResult) return null;

  const getScoreColor = (score) => {
    if (score > 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <Card style={{ 
      borderLeft: `4px solid ${getScoreColor(atsResult.overall_score)}`, 
      backgroundColor: 'var(--color-bg-base)',
      marginBottom: '1rem'
    }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>
            ATS Score
            {atsResult._meta?.isTailored && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '2px 6px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '12px' }}>
                Tailored
              </span>
            )}
          </h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {atsResult.overall_score > 80 
              ? "Great job! Your resume is highly optimized for this role's ATS requirements." 
              : "This resume still has some gaps compared to the job description."}
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: getScoreColor(atsResult.overall_score),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          borderRadius: '50%',
          width: '64px',
          height: '64px'
        }}>
          {atsResult.overall_score}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>Missing Must-Haves</h4>
          {atsResult.missing_must_haves?.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-error)', fontSize: '0.875rem' }}>
              {atsResult.missing_must_haves.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-success)', fontSize: '0.875rem' }}>None! You have all the basics.</p>
          )}
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>Missing Nice-to-Haves</h4>
          {atsResult.missing_nice_to_haves?.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {atsResult.missing_nice_to_haves.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-success)', fontSize: '0.875rem' }}>None!</p>
          )}
        </div>
      </div>

      {atsResult.recommendations?.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>Recommendations</h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {atsResult.recommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 'bold' }}>{rec.issue}:</span> {rec.fix}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
