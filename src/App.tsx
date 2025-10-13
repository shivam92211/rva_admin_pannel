import React, { useEffect } from 'react';
import AppRouter from './router';
import { AuthService } from './services/auth';
import { RecoilRoot } from 'recoil';
import SnackbarWrap from './components/wrapper/SnackbarWrap';

const App: React.FC = () => {
  useEffect(() => {
    // Apply dark theme by default
    document.documentElement.classList.add('dark');
    // Initialize auth service interceptors
    const authService = AuthService.getInstance();
    authService.setupAxiosInterceptors();
  }, []);

  return (
    <RecoilRoot>
      <div className="dark">
        <SnackbarWrap >
          <AppRouter />
        </SnackbarWrap >
      </div>
    </RecoilRoot>
  );
};

export default App;