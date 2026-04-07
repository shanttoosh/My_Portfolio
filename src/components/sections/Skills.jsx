import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { skillCategories } from '../../data/skills';
import SectionLabel from '../ui/SectionLabel';
import { hexToRgb } from '../../utils/colors';

// ─── Skill → Project mapping ────────────────────────────────
const SKILL_PROJECTS = {
  'LangGraph': ['NL2SQL Agent'],
  'LangChain': ['NL2SQL Agent', 'Lease Doc Chat', 'Shopify Analytics'],
  'FastAPI': ['NL2SQL Agent', 'Shopify Analytics', 'Chunk Optimizer'],
  'PostgreSQL': ['NL2SQL Agent', 'Shopify Analytics'],
  'Groq API': ['NL2SQL Agent', 'n8n Pipeline'],
  'Claude API': ['NL2SQL Agent'],
  'FAISS': ['Lease Doc Chat', 'Chunk Optimizer'],
  'ChromaDB': ['Lease Doc Chat', 'Chunk Optimizer'],
  'sentence-transformers': ['Chunk Optimizer', 'Lease Doc Chat'],
  'React': ['NL2SQL Agent', 'Shopify Analytics'],
  'React & TypeScript': ['NL2SQL Agent', 'Shopify Analytics'],
  'Docker': ['NL2SQL Agent', 'Shopify Analytics', 'n8n Pipeline'],
  'n8n & Apify': ['n8n Pipeline'],
  'Python (FastAPI)': ['NL2SQL Agent', 'Lease Doc Chat', 'Chunk Optimizer'],
  'RAG Pipelines': ['Lease Doc Chat', 'Chunk Optimizer'],
  'NLP & Tokenization': ['NL2SQL Agent'],
  'LLM-as-a-Judge': ['NL2SQL Agent'],
  'Prompt Engineering': ['NL2SQL Agent', 'Lease Doc Chat'],
  'Gemini API': ['NL2SQL Agent'],
};

// Shorten category labels for the graph
const SHORT_LABELS = {
  'AI Engineering Core': 'AI / LLM',
  'LLM APIs & Vector DBs': 'Vector DBs',
  'Backend & Databases': 'Backend',
  'Data Science & Analytics': 'Data Science',
  'Frontend & Workflow Tools': 'Frontend',
};

