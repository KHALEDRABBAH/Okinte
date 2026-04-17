import { redirect } from 'next/navigation';

/**
 * Root page "/" — redirects to the default locale "/fr"
 * 
 * WHY: The real homepage lives at /[locale]/page.tsx (e.g. /fr, /en, /ar).
 * This root page just redirects anyone who visits "/" to the French version.
 */
export default function RootPage() {
  redirect('/fr');
}
