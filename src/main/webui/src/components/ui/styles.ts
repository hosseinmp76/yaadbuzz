/** Shared Tailwind class strings — use via components or `cn(...)`. */
export const panelClass =
  'rounded-panel border border-line bg-panel-strong p-5 shadow-panel sm:p-6'

export const stackClass = 'flex flex-col gap-3.5'

export const pageTitleClass =
  'mt-2 mb-1 break-words font-display text-[clamp(1.75rem,6vw,2.8rem)] leading-tight tracking-[-0.03em] text-brand'

export const sectionTitleClass =
  'font-display text-xl tracking-tight text-brand sm:text-2xl'

export const backLinkClass =
  'inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-brand'

export const tributeCardClass =
  'rounded-panel border border-line border-s-[4px] border-s-brand bg-panel-strong p-5 shadow-sm'

export const chipClass =
  'inline-flex max-w-full items-center truncate rounded-xl border border-line bg-[color-mix(in_oklab,var(--brand)_8%,white)] px-2.5 py-1 text-xs font-semibold tracking-[0.02em] text-brand'

export const listItemClass =
  'flex flex-col items-stretch gap-3 rounded-2xl border border-line bg-panel-strong px-4 py-3.5 transition hover:border-brand/30 hover:shadow-panel sm:flex-row sm:items-center sm:justify-between [&_>_:first-child]:min-w-0'

export const appShellClass =
  'mx-auto w-full max-w-[1180px] min-w-0 px-4 pb-[max(4rem,env(safe-area-inset-bottom))] sm:px-6'
