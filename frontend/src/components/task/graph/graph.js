import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    select,
    line,
    curveCatmullRom,
    scaleLinear,
    scaleTime,
    axisBottom,
    axisLeft,
    axisRight,
    zoom, area
} from "d3";
import { Grid } from "@mui/material";
import { extent } from "d3-array";
import "../../../assets/css/graph.css";
import { useTranslation } from "react-i18next";
import { SlGraph } from "react-icons/sl";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import GDD from './GDD_temperature_reference.json';
import Phenomenological_Stadium from './GDD_Phenomenological_Stadium.json';
import MainModal from "../analysePanel/MainModal";
import {ACTIVE_PANE_STATE_SUCCESS, LOADING_BEGIN, OPEN_DRAWER_SUCCESS} from "../../../utils/types";
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
const Graph = ({
                   vegetationIndex,
                   data,
                   datapredict,
                   indexForecast,
                   notifications,
                   pattern,
                   rainData,
                   rain_max,
                   rain_min,
                   patternAlertsDates,
                   ndviForecastAlertsDates,
                   tempData,
                   tempDataMin,
                   tempDataMax,
                   temp_max,
                   temp_min,
                   gddData,
                   gdd_max,
                   gdd_min,
                   cultureId,
                   patternSelf,
                   selfPatternAlertsDates,
                   anomaly,
                   highResOrders,
                   intensificationPlant,
                   startendDate,
                   task
               }) => {

    const dispatch = useDispatch();
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [currentZoom, setcurrentZoom] = useState(null);
    const [datagraph, setdatagraph] = useState(null);
    const [datagraphSmooth, setdataGraphSmooth] = useState(null);
    const [dataRangePredict, setdataRangePredict] = useState(null);
    const [dataRangeNotifications, setdataRangeNotifications] = useState(null);
    const [rainMin, setRainMin] = useState(null);
    const [rainMax, setRainMax] = useState(null);
    const [tempMin, setTempMin] = useState(null);
    const [tempMax, setTempMax] = useState(null);
    const [gddMin, setGddMin] = useState(null);
    const [gddMax, setGddMax] = useState(null);
    const { t } = useTranslation();
    const [observedDataLineState, setobservedDataLineState] = useState(false);
    const [smoothedDataLineState, setsmoothedDataLineState] = useState(true);
    const [forecastDataLineState, setforecastDataLineState] = useState(false);
    const [patternLineState, setpatternLineState] = useState(false);
    const [indexForecastLineState, setIndexForecastLineState] = useState(false);
    const [rainDataLineState, setRainDataLineState] = useState(false);
    const [tempDataLineState, setTempDataLineState] = useState(false);
    const [tempDataMinLineState, setTempDataMinLineState] = useState(false);
    const [tempDataMaxLineState, setTempDataMaxLineState] = useState(false);
    const [gddDataLineState, setGddDataLineState] = useState(false);
    const [patternSelfLineState, setpatternSelfLineState] = useState(false);
    const [anomalyLineState, setAnomalyLineState] = useState(false);
    const userId = useSelector((state) => state.auth.user.id);
    const taskId = useSelector((state) => state.mapReducer.taskIdDetails);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [intensificationPointData, setIntensificationPointData] = useState(null);


    const highResOrdersDates = highResOrders.map(item => item.acquisition_date)
    useEffect(() => {
        if (!data) return;
        setdatagraph(data.data);
        setdataGraphSmooth(data.data_smoothed);
        setRainMin(rain_min);
        setRainMax(rain_max);
        setTempMin(temp_min);
        setTempMax(temp_max);
        setGddMax(gdd_min);
        setGddMax(gdd_max);
    }, [data]);
    useEffect(() => {
        if (!datapredict) return;
        if (!datagraph) return;
        if (!datapredict.length > 0) return;
        if (!datagraph.length > 0) return;
        if (!notifications.length > 0) return;
        const lastDate = dayjs(datagraph[datagraph.length - 1].date);
        const startDate = lastDate.subtract(1, "month");
        const endDate = lastDate.add(4, "month");
        const filteredData = datapredict.filter((data) => {
            const date = dayjs(data.date);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });
        setdataRangePredict(filteredData);
    }, [datapredict, datagraph]);
    useEffect(() => {
        if (!datagraph || !datagraph.length > 0) return;
        if (!notifications || !notifications.length > 0) return;
        const lastDate = dayjs(datagraph[datagraph.length - 1].date);
        const startDate = lastDate.subtract(1, "month");
        const endDate = lastDate.add(2, "month");
        const filteredNotificationsData = notifications.filter((data) => {
            const date = dayjs(data.date);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });
        setdataRangeNotifications(filteredNotificationsData);
    }, [datagraph, notifications]);
    useEffect(() => {
        if (!rainData) return;
        setRainMin(rain_min);
        setRainMax(rain_max);
    }, [rainData]);
    useEffect(() => {
        if (!tempData) return;
        setTempMin(temp_min);
        setTempMax(temp_max);
    }, [tempData]);
    useEffect(() => {
        if (!gddData) return;
        setGddMin(gdd_min);
        setGddMax(gdd_max);
    }, [gddData]);
    useEffect(() => {
        if (!indexForecast) return;
        const svg = select(svgRef.current);
        if (vegetationIndex != "vegetation") {
            svg.selectAll(".ndviForecastLine").style("visibility", "hidden");
            svg.selectAll(".linepattern").style("visibility", "hidden");
            svg.selectAll(".myDot.patternAlertDot.ordinaryAlert").attr("class", "myDot ordinaryAlert");
            svg.selectAll(".myDot.patternAlertDot.severeAlert").attr("class", "myDot severeAlert");
            svg.selectAll(".myDot1.selfpatternAlertDot.ordinaryAlert").attr("class", "myDot1 ordinaryAlert");
            svg.selectAll(".myDot1.selfpatternAlertDot.severeAlert").attr("class", "myDot1 severeAlert");
            svg.selectAll(".forecastdot1.indexForecastAlertDot.severeAlert").style("visibility", "hidden");
            svg.selectAll(".forecastdot1.indexForecastAlertDot.ordinaryAlert").style("visibility", "hidden");
            svg.selectAll(".lineSelfpattern").style("visibility", "hidden");

        } else {
            svg.selectAll(".ndviForecastLine").style("visibility", "visible");
            svg.selectAll(".linepattern").style("visibility", "visible");
            svg.selectAll(".myDot.severeAlert").attr("class", "myDot patternAlertDot severeAlert ");
            svg.selectAll(".myDot.ordinaryAlert").attr("class", "myDot patternAlertDot ordinaryAlert");
            svg.selectAll(".myDot1.severeAlert").attr("class", "myDot1 selfpatternAlertDot severeAlert ");
            svg.selectAll(".myDot1.ordinaryAlert").attr("class", "myDot1 selfpatternAlertDot ordinaryAlert");
            svg.selectAll(".forecastdot1.indexForecastAlertDot.severeAlert").style("visibility", "visible");
            svg.selectAll(".forecastdot1.indexForecastAlertDot.ordinaryAlert").style("visibility", "visible");
            svg.selectAll(".lineSelfpattern").style("visibility", "visible");


        }

    }, [vegetationIndex]);

    const calculateIntensificationPoint = useCallback(() => {
        if (!datagraphSmooth || !intensificationPlant || !intensificationPlant[0] || !startendDate) {
            setIntensificationPointData(null);
            return null;
        }

        if (new Date(intensificationPlant[0]) < new Date(startendDate[0]) || new Date(intensificationPlant[0]) > new Date(startendDate[1])) {
            setIntensificationPointData(null);
            return null;
        }

        const interpolateSmoothedValue = (date, smoothedData) => {
            const targetDate = new Date(date).getTime();

            let previousPoint = null;
            let nextPoint = null;

            for (let i = 0; i < smoothedData.length; i++) {
                const currentDate = new Date(smoothedData[i].date).getTime();

                if (currentDate <= targetDate) {
                    previousPoint = smoothedData[i];
                } else {
                    nextPoint = smoothedData[i];
                    break;
                }
            }

            if (!previousPoint || !nextPoint) {
                return null;
            }

            const previousDate = new Date(previousPoint.date).getTime();
            const nextDate = new Date(nextPoint.date).getTime();

            const ratio = (targetDate - previousDate) / (nextDate - previousDate);
            const interpolatedValue = previousPoint.NDVI_rolling_mean + (nextPoint.NDVI_rolling_mean - previousPoint.NDVI_rolling_mean) * ratio;

            return interpolatedValue;
        };

        const interpolatedValue = interpolateSmoothedValue(intensificationPlant[0], datagraphSmooth);

        if (interpolatedValue !== null) {
            const data = {
                date: intensificationPlant[0],
                value: interpolatedValue
            };
            setIntensificationPointData(data);
            return data;
        } else {
            setIntensificationPointData(null);
            return null;
        }
    }, [datagraphSmooth, intensificationPlant, startendDate]);

    useEffect(() => {
        calculateIntensificationPoint();
    }, [calculateIntensificationPoint]);

    const handleClickObservedLegend = () => {
        const svg = select(svgRef.current);
        setobservedDataLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".line").style("visibility", "visible");
                svg.selectAll(".myDot").style("visibility", "visible");
            } else {
                svg.selectAll(".line").style("visibility", "hidden");
                svg.selectAll(".myDot").style("visibility", "hidden");
            }
            return !prevState;
        });
    };

    const handleClickSmoothedLegend = () => {
        const svg = select(svgRef.current);
        setsmoothedDataLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".lineSmooth").style("visibility", "visible");
                svg.selectAll(".intensificationPoint").style("visibility", "visible");

            } else {
                svg.selectAll(".lineSmooth").style("visibility", "hidden");
                svg.selectAll(".intensificationPoint").style("visibility", "hidden");

            }
            return !prevState;
        });
    };
    const handleClickForecastLegend = () => {
        const svg = select(svgRef.current);
        setforecastDataLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".linepredict").style("visibility", "visible");
            } else {
                svg.selectAll(".linepredict").style("visibility", "hidden");
            }
            return !prevState;
        });
    };
    const handleClickPatternSelfLegend = () => {
        const svg = select(svgRef.current);
        setpatternSelfLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".lineSelfpattern").style("visibility", "visible");
                svg
                    .selectAll(".myDot1.severeAlert")
                    .attr("class", "myDot1 selfpatternAlertDot severeAlert ");
                svg
                    .selectAll(".myDot1.ordinaryAlert")
                    .attr("class", "myDot1 selfpatternAlertDot ordinaryAlert");
            } else {
                svg.selectAll(".lineSelfpattern").style("visibility", "hidden");
                svg
                    .selectAll(".myDot1.selfpatternAlertDot.ordinaryAlert")
                    .attr("class", "myDot1 ordinaryAlert");
                svg
                    .selectAll(".myDot1.selfpatternAlertDot.severeAlert")
                    .attr("class", "myDot1 severeAlert");
            }
            return !prevState;
        });
    };

    const handleClickPatternLegend = () => {
        const svg = select(svgRef.current);
        setpatternLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".linepattern").style("visibility", "visible");
                svg
                    .selectAll(".myDot.severeAlert")
                    .attr("class", "myDot patternAlertDot severeAlert ");
                svg
                    .selectAll(".myDot.ordinaryAlert")
                    .attr("class", "myDot patternAlertDot ordinaryAlert");
            } else {
                svg.selectAll(".linepattern").style("visibility", "hidden");
                svg
                    .selectAll(".myDot.patternAlertDot.ordinaryAlert")
                    .attr("class", "myDot ordinaryAlert");
                svg
                    .selectAll(".myDot.patternAlertDot.severeAlert")
                    .attr("class", "myDot severeAlert");
            }
            return !prevState;
        });
    };
    const handleClickRainFallLegend = () => {
        const svg = select(svgRef.current);
        setRainDataLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".linerainfall").style("visibility", "visible");
            } else {
                svg.selectAll(".linerainfall").style("visibility", "hidden");
            }
            return !prevState;
        });
    };
    /*const handleClickGddFallLegend = () => {
        const svg = select(svgRef.current);
        setGddDataLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".linegddfall").style("visibility", "visible");
                svg.selectAll(".gdddot").style("visibility", "visible");

            } else {
                svg.selectAll(".linegddfall").style("visibility", "hidden");
                svg.selectAll(".gdddot").style("visibility", "hidden");
            }
            return !prevState;
        });
    };*/
    const handleClickGddFallLegend = () => {
        const svg = select(svgRef.current);
        setGddDataLineState((prevState) => {
            svg.selectAll(".phenological-band")
                .transition()
                .duration(300)
                .style("visibility", !prevState ? "visible" : "hidden")
                .style("opacity", !prevState ? 0.2 : 0);

            svg.selectAll(".gdd-line")
                .transition()
                .duration(300)
                .style("visibility", !prevState ? "visible" : "hidden")
                .style("opacity", !prevState ? 1 : 0);

            svg.selectAll(".gdd-point")
                .transition()
                .duration(300)
                .style("visibility", !prevState ? "visible" : "hidden")
                .style("opacity", !prevState ? 1 : 0);

            return !prevState;
        });
    };
    const handleClickTempFallLegend = () => {
        const svg = select(svgRef.current);
        setTempDataLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".linetempfall").style("visibility", "visible");
                svg.selectAll(".tempdot").style("visibility", "visible");
            } else {
                svg.selectAll(".linetempfall").style("visibility", "hidden");
                svg.selectAll(".tempdot").style("visibility", "hidden");
            }
            return !prevState;
        });
    };
    const handleClickTempMinFallLegend = () => {
        const svg = select(svgRef.current);
        setTempDataMinLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".linetempminfall").style("visibility", "visible");
                svg.selectAll(".tempmindot").style("visibility", "visible");
            } else {
                svg.selectAll(".linetempminfall").style("visibility", "hidden");
                svg.selectAll(".tempmindot").style("visibility", "hidden");
            }
            return !prevState;
        });
    };
    const handleClickTempMaxFallLegend = () => {
        const svg = select(svgRef.current);
        setTempDataMaxLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".linetempmaxfall").style("visibility", "visible");
                svg.selectAll(".tempmaxdot").style("visibility", "visible");
            } else {
                svg.selectAll(".linetempmaxfall").style("visibility", "hidden");
                svg.selectAll(".tempmaxdot").style("visibility", "hidden");
            }
            return !prevState;
        });
    };
    const handleClickAnomalyLegend = () => {
        const svg = select(svgRef.current);
        setAnomalyLineState((prevState) => {
            svg.selectAll(".anomalyGroup").style("visibility", !prevState ? "visible" : "hidden");
            return !prevState;
        });
    };
    const handleClickindexForecastLineLegend = () => {
        const svg = select(svgRef.current);
        setIndexForecastLineState((prevState) => {
            if (!prevState) {
                svg.selectAll(".ndviForecastLine").style("visibility", "visible");
                svg.selectAll(".forecastdot1").style("visibility", "visible");
            } else {
                svg.selectAll(".ndviForecastLine").style("visibility", "hidden");
                svg.selectAll(".forecastdot1").style("visibility", "hidden");
            }
            return !prevState;
        });
    };

    useEffect(() => {
        if (!datagraph) return;
        const svg = select(svgRef.current);
        const svgContent = svg.select(".content");
        if (!dimensions) return;
        if (!data) return;
        const { width, height } = dimensions || wrapperRef.current.getBoundingClientRect();

        let xScale;
        let concatenatedArray = [...datagraph];
        if (pattern && pattern.length > 0) {
            concatenatedArray = [...concatenatedArray, ...pattern];
        }
        if (patternSelf && patternSelf.length > 0) {
            concatenatedArray = [...concatenatedArray, ...patternSelf];
        }
        if (dataRangePredict && dataRangePredict.length > 0) {
            concatenatedArray = [...concatenatedArray, ...dataRangePredict];
        }

        const { minn, maxx } = concatenatedArray.reduce(
            (acc, obj) => {
                acc.minn = Math.min(acc.minn, obj.value);
                acc.maxx = Math.max(acc.maxx, obj.value);
                return acc;
            },
            { minn: Infinity, maxx: -Infinity }
        );
        xScale = scaleTime()
            .domain(extent(concatenatedArray, (d) => new Date(d.date)))
            .range([0, width]);

        if (currentZoom) {
            const newXScale = currentZoom.rescaleX(xScale);
            xScale.domain(newXScale.domain());
        }
        const yMax = Math.max(Math.abs(minn), Math.abs(maxx));
        const yScale = scaleLinear()
            .domain([0, maxx * 1.3])
            .range([height, 0]);

        const maxValue = Math.max(
            Math.abs(tempMin), Math.abs(tempMax),
            Math.abs(rainMin), Math.abs(rainMax),
        );
        const yScale2 = scaleLinear()
            .domain([0, maxValue * 1.3])
            .range([height, 0]);

        const myLine = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
            .curve(curveCatmullRom);
        const ndviForecastLine = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
            .curve(curveCatmullRom);
        const myLineSmooth = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.NDVI_rolling_mean))
            .curve(curveCatmullRom);
        const rainLine = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale2(d.value))
            .curve(curveCatmullRom);
        const tempLine = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale2(d.value))
            .curve(curveCatmullRom);
        const gddLine = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale2(d.value))
            .curve(curveCatmullRom);
        const xAxis = axisBottom(xScale);
        const myLineAutoPatter = line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.value))
        svg.select(".x-axis")
            .attr("color", "#808080")
            .attr("transform", `translate(0, ${yScale(0)})`)
            .call(xAxis);
        svg.select(".x-axis")
            .selectAll("text")
            .attr("transform", "translate(-5,5)rotate(-45)")
            .style("text-anchor", "end");
        svg.select(".y-axis2").attr("transform", `translate(${width},0)`);
        const yAxis = axisLeft(yScale).tickFormat(d => d.toFixed(2));
        svg.select(".y-axis").attr("color", "#808080").call(yAxis);
        const yAxisRight = axisRight(yScale2).tickFormat(d => {
            if (d % 1 === 0) {
                return d.toFixed(0) + " mm";
            }
            return d.toFixed(2) + " mm";
        });
        svg.select(".y-axis").attr("color", "#808080").call(yAxis);
        svg.select(".y-axis2").attr("color", "#808080").call(yAxisRight);
        const yAxisTemp = axisRight(yScale2).tickFormat(d => d.toFixed(2) + "°C");
        svg.select(".y-axis-temp")
            .attr("transform", `translate(${width},0)`)
            .call(yAxisTemp);
        const yAxisGdd = axisRight(yScale2).tickFormat(d => d.toFixed(2) + "°C");
        svg.select(".y-axis-gdd")
            .attr("transform", `translate(${width},0)`)
            .call(yAxisGdd);
        svgContent
            .selectAll(".line")
            .data([datagraph])
            .join("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#6f9d2f")
            .attr("stroke-width", "2px")
            .style("visibility", observedDataLineState ? "visible" : "hidden")
            .attr("d", myLine);

        if (intensificationPointData) {
            svgContent
                .selectAll(".intensificationPoint")
                .data([intensificationPointData])
                .join("circle")
                .attr("class", "intensificationPoint")
                .attr("stroke", "#ffc107")
                .attr("stroke-width", "2px")
                .attr("fill", "#ffc107")
                .style("visibility", smoothedDataLineState ? "visible" : "hidden")
                .attr("r", "5")
                .attr("cx", d => xScale(new Date(d.date)))
                .attr("cy", d => yScale(d.value))
                .on("mouseover", function(event, d) {
                    select(this).transition().duration("100").attr("r", 7);
                    div.transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("display", "block")
                        .style("background-color", "white");
                    div.html(
                        "Intensification Date: " + d.date + "<br>" +
                        "Culture: " + task.culture_name_fr+ "<br>" +
                        "Density: " + task.density_name_fr+ "<br>" +
                        "Variety: " + task.variety_name_fr+ "<br>" +
                        "Intensification culture: " + task.intensification_culture_name_fr+ "<br>" +
                        "Intensification density: " + task.intensification_density_name_fr+ "<br>" +
                        "Intensification variety: " + task.intensification_variety_name_fr

                    )
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 30 + "px");
                })
                .on("mouseout", function() {
                    select(this).transition().duration("200").attr("r", 5);
                    div.transition()
                        .duration("200")
                        .style("opacity", 0)
                        .style("display", "none");
                });
        } else {
            svgContent.selectAll(".intensificationPoint").remove();
        }


        svgContent
            .selectAll(".lineSmooth")
            .data([datagraphSmooth])
            .join("path")
            .attr("class", "lineSmooth")
            .attr("fill", "none")
            .attr("stroke", "#ffc107")
            .attr("stroke-width", "2px")
            .style("visibility", smoothedDataLineState ? "visible" : "hidden")
            .attr("d", myLineSmooth);
        if (dataRangePredict) {
            svgContent
                .selectAll(".linepredict")
                .data([dataRangePredict])
                .join("path")
                .attr("class", "linepredict")
                .attr("fill", "none")
                .attr("stroke", "#0051ff")
                .attr("stroke-width", "2px")
                .style("visibility", forecastDataLineState ? "visible" : "hidden")
                .attr("d", myLine);
        }
        if (rainData && rainData.length > 0) {
            svgContent
                .selectAll(".linerainfall")
                .data([rainData])
                .call(axisRight(yScale2))
                .join("path")
                .attr("class", "linerainfall")
                .attr("fill", "none")
                .attr("stroke", "#B0BEC5")
                .attr("stroke-width", "1.5px")
                .style("visibility", rainDataLineState ? "visible" : "hidden")
                .attr("d", rainLine)
                .attr("y", 140)
                .attr("dy", "171px")
                .attr("dx", "205px")
                .style("text-anchor", "end")
                .text("Rainfall (mm)");
        }

        if (gddData.length > 0 && GDD.hasOwnProperty(cultureId) && gddDataLineState &&  (userId == 81 || userId == 223|| userId == 1|| userId == 339 || userId == 352)
        ) {
            const lastIntervalMin = Phenomenological_Stadium[cultureId][Phenomenological_Stadium[cultureId].length - 1].min;
            const phenologicalStages = Phenomenological_Stadium[cultureId] || [];
            const maxGddValue = Math.max(...phenologicalStages.map(stage => stage.max));
            const gddScale = scaleLinear()
                .domain([0, maxGddValue])
                .range([height, 0]);

            const getPhenologicalStage = (gddValue) => {
                const stage = phenologicalStages.find(stage => gddValue >= stage.min && gddValue <= stage.max);
                return stage ? stage : phenologicalStages[phenologicalStages.length - 1];
            };
            let start_date="2022-12-01";
            const wheatCultures = [
                "e0af04c8-b518-460a-902f-1f42e4b8a449",
                "047088cd-3647-4ae5-b37f-19b19af42aaf"
            ];

            if (wheatCultures.includes(cultureId)) {
                start_date = "2020-11-01";
            }

            const startDate = new Date(start_date);
            const filteredGddData = gddData.filter(d => new Date(d.date) >= startDate);

            const areaGenerator = area()
                .x(d => {
                    const date = new Date(d.date);
                    const xPos = xScale(date);
                    return currentZoom ? currentZoom.applyX(xPos) : xPos;
                })
                .y0(height)
                .y1(d => gddScale(d.value))
                .curve(curveCatmullRom)
                .defined(d => d.value > 0);

            const lastGddDate = new Date(filteredGddData[filteredGddData.length - 1].date);

            const stageChanges = [];
            let currentStage = null;

            filteredGddData.forEach(d => {
                const stage = getPhenologicalStage(d.value);
                if (!currentStage || currentStage.name !== stage.name) {
                    stageChanges.push({
                        date: new Date(d.date),
                        stage: stage
                    });
                    currentStage = stage;
                }
            });

            svgContent.select("#area-clip").remove();
            svgContent.selectAll(".phenological-band").remove();
            svgContent.selectAll(".gdd-line").remove();
            svgContent.selectAll(".gdd-point").remove();

            svgContent.append("clipPath")
                .attr("id", "area-clip")
                .append("path")
                .datum(filteredGddData)
                .attr("d", areaGenerator);

            const bandsGroup = svgContent.append("g")
                .attr("class", "phenological-bands");

            for (let i = 0; i < stageChanges.length; i++) {
                const currentChange = stageChanges[i];
                const nextChange = stageChanges[i + 1];
                const xStart = xScale(currentChange.date);
                const xEnd = nextChange ? xScale(nextChange.date) : xScale(lastGddDate);

                bandsGroup
                    .append("rect")
                    .attr("class", "phenological-band")
                    .attr("x", currentZoom ? currentZoom.applyX(xStart) : xStart)
                    .attr("y", 0)
                    .attr("width", () => {
                        const start = currentZoom ? currentZoom.applyX(xStart) : xStart;
                        const end = currentZoom ? currentZoom.applyX(xEnd) : xEnd;
                        return Math.max(0, end - start);
                    })
                    .attr("height", height)
                    .attr("fill", currentChange.stage.color)
                    .attr("opacity", 0.2)
                    .attr("clip-path", "url(#area-clip)")
                    .on("mouseover", function (event, d) {
                        select(this)
                            .transition()
                            .duration(100)
                            .attr("opacity", 0.4);

                        div.transition()
                            .duration(100)
                            .style("opacity", 0.9)
                            .style("display", "block")
                            .style("background-color", "white")
                            .style("color", "black");

                        const startDate = currentChange.date.toLocaleDateString();
                        const endDate = nextChange
                            ? nextChange.date.toLocaleDateString()
                            : lastGddDate.toLocaleDateString();

                        div.html(
                            `${t("State")}: ${t(currentChange.stage.name)}<br>`                                    +
                            `${t("GDD Interval")}: ${currentChange.stage.min} - ${currentChange.stage.max}<br>` +
                            `${t("Period")}: ${startDate} - ${endDate}`
                        )
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 30) + "px");
                    })
                    .on("mouseout", function () {
                        select(this)
                            .transition()
                            .duration(200)
                            .attr("opacity", 0.2);

                        div.transition()
                            .duration(200)
                            .style("opacity", 0)
                            .style("display", "none");
                    });
            }
            const gddLine = line()
                .x(d => {
                    const date = new Date(d.date);
                    return currentZoom ? currentZoom.applyX(xScale(date)) : xScale(date);
                })
                .y(d => gddScale(d.value))
                .curve(curveCatmullRom)
                .defined(d => d.value > 0);

            let currentSegment = [];
            const segments = [];

            for (let i = 0; i < filteredGddData.length - 1; i++) {
                const current = filteredGddData[i];
                const next = filteredGddData[i + 1];                if (current.value > 2000 && next.value < 100) {
                    if (currentSegment.length > 0) {
                        currentSegment.push(current);
                        segments.push({
                            data: [...currentSegment],
                            isOverLastIntervalMin: currentSegment[currentSegment.length - 1].value > lastIntervalMin
                        });
                    }
                    currentSegment = [next];
                    continue;
                }

                currentSegment.push(current);

                if ((current.value <= lastIntervalMin && next.value > lastIntervalMin) ||
                    (current.value > lastIntervalMin && next.value <= lastIntervalMin)) {
                    const ratio = (lastIntervalMin - current.value) / (next.value - current.value);
                    const interpolatedDate = new Date(
                        new Date(current.date).getTime() +
                        ratio * (new Date(next.date) - new Date(current.date))
                    );

                    const intersectionPoint = {
                        date: interpolatedDate,
                        value: lastIntervalMin
                    };

                    currentSegment.push(intersectionPoint);
                    segments.push({
                        data: [...currentSegment],
                        isOverLastIntervalMin: current.value > lastIntervalMin
                    });

                    currentSegment = [intersectionPoint];
                }
            }

            if (currentSegment.length > 0) {
                currentSegment.push(filteredGddData[filteredGddData.length - 1]);
                segments.push({
                    data: currentSegment,
                    isOverLastIntervalMin: currentSegment[currentSegment.length - 1].value > lastIntervalMin
                });
            }

            segments.forEach(segment => {
                svgContent
                    .append("path")
                    .attr("class", "gdd-line")
                    .datum(segment.data)
                    .attr("fill", "none")
                    .attr("stroke", segment.isOverLastIntervalMin ? "#008000" : "#9CEAB3")
                    .attr("stroke-width", 2)
                    .attr("d", gddLine);
            });

            const points = svgContent
                .selectAll(".gdd-point")
                .data(filteredGddData);

            points.exit().remove();

            points
                .attr("cx", d => {
                    const date = new Date(d.date);
                    return currentZoom ? currentZoom.applyX(xScale(date)) : xScale(date);
                })
                .attr("cy", d => gddScale(d.value))
                .attr("fill", d => d.value > lastIntervalMin ? "#008000" : "#9CEAB3");

            points.enter()
                .append("circle")
                .attr("class", "gdd-point")
                .attr("fill", d => d.value > lastIntervalMin ? "#008000" : "#9CEAB3")
                .attr("cx", d => {
                    const date = new Date(d.date);
                    return currentZoom ? currentZoom.applyX(xScale(date)) : xScale(date);
                })
                .attr("cy", d => gddScale(d.value))
                .attr("r", 3)
                .on("mouseover", function (event, d) {
                    const stage = getPhenologicalStage(d.value);
                    select(this)
                        .transition()
                        .duration(100)
                        .attr("r", 5);

                    div.transition()
                        .duration(100)
                        .style("opacity", 0.9)
                        .style("display", "block")
                        .style("background-color", "white")
                        .style("color", "black");

                    div.html(
                        `Date: ${new Date(d.date).toLocaleDateString()}<br>` +
                        `GDD: ${parseFloat(d.value).toFixed(2).replace(/\.?0+$/, '')}<br>` +
                        `${t("State")}: ${stage.name}<br>` +
                        `${t("Interval")}: ${stage.min} - ${stage.max} GDD`
                    )
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 30) + "px");
                })
                .on("mouseout", function () {
                    select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 3);

                    div.transition()
                        .duration(200)
                        .style("opacity", 0)
                        .style("display", "none");
                });

            const yAxisGdd = axisRight(gddScale).tickFormat(d => d.toFixed(2) + "°C");
            svg.select(".y-axis-gdd")
                .attr("transform", `translate(${width},0)`)
                .call(yAxisGdd);
        }

            if (tempData && tempData.length > 0) {
                svgContent
                    .selectAll(".linetempfall")
                    .data([tempData])
                    .call(axisRight(yScale2))
                    .join("path")
                    .attr("class", "linetempfall")
                    .attr("fill", "none")
                    .attr("stroke", "#ED3EF7")
                    .attr("stroke-width", "1.5px")
                    .style("visibility", tempDataLineState ? "visible" : "hidden")
                    .attr("d", tempLine)
                    .attr("y", 140)
                    .attr("dy", "171px")
                    .attr("dx", "205px")
                    .style("text-anchor", "end")
                    .text("Temperature (°C)");
                svgContent
                    .selectAll(".tempdot")
                    .data(tempData)
                    .join("circle")
                    .attr("class", "tempdot")
                    .attr("stroke", "#ED3EF7")
                    .attr("stroke-width", "1px")
                    .attr("fill", "#ED3EF7")
                    .style("visibility", tempDataLineState ? "visible" : "hidden")
                    .attr("r", "2")
                    .attr("cx", (d) => xScale(new Date(d.date)))
                    .attr("cy", (d) => yScale2(d.value))
                    .on("mouseover", function (event, d) {
                        select(this).transition().duration("100").attr("r", 5);
                        div.transition().duration(100).style("opacity", 0.6).style("display", "block")
                            .style("background-color", "white");
                        div.html(`Date: ${d.date}<br>Temperature: ${d.value}°C`)
                            .style("left", event.pageX + 10 + "px")
                            .style("top", event.pageY - 30 + "px");
                    })
                    .on("mouseout", function (d, i) {
                        select(this).transition().duration("200").attr("r", 2);
                        div.transition().duration("200").style("opacity", 0).style("display", "none");
                    });
            }
            if (tempDataMin && tempDataMin.length > 0) {
                svgContent
                    .selectAll(".linetempminfall")
                    .data([tempDataMin])
                    .call(axisRight(yScale2))
                    .join("path")
                    .attr("class", "linetempminfall")
                    .attr("fill", "none")
                    .attr("stroke", "#B6D8F2")
                    .attr("stroke-width", "1.5px")
                    .style("visibility", tempDataMinLineState ? "visible" : "hidden")
                    .attr("d", tempLine)
                    .attr("y", 140)
                    .attr("dy", "171px")
                    .attr("dx", "205px")
                    .style("text-anchor", "end")
                    .text("Temperature (°C)");
                svgContent
                    .selectAll(".tempmindot")
                    .data(tempDataMin)
                    .join("circle")
                    .attr("class", "tempmindot")
                    .attr("stroke", "#B6D8F2")
                    .attr("stroke-width", "1px")
                    .attr("fill", "#B6D8F2")
                    .style("visibility", tempDataMinLineState ? "visible" : "hidden")
                    .attr("r", "2")
                    .attr("cx", (d) => xScale(new Date(d.date)))
                    .attr("cy", (d) => yScale2(d.value))
                    .on("mouseover", function (event, d) {
                        select(this).transition().duration("100").attr("r", 5);
                        div.transition().duration(100).style("opacity", 0.6).style("display", "block")
                            .style("background-color", "white");
                        div.html(`Date: ${d.date}<br>Temperature: ${d.value}°C`)
                            .style("left", event.pageX + 10 + "px")
                            .style("top", event.pageY - 30 + "px");
                    })
                    .on("mouseout", function (d, i) {
                        select(this).transition().duration("200").attr("r", 2);
                        div.transition().duration("200").style("opacity", 0).style("display", "none");
                    });
            }
            if (tempDataMax && tempDataMax.length > 0) {
                svgContent
                    .selectAll(".linetempmaxfall")
                    .data([tempDataMax])
                    .call(axisRight(yScale2))
                    .join("path")
                    .attr("class", "linetempmaxfall")
                    .attr("fill", "none")
                    .attr("stroke", "#A7001E")
                    .attr("stroke-width", "1.5px")
                    .style("visibility", tempDataMaxLineState ? "visible" : "hidden")
                    .attr("d", tempLine)
                    .attr("y", 140)
                    .attr("dy", "171px")
                    .attr("dx", "205px")
                    .style("text-anchor", "end")
                    .text("Temperature (°C)");
                svgContent
                    .selectAll(".tempmaxdot")
                    .data(tempDataMax)
                    .join("circle")
                    .attr("class", "tempmaxdot")
                    .attr("stroke", "#A7001E")
                    .attr("stroke-width", "1px")
                    .attr("fill", "#A7001E")
                    .style("visibility", tempDataMaxLineState ? "visible" : "hidden")
                    .attr("r", "2")
                    .attr("cx", (d) => xScale(new Date(d.date)))
                    .attr("cy", (d) => yScale2(d.value))
                    .on("mouseover", function (event, d) {
                        select(this).transition().duration("100").attr("r", 5);
                        div.transition().duration(100).style("opacity", 0.6).style("display", "block")
                            .style("background-color", "white");
                        div.html(`Date: ${d.date}<br>Temperature: ${d.value}°C`)
                            .style("left", event.pageX + 10 + "px")
                            .style("top", event.pageY - 30 + "px");
                    })
                    .on("mouseout", function (d, i) {
                        select(this).transition().duration("200").attr("r", 2);
                        div.transition().duration("200").style("opacity", 0).style("display", "none");
                    });
            }

            if (indexForecast && indexForecast.length > 0 && vegetationIndex === "vegetation") {
                svgContent
                    .selectAll(".ndviForecastLine")
                    .data([indexForecast])
                    .join("path")
                    .attr("class", "ndviForecastLine")
                    .attr("fill", "none")
                    .attr("stroke", "#024CAA")
                    .attr("stroke-width", "3px")
                    .style("visibility", indexForecastLineState && vegetationIndex === "vegetation" ? "visible" : "hidden")
                    .attr("d", ndviForecastLine);
                svgContent
                    .selectAll(".forecastdot1")
                    .data(indexForecast)
                    .join("circle")
                    .attr("class", (d) =>
                        ndviForecastAlertsDates.ordinaryAlerts.includes(d.date) ? "forecastdot1 indexForecastAlertDot ordinaryAlert"
                            : ndviForecastAlertsDates.severeAlerts.includes(d.date)
                                ? "forecastdot1 indexForecastAlertDot severeAlert"
                                : "forecastdot1"
                    )
                    .attr("stroke", "#024CAA")
                    .attr("stroke-width", "1px")
                    .attr("fill", "#024CAA")
                    .style("visibility", indexForecastLineState ? "visible" : "hidden")
                    .style("opacity", "0")
                    .attr("r", "1")
                    .attr("cx", (d) => xScale(new Date(d.date)))
                    .attr("cy", (d) => yScale(d.value))
                    .on("mouseover", function (event, d) {
                        select(this).transition().duration("100").attr("r", 5);
                        div
                            .transition()
                            .duration(100)
                            .style("opacity", 1)
                            .style("display", "block")
                            .style("background-color", "white");
                        div
                            .html(
                                "Date : " +
                                d.date +
                                "<br>" +
                                t("NDVI") +
                                ": " +
                                d.value.toFixed(3) +
                                "<br>"
                            )
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
            }

            if (pattern && pattern.length > 0 && vegetationIndex === "vegetation" && userId !== 154) {
                svgContent
                    .selectAll(".linepattern")
                    .data([pattern])
                    .join("path")
                    .attr("class", "linepattern")
                    .attr("fill", "none")
                    .attr("stroke", "#FF3535")
                    .attr("stroke-width", "2px")
                    .style("visibility", patternLineState ? "visible" : "hidden")
                    .attr("d", myLineSmooth);
            }


            if (patternSelf && patternSelf.length > 0 && vegetationIndex === "vegetation") {
                svgContent
                    .selectAll(".lineSelfpattern")
                    .data([patternSelf])
                    .join("path")
                    .attr("class", "lineSelfpattern")
                    .attr("fill", "none")
                    .attr("stroke", "#A66E38")
                    .attr("stroke-width", "2px")
                    .style("visibility", patternSelfLineState ? "visible" : "hidden")
                    .attr("d", myLineSmooth);
                const allAlertDates = [
                    ...selfPatternAlertsDates.ordinaryAlerts.map(alert => alert.date),
                    ...selfPatternAlertsDates.severeAlerts.map(alert => alert.date)
                ];

                svgContent
                    .selectAll(".myDot1")
                    .data(patternSelf.filter(d => allAlertDates.includes(d.date)))
                    .join("circle")
                    .attr("class", (d) =>
                        selfPatternAlertsDates.severeAlerts.some(alert => alert.date === d.date)
                            ? "myDot1 selfpatternAlertDot severeAlert"
                            : selfPatternAlertsDates.ordinaryAlerts.some(alert => alert.date === d.date)
                                ? "myDot1 selfpatternAlertDot ordinaryAlert"
                                : "myDot1"
                    )
                    .attr("stroke", "#6f9d2f")
                    .attr("stroke-width", "1px")
                    .attr("fill", (d) =>
                        selfPatternAlertsDates.severeAlerts.some(alert => alert.date === d.date)
                            ? "red"
                            : selfPatternAlertsDates.ordinaryAlerts.some(alert => alert.date === d.date)
                                ? "pink"
                                : "#6f9d2f"
                    )
                    .style("visibility", patternSelfLineState ? "visible" : "hidden")
                    .style("opacity", ".6")
                    .attr("r", "3")
                    .attr("cx", (d) => xScale(new Date(d.date)))
                    .attr("cy", (d) => yScale(d.NDVI_rolling_mean))
                    .on("mouseover", function (event, d) {
                        select(this).transition().duration("100").attr("r", 5);
                        div
                            .transition()
                            .duration(100)
                            .style("opacity", 1)
                            .style("display", "block")
                            .style("background-color", "white");
                        div
                            .html(
                                "Date : " + d.date + "<br>" + t("Value") + ": " + parseFloat(d.NDVI_rolling_mean).toFixed(3).replace(/\.?0+$/, '') + "<br>"
                            )
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


            }
            if (anomaly && anomaly.length > 0) {
                const anomalyGroup = svgContent.selectAll(".anomalyGroup")
                    .data(anomaly)
                    .join("g")
                    .attr("class", "anomalyGroup")
                    .style("visibility", anomalyLineState ? "visible" : "hidden");

                anomalyGroup.selectAll(".anomalyLine")
                    .data(d => [
                        { type: 'open', hour: d.open_hour },
                        { type: 'close', hour: d.close_hour }
                    ])
                    .join("line")
                    .attr("class", d => `anomalyLine ${d.type}Line`)
                    .attr("x1", d => xScale(new Date(d.hour)))
                    .attr("x2", d => xScale(new Date(d.hour)))
                    .attr("y1", 0)
                    .attr("y2", yScale(0))
                    .attr("stroke", d => d.type === 'open' ? "#FFCCCC" : "#FFCCCC")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.7);

                anomalyGroup.selectAll(".anomalyRect")
                    .data(d => [d])
                    .join("rect")
                    .attr("class", "anomalyRect")
                    .attr("x", d => xScale(new Date(d.open_hour)))
                    .attr("y", 0)
                    .attr("width", d => xScale(new Date(d.close_hour)) - xScale(new Date(d.open_hour)))
                    .attr("height", yScale(0))
                    .attr("fill", "#FFF0F0")
                    .attr("opacity", 0.5);

                anomalyGroup
                    .on("mouseover", function (event, d) {
                        select(this).selectAll("line").attr("stroke-width", 2);
                        div.transition()
                            .duration(100)
                            .style("opacity", 1)
                            .style("display", "block")
                            .style("background-color", "white");

                        const openDate = new Date(d.open_hour).toLocaleDateString();
                        const closeDate = new Date(d.close_hour).toLocaleDateString();

                        div.html(`Problem Start Date ${openDate}<br>Problem End Date: ${closeDate}<br>Problem: ${d.anomaly_type_name}<br>Note: ${d.note}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 30) + "px");
                    })
                    .on("mouseout", function () {
                        select(this).selectAll("line").attr("stroke-width", 1);
                        div.transition()
                            .duration(200)
                            .style("opacity", 0)
                            .style("display", "none");
                        div.html('');
                    });

            }

            svgContent
                .selectAll(".myDot")
                .data(datagraph)
                .join("circle")
                .attr("class", (d) => {
                    if (userId !== 154) {
                        return patternAlertsDates.severeAlerts.includes(d.date) && vegetationIndex === "vegetation"
                            ? "myDot patternAlertDot severeAlert"
                            : patternAlertsDates.ordinaryAlerts.includes(d.date) && vegetationIndex === "vegetation"
                                ? "myDot patternAlertDot ordinaryAlert"
                                : "myDot";
                    }
                    return "myDot";
                })
                .attr("stroke", (d) => highResOrdersDates.includes(d.date) ? "#00ff58" : "#6f9d2f")
                .attr("stroke-width", (d) => highResOrdersDates.includes(d.date) ? "3px" : "1px")
                .attr("fill", (d) => {
                    const isInAnomalyPeriod = anomaly.some(anomalyPeriod =>
                        new Date(d.date) >= new Date(anomalyPeriod.open_hour) &&
                        new Date(d.date) <= new Date(anomalyPeriod.close_hour)
                    );

                    if (isInAnomalyPeriod) {
                        return "#f44336";
                    }

                    if (d && typeof d.abs === "number") {
                        return d.abs > 0.2 ? "#f44336" : "#ff9800";
                    }
                    return "#6f9d2f";
                })
                .style("visibility", observedDataLineState ? "visible" : "hidden")
                .style("opacity", ".6")
                .attr("r", (d) => {
                    const isInAnomalyPeriod = anomaly.some(anomalyPeriod =>
                        new Date(d.date) >= new Date(anomalyPeriod.open_hour) &&
                        new Date(d.date) <= new Date(anomalyPeriod.close_hour)
                    );

                    return isInAnomalyPeriod ? 5 : 3;
                })
                .attr("cx", (d) => xScale(new Date(d.date)))
                .attr("cy", (d) => yScale(d.value))
                .on("mouseover", function (event, d) {
                    const isInAnomalyPeriod = anomaly.some(anomalyPeriod =>
                        new Date(d.date) >= new Date(anomalyPeriod.open_hour) &&
                        new Date(d.date) <= new Date(anomalyPeriod.close_hour)
                    );

                    select(this).transition().duration("100").attr("r", isInAnomalyPeriod ? 7 : 5);

                    div
                        .transition()
                        .duration(100)
                        .style("opacity", 1)
                        .style("display", "block")
                        .style("background-color", "white");

                    const matchedAnomaly = anomaly.find(anomalyPeriod =>
                        new Date(d.date) >= new Date(anomalyPeriod.open_hour) &&
                        new Date(d.date) <= new Date(anomalyPeriod.close_hour)
                    );

                    if (matchedAnomaly) {
                        div.html(
                            `Date: ${d.date}<br>` +
                            `Value: ${d.value}<br>` +
                            `Problem: ${matchedAnomaly.anomaly_type_name}<br>` +
                            `Note: ${matchedAnomaly.note}`
                        )
                    } else {
                        div.html(
                            (highResOrdersDates.includes(d.date) ? "<span style='background: rgb(255, 167, 38); color: white; padding: 0px 4px; border - radius: 2px; font - size: 0.7rem; height: 22px; margin - top: 2px; '>HR</span><br>" : "") +
                            (d.cloud_percentage && d.cloud_percentage == -1
                                ?
                                `Date: ${d.date}<br>` +
                                `Value: ${d.value}<br>` +
                                `Cloud: ${t("Undefined")}`
                                : `Date: ${d.date}<br>` +
                                `Value: ${d.value}<br>` +
                                `Cloud: ${d.cloud_percentage}%`)
                        )
                    }

                    div
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 30 + "px");
                })
                .on("mouseout", function (d, i) {
                    const isInAnomalyPeriod = anomaly.some(anomalyPeriod =>
                        new Date(i.date) >= new Date(anomalyPeriod.open_hour) &&
                        new Date(i.date) <= new Date(anomalyPeriod.close_hour)
                    );

                    select(this)
                        .transition()
                        .duration("200")
                        .attr("r", isInAnomalyPeriod ? 5 : 3);

                    div
                        .transition()
                        .duration("200")
                        .style("opacity", 0)
                        .style("display", "none");
                })
                .on("dblclick", function (d, i) {
                    const originalDate = new Date(i.date);
                    const endDate = new Date(originalDate.getTime() + 24 * 60 * 60 * 1000);
                    dispatch({
                        type: ACTIVE_PANE_STATE_SUCCESS,
                        payload:2,
                    });

                    dispatch({
                        type: OPEN_DRAWER_SUCCESS,
                        payload: {
                            isOpen: true,
                            drawerType: "70",
                            startDate: i.date,
                            endDate: endDate.toISOString().split('T')[0],
                        },
                    });

                    setIsModalOpen(true);
                });

            if (dataRangeNotifications && dataRangeNotifications.length > 0) {
                svgContent
                    .selectAll(".myDotNote")
                    .data(dataRangeNotifications)
                    .join("circle")
                    .attr("class", "myDotNote")
                    .style("visibility", forecastDataLineState ? "visible" : "hidden")
                    .attr("stroke", (d) => {
                        if (d && typeof d.abs === "number") {
                            return d.abs > 0.2 ? "#f44336" : "#ff9800";
                        }
                        return "";
                    })
                    .attr("stroke-width", "3px")
                    .attr("fill", (d) => {
                        if (d && typeof d.abs === "number") {
                            return d.abs > 0.2 ? "#f44336" : "#ff9800";
                        }
                        return "";
                    })
                    .attr("r", "3")
                    .attr("cx", (d) => xScale(new Date(d.date)))
                    .attr("cy", (d) => yScale(d.value))
                    .on("mouseover", function (event, d) {
                        select(this).transition().duration("100").attr("r", 5);
                        div
                            .transition()
                            .duration(100)
                            .style("opacity", 1)
                            .style("display", "block")
                            .style("background-color", "white");
                        div
                            .html(
                                d.date
                                    ? "Date : " + d.date + "<br>" + t("Value") + ": " + d.value
                                    : ""
                            )
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
            } else {
                svgContent.selectAll(".myDotNote").remove();
            }
            const zoomBehavior = zoom()
                .translateExtent([
                    [-width * 2, 0],
                    [width * 3, height]
                ])
                .scaleExtent([0.3, 100])
                .on("zoom", (event) => {
                    const zoomState = event.transform;
                    setcurrentZoom(zoomState);
                });
            svg.call(zoomBehavior);
        },
        [
            svgRef,
            datagraph,
            datagraphSmooth,
            dimensions,
            currentZoom,
            observedDataLineState,
            datapredict,
            indexForecast,
            notifications,
            pattern,
            rainData,
            rainMax,
            rainMin,
            tempData,
            tempDataMin,
            tempDataMax,
            tempMax,
            tempMin,
            gddData,
            gddMax,
            gddMin,
            forecastDataLineState,
            ndviForecastAlertsDates,
            patternSelf,
            selfPatternAlertsDates, patternSelfLineState, anomaly, anomalyLineState,gddDataLineState , intensificationPointData, smoothedDataLineState

        ]);

    return (
        <>
            <Grid
                item
                xs={12}
                container
                spacing={1}
                className="mt-3 mb-1 d-flex justify-content-center"
            >
                <Grid
                    item
                    className="d-flex align-items-center task-legend"
                    onClick={() => handleClickObservedLegend()}
                >
                    <SlGraph
                        style={{
                            color: observedDataLineState ? "#6f9d2f" : "#cccccc",
                            fontSize: "2rem",
                            padding: ".1rem",
                            border: "1px grey solid",
                            "border-radius": "100%",
                            marginRight: "5px"
                        }}
                    />
                    <span
                        style={{ color: observedDataLineState ? "#000000" : "#cccccc" }}
                    >
                {t(vegetationIndex)} {t('Observed')}
            </span>
                </Grid>
                <Grid
                    item
                    className="d-flex align-items-center task-legend"
                    onClick={() => handleClickSmoothedLegend()}
                >
                    <SlGraph
                        style={{
                            color: smoothedDataLineState ? "#ffc107" : "#cccccc",
                            fontSize: "2rem",
                            padding: ".1rem",
                            border: "1px grey solid",
                            "border-radius": "100%",
                            marginRight: "5px"
                        }}
                    />
                    <span
                        style={{ color: smoothedDataLineState ? "#000000" : "#cccccc" }}
                    >
                {t(vegetationIndex)} {t('Smoothed')}
            </span>
                </Grid>

                {pattern.length > 0 && vegetationIndex === "vegetation" && userId !== 154 && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickPatternLegend()}
                    >
                        <SlGraph
                            style={{
                                color: patternLineState ? "#FF3535" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                "border-radius": "100%",
                                marginRight: "5px"
                            }}
                        />
                        <span style={{ color: patternLineState ? "#000000" : "#cccccc" }}>
                    Pattern
                </span>
                    </Grid>
                )}

                {patternSelf.length > 0 && vegetationIndex === "vegetation" && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickPatternSelfLegend()}
                    >
                        <SlGraph
                            style={{
                                color: patternSelfLineState ? "#A66E38" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                "border-radius": "100%",
                                marginRight: "5px"
                            }}
                        />

                        <span style={{ color: patternSelfLineState ? "#000000" : "#cccccc" }}>
                    Auto Pattern
                </span>
                    </Grid>
                )}
                {rainData.length > 0 && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickRainFallLegend()}
                    >
                        <SlGraph
                            style={{
                                color: rainDataLineState ? "#B0BEC5" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                "border-radius": "100%",
                                marginRight: "5px"
                            }}
                        />
                        <span style={{ color: rainDataLineState ? "#000000" : "#cccccc" }}>
{t('Rainfall')}
</span>
                    </Grid>
                )}            {tempData.length > 0 && (
                <Grid
                    item
                    className="d-flex align-items-center task-legend"
                    onClick={() => handleClickTempFallLegend()}
                >
                    <SlGraph
                        style={{
                            color: tempDataLineState ? "#ED3EF7" : "#cccccc",
                            fontSize: "2rem",
                            padding: ".1rem",
                            border: "1px grey solid",
                            "border-radius": "100%",
                            marginRight: "5px"
                        }}
                    />
                    <span style={{ color: tempDataLineState ? "#000000" : "#cccccc" }}>
                    {t('Temperature')}
                </span>
                </Grid>
            )}
                {tempDataMin.length > 0 && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickTempMinFallLegend()}
                    >
                        <SlGraph
                            style={{
                                color: tempDataMinLineState ? "#B6D8F2" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                "border-radius": "100%",
                                marginRight: "5px"
                            }}
                        />
                        <span style={{ color: tempDataMinLineState ? "#000000" : "#cccccc" }}>
                    {t('Temperature min')}
                </span>
                    </Grid>
                )}
                {tempDataMax.length > 0 && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickTempMaxFallLegend()}
                    >
                        <SlGraph
                            style={{
                                color: tempDataMaxLineState ? "#A7001E" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                "border-radius": "100%",
                                marginRight: "5px"
                            }}
                        />
                        <span style={{ color: tempDataMaxLineState ? "#000000" : "#cccccc" }}>
                    {t('Temperature max')}
                </span>
                    </Grid>
                )}
                {anomaly && anomaly.length > 0 && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickAnomalyLegend()}
                    >
                        <SlGraph
                            style={{
                                color: anomalyLineState ? "#FFCCCC" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                borderRadius: "100%",
                                marginRight: "5px"
                            }}
                        />
                        <span style={{ color: anomalyLineState ? "#000000" : "#cccccc" }}>
                    {t('Problem')}
                </span>
                    </Grid>
                )}

                {gddData.length > 0 &&
                    GDD.hasOwnProperty(cultureId)&&  (userId == 81 || userId == 223|| userId == 1|| userId == 339 || userId == 352)
                    && (
                        <Grid
                            item
                            className="d-flex align-items-center task-legend"
                            onClick={() => handleClickGddFallLegend()}
                        >
                            <SlGraph
                                style={{
                                    color: gddDataLineState ? "#9CEAB3" : "#cccccc",
                                    fontSize: "2rem",
                                    padding: ".1rem",
                                    border: "1px grey solid",
                                    "border-radius": "100%",
                                    marginRight: "5px"
                                }}
                            />
                            <span style={{ color: gddDataLineState ? "#000000" : "#cccccc" }}>
                        GDD
                    </span>
                        </Grid>
                    )}
                {dataRangePredict && dataRangePredict.length > 0 && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickForecastLegend()}
                    >
                        <SlGraph
                            style={{
                                color: forecastDataLineState ? "#0051ff" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                "border-radius": "100%",
                                marginRight: "5px"

                            }}
                        />
                        <span
                            style={{ color: forecastDataLineState ? "#000000" : "#cccccc" }}
                        >
                    {t('Forecast M1')}
                </span>
                    </Grid>
                )}
                {indexForecast.length > 0 && vegetationIndex === "vegetation" && (
                    <Grid
                        item
                        className="d-flex align-items-center task-legend"
                        onClick={() => handleClickindexForecastLineLegend()}
                    >
                        <SlGraph
                            style={{
                                color: indexForecastLineState ? "#024CAA" : "#cccccc",
                                fontSize: "2rem",
                                padding: ".1rem",
                                border: "1px grey solid",
                                "border-radius": "100%",
                                marginRight: "5px"

                            }}
                        />
                        <span style={{ color: indexForecastLineState ? "#000000" : "#cccccc" }}>
                    {t('Forecast M2')}
                </span>
                    </Grid>
                )}
            </Grid>
            <div
                className="col-md-12 svg-container"
                ref={wrapperRef}
                style={datagraph ? { marginBottom: "40px" } : {}}
            >
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
                        <g className="y-axis2" />
                    </svg>
                ) : (
                    ""
                )}
            </div>

            <MainModal
                open={isModalOpen}
                handleClose={() => setIsModalOpen(true)}
                idTask={taskId}
                //activePane={2}
            />
        </>
    );
};

export default Graph;
