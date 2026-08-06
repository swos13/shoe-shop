import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import filterOrderIds from './utils/filterOrderIds';

export async function middleware(req: NextRequest) {

  const pathname = req.nextUrl.pathname;
  const res = NextResponse.next();

  const token = await getToken({ req });
  const pathNames = pathname.split('/');

  if ((pathNames[1] === 'auth' && token) || pathNames[1] === '') {
    const url = new URL(`/products`, req.url);
    return NextResponse.redirect(url);
  }
  if (pathNames[1] !== 'auth' && !token) {
    const url = new URL(`/auth/sign-in`, req.url);
    return NextResponse.redirect(url);
  }

  if (pathNames[2] === 'order-history') {
    const searchParams = req.nextUrl.searchParams;
    const ids = searchParams.getAll('id');
    if (ids.length > 0) {
      const validIds = await filterOrderIds(ids, token?.sub);
      if (validIds.length !== ids.length) {
        let searchQuery = '/profile/order-history';
        validIds.forEach((id, index) => {
          if (index === 0) searchQuery += '?';
          searchQuery += `id=${id}`;
          if (index !== validIds.length - 1) searchQuery += '&';
        });
        const url = new URL(searchQuery, req.url);
        return NextResponse.redirect(url);
      }
    }
  }

  if(!req.cookies.get('mockUsersCount')) res.cookies.set('mockUsersCount', '2');

  return res;
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/bag/thank-you/:path*',
    '/auth/:path*',
    '/',
    '/bag/checkout',
  ],
};