// ─── D3 Skill Constellation ─────────────────────────────────
function SkillConstellation() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  const isMobile = dimensions.width < 768;
  const skillsPerCat = isMobile ? 2 : 4;
  const containerHeight = isMobile ? 300 : 420;

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerHeight]);

  // D3 simulation
  useEffect(() => {
    if (!svgRef.current || dimensions.width < 100) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Build nodes
    const nodes = [];
    const links = [];

    // Center node
    nodes.push({
      id: 'shanttoosh', label: 'S.AI', type: 'center',
      radius: isMobile ? 20 : 28, color: '#00FF9C',
    });

    // Category + skill nodes
    skillCategories.forEach(cat => {
      const shortLabel = SHORT_LABELS[cat.label] || cat.label;
      nodes.push({
        id: cat.id, label: shortLabel, type: 'category',
        color: cat.color, radius: isMobile ? 14 : 18,
      });
      links.push({ source: 'shanttoosh', target: cat.id });

      cat.skills.slice(0, skillsPerCat).forEach(skill => {
        const skillId = `${cat.id}-${skill.name}`;
        nodes.push({
          id: skillId, label: skill.name, type: 'skill',
          color: cat.color, categoryId: cat.id,
          radius: isMobile ? 7 : 10, level: skill.level,
        });
        links.push({ source: cat.id, target: skillId });
      });
    });

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        if (d.target.type === 'category') return isMobile ? 60 : 90;
        return isMobile ? 35 : 55;
      }).strength(0.8))
      .force('charge', d3.forceManyBody().strength(d => {
        if (d.type === 'center') return isMobile ? -300 : -600;
        if (d.type === 'category') return isMobile ? -100 : -200;
        return isMobile ? -40 : -80;
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.radius + (isMobile ? 4 : 8)));

    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 1);

    // Draw node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer');

    // Circles
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        const rgb = hexToRgb(d.color);
        if (d.type === 'center') return `rgba(${rgb},0.15)`;
        if (d.type === 'category') return `rgba(${rgb},0.12)`;
        return `rgba(${rgb},0.08)`;
      })
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => {
        if (d.type === 'center') return 2;
        if (d.type === 'category') return 1.5;
        return 1;
      })
      .attr('stroke-opacity', d => {
        if (d.type === 'center') return 1;
        if (d.type === 'category') return 0.7;
        return 0.5;
      });

    // Labels
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => {
        if (d.type === 'center') return 4;
        if (d.type === 'category') return d.radius + 14;
        return d.radius + 12;
      })
      .attr('font-family', "'JetBrains Mono', monospace")
      .attr('font-size', d => {
        if (d.type === 'center') return isMobile ? 10 : 12;
        if (d.type === 'category') return isMobile ? 8 : 9;
        return isMobile ? 7 : 8;
      })
      .attr('fill', d => {
        if (d.type === 'center') return '#00FF9C';
        if (d.type === 'category') return d.color;
        return 'rgba(148,163,184,0.7)';
      })
      .attr('pointer-events', 'none');

    // Tooltip hover
    const tooltip = tooltipRef.current;
    node
      .on('mouseenter', (event, d) => {
        // Brighten connected links
        link.attr('stroke', l => {
          if (l.source.id === d.id || l.target.id === d.id) return 'rgba(255,255,255,0.25)';
          return 'rgba(255,255,255,0.08)';
        });

        // Brighten node
        d3.select(event.currentTarget).select('circle')
          .attr('stroke-opacity', 1)
          .attr('r', d.radius + 2);

        // Show tooltip
        if (tooltip) {
          let tooltipText = d.label;
          if (d.type === 'skill') {
            const projects = SKILL_PROJECTS[d.label];
            if (projects) tooltipText = `Used in: ${projects.join(', ')}`;
            else tooltipText = `${d.label} · ${d.level || 'proficient'}`;
          } else if (d.type === 'category') {
            tooltipText = d.label;
          } else {
            tooltipText = 'Shanttoosh V · AI Developer';
          }
          tooltip.textContent = tooltipText;
          tooltip.style.display = 'block';
          tooltip.style.borderColor = d.color;

          const rect = containerRef.current.getBoundingClientRect();
          tooltip.style.left = `${event.clientX - rect.left + 10}px`;
          tooltip.style.top = `${event.clientY - rect.top - 30}px`;
        }
      })
      .on('mouseleave', (event, d) => {
        link.attr('stroke', 'rgba(255,255,255,0.08)');
        d3.select(event.currentTarget).select('circle')
          .attr('stroke-opacity', d.type === 'center' ? 1 : d.type === 'category' ? 0.7 : 0.5)
          .attr('r', d.radius);
        if (tooltip) tooltip.style.display = 'none';
      });

    // Drag behaviour
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    node.call(drag);

    // Tick
    let ticks = 0;
    simulation.on('tick', () => {
      ticks++;
      if (ticks > 300) { simulation.stop(); return; }

      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [dimensions, isMobile, skillsPerCat]);

  return (
    <div ref={containerRef} style={{
      position: 'relative', width: '100%', height: containerHeight,
      background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
      marginBottom: 16, overflow: 'hidden',
    }}>
      <svg ref={svgRef} width={dimensions.width} height={containerHeight} />
      <div ref={tooltipRef} style={{
        display: 'none', position: 'absolute',
        background: 'rgba(13,20,36,0.95)', border: '1px solid #00FF9C',
        padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11,
        color: '#E2E8F0', pointerEvents: 'none', zIndex: 20, whiteSpace: 'nowrap',
      }} />
    </div>
  );
}

// ─── Skill Pill ──────────────────────────────────────────────
function SkillPill({ skill, color }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        padding: '4px 10px',
        background: hovered ? `rgba(${hexToRgb(color)},0.1)` : 'rgba(5,8,16,0.6)',
        border: `1px solid ${hovered ? color : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `2px solid ${color}`,
        borderRadius: 0,
        color: hovered ? color : 'rgba(148,163,184,0.7)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      {skill.name}
    </div>
  );
}

// ─── Skills Section ──────────────────────────────────────────
export default function Skills() {
  return (
    <section id="skills" style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SectionLabel>SKILLS.MAP</SectionLabel>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#E2E8F0' }}>
            Tech{' '}
            <span style={{ color: '#22D3EE', textShadow: '0 0 30px rgba(34,211,238,0.4)' }}>Stack</span>
          </h2>
        </motion.div>

        {/* D3 Constellation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <SectionLabel>EXPLORE THE STACK</SectionLabel>
          </div>
          <SkillConstellation />
          <div style={{
            textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(148,163,184,0.4)', marginBottom: 32,
          }}>
            Hover any node to explore · Drag to rearrange
          </div>
        </motion.div>

        {/* Skills grouped by category */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {skillCategories.map((cat, ci) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: ci * 0.08 }}
              style={{
                background: 'rgba(13,20,36,0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 0,
                padding: '20px',
                borderTop: `2px solid ${cat.color}`,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: cat.color, letterSpacing: '0.15em', marginBottom: 14, textTransform: 'uppercase' }}>
                {cat.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cat.skills.map(skill => (
                  <SkillPill key={skill.name} skill={skill} color={cat.color} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: 40 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <SectionLabel>CERTIFICATIONS</SectionLabel>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {[
              'Google Data Analytics Professional',
              'Google Analytics — 92%',
              'SQL — HackerRank',
              'Prompt Engineering',
              'Git',
            ].map(cert => (
              <div key={cert} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                padding: '6px 14px',
                background: 'rgba(13,20,36,0.7)',
                border: '1px solid rgba(0,255,156,0.15)',
                borderRadius: 0,
                color: 'rgba(226,232,240,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ color: '#00FF9C' }}>✓</span> {cert}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
