import React from 'react';
import styles from './Button.module.css';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '', 
  ...props 
}) {
  const classes = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    isLoading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className={styles.spinner}></span>
      ) : null}
      <span className={styles.content}>{children}</span>
    </button>
  );
}
