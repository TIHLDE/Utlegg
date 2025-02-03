// middleware.ts
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { SESSION_NAME } from "./lib/constants";

export async function middleware(request: NextRequest): Promise<NextResponse> {
	if (request.method === "GET") {
        const response = NextResponse.next();

		const token = request.cookies.get(SESSION_NAME)?.value ?? null;
		console.log("CHECKING TOKEN IN MIDDLEWARE: ", token);

		// Redirect to login page if session token is not set with redirect URL
		if (!token) {
		  const url = new URL("/login", request.url);
		  return NextResponse.redirect(new URL(url));
		}

		if (token !== null) {
			// Only extend cookie expiration on GET requests since we can be sure
			// a new session wasn't set when handling the request.
			response.cookies.set(SESSION_NAME, token, {
				path: "/",
				maxAge: 60 * 60 * 24 * 30,
				sameSite: "lax",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production"
			});
		}
		return response;
	}
	const originHeader = request.headers.get("Origin");
	// NOTE: You may need to use `X-Forwarded-Host` instead
	const hostHeader = request.headers.get("Host");
	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403
		});
	}
	let origin: URL;
	try {
		origin = new URL(originHeader);
	} catch {
		return new NextResponse(null, {
			status: 403
		});
	}
	if (origin.host !== hostHeader) {
		return new NextResponse(null, {
			status: 403
		});
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
	  /*
	   * Match all request paths except for the ones starting with:
	   * - api (API routes)
	   * - _next/static (static files)
	   * - _next/image (image optimization files)
	   * - favicon.ico, sitemap.xml, robots.txt (metadata files)
	   */
	  "/((?!api|login|images|$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};