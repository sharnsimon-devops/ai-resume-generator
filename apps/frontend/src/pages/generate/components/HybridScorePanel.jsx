import { Card } from '../../../components/ui/Card.jsx';

/**
 * HybridScorePanel — displays the blended deterministic + qualitative ATS score.
 * Shows overall score, breakdown bars, missing keywords, and improvement suggestions.
 */
export function HybridScorePanel({ scoreResult }) {
  if (!scoreResult) return null;

  const { overall_score, breakdown, missing_keywords = [], suggestions = [] } = scoreResult;

  const getScoreColor = (score) => {
    if (score > 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getBandLabel = (score) => {
    if (score >= 85) return 'Strong';
    if (score >= 70) return 'Competitive';
    if (score >= 55) return 'Borderline';
    return 'Needs Work';
  };

  const breakdownItems = [
    { key: 'keyword_coverage', label: 'Keyword Coverage', weight: '40%', description: 'JD keywords found in resume' },
    { key: 'contact_completeness', label: 'Contact Info', weight: '20%', description: 'Name, email/phone, location' },
    { key: 'section_presence', label: 'Section Structure', weight: '15%', description: 'Experience, Skills, Education' },
    { key: 'quantification_score', label: 'Quantification', weight: '15%', description: 'Numbers backing achievements' },
    { key: 'relevance_score', label: 'Relevance', weight: '10%', description: 'Bullet alignment to JD' },
  ];

  return (
    <Card style={{
      borderLeft: `4px solid ${getScoreColor(overall_score)}`,
      backgroundColor: 'var(--color-bg-base)',
      marginBottom: '1rem',
    }}>
      {/* Header with score circle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-primary)' }}>
            ATS Score
            <span style={{
              marginLeft: '0.5rem',
              fontSize: 'var(--text-xs)',
              padding: '2px 8px',
              backgroundColor: getScoreColor(overall_score),
              color: 'white',
              borderRadius: '12px',
              fontWeight: 500,
            }}>
              {getBandLabel(overall_score)}
            </span>
          </h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Hybrid score: deterministic keyword match + AI qualitative analysis
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getScoreColor(overall_score),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          flexShrink: 0,
        }}>
          {overall_score}
        </div>
      </div>

      {/* Score Breakdown Bars */}
      {breakdown && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Score Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {breakdownItems.map(({ key, label, weight, description }) => {
              const value = breakdown[key] ?? 0;
              return (
                <div key={key}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '0.25rem',
                  }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {label}
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '0.35rem', fontSize: 'var(--text-xs)' }}>
                        ({weight})
                      </span>
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: getScoreColor(value) }}>
                      {value}%
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: 'var(--color-border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${value}%`,
                      backgroundColor: getScoreColor(value),
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                    {description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missing_keywords.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Missing Keywords
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {missing_keywords.map((kw, i) => (
              <span key={i} style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                color: 'var(--color-error)',
                borderRadius: '12px',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                border: '1px solid rgba(220, 38, 38, 0.2)',
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Improvement Suggestions
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            {suggestions.map((note, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
