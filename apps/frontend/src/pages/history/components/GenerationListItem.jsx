import { useNavigate } from 'react-router-dom';

import { downloadGenerationPdf } from '../../../lib/downloadGenerationPdf.js';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import styles from '../History.module.css';

export function GenerationListItem({ generation }) {
  const navigate = useNavigate();

  function handleRegenerate() {
    navigate('/generate', {
      state: { jdText: generation.jd_text, steering: generation.steering_json },
    });
  }

  const role = generation.steering_json?.targetRole ? `Target Role: ${generation.steering_json.targetRole}` : 'No target role specified';

  return (
    <li>
      <Card className={styles.listItemCard}>
        <div className={styles.itemHeader}>
          <div className={styles.itemDate}>
            {new Date(generation.created_at).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            {role}
          </div>
        </div>
        
        <div className={styles.itemContent}>
          {generation.jd_text.slice(0, 200)}
          {generation.jd_text.length > 200 ? '...' : ''}
        </div>
        
        <div className={styles.itemActions}>
          <Button variant="secondary" size="sm" onClick={() => downloadGenerationPdf(generation.id)}>
            Download PDF
          </Button>
          <Button variant="primary" size="sm" onClick={handleRegenerate}>
            Re-generate
          </Button>
        </div>
      </Card>
    </li>
  );
}
