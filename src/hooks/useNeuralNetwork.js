import { useEffect, useRef, useCallback } from 'react';

export function useNeuralNetwork(isThinking = false) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const thinkingRef = useRef(false);

  thinkingRef.current = isThinking;

  const triggerClickPulse = useCallback(() => {
    nodesRef.current.forEach(node => {
      node.pulseScale = 1.5;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isMobile = window.innerWidth < 768;
    const NODE_COUNT = isMobile ? 25 : 50;
    const CONNECTION_DISTANCE = isMobile ? 100 : 130;
    const MAX_CONNECTIONS = 4;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    nodesRef.current = Array.from({ length: NODE_COUNT }, () => {
      const rand = Math.random();
      const type = rand < 0.2 ? 'active' : rand < 0.5 ? 'secondary' : 'dormant';
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1,
        depth: Math.random(),
        type,
        pulseScale: 1,
        brightness: 1,
      };
    });

    const pulses = [];
    let pulseTimer = 0;
    const pulseInterval = 180;

    const addPulse = () => {
      const nodes = nodesRef.current;
      for (let attempts = 0; attempts < 8; attempts++) {
        const a = Math.floor(Math.random() * nodes.length);
        const b = Math.floor(Math.random() * nodes.length);
        const dx = nodes[a].x - nodes[b].x;
        const dy = nodes[a].y - nodes[b].y;
        if (Math.sqrt(dx * dx + dy * dy) < CONNECTION_DISTANCE) {
          pulses.push({ a, b, t: 0, duration: 60 });
          break;
        }
      }
    };

    let frameCount = 0;
    const draw = () => {
      frameCount++;
      // On mobile, render every other frame to save CPU
      if (isMobile && frameCount % 2 !== 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const thinking = thinkingRef.current;

      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        node.brightness = dist < 120 ? 1 + (1 - dist / 120) : 1;

        if (node.pulseScale > 1) node.pulseScale = Math.max(1, node.pulseScale - 0.03);
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          if (connections >= MAX_CONNECTIONS) break;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / CONNECTION_DISTANCE) * (thinking ? 0.45 : 0.25);
            ctx.strokeStyle = `rgba(0,255,156,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            connections++;
          }
        }
      }

      // Signal pulses
      pulseTimer++;
      const currentInterval = thinking ? pulseInterval / 5 : pulseInterval;
      if (pulseTimer >= currentInterval) { addPulse(); pulseTimer = 0; }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t++;
        if (p.t >= p.duration) { pulses.splice(i, 1); continue; }
        const progress = p.t / p.duration;
        const na = nodes[p.a];
        const nb = nodes[p.b];
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00FF9C';
        ctx.fillStyle = '#00FF9C';
        ctx.beginPath();
        ctx.arc(na.x + (nb.x - na.x) * progress, na.y + (nb.y - na.y) * progress, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw nodes
      nodes.forEach(node => {
        const scale = node.pulseScale * (node.brightness > 1 ? 1.4 : 1);
        const r = node.radius * scale * (1 - node.depth * 0.4);
        let color;
        if (node.type === 'active') color = `rgba(0,255,156,${(0.7 + node.brightness * 0.2) * (thinking ? 1.2 : 1)})`;
        else if (node.type === 'secondary') color = `rgba(123,97,255,${0.5 * (thinking ? 1.3 : 1)})`;
        else color = `rgba(255,255,255,${0.08 + (node.brightness - 1) * 0.25})`;

        if (node.type === 'active' || node.brightness > 1) {
          ctx.save();
          ctx.shadowBlur = node.brightness > 1 ? 10 : 5;
          ctx.shadowColor = node.type === 'secondary' ? '#7B61FF' : '#00FF9C';
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const handleClick = () => triggerClickPulse();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [triggerClickPulse]);

  return { canvasRef };
}
