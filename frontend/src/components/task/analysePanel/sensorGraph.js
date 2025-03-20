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


const Graph = ({ data, data_max }) => {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [currentZoom, setcurrentZoom] = useState(null);
    const [mv1Data, setMv1Data] = useState(null);
    const [mv2Data, setMv2Data] = useState(null);
    const [mv3Data, setMv3Data] = useState(null);

    const [min, setmin] = useState(null)
    const [max, setmax] = useState(null)
    const { t } = useTranslation();
    const [mv1DataState, setmv1DataState] = useState(true)
    const [mv2DataState, setmv2DataState] = useState(true)
    const [mv3DataState, setmv3DataState] = useState(true)

    const [svgWidth, setSvgWidth] = useState(0)
    const [svgHeight, setSvgHeight] = useState(0)
    const [yScale, setYScale] = useState(null)

    const [rangesDrawn, setRangesDrawn] = useState(false);

    const [xScale, setxScale] = useState(null)


    useEffect(() => {
        if (!data) return;
        setMv1Data(data.mv1)
        setMv2Data(data.mv2)
        setMv3Data(data.mv3)
        setmin(0)
        setmax(data_max)
    }, [data]);

    const ranges = [
        { min: 0, max: 50, color: "#FF6347" },
        { min: 50, max: 90, color: "#7FFF00" },
        { min: 90, max: 100, color: "#6CA6CD" }
    ]



    const handleMv1Legend = () => {
        const svg = select(svgRef.current);
        setmv1DataState((prevState) => {
            if (!prevState) {
                svg.selectAll(".line1").style("visibility", "visible");
                svg.selectAll(".myDot1").style("visibility", "visible");
            } else {
                svg.selectAll(".line1").style("visibility", "hidden");
                svg.selectAll(".myDot1").style("visibility", "hidden");
            }
            return !prevState;
        });
    }

    const handleMv2Legend = () => {
        const svg = select(svgRef.current);
        setmv2DataState((prevState) => {
            if (!prevState) {
                svg.selectAll(".line2").style("visibility", "visible");
                svg.selectAll(".myDot2").style("visibility", "visible");
            } else {
                svg.selectAll(".line2").style("visibility", "hidden");
                svg.selectAll(".myDot2").style("visibility", "hidden");
            }
            return !prevState;
        });
    }

    const handleMv3Legend = () => {
        const svg = select(svgRef.current);
        setmv3DataState((prevState) => {
            if (!prevState) {
                svg.selectAll(".line3").style("visibility", "visible");
                svg.selectAll(".myDot3").style("visibility", "visible");
            } else {
                svg.selectAll(".line3").style("visibility", "hidden");
                svg.selectAll(".myDot3").style("visibility", "hidden");
            }
            return !prevState;
        });
    }


    useEffect(() => {
        if (!data) return;
        if (!mv1Data) return;

        const svg = select(svgRef.current);
        const svgContent = svg.select(".content");
        if (!dimensions) return;

        let { width, height } =
            dimensions || wrapperRef.current.getBoundingClientRect();

        const xScale = scaleTime()
            .domain(extent(mv1Data, (d) => new Date(d.date)))
            .range([0, width]);

        const yScale = scaleLinear()
            .domain([0, data_max + 2])
            .range([height, 0]);
        setYScale(() => yScale);

        if (currentZoom) {
            const newXScale = currentZoom.rescaleX(xScale);
            xScale.domain(newXScale.domain());
            // const newYScale = currentZoom.rescaleY(yScale);
            // yScale.domain(newYScale.domain());
        }




        // alert(svg.selectAll(".range_rect").empty())

        // if (!rangesDrawn) {
        // svg.selectAll(".range_rect").empty()
        // // .attr("y", style.yScale(parseFloat(range.max)))

        // ranges.forEach((range) => {
        //     svg.

        // })
        //     setRangesDrawn(true)
        // }
        // alert(rangesDrawn)

        const mv1line = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
            .curve(curveCatmullRom);

        const mv2line = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
            .curve(curveCatmullRom);

        const mv3line = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
            .curve(curveCatmullRom);

        const xAxis = axisBottom(xScale);


        svg
            .select(".x-axis")
            .attr("color", "#808080")
            .attr("transform", `translate(0, ${height})`)
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
            .selectAll(".line1")
            .data([mv1Data])
            .join("path")
            .attr("class", "line1")
            .attr("fill", "none")
            .attr("stroke", "#1cbdfc")
            .attr("stroke-width", "2px")
            .style("visibility", mv1DataState ? "visible" : "hidden")
            .attr("d", mv1line);

        svgContent
            .selectAll(".line2")
            .data([mv2Data])
            .join("path")
            .attr("class", "line2")
            .attr("fill", "none")
            .attr("stroke", "#26ff67")
            .attr("stroke-width", "2px")
            .style("visibility", mv2DataState ? "visible" : "hidden")
            .attr("d", mv2line);
        svgContent
            .selectAll(".line3")
            .data([mv3Data])
            .join("path")
            .attr("class", "line3")
            .attr("fill", "none")
            .attr("stroke", "#ff6b26")
            .attr("stroke-width", "2px")
            .style("visibility", mv3DataState ? "visible" : "hidden")
            .attr("d", mv3line);

        svgContent
            .selectAll(".myDot1")
            .data(mv1Data)
            .join("circle")
            .attr("class", "myDot1")
            .attr("stroke", "#1cbdfc")
            .attr("stroke-width", "1px")
            .attr("fill", "#1cbdfc")
            .style("visibility", mv1DataState ? "visible" : "hidden")
            .attr("r", "3")
            .attr("cx", (d) => xScale(new Date(d.date)))
            .attr("cy", (d) => yScale(d.value))
            .on("mouseover", function (event, d) {
                select(this).transition().duration("100").attr("r", 5);
                //Makes div appear
                div
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("display", "block");
                div
                    .html(d.date ? t("Time") + ": " + d.date.split('.')[0].replace('T', ' ') + "<br>" + t("mv1") + ": " + d.value + "<br>" : "")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 30 + "px");
            })
            .on("mouseout", function (d, i) {
                select(this).transition().duration("200").attr("r", 3);
                div
                    .transition()
                    .duration("200")
                    .style("opacity", 0)
                    .style("display", "none");
            });

        svgContent
            .selectAll(".myDot2")
            .data(mv2Data)
            .join("circle")
            .attr("class", "myDot2")
            .attr("stroke", "#26ff67")
            .attr("stroke-width", "1px")
            .attr("fill", "#26ff67")
            .style("visibility", mv2DataState ? "visible" : "hidden")
            .attr("r", "3")
            .attr("cx", (d) => xScale(new Date(d.date)))
            .attr("cy", (d) => yScale(d.value))
            .on("mouseover", function (event, d) {
                select(this).transition().duration("100").attr("r", 5);
                //Makes div appear
                div
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("display", "block");
                div
                    .html(d.date ? t("Time") + ": " + d.date.split('.')[0].replace('T', ' ') + "<br>" + t("mv2") + ": " + d.value + "<br>" : "")

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
        svgContent
            .selectAll(".myDot3")
            .data(mv3Data)
            .join("circle")
            .attr("class", "myDot3")
            .attr("stroke", "#ff6b26")
            .attr("stroke-width", "1px")
            .attr("fill", "#ff6b26")
            .style("visibility", mv3DataState ? "visible" : "hidden")
            .attr("r", "3")
            .attr("cx", (d) => xScale(new Date(d.date)))
            .attr("cy", (d) => yScale(d.value))
            .on("mouseover", function (event, d) {
                select(this).transition().duration("100").attr("r", 5);
                div
                    .transition()
                    .duration(100)
                    .style("opacity", 1)
                    .style("display", "block");
                div
                    .html(d.date ? t("Time") + ": " + d.date.split('.')[0].replace('T', ' ') + "<br>" + t("mv3") + ": " + d.value + "<br>" : "")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 30 + "px");
            })
            .on("mouseout", function (d, i) {
                select(this).transition().duration("200").attr("r", 3);
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

        // setSvgWidth(20)
        // setSvgHeight(20)
        // setSvgyScale(yScale)


    }, [svgRef, mv1Data, dimensions, currentZoom, mv1DataState]);

    return (
        <>
            <Grid item xs={12} container spacing={1} className="mt-3 mb-1 d-flex justify-content-center">
                <Grid item className="d-flex align-items-center task-legend" onClick={() => handleMv1Legend()}>
                        <SlGraph style={{ color: mv1DataState ? "#1cbdfc" : "#cccccc",
                             fontSize: "2rem", "padding": ".1rem" ,"border": "1px grey solid", "border-radius": "100%"
                             }} />
                    <span style={{ color: mv1DataState ? "#000000" : "#cccccc" }}>MV1</span>
                </Grid>
                <Grid item className="d-flex align-items-center task-legend" onClick={() => handleMv2Legend()}>
                        <SlGraph style={{ color: mv2DataState ? "#26ff67" : "#cccccc",
                             fontSize: "2rem", "padding": ".1rem" ,"border": "1px grey solid", "border-radius": "100%"
                             }} />
                    <span style={{ color: mv2DataState ? "#000000" : "#cccccc" }}>MV2</span>
                </Grid>
                <Grid item className="d-flex align-items-center task-legend" onClick={() => handleMv3Legend()}>
                        <SlGraph style={{ color: mv3DataState ? "#ff6b26" : "#cccccc",
                             fontSize: "2rem", "padding": ".1rem" ,"border": "1px grey solid", "border-radius": "100%"
                             }} />
                    <span style={{ color: mv3DataState ? "#000000" : "#cccccc" }}>MV3</span>
                </Grid>
            </Grid>


            <div className="col-md-12 svg-container" ref={wrapperRef} style={mv1Data ? { marginBottom: "40px" } : {}}>
                {mv1Data ? (
                    <svg ref={svgRef} className="graphIndex">
                        {/* <svg ref={svgRef} className="graphIndex"  > */}
                        {/* <rect id="range_rect_1" x={0} width={svgWidth} height={svgHeight} fill="#FF6347" opacity={0.3}/>
                        <rect id="range_rect_2" x={0} width={svgWidth} height={svgHeight} fill="#7FFF00" opacity={0.3} />
                        <rect id="range_rect_3" x={0} width={svgWidth} height={svgHeight} fill="#6CA6CD" opacity={0.3} /> */}
                        {/* {yScale && <rect style={{"overflow":"hidden"}}> */}

                        {yScale && ranges.map((range, index) => {
                            let yMax = yScale(range.max);
                            let yMin = yScale(range.min);
                            let y = Math.max(0, yMax);
                            let height = Math.min(yMin - yMax, yScale(0) - yMax);
                            return (
                                <rect
                                    key={index}
                                    x={0}
                                    y={yScale(range.max)}
                                    width={"100%"}
                                    height={yScale(range.min) - yScale(range.max)}
                                    fill={range.color}
                                    opacity={0.3}
                                />
                            )
                        })}
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

export default Graph;
