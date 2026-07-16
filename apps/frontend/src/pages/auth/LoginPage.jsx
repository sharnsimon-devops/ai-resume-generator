import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import styles from './Auth.module.css';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate('/profile');
  }

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.subtitle}>Welcome back to ResumeAI.</p>
        
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
            required 
          />
          
          <Button type="submit" isLoading={submitting} style={{ marginTop: '0.5rem' }}>
            Log in
          </Button>
        </form>
        
        <p className={styles.footer}>
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}
