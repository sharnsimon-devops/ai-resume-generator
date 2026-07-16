import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export const Input = forwardRef(({ 
  label, 
  error, 
  hint,
  className = '', 
  id,
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
      <input
        ref={ref}
        id={inputId}
        className={`${styles.input} ${error ? styles.hasError : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hintText}>{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
