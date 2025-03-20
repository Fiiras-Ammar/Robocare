import React, { useRef, useEffect, useState } from "react";
import {
  select,
  line,
  curveCardinal,
  curveLinear,
  scaleLinear,
  scaleTime,
  axisBottom,
  axisLeft,
  zoom,
  timeParse,
  zoomTransform,
} from "d3";
import { extent } from "d3-array";
import "../../../assets/css/graph.css";
import { height } from "dom-helpers";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Grid } from '@mui/material';
import { SlGraph } from "react-icons/sl";
import loading from "../../../assets/images/loading_small.svg";

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
const Graph = ({ vegetationIndex, data, datapredict, notifications }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);
  const [currentZoom, setcurrentZoom] = useState(null);
  const [datagraph, setdatagraph] = useState(null);
  const [datagraphSmooth, setdataGraphSmooth] = useState(null);
  const [min, setmin] = useState(null)
  const [max, setmax] = useState(null)
  const { t } = useTranslation();
  const [observedDataLineState, setobservedDataLineState] = useState(true)
  const [smoothedDataLineState, setsmoothedDataLineState] = useState(true)
  const [forecastDataLineState, setforecastDataLineState] = useState(true)

  useEffect(() => {
    if (!data) return;
    // setdata(data_graph);
    setdatagraph(data.data)
    setdataGraphSmooth(data.data_smoothed)
    setmin(parseFloat(data.min))
    setmax(parseFloat(data.max))
  }, [data]);

  useEffect(() => {
    if (!vegetationIndex) return;
    if (!svgRef) return;
    const svg = select(svgRef.current);

  }, [vegetationIndex, svgRef])


  const handleClickObservedLegend = () => {
    const svg = select(svgRef.current);
    // Use the state updater function to ensure you work with the latest state
    setobservedDataLineState((prevState) => {
      if (!prevState) {
        svg.selectAll(".line").style("visibility", "visible");
        svg.selectAll(".myDot").style("visibility", "visible");
      } else {
        svg.selectAll(".line").style("visibility", "hidden");
        svg.selectAll(".myDot").style("visibility", "hidden");
      }
      // Return the new state value
      return !prevState;
    });
  }

  const handleClickSmoothedLegend = () => {
    const svg = select(svgRef.current);
    // Use the state updater function to ensure you work with the latest state
    setsmoothedDataLineState((prevState) => {
      if (!prevState) {
        svg.selectAll(".lineSmooth").style("visibility", "visible");
      } else {
        svg.selectAll(".lineSmooth").style("visibility", "hidden");
      }
      return !prevState;
    });
  }
  const handleClickForecastLegend = () => {
    const svg = select(svgRef.current);
    // Use the state updater function to ensure you work with the latest state
    setforecastDataLineState((prevState) => {
      if (!prevState) {
        svg.selectAll(".linepredict").style("visibility", "visible");
      } else {
        svg.selectAll(".linepredict").style("visibility", "hidden");
      }
      return !prevState;
    });
  }

  // useEffect(() => {
  //   const svg = select(svgRef.current);

  //   const observedLegend = svg.selectAll(".legend-observed");

  //   observedLegend.on('click', handleClickObservedLegend);

  //   return () => {
  //     observedLegend.on('click', null);  // Cleanup the event handler when component unmounts
  //   };
  // }, [handleClickObservedLegend]);

  // useEffect(() => {
  //   const svg = select(svgRef.current);

  //   const observedLegend = svg.selectAll(".legend-smoothed");

  //   observedLegend.on('click', handleClickSmoothedLegend);

  //   return () => {
  //     observedLegend.on('click', null);  // Cleanup the event handler when component unmounts
  //   };
  // }, [handleClickSmoothedLegend]);


  useEffect(() => {
    if (!datagraph) return
    const svg = select(svgRef.current);
    const svgContent = svg.select(".content");
    const { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();
    if (!dimensions) return;
    if (!data) return;
    // const xScale = scaleTime()
    //   .domain(extent(datagraph, (d) => new Date(d.date)))
    //   .range([0, width]);
    let xScale
    if (datapredict && datapredict.length > 0) {
      const concatenatedArray = [...datagraph, ...datapredict];
      xScale = scaleTime()
        .domain(extent(concatenatedArray, (d) => new Date(d.date)))
        .range([0, width]);
    } else {
      xScale = scaleTime()
        .domain(extent(datagraph, (d) => new Date(d.date)))
        .range([0, width]);
    }
    if (currentZoom) {
      const newXScale = currentZoom.rescaleX(xScale);
      xScale.domain(newXScale.domain());
    }
    const yScale = scaleLinear()
      .domain([min - 0.06, max + 0.02])
      .range([height, 0]);

    const myLine = line()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.value))
      .curve(curveLinear);

    const myLineSmooth = line()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.NDVI_rolling_mean))
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

    svgContent
      .selectAll(".line")
      .data([datagraph])
      .join("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "#6f9d2f")
      .attr("stroke-width", "1px")
      .style("visibility", observedDataLineState ? "visible" : "hidden")
      .attr("d", myLine);
    {/*if (datapredict) {
      svgContent
        .selectAll(".linepredict")
        .data([datapredict])
        .join("path")
        .attr("class", "linepredict")
        .attr("fill", "none")
        .attr("stroke", "#0051ff")
        .attr("stroke-width", "1px")
        .style("visibility", forecastDataLineState ? "visible" : "hidden")
        .attr("d", myLine);
    }*/}




    svgContent
      .selectAll(".lineSmooth")
      .data([datagraphSmooth])
      .join("path")
      .attr("class", "lineSmooth")
      .attr("fill", "none")
      .attr("stroke", "#ffc107")
      .attr("stroke-width", "1px")
      .style("visibility", smoothedDataLineState ? "visible" : "hidden")
      .attr("d", myLineSmooth);

    svgContent
      .selectAll(".myDot")
      .data(datagraph)
      .join("circle")
      .attr("class", "myDot")
      .attr("stroke", "#6f9d2f")
      .attr("stroke-width", "3px")
      .attr("fill", "#fff")
      .style("visibility", observedDataLineState ? "visible" : "hidden")
      .attr("r", "4")
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
          .html(d.cloud_percentage && d.cloud_percentage == -1 ? "Date : " + d.date + "<br>" + t("Value") + ": " + d.value + "<br>" + t("Cloud") + " : " + t("Undefined") : "Date : " + d.date + "<br>" + t("Value") + ": " + d.value + "<br>" + t("Cloud") + " : " + d.cloud_percentage + "%")
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
    {/*if (notifications && notifications.length > 0) {
      svgContent
        .selectAll(".myDotNote")
        .data(notifications)
        .join("circle")
        .attr("class", "myDotNote")
        .attr("stroke", (d) => {
          if (d && typeof d.abs === 'number') {
            return d.abs > 0.2 ? "#f44336" : "#ff9800";
          }
          return "";
        })
        .attr("stroke-width", "3px")
        .attr("fill", (d) => {
          if (d && typeof d.abs === 'number') {
            return d.abs > 0.2 ? "#f44336" : "#ff9800";
          }
          return "";
        })
        .style("visibility", "visible")
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
            .html(d.date ? "Date : " + d.date + "<br>" + t("Value") + ": " + d.value  : "")
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
    }*/}

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
  }, [svgRef, datagraph, datagraphSmooth, dimensions, currentZoom, observedDataLineState, datapredict, notifications]);

  return (
    <>
      <Grid item xs={12} container spacing={1} className="mt-3 mb-1">
        <Grid item className="d-flex align-items-center task-legend" onClick={() => handleClickObservedLegend()}>
          <span className="sidebar-graph-legend-icon-wrapper d-flex justify-content-center align-items-center flex-direction-row mr-2">
            <SlGraph style={{ color: observedDataLineState ? "#6f9d2f" : "#cccccc", fontSize: "25px" }} />
          </span>
          <span style={{ color: observedDataLineState ? "#000000" : "#cccccc" }}> {t(`${vegetationIndex}`)} {t('Observed')}</span>
        </Grid>
        <Grid item className="d-flex align-items-center task-legend" onClick={() => handleClickSmoothedLegend()}>
          <span className="sidebar-graph-legend-icon-wrapper d-flex justify-content-center align-items-center flex-direction-row mr-2">
            <SlGraph style={{ color: smoothedDataLineState ? "#ffc107" : "#cccccc", fontSize: "25px" }} />
          </span>
          <span style={{ color: smoothedDataLineState ? "#000000" : "#cccccc" }}> {t(`${vegetationIndex}`)} {t('Smoothed')}</span>
        </Grid>
        {/*{datapredict.length > 0 &&
          <Grid item className="d-flex align-items-center task-legend" onClick={() => handleClickForecastLegend()}>
            <span className="sidebar-graph-legend-icon-wrapper d-flex justify-content-center align-items-center flex-direction-row mr-2">
              <SlGraph style={{ color: forecastDataLineState ? "#0051ff" : "#cccccc", fontSize: "25px" }} />
            </span>
            <span style={{ color: forecastDataLineState ? "#000000" : "#cccccc" }}>Current year forecast  {vegetationIndex}</span>
          </Grid>
        }*/}
      </Grid>
      <div className="col-md-12 svg-container" ref={wrapperRef} style={datagraph ? { marginBottom: "40px" } : {}}>
        {datagraph ? (
          <svg ref={svgRef} className="graphIndexSidebar">
            <defs>
              <clipPath id="Mygraph">
                <rect x="0" y="0" width="100%" height="100%" />
              </clipPath>
            </defs>
            <g className="content" clipPath="url(#Mygraph)"></g>
            <g className="x-axis" />
            <g className="x-axis-grid" />
            <g className="y-axis" />
            {/* <g className="y-axis-grid" /> */}
          </svg>
        ) : <img src={loading} alt="Loading" />
        }
      </div >
    </>
  );
};

export default Graph;
