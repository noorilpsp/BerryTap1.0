"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prefetchImages(href: string) {
  if (!href.startsWith("/") || href.startsWith("/order") || href === "/") {
    return [];
  }
  const url = new URL(href, window.location.href);
  const imageResponse = await fetch(`/api/prefetch-images${url.pathname}`);
  // only throw in dev
  if (!imageResponse.ok && process.env.NODE_ENV === "development") {
    throw new Error("Failed to prefetch images");
  }
  const { images } = await imageResponse.json();
  return images as PrefetchImage[];
}

const seen = new Set<string>();
const imageCache = new Map<string, PrefetchImage[]>();
const permissionsPrefetched = new Set<string>(); // Track if permissions have been prefetched

function prefetchPermissions() {
  // Only prefetch once per session
  if (permissionsPrefetched.has('admin')) {
    return;
  }
  permissionsPrefetched.add('admin');
  // Prefetch permissions in background (non-blocking)
  fetch('/api/user/permissions', { credentials: 'include' }).catch(() => {
    // Ignore errors - this is just a prefetch
  });
}

export const Link: typeof NextLink = (({ children, ...props }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (props.prefetch === false) return;

    const linkElement = linkRef.current;
    if (!linkElement) return;

    const href = String(props.href);
    const isAdminRoute = href.startsWith('/admin');

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          prefetchTimeoutRef.current = setTimeout(async () => {
            router.prefetch(href);
            await sleep(0);

            if (!imageCache.has(href)) {
              void prefetchImages(href).then((images) => {
                imageCache.set(href, images);
              }, console.error);
            }

            // Prefetch permissions if this is an admin route
            if (isAdminRoute) {
              prefetchPermissions();
            }

            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeoutRef.current) {
          clearTimeout(prefetchTimeoutRef.current);
          prefetchTimeoutRef.current = null;
        }
      },
      { rootMargin: "0px", threshold: 0.1 },
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [props.href, props.prefetch, router]);

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onMouseEnter={() => {
        const href = String(props.href);
        const isAdminRoute = href.startsWith('/admin');
        
        router.prefetch(href);
        const images = imageCache.get(href) || [];
        for (const image of images) {
          prefetchImage(image);
        }
        
        // Prefetch permissions API if navigating to admin routes
        // This makes admin navigation faster
        if (isAdminRoute) {
          prefetchPermissions();
        }
      }}
      onMouseDown={(e) => {
        const url = new URL(String(props.href), window.location.href);
        if (
          url.origin === window.location.origin &&
          e.button === 0 &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.push(String(props.href));
        }
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}) as typeof NextLink;

function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy" || seen.has(image.srcset)) {
    return;
  }
  const img = new Image();
  img.decoding = "async";
  // fetchPriority is a valid HTMLImageElement property (experimental)
  if ('fetchPriority' in img) {
    // @ts-expect-error - fetchPriority is experimental and not in all TypeScript versions
    img.fetchPriority = "low";
  }
  img.sizes = image.sizes;
  seen.add(image.srcset);
  img.srcset = image.srcset;
  img.src = image.src;
  img.alt = image.alt;
}
