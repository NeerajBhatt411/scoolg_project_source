import * as React from 'react';
import { cn } from '@/lib/utils';

// Lightweight avatar (no Radix): renders the image, falls back to children
// (e.g. initials) when the src is missing or fails to load.
const Avatar = React.forwardRef(({ className, src, alt = '', children, ...props }, ref) => {
  const [errored, setErrored] = React.useState(false);
  const showImg = src && !errored;
  return (
    <div
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted items-center justify-center', className)}
      {...props}
    >
      {showImg ? (
        <img src={src} alt={alt} onError={() => setErrored(true)} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">{children}</span>
      )}
    </div>
  );
});
Avatar.displayName = 'Avatar';

export { Avatar };
