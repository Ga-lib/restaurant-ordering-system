import { useRef } from "react";
import { useBoomerangVideo } from "../../hooks/useBoomerangVideo";

function PageBackground({ type, src, opacity = 0.35 }) {
  const videoRef = useRef(null);
  useBoomerangVideo(type === "video" ? videoRef : { current: null });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {type === "video" ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ opacity }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <img src={src} alt="" className="w-full h-full object-cover" style={{ opacity }} />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: "var(--bg-app)", opacity: 0.55 }} />
    </div>
  );
}

export default PageBackground;