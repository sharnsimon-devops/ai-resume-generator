import React from 'react';
import styles from './Badge.module.css';

export function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[`variant-${variant}`]} ${className}`}>
      {children}
    </span>
  );
}
