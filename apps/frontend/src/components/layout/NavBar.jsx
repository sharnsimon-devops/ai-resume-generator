import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../ui/Button.jsx';
import styles from './NavBar.module.css';

export function NavBar() {
  const { user, signOut } = useAuth();

  return (
    <header className={styles.navHeader}>
      <div className={styles.navContainer}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.brand}>OG Resume Builder</span>
            <span className={styles.betaBadge}>BETA</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '-2px', fontWeight: '500', letterSpacing: '0.5px' }}>A Product of OG</span>
        </Link>
        
        {user ? (
          <>
            <nav className={styles.navLinks}>
              <Link to="/profile" className={styles.navLink}>Profile</Link>
              <Link to="/generate" className={styles.navLink}>Generate</Link>
              <Link to="/settings/templates" className={styles.navLink}>Templates</Link>
              <Link to="/settings/api-key" className={styles.navLink}>Keys</Link>
              <a href="mailto:sharnjackson2002@gmail.com" className={styles.navLink}>Support</a>
            </nav>
            <div className={styles.authControls}>
              <span className={styles.userEmail}>{user.email}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Log out
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.authControls}>
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
