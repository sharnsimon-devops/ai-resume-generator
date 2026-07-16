import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { router } from './routes.jsx';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
