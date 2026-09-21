import React, { useEffect, useRef } from 'react';

export const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Retro Black & White Monochrome Particles
    const particleCount = 65;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.4 + 0.2,
    }));

    // Floating 3D Monochrome Wireframe Glyphs
    const glyphCount = 6;
    const glyphs = Array.from({ length: glyphCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 25 + 15,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.01,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Retro Monochrome Spotlight
      const spotlight = ctx.createRadialGradient(mx, my, 0, mx, my, 480);
      spotlight.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      spotlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
      spotlight.addColorStop(1, 'transparent');
      ctx.fillStyle = spotlight;
      ctx.fillRect(0, 0, width, height);

      // Render Floating 3D Monochrome Octahedrons
      glyphs.forEach((g) => {
        g.x += g.vx;
        g.y += g.vy;
        g.rot += g.vrot;

        if (g.x < -50) g.x = width + 50;
        if (g.x > width + 50) g.x = -50;
        if (g.y < -50) g.y = height + 50;
        if (g.y > height + 50) g.y = -50;

        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rot);

        ctx.beginPath();
        ctx.moveTo(0, -g.size);
        ctx.lineTo(g.size * 0.6, 0);
        ctx.lineTo(0, g.size);
        ctx.lineTo(-g.size * 0.6, 0);
        ctx.closePath();

        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-g.size * 0.6, 0);
        ctx.lineTo(g.size * 0.6, 0);
        ctx.stroke();

        ctx.restore();
      });

      // Render & Connect Monochrome Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = (1 - dist / 120) * 0.08;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#000000]">
      {/* Retro Dot Matrix / Phosphor Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />

      {/* Retro Horizontal CRT Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40" />

      {/* Subtle Vignette Mask */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_40%,#000_60%,transparent_100%)]" />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
