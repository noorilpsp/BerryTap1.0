import { NextRequest, NextResponse } from "next/server";
import { parseHTML } from "linkedom";

export async function GET(
  request: NextRequest,
  { params }: { params: { rest: string[] } },
) {
  const href = (await params).rest.join("/");
  if (!href) {
    return new Response("Missing url parameter", { status: 400 });
  }
  
  // Use the request URL to construct the target URL
  // This works in all environments (dev, preview, production)
  const baseUrl = request.nextUrl.origin;
  const url = `${baseUrl}/${href}`;
  
  // Forward cookies from the client request to the internal fetch
  // This allows prefetching images from authenticated routes like /admin
  const cookieHeader = request.headers.get("cookie");
  const headers: HeadersInit = {};
  if (cookieHeader) {
    headers["cookie"] = cookieHeader;
  }
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    return new Response("Failed to fetch", { status: response.status });
  }
  const body = await response.text();
  const { document } = parseHTML(body);
  const images = Array.from(document.querySelectorAll("main img"))
    .map((img) => ({
      srcset: img.getAttribute("srcset") || img.getAttribute("srcSet"), // Linkedom is case-sensitive
      sizes: img.getAttribute("sizes"),
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      loading: img.getAttribute("loading"),
    }))
    .filter((img) => img.src);
  return NextResponse.json(
    { images },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
