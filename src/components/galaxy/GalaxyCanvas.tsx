import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Subject, Goal, StudySession } from '../../types';
import { ProgressionService } from '../../services/progression';
import { PlanetTooltip } from './PlanetTooltip';
import { ZoomIn, ZoomOut, RotateCcw, Compass, Flame, AlertTriangle, Moon, Sparkles } from 'lucide-react';

export interface GalaxyCanvasProps {
  subjects: Subject[];
  goals: Goal[];
  sessions: StudySession[];
  streakCount: number;
  activeFilter: 'ALL' | 'ACTIVE' | 'HIGH_MOMENTUM' | 'DORMANT' | 'NEAR_DEADLINE';
  onFilterChange: (filter: 'ALL' | 'ACTIVE' | 'HIGH_MOMENTUM' | 'DORMANT' | 'NEAR_DEADLINE') => void;
  onSelectSubject: (subjectId: string) => void;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  layer: number; // 1 (far), 2 (mid), 3 (near)
}

interface Comet {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
}

export const GalaxyCanvas: React.FC<GalaxyCanvasProps> = ({
  subjects,
  goals,
  sessions,
  streakCount,
  activeFilter,
  onFilterChange,
  onSelectSubject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover state
  const [hoveredSubject, setHoveredSubject] = useState<Subject | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const starsRef = useRef<Star[]>([]);
  const cometsRef = useRef<Comet[]>([]);

  // Filter subjects based on active filter
  const visibleSubjects = subjects.filter((subj) => {
    if (subj.isArchived) return false;
    const momentum = ProgressionService.calculateSubjectMomentum(subj, sessions, goals);
    if (activeFilter === 'HIGH_MOMENTUM') return momentum === 'HIGH';
    if (activeFilter === 'DORMANT') return momentum === 'DORMANT';
    if (activeFilter === 'NEAR_DEADLINE') return momentum === 'NEEDS_ATTENTION';
    if (activeFilter === 'ACTIVE') return momentum === 'HIGH' || momentum === 'GROWING';
    return true;
  });

  // Initialize multi-depth parallax starfield
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 320; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2600,
        y: (Math.random() - 0.5) * 2600,
        size: Math.random() * 2.2 + 0.3,
        alpha: Math.random() * 0.85 + 0.15,
        speed: Math.random() * 0.02 + 0.005,
        layer: Math.floor(Math.random() * 3) + 1,
      });
    }
    starsRef.current = stars;

    const comets: Comet[] = [];
    const cometNum = Math.min(4, Math.max(1, Math.floor(streakCount / 2)));
    for (let c = 0; c < cometNum; c++) {
      comets.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 1200,
        length: 90 + c * 35,
        speed: 1.6 + Math.random() * 0.8,
        angle: Math.PI / 4,
      });
    }
    cometsRef.current = comets;
  }, [streakCount]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

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

      // 1. Background
      ctx.fillStyle = '#050509';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2 + pan.x;
      const centerY = height / 2 + pan.y;

      // 2. Multi-layered Nebulae Glows
      const nebula1 = ctx.createRadialGradient(
        centerX - 240 * zoom,
        centerY - 180 * zoom,
        10,
        centerX - 240 * zoom,
        centerY - 180 * zoom,
        500 * zoom
      );
      nebula1.addColorStop(0, 'rgba(168, 85, 247, 0.14)');
      nebula1.addColorStop(1, 'rgba(5, 5, 9, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(
        centerX + 280 * zoom,
        centerY + 200 * zoom,
        10,
        centerX + 280 * zoom,
        centerY + 200 * zoom,
        550 * zoom
      );
      nebula2.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
      nebula2.addColorStop(1, 'rgba(5, 5, 9, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // 3. Parallax Starfield
      starsRef.current.forEach((star) => {
        star.alpha += Math.sin(Date.now() * star.speed) * 0.008;
        const parallaxFactor = 0.5 + star.layer * 0.25;
        const starX = width / 2 + (pan.x * parallaxFactor) + star.x * zoom;
        const starY = height / 2 + (pan.y * parallaxFactor) + star.y * zoom;

        if (starX >= -10 && starX <= width + 10 && starY >= -10 && starY <= height + 10) {
          ctx.beginPath();
          ctx.arc(starX, starY, Math.max(0.2, star.size * zoom), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(241, 245, 249, ${Math.max(0.1, Math.min(1, star.alpha))})`;
          ctx.fill();
        }
      });

      // 4. Comets
      cometsRef.current.forEach((comet) => {
        comet.x += Math.cos(comet.angle) * comet.speed;
        comet.y += Math.sin(comet.angle) * comet.speed;

        if (comet.x > 1200 || comet.y > 1200) {
          comet.x = -1200;
          comet.y = -600 - Math.random() * 400;
        }

        const startX = centerX + comet.x * zoom;
        const startY = centerY + comet.y * zoom;
        const endX = startX - Math.cos(comet.angle) * comet.length * zoom;
        const endY = startY - Math.sin(comet.angle) * comet.length * zoom;

        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        grad.addColorStop(0.3, 'rgba(168, 85, 247, 0.4)');
        grad.addColorStop(1, 'rgba(5, 5, 9, 0)');

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();
      });

      // 5. Central Galaxy Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 16 * zoom, 0, Math.PI * 2);
      const sunGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 20 * zoom);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.5, '#c084fc');
      sunGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // 6. Orbit Rings & Planets
      visibleSubjects.forEach((subj, idx) => {
        const stats = ProgressionService.calculateSubjectStats(subj, sessions, goals);
        const radius = (subj.orbitRadius || 160 + idx * 80) * zoom;
        const angleRad = ((subj.orbitAngle || 45 + idx * 70) * Math.PI) / 180;

        // Draw Orbit Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        const planetX = centerX + radius * Math.cos(angleRad);
        const planetY = centerY + radius * Math.sin(angleRad);
        const baseSize = subj.size || 38;
        const planetRadius = Math.max(14, (baseSize / 2) * zoom);

        const isHovered = hoveredSubject?.id === subj.id;

        // Momentum Glow Effects
        let momentumGlowColor = subj.color;
        let momentumAlpha = 0.4 + (stats.percentage / 100) * 0.4;

        if (stats.momentum === 'HIGH') {
          momentumGlowColor = '#f59e0b'; // Gold flame aura
          momentumAlpha = 0.7;
        } else if (stats.momentum === 'NEEDS_ATTENTION') {
          momentumGlowColor = '#ef4444'; // Red warning aura
          momentumAlpha = 0.8;
        } else if (stats.momentum === 'DORMANT') {
          momentumAlpha = 0.2;
        }

        const glowRadius = planetRadius * (1.8 + stats.percentage / 100);
        const atmGrad = ctx.createRadialGradient(planetX, planetY, planetRadius * 0.8, planetX, planetY, glowRadius);
        atmGrad.addColorStop(0, momentumGlowColor);
        atmGrad.addColorStop(1, 'rgba(5, 5, 9, 0)');

        ctx.beginPath();
        ctx.arc(planetX, planetY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = atmGrad;
        ctx.globalAlpha = momentumAlpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Draw Rings for 75%+ or Mastered
        if (stats.percentage >= 75) {
          ctx.save();
          ctx.translate(planetX, planetY);
          ctx.rotate(0.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, planetRadius * 2.2, planetRadius * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = subj.secondaryColor || subj.color;
          ctx.lineWidth = 2 * zoom;
          ctx.globalAlpha = 0.6;
          ctx.stroke();
          ctx.restore();
        }

        // Main Planet Body
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(
          planetX - planetRadius * 0.3,
          planetY - planetRadius * 0.3,
          planetRadius * 0.1,
          planetX,
          planetY,
          planetRadius
        );
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.4, subj.color);
        bodyGrad.addColorStop(1, '#090912');
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Border outline
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isHovered ? 2.5 : 1;
        ctx.stroke();

        // Orbiting Unit Moons
        subj.units.forEach((unit, uIdx) => {
          const moonOrbit = planetRadius + 14 * zoom + uIdx * 8 * zoom;
          const moonAngle = (Date.now() * 0.0005 * (uIdx % 2 === 0 ? 1 : -1) + uIdx * 1.5);
          const moonX = planetX + moonOrbit * Math.cos(moonAngle);
          const moonY = planetY + moonOrbit * Math.sin(moonAngle);

          const moonStats = ProgressionService.getUnitConstellationStatus(unit);

          ctx.beginPath();
          ctx.arc(moonX, moonY, Math.max(2, 3 * zoom), 0, Math.PI * 2);
          ctx.fillStyle = moonStats.isDiscovered ? '#f59e0b' : 'rgba(203, 213, 225, 0.7)';
          ctx.fill();
        });

        // Subject Label & Momentum Icon
        ctx.font = `${Math.max(10, Math.round(12 * zoom))}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
        ctx.textAlign = 'center';

        const labelText = stats.momentum === 'HIGH' ? `🔥 ${subj.name}` : stats.momentum === 'NEEDS_ATTENTION' ? `⚠ ${subj.name}` : subj.name;
        ctx.fillText(labelText, planetX, planetY + planetRadius + 16 * zoom);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [visibleSubjects, sessions, goals, zoom, pan, hoveredSubject]);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    let hitSubject: Subject | null = null;
    let hitPos = { x: 0, y: 0 };

    visibleSubjects.forEach((subj, idx) => {
      const radius = (subj.orbitRadius || 160 + idx * 80) * zoom;
      const angleRad = ((subj.orbitAngle || 45 + idx * 70) * Math.PI) / 180;
      const planetX = centerX + radius * Math.cos(angleRad);
      const planetY = centerY + radius * Math.sin(angleRad);

      const baseSize = subj.size || 38;
      const planetRadius = Math.max(14, (baseSize / 2) * zoom);

      const dist = Math.hypot(x - planetX, y - planetY);
      if (dist <= planetRadius + 10) {
        hitSubject = subj;
        hitPos = { x: planetX, y: planetY };
      }
    });

    if (hitSubject) {
      setHoveredSubject(hitSubject);
      setTooltipPos(hitPos);
    } else {
      setHoveredSubject(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredSubject) {
      onSelectSubject(hoveredSubject.id);
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(2.5, Math.max(0.5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-140px)] min-h-[500px] overflow-hidden select-none bg-[#050509]">
      {/* Top Compact Filter Bar */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-1 bg-[#10101a]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl text-xs">
        {[
          { id: 'ALL', label: 'All Planets', icon: <Compass className="w-3.5 h-3.5" /> },
          { id: 'ACTIVE', label: 'Active', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'HIGH_MOMENTUM', label: 'High Momentum', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'DORMANT', label: 'Dormant', icon: <Moon className="w-3.5 h-3.5 text-slate-400" /> },
          { id: 'NEAR_DEADLINE', label: 'Needs Attention', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeFilter === f.id
                ? 'bg-purple-600 text-white shadow border border-purple-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f.icon}
            <span className="hidden sm:inline">{f.label}</span>
          </button>
        ))}
      </div>

      {/* 2D Galaxy Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handlePointerMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Planet Hover Tooltip */}
      {hoveredSubject && (
        <PlanetTooltip
          subject={hoveredSubject}
          x={tooltipPos.x}
          y={tooltipPos.y}
          onOpenWorld={onSelectSubject}
        />
      )}

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-[#10101a]/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
          title="Zoom In"
          className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
          title="Zoom Out"
          className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-white/10" />
        <button
          onClick={resetView}
          title="Reset Galaxy View"
          className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
