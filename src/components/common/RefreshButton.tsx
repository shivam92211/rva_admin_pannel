import React, { useState } from 'react';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { useSnackbarMsg } from '@/hooks/snackbar';

export default function RefreshButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [, setMsg] = useSnackbarMsg();
  // const buttonText = refreshing ? 'Refreshing...' : 'Refresh';
  return (
    <>
      <Button
        onClick={() => {
          setRefreshing(true);
          onClick();
          setTimeout(() => {
            setRefreshing(false);
            setMsg({
              msg: 'Refreshed successfully',
              type: 'success'
            });
          }, 1000);
        }}
        variant="outline"
        size="sm"
        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </>
  );
}
