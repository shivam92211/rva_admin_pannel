import React, { useEffect } from 'react';
import { useSnackbarMsg } from '@/hooks/snackbar';
import { setGlobalSnackbarSetter } from '@/services/auth';

const GlobalErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setSnackbarMsg] = useSnackbarMsg();

  useEffect(() => {
    // Set the global snackbar setter for axios interceptors
    setGlobalSnackbarSetter(setSnackbarMsg);
  }, [setSnackbarMsg]);

  return <>{children}</>;
};

export default GlobalErrorHandler;