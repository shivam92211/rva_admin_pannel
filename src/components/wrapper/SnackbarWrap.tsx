import { useSnackbarMsg } from '@/hooks/snackbar';
import React, { useEffect } from 'react';
// @ts-ignore
import SnackbarProvider, { useSnackbar } from 'react-simple-snackbar';

const commonStyle = {
  zIndex: 999999,
};

const getLightModeOptions = (type: string = 'info') => {
  const baseStyle = {
    ...commonStyle,
    position: 'bottom-right' as const,
    style: {
      border: '1px solid #81838bff',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      textAlign: 'start' as const,
    },
    closeStyle: {
      color: '#1b1b1b',
      fontSize: '16px',
    },
  };

  switch (type) {
    case 'success':
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          backgroundColor: '#2a8d2aff',
        },
      };
    case 'error':
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          backgroundColor: '#dc3545',
        },
      };
    case 'warn':
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          backgroundColor: '#ffc107',
          color: '#000000',
        },
      };
    default: // info
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          backgroundColor: '#17a2b8',
        },
      };
  }
};

const getDarkModeOptions = (type: string = 'info') => {
  const baseStyle = {
    ...commonStyle,
    position: 'bottom-right' as const,
    style: {
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'start' as const,
    },
    closeStyle: {
      fontSize: '16px',
    },
  };

  switch (type) {
    case 'success':
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          border: '1px solid #28a745',
          color: "white",
          backgroundColor: '#28a745',
        },
        closeStyle: {
          ...baseStyle.closeStyle,
          color: '#ffffff',
        },
      };
    case 'error':
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          border: '1px solid #dc3545',
          color: "white",
          backgroundColor: '#dc3545',
        },
        closeStyle: {
          ...baseStyle.closeStyle,
          color: '#ffffff',
        },
      };
    case 'warn':
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          border: '1px solid #ffc107',
          color: '#000000',
          backgroundColor: '#ffc107',
        },
        closeStyle: {
          ...baseStyle.closeStyle,
          color: '#000000',
        },
      };
    default: // info
      return {
        ...baseStyle,
        style: {
          ...baseStyle.style,
          border: '1px solid #17a2b8',
          color: "white",
          backgroundColor: '#17a2b8',
        },
        closeStyle: {
          ...baseStyle.closeStyle,
          color: '#ffffff',
        },
      };
  }
};

export function SnackbarInternal() {
  const [sBar, setSBar] = useSnackbarMsg();

  // Get options based on message type
  const messageType = sBar?.type || 'info';
  const lightOptions = getLightModeOptions(messageType);
  const darkOptions = getDarkModeOptions(messageType);
  const [lOpen, lClose] = useSnackbar(lightOptions);
  const [dOpen, dClose] = useSnackbar(darkOptions);

  useEffect(() => {
    if (sBar) {
      dOpen(sBar.msg);
    } else {
      lOpen(false);
      dClose(false);
    }
  }, [sBar]);

  return null;
}

export default function SnackbarWrap({ children }: { children?: React.ReactNode; }) {


  return (
    <>
      <SnackbarProvider>
        <SnackbarInternal />
        {children}
      </SnackbarProvider>
    </>
  );
}
