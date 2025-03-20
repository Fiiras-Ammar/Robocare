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
    timeFormat,
    scaleOrdinal,
    zoomTransform,
    schemeCategory10
} from "d3";
import { Grid } from '@mui/material';
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
const GraphYear = ({ vegetationIndex, data, monthRange }) => {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [currentZoom, setcurrentZoom] = useState(null);
    const [datagraph, setdatagraph] = useState(null);
    const [years, setyears] = useState(null)
    const [dataToView, setDataToView] = useState({})
    const [min, setmin] = useState(null)
    const [max, setmax] = useState(null)
    const { t } = useTranslation();
    const [colorsYears, setcolorsYears] = useState([])
    const [lineVisibility, setLineVisibility] = useState([]);

    const color = scaleOrdinal(schemeCategory10);

    const colors = ['#6929c4', '#1192e8', '#005d5d',
        '#fc8003', '#fa4d56', '#bdbd00', '#00ffdd',
        '#03fc49', '#ee538b', '#b28600', '#009d9a',
        '#012749', '#8a3800', '#a56eff', '#03fc49',
        '#03cefc', '#fc03f8', '#fc0339', '#fc8003',
        '#000000', '#bdbd00', '#00ffdd'];

    const addDateFigureAttribute = (data, year) => {
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                data[key].forEach(item => {
                    const dateParts = item.date.split('-');
                    const newDate = year + '-' + dateParts[1] + '-' + dateParts[2];
                    item['datefigure'] = newDate;
                });
            }
        }
    };
    useEffect(() => {
        if (!data) return;
        const newData = JSON.parse(JSON.stringify(data.data));
        addDateFigureAttribute(newData, '2018');
        setdatagraph(newData)
        setDataToView(newData)
        setyears(data.years)
        setmin(parseFloat(data.min))
        setmax(parseFloat(data.max))

    }, [data]);
    useEffect(() => {
        if (!years) return
        years.map((item, index) => {
            colorsYears[item] = colors[index]
        });
        setLineVisibility(Array(years.length).fill(true));
    }, [years])

    useEffect(() => {
        if (!datagraph) return
        let YearlyDataInRange = {}
        for(const key in datagraph){
            let arr = datagraph[key].filter(item=>{
                const date =new Date(item.date);
                const month = date.getMonth();
                return month >= monthRange[0] && month <= monthRange[1]
            })
            YearlyDataInRange[key] = arr
        }

        setDataToView(YearlyDataInRange)
    }, [monthRange,datagraph])


    useEffect(() => {
    }, [colorsYears])
    useEffect(() => {
        if (!lineVisibility) return
    }, [lineVisibility])

    useEffect(() => {
        if (!dataToView) return
        const svg = select(svgRef.current);
        const svgContent = svg.select(".content");
        const { width, height } =
            dimensions || wrapperRef.current.getBoundingClientRect();
        if (!dimensions) return;
        if (!data) return;

        const yScale = scaleLinear()
            .domain([min - 0.06, max + 0.02])
            .range([height, 0]);

        const xScale = scaleTime()
            .domain(extent(dataToView["2018"], (d) => new Date(d.date)))
            .range([0, width]);
        if (currentZoom) {
            const newXScale = currentZoom.rescaleX(xScale);
            xScale.domain(newXScale.domain());
        }
        
        years.map((year, index) => {
            const myLine = line()
                .x((d) => xScale(new Date(d.datefigure)))
                .y((d) => yScale(d.value))
                .curve(curveCatmullRom);
            svgContent
                .selectAll(".line-" + year)
                .data([dataToView[year]])
                .join("path")
                .attr("class", "line-" + year)
                .attr("fill", "none")
                .attr("stroke", colors[index])
                .attr("stroke-width", "2px")
                .style("visibility", lineVisibility[index] ? "visible" : "hidden")
                .attr("d", myLine);

            svgContent
                .selectAll(".myDot-" + year)
                .data(dataToView[year])
                .join("circle")
                .attr("class", "myDot-" + year)
                .attr("stroke", colors[index])
                .attr("stroke-width", "1px")
                .attr("fill", colors[index])
                .attr("r", "1")
                .attr("cx", (d) => xScale(new Date(d.datefigure)))
                .style("visibility", lineVisibility[index] ? "visible" : "hidden")
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
                        .html(d.cloud_percentage && d.cloud_percentage == -1 ? "Date : " + d.date + "<br>" + t("Value") + ": " + d.value + "<br>" + t("Cloud") + " : " + t("Undefined") : "Date : " + d.date + "<br>" + t("Value") + ": " + d.value + "<br>" + t("Cloud") + " : " + d.cloud_percentage + "%")
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 30 + "px");
                })
                .on("mouseout", function (d, i) {
                    select(this).transition().duration("200").attr("r", 1);
                    //makes div disappear
                    div
                        .transition()
                        .duration("200")
                        .style("opacity", 0)
                        .style("display", "none");
                });
        })

        const xAxis = axisBottom(xScale).tickFormat(d => timeFormat("%b %d")(d));
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
        svg
            .select(".y-axis")
            .attr("color", "#808080")
            .call(yAxis);


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

    }, [svgRef, dataToView, years, dimensions, currentZoom, min, max, lineVisibility]);
    const showHideLineChart = (ind) => {
        const newVisibility = [...lineVisibility];
        newVisibility[ind] = !newVisibility[ind];
        setLineVisibility(newVisibility);
    }
    return (
        <>
            <Grid item xs={12} container spacing={1} className="mt-3 mb-1 d-flex justify-content-center">
                {years && years.map((item, index) => {
                    const lineStyle = lineVisibility[index] ? {
                        color: colorsYears[item],
                        // fontSize: "30px",
                        fontSize: "2rem", "padding": ".1rem" ,"border": "1px grey solid", "border-radius": "100%"
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
                        <Grid item key={item} className="d-flex align-items-center task-legend" onClick={() => showHideLineChart(index)}>
                            {/* <span className="graph-legend-icon-wrapper d-flex justify-content-center align-items-center flex-direction-row mr-2"> */}
                                <SlGraph style={lineStyle} />
                            {/* </span> */}
                            <span style={taskStyle}>{item}</span>
                        </Grid>
                    )
                })}
            </Grid>
            <Grid item xs={12} ref={wrapperRef} className="svg-container">
                {dataToView ? (
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

export default GraphYear;
