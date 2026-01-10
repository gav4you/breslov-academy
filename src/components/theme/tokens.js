// v8.6 Premium UI Tokens
// Single place to tune the "MasterClass x Ivy League x Sefaria" look.
// Keep purely presentational so it's safe to reuse across all pages.

export const tokens = {
  page: {
    outer:
      'min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground',
    inner: 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
    content: 'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12', // For centered academic reading
  },
  glass: {
    card:
      'relative rounded-2xl border border-border/60 bg-background/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
    cardHover:
      'transition-all hover:border-border/80 hover:bg-background/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.45)]',
    navItem: 'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
    navItemActive: 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20',
  },
  text: {
    h1: 'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-serif text-slate-900 dark:text-slate-50',
    h2: 'text-2xl sm:text-3xl font-semibold tracking-tight font-serif text-slate-800 dark:text-slate-100',
    h3: 'text-lg sm:text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-200',
    lead: 'text-lg text-muted-foreground leading-relaxed',
    body: 'text-base leading-7 text-slate-700 dark:text-slate-300',
    meta: 'text-xs font-medium uppercase tracking-wider text-muted-foreground/80',
    serif: 'font-serif',
    sans: 'font-sans',
  },
  layout: {
    sectionGap: 'space-y-12 sm:space-y-16',
    gridGap: 'gap-6 sm:gap-8 lg:gap-10',
    stack: 'flex flex-col gap-4',
  },
  focus:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
};

export const cx = (...parts) => parts.filter(Boolean).join(' ');
