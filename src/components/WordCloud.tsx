import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Word {
  text: string;
  size: number;
}

interface WordCloudProps {
  words: Word[];
}

export function WordCloud({ words }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || words.length === 0) return;

    const width = 800;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const fontScale = d3.scaleLinear()
      .domain([d3.min(words, d => d.size) || 1, d3.max(words, d => d.size) || 10])
      .range([12, 32]);

    const radiusScale = d3.scaleSqrt()
      .domain([d3.min(words, d => d.size) || 1, d3.max(words, d => d.size) || 10])
      .range([40, 90]);

    const nodes = words.map(d => ({
      ...d,
      radius: radiusScale(d.size)
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force("collide", d3.forceCollide((d: any) => d.radius + 5))
      .stop();

    for (let i = 0; i < 120; ++i) simulation.tick();

    const g = svg.append("g");

    const nodeGroups = g.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    const pastelColors = ["#E6E6FA", "#F0FFF0", "#FFF5EE", "#F0F8FF", "#FFF0F5"];

    nodeGroups.append("circle")
      .attr("r", (d: any) => d.radius)
      .style("fill", (d, i) => pastelColors[i % pastelColors.length])
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("stroke-opacity", "0.05")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);

    nodeGroups.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("font-size", (d: any) => `${fontScale(d.size)}px`)
      .style("font-family", "Inter")
      .style("font-weight", "600")
      .style("fill", "#1A1A1A")
      .text((d: any) => d.text)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 30)
      .style("opacity", 1);

  }, [words]);

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-black/5 p-8 flex justify-center items-center overflow-hidden shadow-sm">
      <svg ref={svgRef} width="800" height="400" viewBox="0 0 800 400" className="max-w-full h-auto" />
    </div>
  );
}
