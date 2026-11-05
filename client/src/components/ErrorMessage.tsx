import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4" role="alert">
      <AlertCircle className="w-10 h-10 text-red-500 mb-3" aria-hidden="true" />
      <p className="text-red-600 text-center mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline text-sm px-4 py-2">
          पुनः प्रयास करें
        </button>
      )}
    </div>
  );
}
