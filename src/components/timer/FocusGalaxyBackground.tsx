import React, { useRef, useEffect } from 'react';
import type { Subject, Topic } from '../../types';

export interface FocusGalaxyBackgroundProps {
  subject?: Subject;
  currentTopicId?: string;
  reducedMotion?: boolean;
}

export const FocusGalaxyBackground: React.FC<FocusGalaxyBackgroundProps> = ({
  subject,
  currentTopicId,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Generate static stars array
    const starCount = 180;
    const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.008 + 0.002,
      });
    }

    // Find current unit topics for constellation map
    let constellationTopics: Topic[] = [];
    if (subject) {
      subject.units.forEach((unit) => {
        if (unit.topics.some((t) => t.id === currentTopicId)) {
          constellationTopics = unit.topics;
        }
      });
      if (constellationTopics.length === 0 && subject.units.length > 0) {
        constellationTopics = subject.units[0].topics;
      }
    }

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Space background
      ctx.fillStyle = '#050509';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 2. Faint Subject Nebula Gradient
      const colorHex = subject?.color || '#a855f7';
      const nebulaGrad = ctx.createRadialGradient(
        centerX,
        centerY - 40,
        10,
        centerX,
        centerY - 40,
        Math.max(width, height) * 0.65
      );
      nebulaGrad.addColorStop(0, `${colorHex}1a`);
      nebulaGrad.addColorStop(0.5, `${colorHex}08`);
      nebulaGrad.addColorStop(1, 'rgba(5, 5, 9, 0)');

      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Ambient Starfield
      stars.forEach((star) => {
        if (!reducedMotion) {
          star.alpha += Math.sin(Date.now() * star.speed) * 0.005;
        }

        const sx = star.x * width;
        const sy = star.y * height;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 245, 249, ${Math.max(0.1, Math.min(0.9, star.alpha))})`;
        ctx.fill();
      });

      // 4. Subtle Subject Planet Atmosphere (Top-Left or Center Backdrop)
      if (subject) {
        const planetX = width * 0.2;
        const planetY = height * 0.25;
        const planetRadius = 48;

        const atmGrad = ctx.createRadialGradient(
          planetX,
          planetY,
          planetRadius * 0.8,
          planetX,
          planetY,
          planetRadius * 2.2
        );
        atmGrad.addColorStop(0, `${colorHex}33`);
        atmGrad.addColorStop(1, 'rgba(5, 5, 9, 0)');

        ctx.beginPath();
        ctx.arc(planetX, planetY, planetRadius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = atmGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(
          planetX - 12,
          planetY - 12,
          5,
          planetX,
          planetY,
          planetRadius
        );
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.5, colorHex);
        bodyGrad.addColorStop(1, '#090912');
        ctx.fillStyle = bodyGrad;
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 5. Constellation Map Overlay behind timer
      if (constellationTopics.length > 0) {
        const topicPositions: { x: number; y: number; topic: Topic }[] = [];
        const count = constellationTopics.length;
        const constRadius = Math.min(width, height) * 0.32;

        constellationTopics.forEach((topic, idx) => {
          const angle = (idx / count) * Math.PI * 1.6 - Math.PI * 0.8;
          const px = centerX + constRadius * Math.cos(angle);
          const py = centerY - 20 + constRadius * Math.sin(angle) * 0.6;
          topicPositions.push({ x: px, y: py, topic });
        });

        // Draw Constellation Lines
        ctx.beginPath();
        topicPositions.forEach((pos, idx) => {
          if (idx === 0) ctx.moveTo(pos.x, pos.y);
          else ctx.lineTo(pos.x, pos.y);
        });
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Constellation Topic Stars
        topicPositions.forEach(({ x, y, topic }) => {
          const isCurrent = topic.id === currentTopicId;
          const isCompleted = topic.status === 'COMPLETED' || topic.status === 'MASTERED';

          ctx.beginPath();
          if (isCurrent) {
            // Pulse current topic star
            const pulse = reducedMotion ? 1 : 1 + Math.sin(Date.now() * 0.004) * 0.25;
            const currentR = 7 * pulse;

            const glowGrad = ctx.createRadialGradient(x, y, 2, x, y, currentR * 3);
            glowGrad.addColorStop(0, colorHex);
            glowGrad.addColorStop(1, 'rgba(5, 5, 9, 0)');
            ctx.arc(x, y, currentR * 3, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, currentR, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = colorHex;
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (isCompleted) {
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
          } else {
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.fill();
          }
        });
      }

      ctx.restore();

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [subject, currentTopicId, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none block"
    />
  );
};
