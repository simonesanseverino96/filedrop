import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(en|it|de|fr|es|pt|ja|zh|ar)/:path*',
    
    // Enable redirects that add missing locales
    // (e.g. `/path` -> `/en/path`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
