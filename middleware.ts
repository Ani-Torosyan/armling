import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isTeacherRoute = createRouteMatcher(['/reviews(.*)'])

const isPublicRoute = createRouteMatcher(["/", "/api/webhooks", "/api/data", "/teachers", "/about-us", "/api/stripe-webhooks"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
  if (isTeacherRoute(request) && (await auth()).sessionClaims?.metadata?.role !== 'teacher') {
    const url = new URL('/teachers?error=not-a-teacher', request.url);
    return NextResponse.redirect(url);
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}