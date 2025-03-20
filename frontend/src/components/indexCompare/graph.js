import React, { useRef, useEffect, useState } from "react";
import {
    select,
    line,
    curveLinear,
    scaleLinear,
    scaleTime,
    axisBottom,
    axisLeft,
    zoom,
} from "d3";
import { extent } from "d3-array";
import "../../assets/css/graph.css";
import { useTranslation } from "react-i18next";
import { MdShowChart } from "react-icons/md";
import { Grid } from '@mui/material';
import "../../assets/scss/compare.scss";
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

var div = select("body")
    .append("div")
    .attr("class", "txt1")
    .style("opacity", 0)
    .style("display", "none")
    .style("text-align", "left"); // Align text to the left

const Graph = ({ vegetationIndex, data }) => {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [currentZoom, setcurrentZoom] = useState(null);
    const [datagraph, setdatagraph] = useState(null);
    const [min, setmin] = useState(null)
    const [max, setmax] = useState(null)
    const { t } = useTranslation();
    const [observedDataLineState, setobservedDataLineState] = useState(false)
    const [smoothedDataLineState, setsmoothedDataLineState] = useState(true)
    const [lineVisibility, setLineVisibility] = useState([]);
    const [xScaleState, setXScaleState] = useState(null)
    const [yScaleState, setYScaleState] = useState(null)

    const colors = ['#6929c4', '#1192e8', '#005d5d',
        '#9f1853', '#fa4d56', '#570408', '#198038',
        '#002d9c', '#ee538b', '#b28600', '#009d9a',
        '#012749', '#8a3800', '#a56eff', '#03fc49',
        '#03cefc', '#fc03f8', '#fc0339', '#fc8003',
        '#000000', '#bdbd00', '#00ffdd'];
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    const shuffledColors = shuffleArray(colors);

    useEffect(() => {
        if (!data) return
        const minimum = data.reduce((min, item) => {
            const itemMin = item.min;
            return min === null || (itemMin !== null && itemMin < min) ? itemMin : min;
        }, null);
        setmin(minimum)
        const maximum = data.reduce((max, item) => {
            const itemMax = item.max;
            return max === null || (itemMax !== null && itemMax > max) ? itemMax : max;
        }, null);
        setmax(maximum)
        const dataWithColors = data.map((item, index) => ({
            data: item.data,
            color: shuffledColors[index % shuffledColors.length], // Use modulo to cycle through colors
            task: item.task
        }));
        setdatagraph(dataWithColors)
        setLineVisibility(Array(dataWithColors.length).fill(true));

    }, [data])


    const showHideLineChart = (ind) => {
        const newVisibility = [...lineVisibility];
        newVisibility[ind] = !newVisibility[ind];
        setLineVisibility(newVisibility);
    }
    useEffect(() => {
        if (!datagraph) return
        if (!min) return
        const svg = select(svgRef.current);
        const svgContent = svg.select(".content");
        const { width, height } =
        dimensions || wrapperRef.current.getBoundingClientRect();
        if (!dimensions) return;

        const xScale = scaleTime()
            .domain(extent(datagraph[0].data, (d) => new Date(d.date)))
            .range([0, width]);

        if (currentZoom) {
            const newXScale = currentZoom.rescaleX(xScale);
            xScale.domain(newXScale.domain());
        }
        const yScale = scaleLinear()
            .domain([parseFloat(min) - 0.06, parseFloat(max) + 0.02])
            .range([height, 0]);
        setXScaleState(xScale)
        setYScaleState(yScale)
        const myLine = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
            .curve(curveLinear);

        const xAxis = axisBottom(xScale);
        svg
            .select(".x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);
        svg
            .select(".x-axis")
            .selectAll("text")
            .attr("transform", "translate(-5,5)rotate(-45)")
            .style("text-anchor", "end");

        const yAxis = axisLeft(yScale);
        const yAxisGrid = axisLeft(yScale).tickSize(-width).tickFormat("");
        svg.select(".y-axis").call(yAxis);
        svgContent.selectAll(".line").remove();
        datagraph.map((item, index) => {
            svgContent
                .selectAll(".line" + index)
                .data([item.data])
                .join("path")
                .attr("class", "line line" + index)
                .attr("fill", "none")
                .attr("stroke", String(item.color))
                .attr("stroke-width", "2px")
                .style("visibility", lineVisibility[index] ? "visible" : "hidden")

                .attr("d", myLine);
        })
        // Remove any existing intensification markers before drawing new ones
        svgContent.selectAll(".intensification-marker").remove();
        // Add intensification date markers on the curve
        datagraph.forEach((item, index) => {
            if (item.task.intensification_date) {
                const intensificationDate = new Date(item.task.intensification_date);

                // Find the data point closest to the intensification date
                let closestDataPoint = null;
                let minDistance = Infinity;

                item.data.forEach(d => {
                    const dataDate = new Date(d.date);
                    const distance = Math.abs(intensificationDate.getTime() - dataDate.getTime());

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestDataPoint = d;
                    }
                });

                // Check if an intensification data point is within the current x-axis domain and if a close point is found
                if (closestDataPoint && intensificationDate >= xScale.domain()[0] && intensificationDate <= xScale.domain()[1]) {
                    svgContent.append("circle")
                        .attr("class", "intensification-marker")
                        .attr("cx", xScale(new Date(closestDataPoint.date))) // Use the date from the closest data point
                        .attr("cy", yScale(closestDataPoint.value)) // Use the value from the closest data point
                        .attr("r", 5)
                        .attr("fill", item.color) // Use the line color for the dot
                        .style("visibility", lineVisibility[index] ? "visible" : "hidden")
                        .on("mouseover", (event) => {  // Add mouseover event
                            const taskDetails = Object.entries(item.task)
                                .filter(([key, value]) => key !== 'id' && value !== null)
                                .map(([key, value]) => {
                                    let label = key;
                                    if (key === 'task_name') {
                                        label = 'Name';
                                    } else if (key === 'culture_name_fr') {
                                        label = 'Culture';
                                    }
                                    else if (key === 'age') {
                                        label = 'Age';
                                    }
                                    else if (key === 'variety_name_fr') {
                                        label = 'Variety';
                                    } else if (key === 'density_name_fr') {
                                        label = 'Density';
                                    } else if (key === 'intensification_culture_name_fr') {
                                        label = 'Intensification culture';
                                    } else if (key === 'intensification_variety_name_fr') {
                                        label = 'Intensification variety';
                                    } else if (key === 'intensification_density_name_fr') {
                                        label = 'Intensification density';
                                    }
                                    return `<b>${label}:</b> ${value}`;
                                })
                                .join('<br>');
                            div.transition()
                                .duration(200)
                                .style("opacity", .9)
                                .style("display", "block"); // Show the tooltip
                            div.html(`<div style="text-align: center;"><b style="font-size: 18px;">Task Details</b></div><div style="text-align: left;">${taskDetails}</div>`)
                                .style("left", (event.pageX) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function (d) {  // Add mouseout event
                            div.transition()
                                .duration(500)
                                .style("opacity", 0)
                                .style("display", "none"); // Hide the tooltip
                        });
                }
            }
        });
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

    }, [svgRef, datagraph, dimensions, currentZoom, min, max, lineVisibility]);

    return (
        <>
            <Grid item xs={12} container spacing={1} className="mt-3 mb-1">
                {datagraph && datagraph.map((item, index) => {
                    const lineStyle = lineVisibility[index] ? {
                        color: item.color,
                        fontSize: "30px",
                    } : {
                        color: "#c0c0c0",
                        fontSize: "30px",
                    }
                    const taskStyle = lineVisibility[index] ? {
                        color: "#000000",
                    } : {
                        color: "#c0c0c0",
                    }
                    return (
                        <Grid item key={item.color} className="d-flex align-items-center task-legend" onClick={() => showHideLineChart(index)}>
                            <span className="graph-legend-icon-wrapper d-flex justify-content-center align-items-center flex-direction-row mr-2">
                                <SlGraph style={lineStyle} />
                            </span>
                            <span style={taskStyle}>{item.task.task_name} ({item.task.age} ans)</span>
                        </Grid>
                    )
                })}
            </Grid>
            <Grid item xs={12} ref={wrapperRef} className="svg-container">
                {datagraph ? (
                    <svg ref={svgRef} className="graphIndex">
                        <defs>
                            <clipPath id="MygraphPanel">
                                <rect x="0" y="0" width="100%" height="100%" />
                            </clipPath>
                        </defs>
                        <g className="content" clipPath="url(#MygraphPanel)"></g>
                        <g className="x-axis" />
                        <g className="x-axis-grid" />
                        <g className="y-axis" />
                        {/* <g className="y-axis-grid" /> */}
                    </svg>
                ) : (
                    ""
                )}
            </Grid>
        </>
    );
};

export default Graph;
