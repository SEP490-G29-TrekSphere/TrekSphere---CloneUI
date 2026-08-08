import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberAvatarProps {
  fullName: string;
  avatarUrl?: string;
  isLeader?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-xs',
  lg: 'h-14 w-14 text-sm',
};

const badgeSizeStyles = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function MemberAvatar({
  fullName,
  avatarUrl,
  isLeader = false,
  size = 'md',
  className,
}: MemberAvatarProps) {
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={cn('relative shrink-0', className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className={cn('rounded-full object-cover border border-border', sizeStyles[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-secondary text-primary flex items-center justify-center font-bold',
            sizeStyles[size]
          )}
        >
          {initials}
        </div>
      )}
      {isLeader && (
        <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-primary text-white">
          <CheckCircle2 className={cn('fill-secondary text-primary', badgeSizeStyles[size])} />
        </div>
      )}
    </div>
  );
}
