import React, { useEffect, useRef } from 'react';
import './BackgroundCanvas.css';

/**
 * A lightweight canvas that draws a subtle moving gradient to serve as a
 * glass‑morphic background for the entire app. The animation is performed with
 * requestAnimationFrame and keeps CPU usage low.
 */
const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setSize();
    window.addEventListener('resize', setSize);

    let animationFrame: number;
    const draw = (time: number) => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const gradient = ctx.createLinearGradient(
        Math.sin(time * 0.0002) * width,
        Math.cos(time * 0.0003) * height,
        Math.cos(time * 0.0005) * width,
        Math.sin(time * 0.0004) * height,
      );
      // Colors are chosen to match the dark‑mode glass aesthetic
      gradient.addColorStop(0, 'rgba(30,30,60,0.7)');
      gradient.addColorStop(0.5, 'rgba(45,55,90,0.5)');
      gradient.addColorStop(1, 'rgba(30,30,60,0.7)');

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="background-canvas"
      aria-hidden="true"
    />
  );
};

export default BackgroundCanvas;
