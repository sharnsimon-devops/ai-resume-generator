import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import styles from './Auth.module.css';

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmNotice, setConfirmNotice] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { data, error: signUpError } = await signUp(email, password);
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      navigate('/profile');
    } else {
      setConfirmNotice(true);
    }
  }

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <h1 className={styles.title}>Sign up</h1>
        <p className={styles.subtitle}>Start building verified resumes.</p>
        
        {confirmNotice ? (
          <div className={styles.successAlert}>
            Check your email to confirm your account, then log in.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorAlert} role="alert">{error}</div>}
            
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              minLength={6}
              required 
              hint="Must be at least 6 characters."
            />
            
            <Button type="submit" isLoading={submitting} style={{ marginTop: '0.5rem' }}>
              Sign up
            </Button>
          </form>
        )}
        
        <p className={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
