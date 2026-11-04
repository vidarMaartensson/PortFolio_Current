import React, { useEffect, useRef, useState } from "react";
import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";

interface PausableGifProps {
  src: string;
  alt: string;
  className?: string;
}

// Browsers can't pause an <img> GIF, so we decode the frames and play them
// on a canvas ourselves. Until decoding is done the plain <img> is shown.
export const PausableGif: React.FC<PausableGifProps> = ({
  src,
  alt,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    (async () => {
      const buffer = await (await fetch(src)).arrayBuffer();
      const gif = parseGIF(buffer);
      const frames = decompressFrames(gif, true);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (cancelled || !canvas || !ctx || frames.length === 0) return;

      canvas.width = gif.lsd.width;
      canvas.height = gif.lsd.height;

      // Scratch canvas for drawing each frame's patch (keeps transparency, unlike putImageData)
      const patchCanvas = document.createElement("canvas");
      const patchCtx = patchCanvas.getContext("2d")!;

      let index = 0;
      let previous: ParsedFrame | undefined;
      let restoreData: ImageData | undefined;

      const drawFrame = () => {
        const frame = frames[index];

        if (index === 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else if (previous?.disposalType === 2) {
          const { left, top, width, height } = previous.dims;
          ctx.clearRect(left, top, width, height);
        } else if (previous?.disposalType === 3 && restoreData) {
          ctx.putImageData(restoreData, 0, 0);
        }

        if (frame.disposalType === 3) {
          restoreData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        const { left, top, width, height } = frame.dims;
        patchCanvas.width = width;
        patchCanvas.height = height;
        patchCtx.putImageData(
          new ImageData(new Uint8ClampedArray(frame.patch), width, height),
          0,
          0,
        );
        ctx.drawImage(patchCanvas, left, top);

        previous = frame;
        index = (index + 1) % frames.length;
      };

      const tick = () => {
        if (cancelled) return;
        if (!pausedRef.current) drawFrame();
        const delay = previous?.delay || 100;
        timer = window.setTimeout(tick, pausedRef.current ? 100 : delay);
      };

      drawFrame();
      setIsReady(true);
      timer = window.setTimeout(tick, previous?.delay || 100);
    })().catch(() => {
      // Decoding failed – the plain <img> keeps playing as a fallback
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [src]);

  const togglePaused = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  };

  return (
    <div className="pgif">
      {!isReady && <img src={src} alt={alt} className={className} />}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className={className}
        hidden={!isReady}
      />
      {isReady && (
        <button
          type="button"
          onClick={togglePaused}
          aria-label={isPaused ? "Play demo" : "Pause demo"}
          className={isPaused ? "pgif__toggle is-paused" : "pgif__toggle"}
        >
          <span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
};
