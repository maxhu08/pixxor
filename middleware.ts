import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/uploadthing")) {
    return;
  }

  const response = await updateSession(request);

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  // const csp = `
  //     default-src 'self';
  //     script-src 'nonce-${nonce}' 'strict-dynamic' ${
  //   process.env.NODE_ENV === "production" ? "unsafe-eval" : `'unsafe-eval'`
  // };
  //     style-src 'self' 'unsafe-inline';
  //     connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL};
  //     img-src 'self' blob: data:;
  //     object-src 'none';
  //     base-uri 'none';
  //     frame-ancestors 'none';
  //     upgrade-insecure-requests;
  // `
  //   .replace(/\s{2,}/g, " ")
  //   .trim();

  // response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
