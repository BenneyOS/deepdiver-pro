import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface ParticleBurstProps {
  active: boolean;
  color?: string;
  count?: number;
}

export function ParticleBurst({ active, color = "var(--reward)", count = 8 }: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        id: i,
        x: Math.cos(angle) * 30,
        y: Math.sin(angle) * 30,
        size: 4 + Math.random() * 4,
        delay: Math.random() * 100,
      };
    });
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 600);
    return () => clearTimeout(timer);
  }, [active, count]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="animate-particle-burst absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            transform: `translate(${p.x}px, ${p.y}px)`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
