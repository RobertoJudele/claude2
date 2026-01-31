// src/components/VideoBanner.tsx
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

export default function VideoBanner() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Don't waste data if user prefers reduced data/motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const prefersReducedData = (navigator as any).connection?.saveData === true;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!el) return;
        if (entry.isIntersecting && !prefersReducedData) {
          // Trigger actual loading as it enters view
          // (preload="metadata" keeps it light until now)
          el.load();
          if (!prefersReducedMotion) {
            el.play().catch(() => {
              /* user gesture required on some browsers */
            });
          }
        } else {
          // Pause when out of view (saves CPU/bandwidth)
          el.pause();
        }
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        py: 2,
        bgcolor: "black",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          aspectRatio: "16 / 9",
          position: "relative",
          bgcolor: "black",
          overflow: "hidden",
          borderRadius: 1,
        }}
      >
        <Box
          component="video"
          ref={ref}
          muted
          loop
          playsInline
          // keep controls if you want; remove if this is a hero anim
          controls={false}
          preload="metadata"
          poster="/images/FB_upscaled.png"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain", // no cropping; keep full frame
            display: "block",
            backgroundColor: "black",
          }}
        >
          {/* Mobile-first 720p (only loads if media query matches) */}
          <source
            src="/video/promo_720p.webm"
            type="video/webm"
            media="(max-width: 768px)"
          />
          <source
            src="/video/promo_720p.mp4"
            type="video/mp4"
            media="(max-width: 768px)"
          />
          {/* Default 1080p for larger screens */}
          <source src="/video/promo_1080p.webm" type="video/webm" />
          <source src="/video/promo_1080p.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </Box>
      </Box>
    </Box>
  );
}
