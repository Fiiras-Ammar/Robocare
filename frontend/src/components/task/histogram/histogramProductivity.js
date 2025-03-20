import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import "../../../assets/scss/histogram.scss";
import "../../../assets/css/mapView.css";
import { useDispatch, useSelector } from "react-redux";
import loadingImg from "../../../assets/images/loading_small.svg";
import { SET_HISTOGRAM_INTERVAL_SUCCESS } from "../../../utils/types";

const HistogramProductivity = ({}) => {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  // const [minInput, setMinInput] = useState(0);
  // const [maxInput, setMaxInput] = useState(0);
  const hgContainerRef = useRef(null);
  const colorMapElemRef = useRef(null);
  const rangeX = useRef([0, 0]);
  const rangeY = useRef([0, 0]);
  const maxDown = useRef(false);
  const minDown = useRef(false);
  const maxPosX = useRef(null);
  const minPosX = useRef(null);
  const dispatch = useDispatch();
  let minLine;
  let maxLine;
  // const [loading, setloading] = useState(true);

  const loadingState = useSelector((state) => state.histogramReducer.loading);
  const activeTab = useSelector((state) => state.histogramReducer.activeTab);
  const cmap = useSelector((state) => state.histogramReducer.cmapProductivity);
  const statisticsProductivity = useSelector(
    (state) => state.histogramReducer.histogramProductivity
  );
  const [loading, setloading] = useState(false);
  const defaultBandColors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ff8000",
    "#ffff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
  ];

  useEffect(() => {
    setloading(loadingState);
  }, [loadingState]);

  const reset = () => {
    const minY = 0;
    let maxY = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let band;
    band = statisticsProductivity;
    minX = band["min"];
    maxX = band["max"];
    setMin(parseFloat(minX.toFixed(3)));
    setMax(parseFloat(maxX.toFixed(3)));

    maxY = Math.max(maxY, Math.max(...band["bins"]));

    rangeX.current = [parseFloat(minX), parseFloat(maxX)];
    rangeY.current = [minY, maxY];
  };

  useEffect(() => {
    if (!hgContainerRef.current) return;

    if (cmap.length == 0) return;
    if (statisticsProductivity.length == 0) return;
    reset();
  }, [hgContainerRef, loading, activeTab, statisticsProductivity, cmap]);

  useEffect(() => {
    if (!hgContainerRef.current) return;
    if (cmap.length == 0) return;
    if (statisticsProductivity.length == 0) return;
    redraw();
  }, [
    min,
    max,
    cmap,
    hgContainerRef,
    loading,
    rangeX,
    activeTab,
    statisticsProductivity,
  ]);

  const redraw = () => {
    const margin = { top: 15, right: 20, bottom: 15, left: 20 };
    const containerWidth = hgContainerRef.current
      ? hgContainerRef.current.offsetWidth
      : 0;
    const width = containerWidth - margin.left - margin.right;
    const height = 100 - margin.top - margin.bottom;

    if (hgContainerRef.current.firstChild) {
      hgContainerRef.current.removeChild(hgContainerRef.current.firstChild);
    }
    const band = statisticsProductivity;
    const svgContainer = d3
      .select(hgContainerRef.current)
      .append("svg")
      .attr("class", "histogram-container")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Create a group for the bars
    const svg = svgContainer
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3
      .scaleLinear()
      .domain([rangeX.current[0], rangeX.current[1]]) // Ensure domain covers the entire range
      .range([0, width]);

    // Use bins_values as the tick values (start and end of each bar)
    const binTicks = [...band["bins_values"], rangeX.current[1]]; // Add end tick for the last bin

    svg
      .append("g")
      .attr("class", "x axis theme-fill-primary")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickValues(binTicks).tickSize(4).tickFormat(d3.format(".2f")))
      .selectAll("text") // Select all tick labels
      .style("font-size", "9px") // Set the font size
      .attr("transform", "rotate(-45)") // Rotate the labels -45 degrees
      .style("text-anchor", "end"); // Set ticks at each bin boundary

    // Scale for the Y axis, range is [height, 0] (bottom to top)
    const y = d3.scaleLinear().domain(rangeY.current).range([height, 0]);
  

    // Determine bin width based on the number of bins and total available width
    const binWidth = width / band["bins"].length;

    // Create a color scale using the provided cmap array
    const colorScale = d3
      .scaleLinear()
      .domain([0, cmap.length - 1])
      .range([0, 1])
      .interpolate(d3.interpolateRgb)
      .clamp(true)
      .range(cmap.map((c) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] / 255})`));

    const data = band["bins"].map((e, i) => [band["bins_values"][i], e]);

    // Append rects for each bin with animation and proper color mapping
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(d[0])) // Position the bar based on the bin value
      .attr("y", height) // Initially position the bars at the bottom of the SVG for animation
      .attr("width", binWidth - 1) // Set the bar width based on available space
      .attr("height", 0) // Start with height 0 for animation
      .attr(
        "fill",
        (d, i) =>
          `rgba(${cmap[i][0]}, ${cmap[i][1]}, ${cmap[i][2]}, ${
            cmap[i][3] / 255
          })`
      ) // Apply color from cmap for each bin
      .transition() // Add transition for animation
      .duration(800) // Set duration for the transition (800ms)
      .attr("y", (d) => y(d[1])) // Animate to the correct y position based on the data value
      .attr("height", (d) => height - y(d[1])) // Animate to the correct height
      .delay((d, i) => i * 100); // Delay each bar's animation by 100ms * index

    const divWidth = 40;
    const minXStart =
      ((min - rangeX.current[0]) / (rangeX.current[1] - rangeX.current[0])) *
      width;
    const maxXStart =
      ((max - rangeX.current[0]) / (rangeX.current[1] - rangeX.current[0])) *
      width;
    const centeredXmin = minXStart - divWidth / 2;
    const centeredXmax = maxXStart - divWidth / 2;
  };

  useEffect(() => {
    // Prevent Leaflet's mousedown event handling on histogram
    const handlePreventOutline = (e) => {
      e.stopPropagation();
    };

    // Attach event listener to prevent outline on mousedown
    const histogramElement = hgContainerRef.current;
    if (histogramElement) {
      histogramElement.addEventListener("mousedown", handlePreventOutline);
    }

    // Cleanup: remove event listener when component unmounts
    return () => {
      if (histogramElement) {
        histogramElement.removeEventListener("mousedown", handlePreventOutline);
      }
    };
  }, [hgContainerRef.current]);
  return (
    <React.Fragment>
      {loading ? (
        <div className="histogram-load">
          <img src={loadingImg} />
        </div>
      ) : (
        <div className={"histogram-productivity"}>
          <div ref={hgContainerRef}></div>
        </div>
      )}
    </React.Fragment>
  );
};
export default HistogramProductivity;
