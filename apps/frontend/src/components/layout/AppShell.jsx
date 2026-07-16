import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar.jsx';
import styles from './AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.appShell}>
      <NavBar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
