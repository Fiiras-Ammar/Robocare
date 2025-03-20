import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import "../../../assets/scss/histogram.scss";
import "../../../assets/css/mapView.css";
import { colormap } from "../../../utils/colorMap";
import { useDispatch, useSelector } from "react-redux";
import loadingImg from "../../../assets/images/loading_small.svg";
import { SET_HISTOGRAM_INTERVAL_SUCCESS } from "../../../utils/types";

const Histogram = ({}) => {
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

  const statistics = useSelector((state) => state.histogramReducer.histogram);
  const loadingState = useSelector((state) => state.histogramReducer.loading);
  const minPercentile = useSelector((state) => state.histogramReducer.min);
  const maxPercentile = useSelector((state) => state.histogramReducer.max);
  const activeTab = useSelector((state) => state.histogramReducer.activeTab);
  const cmap = useSelector((state) => state.histogramReducer.cmap);
  const index = useSelector((state) => state.mapReducer.checkboxLayers);

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

    if (activeTab == 1 || activeTab === 2) {
      band = statistics;
    } else {
      band = statisticsProductivity;
    }

    if (activeTab === 2) {
      //minX = 0;
      minX = -1;
      maxX = 1;
    } else {
      minX = band["min"].toFixed(3);
      maxX = band["max"].toFixed(3);
    }
    if (activeTab != 3) {
      setMin(parseFloat(minPercentile.toFixed(3)));


      setMax(parseFloat(maxPercentile.toFixed(3)));
    }

    if (activeTab === 2) {
      maxY = Math.max(maxY, Math.max(...band["bins_static"]));
    } else {
      maxY = Math.max(maxY, Math.max(...band["bins"]));
    }
    rangeX.current = [parseFloat(minX), parseFloat(maxX)];
    rangeY.current = [minY, maxY];
  };

  useEffect(() => {
    if (statistics.length == 0) return;
    if (!hgContainerRef.current) return;
    if (!minPercentile) return;
    if (!maxPercentile) return;
    if (cmap.length == 0) return;
    if (activeTab === 3) {
      if (statisticsProductivity.length == 0) return;
    }
    reset();
  }, [
    minPercentile,
    maxPercentile,
    statistics,
    hgContainerRef,
    loading,
    activeTab,
    statisticsProductivity,
    cmap,
  ]);

  useEffect(() => {
    if (statistics.length == 0) return;
    if (!hgContainerRef.current) return;
    if (!minPercentile) return;
    if (!maxPercentile) return;
    if (cmap.length == 0) return;
    if (activeTab === 3) {
      if (statisticsProductivity.length == 0) return;
    }
    redraw();
  }, [
    minPercentile,
    maxPercentile,
    min,
    max,
    cmap,
    statistics,
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

    const svgContainer = d3
      .select(hgContainerRef.current)
      .append("svg")
      .attr("class", "histogram-container")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    if (cmap) {
      colorMapElemRef.current = svgContainer
        .append("defs")
        .append("linearGradient")
        .attr("id", "linear")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      updateColorMap(true);
    }

    const svg = svgContainer
      .append("g")
      // .attr("transform", `translate(${margin.left},${margin.top})`);
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const x = d3.scaleLinear().domain(rangeX.current).range([0, width]);
    const center_value = (rangeX.current[0] + rangeX.current[1]) / 2;
    const ticks = [rangeX.current[0], center_value, rangeX.current[1]];
    svg
      .append("g")
      .attr("class", "x axis theme-fill-primary")
      // .attr("transform", `translate(0,${height - 5})`)
      .attr("transform", "translate(0," + height + ")")

      .call(d3.axisBottom(x).tickValues(ticks));

    const y = d3.scaleLinear().domain(rangeY.current).range([height, 0]);
    let band;
    if (activeTab == 1 || activeTab === 2) {
      band = statistics;
    } else {
      band = statisticsProductivity;
    }
    let data;
    if (activeTab === 2) {
      data = band["bins_static"].map((e, i) => [
        band["bins_values_static"][i],
        e,
      ]);
    } else {
      data = band["bins"].map((e, i) => [band["bins_values"][i], e]);
    }
    data.unshift([data[0][0], 0]);
    data.push([data[data.length - 1][0], 0]);
    svg
      .append("g")
      .append("path")
      .datum(data)
      .attr(
        "fill",
        !colorMapElemRef.current ? defaultBandColors[0] : "url(#linear)"
      )
      .attr("opacity", 1)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d[0]))
          .y((d) => y(d[1]))
      );
    const divWidth = 40;
    let minXStart
    let minBar=min

    if (activeTab === 2) {
      if(index=="NDVI"){
        minBar=0
      }
      else if(index=="GCI"){
        minBar=0.2

      }
      else if(index=="NDWI"){
        minBar=0.2
      }
      else {
        minBar= min
      }
        minXStart = (minBar - rangeX.current[0]) / (rangeX.current[1] - rangeX.current[0]) * width;
    } else {
      minXStart = ((min - rangeX.current[0]) / (rangeX.current[1] - rangeX.current[0])) * width;
    }
    const maxXStart =
      ((max - rangeX.current[0]) / (rangeX.current[1] - rangeX.current[0])) *
      width;
    let centeredXmin = minXStart - divWidth / 2;
    const centeredXmax = maxXStart - divWidth / 2;
    if (activeTab === 1) {
      minLine = svg
        .append("g")
        .append("line")
        .attr("x1", minXStart)
        .attr("y1", 0)
        .attr("x2", minXStart)
        .attr("y2", height)
        .attr("class", "theme-stroke-primary slider-line min")
        .on("mousedown", () => {
          maxDown.current = false;
          minDown.current = true;
        });

      maxLine = svg
        .append("g")
        .append("line")
        .attr("x1", maxXStart)
        .attr("y1", 0)
        .attr("x2", maxXStart)
        .attr("y2", height)
        .attr("class", "theme-stroke-primary slider-line max")
        .on("mousedown", () => {
          minDown.current = false;
          maxDown.current = true;
        });

      // svg
      //   .append("foreignObject")
      //   .attr("x", minXStart)
      //   .attr("y", height)
      //   .attr("width", 50)
      //   .attr("height", 50)
      //   .append("xhtml:div")
      //   .attr("class", "max-line-label")
      //   .attr("tabindex", "0")
      //   .style("border", "1px solid black")
      //   .style("padding", "5px")
      //   .text("This is a div inside SVG");

      const handleLeave = () => {
        maxDown.current = minDown.current = false;
        maxPosX.current = null;
        minPosX.current = null;
      };

      const handleMoveMax = (x) => {
        const mouseX = x;
        if (maxDown.current) {
          if (!maxPosX.current) maxPosX.current = mouseX;
          const deltaX = mouseX - maxPosX.current;
          const prevX = parseFloat(maxLine.attr("x1"));
          const newX = Math.max(
            Math.min(width, prevX + deltaX),
            parseFloat(minLine.attr("x1"))
          );
          maxPosX.current = mouseX;
          maxLine.attr("x1", newX).attr("x2", newX);
          if (prevX !== newX) {
            // const newMaxValue =
            //   rangeX.current[0] +
            //   ((rangeX.current[1] - rangeX.current[0]) / width) * newX;
            // setMax(newMaxValue.toFixed(3));
            setMax(
              (
                rangeX.current[0] +
                ((rangeX.current[1] - rangeX.current[0]) / width) * newX
              ).toFixed(3)
            );
          }
        }
      };

      const handleMoveMin = (x) => {
        const mouseX = x;
        if (minDown.current) {
          if (!minPosX.current) minPosX.current = mouseX;
          const deltaX = mouseX - minPosX.current;
          const prevX = parseFloat(minLine.attr("x1"));
          const newX = Math.max(
            0,
            Math.min(prevX + deltaX, parseFloat(maxLine.attr("x1")))
          );
          minPosX.current = mouseX;
          minLine.attr("x1", newX).attr("x2", newX);
          if (prevX !== newX) {
            // const newMinValue =
            //   rangeX.current[0] +
            //   ((rangeX.current[1] - rangeX.current[0]) / width) * newX;
            // setMin(newMinValue.toFixed(3));
            setMin(
              (
                rangeX.current[0] +
                ((rangeX.current[1] - rangeX.current[0]) / width) * newX
              ).toFixed(3)
            );
          }
        }
      };
      const handleDispatchMinMax = () => {
        const params = [parseFloat(min), parseFloat(max)];
        dispatch({
          type: SET_HISTOGRAM_INTERVAL_SUCCESS,
          payload: params,
        });
      };
      svgContainer.on("mousemove", (event) => {
        let [x, y] = d3.pointer(event);
        handleMoveMax(x);
        handleMoveMin(x);
      });

      svgContainer
        .on("mouseleave", handleLeave)
        .on("mouseup", (event) => {
          handleLeave();
          handleDispatchMinMax();
        })
        .on("mousedown", (event) => {
          let [x, y] = d3.pointer(event);
          const mouseX = x;
          const maxBarX = parseFloat(maxLine.attr("x1")) + margin.right;
          const minBarX = parseFloat(minLine.attr("x1")) + margin.right;
          if (Math.abs(mouseX - maxBarX) < Math.abs(mouseX - minBarX)) {
            maxDown.current = true;
            maxPosX.current = parseFloat(maxLine.attr("x1")) + margin.right;
            handleMoveMax(x);
          } else {
            minDown.current = true;
            minPosX.current = parseFloat(minLine.attr("x1")) + margin.right;
            handleMoveMin(x);
          }
          handleDispatchMinMax();
        });
    }

    svg.append("foreignObject")
        .attr("x", centeredXmin)
        .attr("y", height + 20)
        .attr("width", divWidth)
        .attr("height", 60)
        .attr("overflow", "visible")
        .append("xhtml:div")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .attr("tabindex", "0")
        .attr("aria-valuemax", rangeX.current[1])
        .attr("aria-valuemin", rangeX.current[0])
        .attr("aria-valuenow", min)
        .attr("draggable", "false")
        .attr("role", "slider")
        .attr("class", "histogram-silder-label")
        .style("position", "relative")
        .style("z-index", "1")
        .style("cursor", "grab")
        .style("text-align", "center")
        .style("user-select", "none")
        .style("touch-action", "none")
        .html(`
     <div class="histogram-slider-arrow"></div>
    <span>${activeTab === 2 ? minBar : min}</span>
   `);

    svg
        .append("foreignObject")
        .attr("x", centeredXmax)
        .attr("y", height + 20)
        .attr("width", divWidth)
        .attr("height", 60)
        .attr("overflow", "visible")
        .append("xhtml:div")
        .attr("xmlns", "http://www.w3.org/1999/xhtml")
        .attr("tabindex", "0")
        .attr("aria-valuemax", rangeX.current[1])
        .attr("aria-valuemin", rangeX.current[0])
        .attr("aria-valuenow", max)
        .attr("draggable", "false")
        .attr("role", "slider")
        .attr("class", "histogram-silder-label")
        .style("position", "relative")
        .style("z-index", "1")
        .style("cursor", "grab")
        .style("text-align", "center")
        .style("user-select", "none")
        .style("touch-action", "none")
        .html(`
    <div class="histogram-slider-arrow"></div>
    <span class="">${max}</span>
  `);
  };

  const updateColorMap = (recreate) => {
    if (!colorMapElemRef.current) return;
    if (recreate) {
      colorMapElemRef.current.selectAll("stop").remove();
      cmap.forEach((color, i) => {
        colorMapElemRef.current
          .append("stop")
          .attr("offset", `${(i / (cmap.length - 1)) * 100.0}%`)
          .attr("stop-color", `rgb(${color.join(",")})`);
      });
    }
    const minPerc =
      (Math.abs(min - rangeX.current[0]) /
        (rangeX.current[1] - rangeX.current[0])) *
      100.0;
    const maxPerc =
      (Math.abs(max - rangeX.current[0]) /
        (rangeX.current[1] - rangeX.current[0])) *
      100.0;

    colorMapElemRef.current.attr("x1", `${minPerc}%`).attr("x2", `${maxPerc}%`);
  };

  // const handleChangeMax = (e) => {
  //   const inputValue = e.target.value;
  //   const numericValue = parseFloat(inputValue);
  //   setMaxInput(numericValue.toFixed(3));
  //   const val = parseFloat(e.target.value);
  //   if (val >= min && val <= rangeX.current[1]) {
  //     setMax(val);
  //   }
  // };

  // const handleChangeMin = (e) => {
  //   const inputValue = e.target.value;
  //   const numericValue = parseFloat(inputValue);
  //   setMinInput(numericValue.toFixed(3));
  //   const val = parseFloat(e.target.value);
  //   if (val <= max && val >= rangeX.current[0]) {
  //     setMin(val);
  //   }
  // };
  // useEffect(() => {
  //   if (!min || !max) return;
  //   const params = [min, max];

  //   dispatch({
  //     type: SET_HISTOGRAM_INTERVAL,
  //     payload: params,
  //   });
  // }, [min, max]);
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
        <div className={"histogram"}>
          <div ref={hgContainerRef}></div>
        </div>
      )}
    </React.Fragment>
  );
};
export default Histogram;
