
import { cn } from '@/lib/utils';
import { useSidebar } from './ui/sidebar';
import './app-logo.css';


function HeartEcgIcon({ className }: { className?: string }) {
  return (
     <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M3 12h2l1.5 4 3-8 3 8 1.5-4h2" />
        <path d="M18.4 14.5C19.9 13.2 21 11.2 21 9.1C21 6.8 19.5 5.1 17.6 5.1C16.2 5.1 15.1 5.9 14.5 7.1L14.5 7.1C13.5 5.5 11.5 4.5 9.5 4.5C6.5 4.5 4 7 4 10.1C4 12.7 5.5 15.1 8.5 17.5L14.5 21L16.2 19.5" />
    </svg>
  );
}


export function AppLogo({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'bright';
}) {
  let sidebar: ReturnType<typeof useSidebar> | undefined;
  try {
    sidebar = useSidebar();
  } catch (e) {}

  if (variant === 'bright') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4 text-center', className)}>
         <div className="h-28 w-28 flex items-center justify-center rounded-full bg-white/10 p-2 shadow-inner">
           <HeartEcgIcon className="h-20 w-20 text-white" />
        </div>
        <div>
          <h1 className="title-text" data-text="सेहत">सेहत</h1>
          <p className="tagline">YOUR DIGITAL HEALTH PARTNER</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 text-xl font-bold text-sidebar-foreground',
        className
      )}
    >
      <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center p-1.5">
        <HeartEcgIcon className="h-6 w-6 text-sidebar-primary-foreground" />
      </div>
      <span
        className={cn(
          'truncate',
          sidebar?.state === 'collapsed'
            ? 'group-data-[collapsible=icon]/sidebar-wrapper:hidden'
            : ''
        )}
      >
        सेहत
      </span>
    </div>
  );
}
