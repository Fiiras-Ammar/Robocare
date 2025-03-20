import React, { useRef, useEffect, useState } from "react";
import {
    select,
    line,
    curveCardinal,
    curveCatmullRom,
    scaleLinear,
    scaleTime,
    axisBottom,
    axisLeft,
    zoom,
    timeParse,
    zoomTransform,
} from "d3";
import { Grid, collapseClasses } from '@mui/material';
import { extent } from "d3-array";
import "../../../assets/css/graph.css";
import { height } from "dom-helpers";
import { useSelector } from "react-redux";
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

var div = select("body")
    .append("div")
    .attr("class", "txt1")
    .style("opacity", 0)
    .style("display", "none");


const DailyEt0Graph = ({ data, data_max, title, dot_name, data_freq, line_color }) => {
    const svgRef = useRef();


    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [currentZoom, setcurrentZoom] = useState(null);
    const [dataSmooth, rainsetdataSmooth] = useState(null);
    const [min, setmin] = useState(null)
    const [max, setmax] = useState(null)
    const { t } = useTranslation();
    const [rainDataState, setrainDataState] = useState(true)
    const [xScale, setxScale] = useState(null)
    useEffect(() => {
        if (!data) return;
        setmin(parseFloat(data.min))
        setmax(parseFloat(data.max))
    }, [data]);

    const handleClickObservedLegend = () => {
        const svg = select(svgRef.current);
        setrainDataState((prevState) => {
            if (!prevState) {
                svg.selectAll(".line").style("visibility", "visible");
                svg.selectAll(".myDot").style("visibility", "visible");
            } else {
                svg.selectAll(".line").style("visibility", "hidden");
                svg.selectAll(".myDot").style("visibility", "hidden");
            }
            return !prevState;
        });
    }
    useEffect(() => {
        if (!data) return
        const svg = select(svgRef.current);
        const svgContent = svg.select(".content");
        const { width, height } =
            dimensions || wrapperRef.current.getBoundingClientRect();
        if (!dimensions) return;
        if (!data) return;
        let xScale

        xScale = scaleTime()
            .domain(extent(data, (d) => new Date(d.date)))
            .range([0, width]);
        if (currentZoom) {
            const newXScale = currentZoom.rescaleX(xScale);
            xScale.domain(newXScale.domain());
        }

        const yScale = scaleLinear()
            .domain([0, data_max + 5])
            .range([height, 0]);

        const myLine = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
            .curve(curveCatmullRom);

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

        const yAxis = axisLeft(yScale);
        const yAxisGrid = axisLeft(yScale).tickSize(-width).tickFormat("");
        svg
            .select(".y-axis")
            .attr("color", "#808080")
            .call(yAxis);

        svgContent
            .selectAll(".line")
            .data([data])
            .join("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", line_color)
            .attr("stroke-width", "2px")
            .style("visibility", rainDataState ? "visible" : "hidden")
            .attr("d", myLine);

        svgContent
            .selectAll(".myDot")
            .data(data)
            .join("circle")
            .attr("class", "myDot")
            .attr("stroke", line_color)
            .attr("stroke-width", "1px")
            .attr("fill", line_color)
            .style("visibility", rainDataState ? "visible" : "hidden")
            .attr("r", "3")
            .attr("cx", (d) => xScale(new Date(d.date)))
            .attr("cy", (d) => yScale(d.value))
            .on("mouseover", function (event, d) {
                select(this).transition().duration("100").attr("r", 5);
                let dot_date = (data_freq === "month" && d.date) ? "Month : " + new Date(d.date).toLocaleString('default', { month: 'long' }) + " " + new Date(d.date).getFullYear() : "Date : " + d.date;
                //Makes div appear
                div
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("display", "block");
                div
                    .html(t(dot_date) + "<br>" + t(dot_name) + ": " + d.value + "<br>")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 30 + "px");
            })
            .on("mouseout", function (d, i) {
                select(this).transition().duration("200").attr("r", 3);
                //makes div disappear
                div
                    .transition()
                    .duration("200")
                    .style("opacity", 0)
                    .style("display", "none");
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

    }, [svgRef, data, dimensions, currentZoom, rainDataState,]);

    return (
        <>
            <Grid item xs={12} container spacing={1} className="mt-3 mb-1 d-flex justify-content-center">
                <Grid item className="d-flex align-items-center task-legend" onClick={() => handleClickObservedLegend()}>
                        <SlGraph style={{ color: rainDataState ? line_color : "#cccccc", fontSize: "2rem", "padding": ".1rem" ,"border": "1px grey solid", "border-radius": "100%"}} />
                    <span style={{ color: rainDataState ? "#000000" : "#cccccc" }}>{title}</span>
                </Grid>
            </Grid>


            <div className="col-md-12 svg-container" ref={wrapperRef} style={data ? { marginBottom: "40px" } : {}}>
                {data ? (
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
            </div>
        </>
    );
};

export default DailyEt0Graph;
