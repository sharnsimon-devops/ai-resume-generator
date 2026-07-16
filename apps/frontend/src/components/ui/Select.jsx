import React, { forwardRef } from 'react';
import styles from './Input.module.css'; // Reusing wrapper/label styles

export const Select = forwardRef(({ 
  label, 
  error, 
  hint,
  options = [],
  className = '', 
  id,
  ...props 
}, ref) => {
  const selectId = id || Math.random().toString(36).substring(7);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`${styles.input} ${error ? styles.hasError : ''}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hintText}>{hint}</span>}
    </div>
  );
});

Select.displayName = 'Select';
