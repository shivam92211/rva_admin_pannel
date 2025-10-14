import { useSnackbarMsg } from '@/hooks/snackbar';
import { handleCopy } from '@/utils/basic';
import { Copy } from 'lucide-react';

export default function CopyButton({
  text,
  msg = "Address copied to clipboard"
}: { text: string; msg?: string; }) {
  const [, setMsg] = useSnackbarMsg();
  return (
    <button
      onClick={() => {
        handleCopy(text, setMsg);
      }}
      className="text-gray-400 hover:text-blue-400 transition-colors p-1"
      title="Copy address to clipboard"
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}
