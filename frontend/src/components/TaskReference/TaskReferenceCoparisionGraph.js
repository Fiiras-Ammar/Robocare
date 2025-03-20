import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIndexArrayComparison, getGraphDataSelfTask } from "../../actions/graph";
import * as d3 from 'd3';
import { useTranslation } from "react-i18next";
import { getHistogram } from "../../actions/histogram";

const TaskReferenceComparisonGraph = ({ selectedIndex }) => {
    const svgRef = useRef(null);
    const taskId = useSelector((state) => state.mapReducer.taskIdDetails);
    const taskName = useSelector((state) => state.mapReducer.taskNameDetails);
    const date = useSelector((state) => state.mapReducer.selected_date);
    const checkboxLayers = useSelector((state) => state.mapReducer.checkboxLayers);
    const provider = useSelector((state) => state.mapReducer.SelectedDate.provider);

    const { t } = useTranslation();

    const [graphData, setGraphData] = useState({
        reference: [],
        currentYear: [],
        filteredReference: [],
        filteredCurrentYear: []
    });
    const dispatch = useDispatch();
    const defaultIndex = selectedIndex || "NDVI";

    const filterData = useCallback((data_smoothed, index) => {
        if (!data_smoothed || !Array.isArray(data_smoothed)) return [];
        const filteredItem = data_smoothed.find(item =>
            item.index.toLowerCase() === index.toLowerCase()
        );
        return filteredItem?.data_smoothed || [];
    }, []);

    const adjustReferenceToCurrentYear = (referenceData, currentYear = new Date().getFullYear()) => {
        if (!referenceData?.length) return [];

        const firstRefYear = new Date(referenceData[0].date).getFullYear();
        const previousYear = currentYear - 1;

        return referenceData.map(item => {
            const [year, month, day] = item.date.split('-').map(num => parseInt(num));
            const originalYear = year;
            const yearToUse = originalYear === firstRefYear ? previousYear : currentYear;

            if (month === 2 && day === 29) {
                if (!isLeapYear(yearToUse)) {
                    return {
                        ...item,
                        date: `${yearToUse}-02-28`
                    };
                }
            }

            return {
                ...item,
                date: `${yearToUse}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            };
        });
    };
    const isLeapYear = (year) => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };
    const filterCurrentYearData = useCallback((currentYearData, referenceData) => {
        if (!currentYearData?.length || !referenceData?.length) return currentYearData;
        const firstReferenceDate = new Date(referenceData[0].date);
        const startIndex = currentYearData.findIndex(item =>
            new Date(item.date) >= firstReferenceDate
        );
        if (startIndex <= 0) return currentYearData.filter(item =>
            new Date(item.date) >= firstReferenceDate
        );
        return currentYearData.slice(startIndex - 1);
    }, []);

    const dimensions = useMemo(() => {
        const margin = { top: 0, right: 0, bottom: 60, left: 40 };
        return {
            margin,
            width: svgRef.current?.parentElement?.clientWidth - margin.left - margin.right || 0,
            height: (250) - margin.top - margin.bottom
        };
    }, [svgRef.current]);

    useEffect(() => {
        if (!taskId) return;

        const fetchData = async () => {
            try {
                let currentYearData = [];
                try {
                    const currentYearResponse = await dispatch(getGraphDataSelfTask(taskId));
                    currentYearData = currentYearResponse.data.data || [];
                } catch (error) {
                    console.error('Error fetching current year data:', error);
                }

                let referenceData = [];
                try {
                    const referenceResponse = await dispatch(getIndexArrayComparison(taskId, date));

                    if (referenceResponse.status !== 200) {
                        dispatch(getHistogram(taskId, date, provider, checkboxLayers))
                    }

                    referenceData = referenceResponse.data.data || [];
                } catch (error) {
                    console.log('Reference data not available:', error);
                }

                const filteredCurrentYear = filterData(currentYearData, defaultIndex);
                const filteredReference = filterData(referenceData, defaultIndex);

                const adjustedReference = adjustReferenceToCurrentYear(
                    filteredReference,
                );

                const filteredCurrentYearData = filterCurrentYearData(filteredCurrentYear, adjustedReference);

                setGraphData({
                    reference: referenceData,
                    currentYear: currentYearData,
                    filteredReference: adjustedReference,
                    filteredCurrentYear: filteredCurrentYearData
                });
            } catch (error) {
                console.error('Error in fetchData:', error);
            }
        };

        fetchData();
    }, [taskId, defaultIndex, filterData, filterCurrentYearData]);

    useEffect(() => {
        if (!graphData.currentYear && !graphData.reference) return;

        const filteredCurrentYear = filterData(graphData.currentYear, defaultIndex);
        const filteredReference = filterData(graphData.reference, defaultIndex);

        const adjustedReference = adjustReferenceToCurrentYear(
            filteredReference,
        );

        const filteredCurrentYearData = filterCurrentYearData(filteredCurrentYear, adjustedReference);

        setGraphData(prev => ({
            ...prev,
            filteredReference: adjustedReference,
            filteredCurrentYear: filteredCurrentYearData
        }));
    }, [defaultIndex, filterData, filterCurrentYearData]);

    useEffect(() => {
        const hasCurrentYearData = graphData.filteredCurrentYear?.length > 0;
        const hasReferenceData = graphData.filteredReference?.length > 0;

        if (!hasCurrentYearData && !hasReferenceData) {
            return;
        }
        if (!svgRef.current) return;

        const { width, height, margin } = dimensions;

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('background-color', 'white')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        const allData = [
            ...(hasCurrentYearData ? graphData.filteredCurrentYear : []),
            ...(hasReferenceData ? graphData.filteredReference : [])
        ];

        const xScale = d3.scaleTime()
            .domain(d3.extent(allData, d => new Date(d.date)))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(allData, d => d.NDVI_rolling_mean) * 1.1])
            .range([height, 0]);

        const line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.NDVI_rolling_mean))
            .curve(d3.curveMonotoneX);

        const chartGroup = svg.append("g")
            .attr("clip-path", "url(#clip)");

        const drawLine = (data_smoothed, color) => {
            if (!data_smoothed?.length) return null;
            return chartGroup.append('path')
                .datum(data_smoothed)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 1.5)
                .attr('d', line);
        };

        if (graphData.filteredCurrentYear?.length > 0) {
            drawLine(graphData.filteredCurrentYear, '#ff4081');
        }

        if (graphData.filteredReference?.length > 0) {
            drawLine(graphData.filteredReference, '#2196f3');
        }

        const xAxis = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`);

        const yAxis = svg.append('g')
            .attr('class', 'y-axis');

        const updateAxes = (newXScale, newYScale) => {
            const formatDate = d3.timeFormat('%b %Y');

            xAxis.call(d3.axisBottom(newXScale)
                .ticks(d3.timeMonth.every(1))
                .tickFormat(formatDate))
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-45)')
                .style('font-size', '10px');

            yAxis.call(d3.axisLeft(newYScale)
                .ticks(5)
                .tickFormat(d => d.toString()))
                .selectAll('text')
                .style('font-size', '10px');
        };

        updateAxes(xScale, yScale);

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on('zoom', (event) => {
                const { transform } = event;
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);

                updateAxes(newXScale, newYScale);

                chartGroup.selectAll('path')
                    .attr('d', function() {
                        const path = d3.select(this);
                        const pathData = path.datum();
                        return line
                            .x(d => newXScale(new Date(d.date)))
                            .y(d => newYScale(d.NDVI_rolling_mean))(pathData);
                    });
            });

        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .call(zoom)
            .on('wheel', event => event.preventDefault());
    }, [graphData, dimensions]);

    if (!graphData.filteredCurrentYear?.length && !graphData.filteredReference?.length) {
        return null;
    }
    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="text-sm mb-2 flex flex-wrap justify-center items-center" style={{ fontWeight: "bold", textAlign: "center" }}>
                {graphData.filteredReference.length > 0 && (
                    <div className="flex items-center mx-2">
                        <svg width="20" height="20" className="mr-2">
                            <line
                                x1="0"
                                y1="10"
                                x2="20"
                                y2="10"
                                stroke="#2196f3"
                                strokeWidth="2"
                            />
                        </svg>
                        <span style={{ margin: '5px' }}>{t("Reference field")}</span>
                    </div>
                )}
                {graphData.filteredCurrentYear.length > 0 && (
                    <div className="flex items-center mx-2">
                        <svg width="20" height="20" className="mr-2">
                            <line
                                x1="0"
                                y1="10"
                                x2="20"
                                y2="10"
                                stroke="#ff4081"
                                strokeWidth="2"
                            />
                        </svg>
                        <span>{taskName}</span>
                    </div>
                )}
            </div>

            <div className="w-full h-[800px]">
                <div className="chart-container w-full h-full">
                    <svg ref={svgRef} className="w-full h-full" />
                </div>
            </div>
        </div>
    );
};

export default TaskReferenceComparisonGraph;
