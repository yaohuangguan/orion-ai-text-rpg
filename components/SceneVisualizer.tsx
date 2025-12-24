import React, { useEffect, useRef } from 'react';

interface SceneVisualizerProps {
  theme: string;
  inCombat: boolean;
}

class Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  canvasWidth: number;
  canvasHeight: number;
  life: number;
  maxLife: number;

  constructor(w: number, h: number, theme: string, inCombat: boolean) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.reset(theme, inCombat, true);
  }

  reset(theme: string, inCombat: boolean, randomY = false) {
    this.x = Math.random() * this.canvasWidth;
    this.life = 0;
    this.maxLife = 100 + Math.random() * 100;

    if (theme.toLowerCase().includes('cyberpunk')) {
      // Digital Rain / Neon
      this.y = randomY ? Math.random() * this.canvasHeight : -10;
      this.speed = (Math.random() * 5 + 2) * (inCombat ? 3 : 1);
      this.size = Math.random() * 15 + 10;
      const colors = inCombat 
        ? ['#ef4444', '#b91c1c', '#991b1b'] // Red in combat
        : ['#06b6d4', '#22d3ee', '#0891b2', '#c084fc']; // Cyan/Purple normally
      this.color = colors[Math.floor(Math.random() * colors.length)];
    } else if (theme.toLowerCase().includes('medieval') || theme.toLowerCase().includes('fantasy')) {
      // Floating Embers (Upwards)
      this.y = randomY ? Math.random() * this.canvasHeight : this.canvasHeight + 10; 
      this.speed = (Math.random() * 1 + 0.5) * (inCombat ? 3 : 1);
      this.size = Math.random() * 3 + 1;
      const colors = inCombat
        ? ['#ef4444', '#fca5a5', '#fee2e2'] // Bright red/white sparks
        : ['#fbbf24', '#f59e0b', '#d97706', '#ffffff']; // Gold/Orange embers
      this.color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      // Default / Apocalypse (Ash down)
      this.y = randomY ? Math.random() * this.canvasHeight : -10;
      this.speed = Math.random() * 2 + 0.5;
      this.size = Math.random() * 3 + 1;
      this.color = inCombat ? '#7f1d1d' : '#52525b';
    }
  }

  update(theme: string, inCombat: boolean) {
    if (theme.toLowerCase().includes('medieval') || theme.toLowerCase().includes('fantasy')) {
      this.y -= this.speed; // Float up
      this.x += Math.sin(this.life / 20) * 0.5; // Slight sway
    } else {
      this.y += this.speed; // Fall down
    }
    
    this.life++;

    if (this.y > this.canvasHeight + 20 || this.y < -20 || this.life > this.maxLife) {
      this.reset(theme, inCombat);
    }
  }

  draw(ctx: CanvasRenderingContext2D, theme: string) {
    ctx.globalAlpha = Math.max(0, 1 - this.life / this.maxLife);
    ctx.fillStyle = this.color;
    
    if (theme.toLowerCase().includes('cyberpunk')) {
      // Draw characters or lines
      ctx.font = `${this.size}px monospace`;
      ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), this.x, this.y);
    } else {
      // Draw circles
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

const SceneVisualizer: React.FC<SceneVisualizerProps> = ({ theme, inCombat }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Re-init particles on resize
      const count = window.innerWidth < 768 ? 30 : 80;
      particles.current = Array.from({ length: count }).map(() => 
        new Particle(canvas.width, canvas.height, theme, inCombat)
      );
    };

    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dynamic Background Tint
      if (inCombat) {
        ctx.fillStyle = 'rgba(50, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      particles.current.forEach(p => {
        p.update(theme, inCombat);
        p.draw(ctx, theme);
      });

      // Combat Scanlines - ONLY in Cyberpunk
      if (inCombat && theme.includes('cyberpunk')) {
         ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.05})`;
         ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 2);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [theme, inCombat]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    />
  );
};

export default SceneVisualizer;
