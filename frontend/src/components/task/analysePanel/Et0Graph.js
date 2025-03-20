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


const Et0Graph = ({ data, monthly_max }) => {
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
            .domain(extent(data, (d) => new Date(d.et0_display_date)))
            .range([0, width]);
        if (currentZoom) {
            const newXScale = currentZoom.rescaleX(xScale);
            xScale.domain(newXScale.domain());
        }

        const yScale = scaleLinear()
            .domain([0, monthly_max])
            .range([height, 0]);

        const myLine = line()
            .x((d) => xScale(new Date(d.et0_display_date)))
            .y((d) => yScale(d.mean_et0))
            .curve(curveCatmullRom);

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

        svgContent
            .selectAll(".line")
            .data([data])
            .join("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#6f9d2f")
            .attr("stroke-width", "2px")
            .style("visibility", rainDataState ? "visible" : "hidden")
            .attr("d", myLine);
 
        svgContent
            .selectAll(".myDot")
            .data(data)
            .join("circle")
            .attr("class", "myDot")
            .attr("stroke", "#6f9d2f")
            .attr("stroke-width", "1px")
            .attr("fill", "#6f9d2f")
            .style("visibility", rainDataState ? "visible" : "hidden")
            .attr("r", "3")
            .attr("cx", (d) => xScale(new Date(d.et0_display_date)))
            .attr("cy", (d) => yScale(d.mean_et0))
            .on("mouseover", function (event, d) {
                select(this).transition().duration("100").attr("r", 5);
                //Makes div appear
                div
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("display", "block");
                div
                    .html(d.et0_display_date ? "Period : " + d.period_name + " " + "<br>" + t("Et0") + ": " + d.mean_et0 + "<br>":"")
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
                    <span className="graph-legend-icon-wrapper d-flex justify-content-center align-items-center flex-direction-row mr-2">
                        <SlGraph style={{ color: rainDataState ? "#6f9d2f" : "#cccccc", fontSize: "25px" }} />
                    </span>
                    <span style={{ color: rainDataState ? "#000000" : "#cccccc" }}>ET0</span>
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

export default Et0Graph;
