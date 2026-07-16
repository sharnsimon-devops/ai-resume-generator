import styles from '../Generate.module.css';

export function ProgressStream({ stageLabel }) {
  if (!stageLabel) return null;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.spinner}></div>
      <span>{stageLabel}</span>
    </div>
  );
}
