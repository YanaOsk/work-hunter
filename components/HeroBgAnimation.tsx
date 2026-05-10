"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number; y: number; vx: number; vy: number;
  r: number; type: "person" | "job"; opacity: number;
}

export default function HeroBgAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;
    let nodes: Node[] = [];

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      // Re-scatter nodes on resize
      nodes = Array.from({ length: 22 }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: i < 12 ? Math.random() * 3.5 + 2.5 : Math.random() * 2.5 + 1.5,
        type: (i < 12 ? "person" : "job") as "person" | "job",
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.22,
        opacity: Math.random() * 0.22 + 0.06,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw connection lines between person↔job nodes that are close
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].type === nodes[j].type) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.09;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(94,106,210,${alpha})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // Draw nodes and move them
      nodes.forEach((n) => {
        if (n.type === "person") {
          // Circle: profile node
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(94,106,210,${n.opacity})`;
          ctx.fill();
          // Outer ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(94,106,210,${n.opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Rounded rect: job card
          const rw = n.r * 7;
          const rh = n.r * 4.5;
          const rx = n.x - rw / 2;
          const ry = n.y - rh / 2;
          const radius = 3;
          ctx.beginPath();
          ctx.moveTo(rx + radius, ry);
          ctx.lineTo(rx + rw - radius, ry);
          ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
          ctx.lineTo(rx + rw, ry + rh - radius);
          ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
          ctx.lineTo(rx + radius, ry + rh);
          ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
          ctx.lineTo(rx, ry + radius);
          ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
          ctx.closePath();
          ctx.fillStyle = `rgba(74,222,128,${n.opacity * 0.55})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(74,222,128,${n.opacity * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Move
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
      aria-hidden
    />
  );
}
