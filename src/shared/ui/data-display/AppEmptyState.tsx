import type React from 'react';
import EmptyIcon from '@/assets/icons/empty.svg?react';
import { AppIcon } from '@/shared/ui/primitives/AppIcon';

export interface AppEmptyStateProps {
  title?: string;
  description?: string;
  /**
   * You can pass an SVG component imported via vite-plugin-svgr
   */
  icon?: React.ElementType;
}

export function AppEmptyState({
  title = 'No Data Available',
  description,
  icon: CustomIcon,
}: AppEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
        {CustomIcon ? (
          <CustomIcon className="h-10 w-10 text-muted-foreground opacity-50" />
        ) : (
          <AppIcon svg={EmptyIcon} className="h-10 w-10 text-muted-foreground opacity-50" />
        )}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
    </div>
  );
}
