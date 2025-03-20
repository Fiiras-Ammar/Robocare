import {Container, Grid, Slider, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import Histogram from "./histogram";
import {useDispatch, useSelector} from "react-redux";
import {
    getBornReferenceTask, getHistogram,
    getHistogramProductivity,
    getHistogramRange,
} from "../../../actions/histogram";
import {
    SET_ACTIVE_TAB_SUCCESS,
    SET_HISTOGRAM_INTERVAL_SUCCESS,
} from "../../../utils/types";
import HistogramProductivity from "./histogramProductivity";
import GraphPage from "../graph/GraphPage";
import TaskReferenceComparisonGraph from "../../TaskReference/TaskReferenceCoparisionGraph";
import LegendHistogram from "../../Legend/LegendHistogram";
import {setCheckboxLayerState} from "../../../actions/map";

const HistogramTab = () => {
    const {t} = useTranslation();

    const [staticMin, setstaticMin] = useState(null);
    const [staticMax, setstaticMax] = useState(null);
    const density_id = useSelector((state) => state.mapReducer.densityDetails);
    const index = useSelector((state) => state.mapReducer.checkboxLayers);
    const minPercentile = useSelector((state) => state.histogramReducer.min);
    const maxPercentile = useSelector((state) => state.histogramReducer.max);
    const histogram = useSelector((state) => state.histogramReducer.histogram);
    const activeTab = useSelector((state) => state.histogramReducer.activeTab);
    const loading = useSelector((state) => state.histogramReducer.loading);
    const selected_date = useSelector((state) => state.mapReducer.SelectedDate);
    const taskId = useSelector((state) => state.mapReducer.taskIdDetails);
    const date = useSelector((state) => state.mapReducer.selected_date);
    const id_task = useSelector((state) => state.mapReducer.taskIdDetails);

    const [zoneNbr, setzoneNbr] = useState(5);
    const dispatch = useDispatch();
    const handleTabClick = (tab) => {
        if (tab === 2) {
            dispatch(setCheckboxLayerState("NDVI"));
            dispatch(
                getHistogram(
                    id_task,
                    selected_date.date,
                    selected_date.provider,
                    "NDVI"
                )
            );
        }

        dispatch({
            type: SET_ACTIVE_TAB_SUCCESS,
            payload: tab,
        });
    };
    const marks = [
        {
            value: 5,
            label: "5",
        },
        {
            value: 6,
            label: "6",
        },
        {
            value: 7,
            label: "7",
        },
        {
            value: 8,
            label: "8",
        },
        {
            value: 9,
            label: "9",
        },
        {
            value: 10,
            label: "10",
        },
        {
            value: 11,
            label: "11",
        },
        {
            value: 12,
            label: "12",
        },
        {
            value: 13,
            label: "13",
        },
        {
            value: 14,
            label: "14",
        },
        {
            value: 15,
            label: "15",
        },
    ];
    useEffect(() => {

        if (!activeTab) return;
        if (!index) return;
        if (!histogram || histogram.length === 0) return;
        if (activeTab === 2) {
            //dispatch(getBornReferenceTask(index, taskId,date)).then((res) => {

                /*if (res.status !== 200 ||
                    (res.status === 200 && (!res.data.data.min_month || !res.data.data.max_month))) {
                    dispatch(getHistogramStatic(index, density_id)).then((res) => {
                    });
                }*/
            //});
            //dispatch(getHistogramStatic(index, density_id)).then((res) => {});
            let minInterval
            if(index=="NDVI"){
                minInterval=0
            }
            else if(index=="GCI"){
                minInterval=0.2
            }
            else if(index=="NDWI"){
                minInterval=0.2
            }
            else {
                minInterval= histogram.percentile[0]
            }
            const interval = [
                parseFloat(minInterval),
                parseFloat(histogram.percentile[1]),
            ];
            dispatch({
                type: SET_HISTOGRAM_INTERVAL_SUCCESS,
                payload: interval,
            });
        }
        if (activeTab === 1) {
            const interval = [
                parseFloat(histogram.percentile[0]),
                parseFloat(histogram.percentile[1]),
            ];
            dispatch({
                type: SET_HISTOGRAM_INTERVAL_SUCCESS,
                payload: interval,
            });
        }
        if (activeTab === 3) {
            dispatch(
                getHistogramProductivity(
                    taskId,
                    selected_date.date,
                    selected_date.provider,
                    index,
                    zoneNbr
                )
            ).then((res) => {
                if (res.state === 200) {
                }
            });
        }
    }, [activeTab, histogram, index]);
    const onChangeSlider = (e, value) => {
        setzoneNbr(value);
        dispatch(
            getHistogramProductivity(
                taskId,
                selected_date.date,
                selected_date.provider,
                index,
                value
            )
        ).then((res) => {
            if (res.state === 200) {
            }
        });
    };
    // useEffect(() => {
    //   console.log("histogram.length", histogram.length);
    //   if (!histogram.percentile) return;
    //   if (!index) return;
    //   if (!density_id) return;
    //   console.log("clicked");
    //   if (activeTab === 2 && index && density_id) {
    //     dispatch(getHistogramStatic(index, density_id));
    //   }
    //   if (activeTab == 1) {
    //     const interval = [
    //       parseFloat(histogram.percentile[0]),
    //       parseFloat(histogram.percentile[1]),
    //     ];
    //     dispatch({
    //       type: SET_HISTOGRAM_INTERVAL_STATIC_SUCCESS,
    //       payload: interval,
    //     });
    //   }
    // }, [histogram, activeTab, index, density_id, dispatch]);
    return (
        <React.Fragment>
            <Grid container sx={{flex: 1, p: 1}}>
                <ul
                    className="nav nav-tabs nav-tabs-histogram nav-justified w-100"
                    role="tablist"

                >
                    <li className="nav-item navlinkSize" >
                        <a
                            className={`nav-link  navlink ${activeTab === 1 ? "active" : ""}`}
                            data-bs-toggle="tab"
                            href="#dynamic"
                            role="tab"
                            onClick={() => handleTabClick(1)}
                            style={{
                                fontSize: window.innerWidth <= 768 ? '10px' : 'inherit',
                                fontWeight: 'bold',
                                height: '30px',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}

                        >
                            <span className=" d-sm-block ">{t("SPATIAL MAP")}</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className={`nav-link navlink ${activeTab === 2 ? "active" : ""}`}
                            data-bs-toggle="tab"
                            href="#static"
                            role="tab"
                            onClick={() => handleTabClick(2)}
                            style={{
                                fontSize: window.innerWidth <= 768 ? '10px' : 'inherit',
                                fontWeight: 'bold',
                                height: '30px',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span className=" d-sm-block navlinkSize">{t("REFERENCE")}</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className={`nav-link navlink ${activeTab === 3 ? "active" : ""}`}
                            data-bs-toggle="tab"
                            href="#productivity"
                            role="tab"
                            onClick={() => handleTabClick(3)}
                            style={{
                                fontSize: window.innerWidth <= 768 ? '10px' : 'inherit',
                                fontWeight: 'bold',
                                height: '30px',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span className="d-sm-block">{t("PRODUCTIVITY")}</span>
                        </a>
                    </li>
                </ul>
            </Grid>
            <Grid>
                <div
                    className={`tab-pane ${activeTab === 1 ? "active" : ""}`}
                    id="dynamic"
                    role="tabpanel"
                >
                    <Grid>
                        {/*{(activeTab === 1 || activeTab == 2) && histogram ? (*/}
                        {(activeTab === 1) && histogram ? (
                            <Histogram/>
                        ) : (
                            ""
                        )}
                        {(activeTab == 2) && histogram ? (
                            <>
                            {/*<LegendHistogram
                                    lowestVegParam="Low vegetation"
                                    densestVegParam="Dense vegetation"
                                />*/}
                                <TaskReferenceComparisonGraph selectedIndex={index}/>
                            </>
                        ) : (
                            ""
                        )}
                        {(activeTab == 1) && histogram ? (
                            <>
                                <LegendHistogram
                                    lowestVegParam="The area with the lowest vegetation"
                                    densestVegParam="The area with the densest vegetation"
                                />

                            </>
                        ) : (
                            ""
                        )}
                        {activeTab === 3 && histogram ? (
                            <Grid>
                                <div className="row mt-2">
                                    <div className="col-md-12">
                                        <Typography id="input-slider" gutterBottom>
                                            Zone number
                                        </Typography>
                                    </div>
                                </div>
                                <div className="row justify-content-center">
                                    <div className="col-md-11">
                                        <Slider
                                            aria-label="Temperature"
                                            defaultValue={3}
                                            // getAriaValueText={valuetext}
                                            valueLabelDisplay="on"
                                            marks={marks}
                                            min={5}
                                            max={15}
                                            step={1}
                                            disabled={loading}
                                            value={zoneNbr}
                                            onChange={onChangeSlider}
                                        />
                                    </div>
                                </div>
                                <HistogramProductivity/>
                            </Grid>
                        ) : (
                            ""
                        )}
                    </Grid>

                    {/* <div
            className={`tab-pane ${activeTab === 2 ? "active" : ""}`}
            id="static"
            role="tabpanel"
          >
            <Grid>
              {activeTab === 2 ? (
                <Histogram tab={2} staticMin={-1} staticMax={1} />
              ) : (
                ""
              )}
            </Grid>
          </div>
          <div
            className={`tab-pane ${activeTab === 3 ? "active" : ""}`}
            id="static"
            role="tabpanel"
          >
            <Grid>{activeTab === 3 ? <Histogram tab={3} /> : ""}</Grid>
          </div> */}
                </div>
            </Grid>
        </React.Fragment>
    );
};

export default HistogramTab;
