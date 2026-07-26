/** Shared Tailwind class strings — use via components or `cn(...)`. */
export const panelClass =
  'rounded-panel border border-line bg-panel p-4 shadow-panel backdrop-blur-md sm:p-5'

export const stackClass = 'flex flex-col gap-3'

export const pageTitleClass =
  'mt-2 mb-1 break-words font-display text-[clamp(1.75rem,6vw,2.8rem)] leading-tight tracking-[-0.03em]'

export const chipClass =
  'inline-flex max-w-full items-center truncate rounded-full border border-line bg-panel-strong px-2.5 py-1 text-xs font-semibold tracking-[0.02em] text-muted'

export const listItemClass =
  'flex flex-col items-stretch gap-3 rounded-[14px] border border-line bg-panel px-3.5 py-3 transition hover:border-brand/35 sm:flex-row sm:items-center sm:justify-between [&_>_:first-child]:min-w-0'

export const appShellClass =
  'mx-auto w-[min(1100px,calc(100%-1.25rem))] pb-[max(4rem,env(safe-area-inset-bottom))] sm:w-[min(1100px,calc(100%-2rem))]'
