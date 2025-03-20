import React, { useRef, useEffect, useState } from "react";
import {
    select,
    line,
    curveCatmullRom,
    scaleLinear,
    scaleTime,
    axisBottom,
    axisLeft,
    zoom,
    extent
} from "d3";
import { Grid, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";
import { SlGraph } from "react-icons/sl";

const useResizeObserver = (ref) => {
    const [dimensions, setdimensions] = useState(null);

    useEffect(() => {
        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                setdimensions(entry.contentRect);
            });
        });
        resizeObserver.observe(observeTarget);
        return () => {
            resizeObserver.unobserve(observeTarget);
        };
    }, [ref]);
    return dimensions;
};

const TemperatureRainGraph = ({
                                  data,
                                  title,
                                  dot_name,
                                  data_freq = "month",
                                  line_colors = []
                              }) => {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [currentZoom, setcurrentZoom] = useState(null);
    const { t } = useTranslation();
    const [dataVisibility, setDataVisibility] = useState(
        data?.datasets.map(() => true) || []
    );

    useEffect(() => {
        if (!data || !data.labels || data.labels.length === 0) return;

        const svg = select(svgRef.current);
        const svgContent = svg.select(".content");
        const { width, height } = dimensions || wrapperRef.current.getBoundingClientRect();

        if (!dimensions) return;

        // Create time-based x-scale
        const xScale = scaleTime()
            .domain(extent(data.labels, d => new Date(d)))
            .range([0, width]);

        // Apply zoom if exists
        if (currentZoom) {
            const newXScale = currentZoom.rescaleX(xScale);
            xScale.domain(newXScale.domain());
        }

        const yScale = scaleLinear()
            .domain([
                Math.min(0, ...data.datasets.flatMap(dataset => dataset.data)) * 0.9,
                Math.max(...data.datasets.flatMap(dataset => dataset.data)) * 1.1
            ])
            .range([height, 0]);

        // X-axis
        const xAxis = axisBottom(xScale);
        svg
            .select(".x-axis")
            .attr("transform", `translate(0, ${height})`)
            .attr("color", "#808080")
            .call(xAxis);
        svg
            .select(".x-axis")
            .selectAll("text")
            .attr("transform", "translate(-5,5)rotate(-45)")
            .style("text-anchor", "end");

        // Y-axis
        const yAxis = axisLeft(yScale);
        svg
            .select(".y-axis")
            .attr("color", "#808080")
            .call(yAxis);

        // Draw lines and dots for each dataset
        data.datasets.forEach((dataset, index) => {
            const lineGenerator = line()
                .x((d, i) => xScale(new Date(data.labels[i])))
                .y(d => yScale(d))
                .curve(curveCatmullRom);

            // Line
            svgContent
                .selectAll(`.line-${index}`)
                .data([dataset.data])
                .join("path")
                .attr("class", `line line-${index}`)
                .attr("fill", "none")
                .attr("stroke", line_colors[index] || dataset.borderColor)
                .attr("stroke-width", "2px")
                .style("visibility", dataVisibility[index] ? "visible" : "hidden")
                .attr("d", lineGenerator);

            // Dots
            svgContent
                .selectAll(`.myDot-${index}`)
                .data(dataset.data)
                .join("circle")
                .attr("class", `myDot myDot-${index}`)
                .attr("stroke", line_colors[index] || dataset.borderColor)
                .attr("stroke-width", "1px")
                .attr("fill", line_colors[index] || dataset.borderColor)
                .style("visibility", dataVisibility[index] ? "visible" : "hidden")
                .attr("r", "3")
                .attr("cx", (d, i) => xScale(new Date(data.labels[i])))
                .attr("cy", d => yScale(d));
        });

        // Zoom behavior
        const zoomBehavior = zoom()
            .translateExtent([
                [0, 0],
                [width, height],
            ])
            .scaleExtent([0.3, 100])
            .on("zoom", (event) => {
                const zoomState = event.transform;
                setcurrentZoom(zoomState);
            });
        svg.call(zoomBehavior);

    }, [svgRef, data, dimensions, currentZoom, dataVisibility]);

    const handleClickLegend = (index) => {
        const svg = select(svgRef.current);
        setDataVisibility(prevState => {
            const newVisibility = [...prevState];
            newVisibility[index] = !newVisibility[index];

            // Update line and dot visibility
            data.datasets.forEach((_, i) => {
                svg.selectAll(`.line-${i}`).style("visibility", newVisibility[i] ? "visible" : "hidden");
                svg.selectAll(`.myDot-${i}`).style("visibility", newVisibility[i] ? "visible" : "hidden");
            });

            return newVisibility;
        });
    };

    return (
        <>
            <Typography style={{textAlign:"center"}}>{title}</Typography>
            <Grid item xs={12} container spacing={1} className="mt-3 mb-1 d-flex justify-content-center">
                {data?.datasets.map((dataset, index) => (
                    <Grid
                        key={dataset.label}
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickLegend(index)}
                    >
                        <SlGraph
                            style={{
                                color: dataVisibility[index]
                                    ? (line_colors[index] || dataset.borderColor)
                                    : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                borderRadius: "100%"
                            }}
                        />
                        <span
                            style={{
                                color: dataVisibility[index]
                                    ? "#000000"
                                    : "#cccccc"
                            }}
                        >
                            {dataset.label}
                        </span>
                    </Grid>
                ))}
            </Grid>

            <div
                className="col-md-12 svg-container"
                ref={wrapperRef}
                style={data ? { marginBottom: "40px" } : {}}
            >
                {data ? (
                    <svg ref={svgRef} className="graphIndex">
                        <defs>
                            <clipPath id="MygraphPanel">
                                <rect x="0" y="0" width="100%" height="100%" />
                            </clipPath>
                        </defs>
                        <g className="content" clipPath="url(#MygraphPanel)"></g>
                        <g className="x-axis" />
                        <g className="y-axis" />
                    </svg>
                ) : (
                    ""
                )}
            </div>
        </>
    );
};

export default TemperatureRainGraph;
