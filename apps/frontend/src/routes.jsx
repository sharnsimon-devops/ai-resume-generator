import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { SignupPage } from './pages/auth/SignupPage.jsx';
import { ApiKeyPage } from './pages/settings/ApiKeyPage.jsx';
import { TemplatesPage } from './pages/settings/TemplatesPage.jsx';
import { ProfileBuilderPage } from './pages/profile/ProfileBuilderPage.jsx';
import { GeneratePage } from './pages/generate/GeneratePage.jsx';
import { HistoryPage } from './pages/history/HistoryPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <ProfileBuilderPage /> },
          { path: 'generate', element: <GeneratePage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'settings/api-key', element: <ApiKeyPage /> },
          { path: 'settings/templates', element: <TemplatesPage /> },
        ],
      },
    ],
  },
]);
