import { useEffect } from "react";

export function useBoomerangVideo(videoRef) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let reverseFrameId = null;

    function reverseStep() {
      if (!video) return;
      if (video.currentTime <= 0.05) {
        video.currentTime = 0;
        video.play().catch(() => {});
        return;
      }
      video.currentTime = Math.max(0, video.currentTime - 0.032); // ~30fps scrub
      reverseFrameId = requestAnimationFrame(reverseStep);
    }

    function handleEnded() {
      video.pause();
      reverseFrameId = requestAnimationFrame(reverseStep);
    }

    video.loop = false; // we control looping manually now
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
      if (reverseFrameId) cancelAnimationFrame(reverseFrameId);
    };
  }, [videoRef]);
}