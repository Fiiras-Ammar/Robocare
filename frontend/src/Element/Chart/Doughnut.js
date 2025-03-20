import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";

const Doughnut = ({ data }) => {
    const [isMobile, setIsMobile] = useState(false);

    const staticColors = [
        '#a9c74d', '#fff7d4', '#d2ddc3', '#6f9d2f', '#b6e9d1',
        '#b6f1a4', '#fef190', '#d1f69e', '#25d37d', '#CFFF00FF',
        '#52b332', '#97fd00', '#f8a300', '#ff8652', '#9e8e01',
        '#508104', '#b28868', '#d5ad56', '#db8200', '#F58575',
        '#35d3da', '#9cb806', '#fef764', '#f89c12', '#f23c06',
        '#57ae12', '#bfd7f1', '#318053', '#81ab6c', '#c6ed06'
    ];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const getOption = () => {
        if (!data || !data.labels || !data.datasets || !data.datasets[0]) {
            return {
                series: [{
                    type: 'pie',
                    data: []
                }]
            };
        }

        const initialTotal = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
        const initialPercentages = data.datasets[0].data.map(value =>
            ((value / initialTotal) * 100).toFixed(2)
        );

        return {
            toolbox: {
                show: false,
            },
            tooltip: {
                trigger: "item",
                formatter: function(params) {
                    const index = data.labels.indexOf(params.name);
                    return `${params.seriesName} <br/>${params.name}: ${params.value} (${initialPercentages[index]}%)`;
                }
            },
            legend: {
                orient: isMobile ? "horizontal" : "vertical",
                x: isMobile ? "center" : "left",
                y: isMobile ? "top" : "center",
                data: data.labels,
                textStyle: {
                    color: "#74788d",
                    fontSize: isMobile ? 11 : 12,
                },
                width: isMobile ? '100%' : 'auto',
                padding: isMobile ? [5, 0, 10, 0] : [0, 0, 0, 0],
                itemWidth: isMobile ? 15 : 25,
                itemHeight: isMobile ? 15 : 25,
                itemGap: isMobile ? 8 : 10,
                formatter: function(name) {
                    const index = data.labels.indexOf(name);
                    let displayName = name;
                    if (isMobile && name.length > 15) {
                        displayName = name.substring(0, 15) + '...';
                    }
                    return `${displayName} (${initialPercentages[index]}%)`;
                }
            },
            grid: {
                containLabel: true
            },
            color: staticColors.slice(0, data.labels.length),
            series: [
                {
                    name: "Culture Data",
                    type: "pie",
                    radius: isMobile ? ['30%', '50%'] : ['50%', '70%'],
                    center: isMobile ? ['50%', '55%'] : ['60%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: "center",
                        },
                        emphasis: {
                            show: true,
                            formatter: function(params) {
                                const index = data.labels.indexOf(params.name);
                                return `${params.name}\n${params.value}Ha\n${initialPercentages[index]}%`;
                            },
                            textStyle: {
                                fontSize: isMobile ? "20" : "30",
                                fontWeight: "bold",
                            },
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false,
                        },
                    },
                    data: data.labels.map((label, index) => ({
                        value: data.datasets[0].data[index] || 0,
                        name: label
                    })),
                },
            ],
        };
    };

    return (
        <div className="w-full">
            <ReactEcharts
                style={{
                    height: isMobile ? "450px" : "350px",
                    marginTop: isMobile ? "10px" : "0"
                }}
                option={getOption()}
                notMerge={true}
            />
        </div>
    );
};

export default Doughnut;
