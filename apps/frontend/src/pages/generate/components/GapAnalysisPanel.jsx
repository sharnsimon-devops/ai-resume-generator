import { useState } from 'react';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * GapAnalysisPanel — shows the results of the JD analysis (Step 1).
 * Displays matched requirements, flagged gaps (as interactive questions),
 * and the extracted keyword list. Blocks generation until all gaps are answered.
 */
export function GapAnalysisPanel({ analysis, gapAnswers, onGapAnswerChange, onProceed, onCancel }) {
  const [expandMatches, setExpandMatches] = useState(false);

  if (!analysis) return null;

  const { matched_requirements = [], flagged_gaps = [], keyword_list = [] } = analysis;

  const allGapsAnswered = flagged_gaps.every((gap) => {
    const answer = gapAnswers[gap.id];
    return answer && answer.trim().length > 0;
  });

  return (
    <Card style={{
      borderLeft: '4px solid var(--color-accent)',
      backgroundColor: 'var(--color-bg-base)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          margin: '0 0 0.5rem 0',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-display)',
        }}>
          📋 JD Gap Analysis
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          We've analyzed the job description against your profile.
          {flagged_gaps.length > 0
            ? ` ${flagged_gaps.length} gap${flagged_gaps.length > 1 ? 's' : ''} need${flagged_gaps.length === 1 ? 's' : ''} your input before we generate.`
            : ' Your profile is a strong match — ready to generate!'}
        </p>
      </div>

      {/* Matched Requirements (collapsible) */}
      {matched_requirements.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setExpandMatches(!expandMatches)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0',
              color: 'var(--color-verified)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
            }}
          >
            <span style={{ transform: expandMatches ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              ▶
            </span>
            ✅ {matched_requirements.length} Matched Requirement{matched_requirements.length !== 1 ? 's' : ''}
          </button>
          {expandMatches && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              paddingLeft: '1.5rem',
              marginTop: '0.5rem',
            }}>
              {matched_requirements.map((match, i) => (
                <div key={i} style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(5, 150, 105, 0.05)',
                  border: '1px solid rgba(5, 150, 105, 0.15)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--text-sm)',
                }}>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    {match.requirement}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                    Evidence: {match.evidence_ref}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flagged Gaps (interactive) */}
      {flagged_gaps.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            margin: '0 0 0.75rem 0',
            color: 'var(--color-flagged)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            ⚠️ {flagged_gaps.length} Gap{flagged_gaps.length !== 1 ? 's' : ''} Need Your Input
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {flagged_gaps.map((gap) => (
              <GapQuestionCard
                key={gap.id}
                gap={gap}
                answer={gapAnswers[gap.id] || ''}
                onAnswerChange={(val) => onGapAnswerChange(gap.id, val)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Keyword List */}
      {keyword_list.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            🔑 Keywords to Mirror
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {keyword_list.map((kw, i) => (
              <span key={i} style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: 'rgba(0, 85, 255, 0.08)',
                color: 'var(--color-accent)',
                borderRadius: '12px',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                border: '1px solid rgba(0, 85, 255, 0.15)',
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: '1.25rem',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
      }}>
        <Button variant="secondary" onClick={onCancel}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={onProceed}
          disabled={flagged_gaps.length > 0 && !allGapsAnswered}
        >
          {flagged_gaps.length === 0 ? 'Generate Resume' : `Generate with ${flagged_gaps.length} Answer${flagged_gaps.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </Card>
  );
}


/**
 * Individual gap question card with quick-select chips + free text.
 */
function GapQuestionCard({ gap, answer, onAnswerChange }) {
  const quickOptions = ['Yes, I have this', 'No', 'Somewhat — let me explain'];

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'rgba(217, 119, 6, 0.04)',
      border: '1px solid rgba(217, 119, 6, 0.2)',
      borderRadius: 'var(--border-radius-md)',
    }}>
      {/* Requirement */}
      <div style={{
        fontWeight: 600,
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        marginBottom: '0.25rem',
      }}>
        {gap.requirement}
      </div>

      {/* Reason */}
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
        marginBottom: '0.75rem',
        fontStyle: 'italic',
      }}>
        {gap.reason}
      </div>

      {/* Question */}
      <div style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        marginBottom: '0.75rem',
        fontWeight: 500,
      }}>
        {gap.question}
      </div>

      {/* Quick-select chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {quickOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onAnswerChange(opt)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '16px',
              border: answer === opt ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
              backgroundColor: answer === opt ? 'rgba(0, 85, 255, 0.08)' : 'var(--color-bg-surface)',
              color: answer === opt ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Free-text input */}
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type a detailed answer here…"
        rows={2}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: 'var(--text-sm)',
          resize: 'vertical',
          fontFamily: 'inherit',
          backgroundColor: 'var(--color-bg-surface)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}
