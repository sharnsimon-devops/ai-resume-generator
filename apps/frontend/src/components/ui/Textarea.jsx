import React, { forwardRef } from 'react';
import styles from './Input.module.css'; // Reusing Input styles for consistency

export const Textarea = forwardRef(({ 
  label, 
  error, 
  hint,
  className = '', 
  id,
  rows = 4,
  ...props 
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={`${styles.input} ${error ? styles.hasError : ''}`}
        style={{ resize: 'vertical', minHeight: '80px' }}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hintText}>{hint}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
