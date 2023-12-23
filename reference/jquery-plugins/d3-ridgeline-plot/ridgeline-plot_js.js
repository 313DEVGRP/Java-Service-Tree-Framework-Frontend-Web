// ES6 모듈 형식으로 D3를 임포트합니다.
import * as d3 from 'https://cdn.skypack.dev/d3@6';
import { trafficData } from './traffic.js'; // traffic.js에서 데이터를 가져옵니다.

// trafficData를 사용하여 차트를 생성합니다.
const dates = Array.from(d3.group(trafficData, d => +new Date(d.date)).keys()).sort(d3.ascending);
const series = d3.groups(trafficData, d => d.name).map(([name, values]) => {
  const value = new Map(values.map(d => [+new Date(d.date), d.value]));
  return {name, values: dates.map(date => value.get(date))};
});


  const overlap = 8;
  const width = 928;
  const height = series.length * 17;
  const marginTop = 40;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 120;
  // Create the scales.
    const x = d3.scaleTime()
        .domain(d3.extent(dates))
        .range([marginLeft, width - marginRight]);

    const y = d3.scalePoint()
        .domain(series.map(d => d.name))
        .range([marginTop, height - marginBottom]);

    const z = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d.values))]).nice()
        .range([0, -overlap * y.step()]);

    // Create the area generator and its top-line generator.
    const area = d3.area()
        .curve(d3.curveBasis)
        .defined(d => !isNaN(d))
        .x((d, i) => x(dates[i]))
        .y0(0)
        .y1(d => z(d));

    const line = area.lineY1();

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Append the axes.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0));

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
        .call(g => g.select(".domain").remove());

    // Append a layer for each series.
    const group = svg.append("g")
      .selectAll("g")
      .data(series)
      .join("g")
        .attr("transform", d => `translate(0,${y(d.name) + 1})`);

    group.append("path")
        .attr("fill", "#ddd")
        .attr("d", d => area(d.values));

    group.append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("d", d => line(d.values));

  // #chart div에 SVG를 추가합니다.
  document.getElementById('chart').appendChild(svg.node());
