import React from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * Global Loading Spinner component.
 * Uses Zustand state (useAppStore) to determine visibility.
 * @returns the loading layer template
 */
const AppGlobalLoadingSpinner = React.memo(function AppGlobalLoadingSpinner() {
  const isLoading = useAppStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div
      id="spinner"
      className="z-[5000] fixed top-0 left-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-black/45"
      aria-live="polite"
      role="alert"
      aria-label="Loading content"
    >
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
          <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full" />
        </div>
      </div>
    </div>
  );
});

export { AppGlobalLoadingSpinner };
