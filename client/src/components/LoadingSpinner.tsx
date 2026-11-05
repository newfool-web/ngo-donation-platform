import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" aria-hidden="true" />
      <p className="mt-3 text-gray-500 text-sm">{text || 'लोड हो रहा है...'}</p>
    </div>
  );
}
