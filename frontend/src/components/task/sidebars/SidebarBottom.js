import { Container, Select, MenuItem, FormControl } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
    change_accusation_dates,
    change_selected_date, change_selected_date_initial,
    get_dates,
} from "../../../actions/task";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import {
    setClickEventFail,
    setClickEventSucess,
} from "../../../actions/map";
import spinner from "../../../assets/images/Spinner-green.svg"
import Tippy, { tippy } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import DateTooltip from "./DateTooltip";
import ReactDOMServer from 'react-dom/server';

const SidebarBottom = () => {
    const [accusationDates, setaccusationDates] = useState(null);
    const [selectedIndex, setselectedIndex] = useState(0);
    const [sidebarRef, setsidebarRef] = useState(null);
    const [selectedDate, setselectedDate] = useState(null);

    const dates = useSelector((state) => state.mapReducer.AccusationDates);
    const selected_date_state = useSelector(
        (state) => state.mapReducer.SelectedDate
    );
    const taskIdDetailsEdit = useSelector(
        (state) => state.mapReducer.taskIdDetails
    );

    const { t } = useTranslation();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!sidebarRef) return;

        if (isMobile) {
            sidebarRef.addEventListener("touchstart", disableMapInteractions);
            sidebarRef.addEventListener("touchmove", disableMapInteractions);
        }
        sidebarRef.addEventListener("mouseenter", disableMapInteractions);
        sidebarRef.addEventListener("mouseleave", enableMapInteractions);
        return () => {
            sidebarRef.removeEventListener("mouseenter", disableMapInteractions);
            sidebarRef.removeEventListener("mouseleave", enableMapInteractions);
            sidebarRef.removeEventListener("touchstart", disableMapInteractions);
            sidebarRef.removeEventListener("touchend", enableMapInteractions);
            sidebarRef.removeEventListener("touchmove", enableMapInteractions);
        };
    }, [sidebarRef]);

    const disableMapInteractions = () => {
        dispatch(setClickEventFail());
    };

    const enableMapInteractions = () => {
        dispatch(setClickEventSucess());
    };

    useEffect(() => {
        if (!taskIdDetailsEdit) return;
        dispatch(get_dates(taskIdDetailsEdit)).then((res_date) => {
            dispatch(change_selected_date(res_date.data.data["dates"][0]["date"],res_date.data.data["dates"][0]["provider"]))
            dispatch(change_accusation_dates(res_date.data.data["dates"]));
        });
    }, [taskIdDetailsEdit]);

    useEffect(() => {
        if (!selected_date_state) return
        setselectedDate(selected_date_state)
    }, [selected_date_state]);

    useEffect(() => {
        setaccusationDates(dates);
    }, [dates]);

    const changeSelectedDate = (event) => {
        const value = event.target.value;
        const selectedItem = accusationDates.find(item => item.date === value);
        const index = accusationDates.findIndex(item => item.date === value);
        setselectedIndex(index);
        dispatch(change_selected_date(selectedItem.date, selectedItem.provider));
    };

    const itemShowTooltip = (date, provider, image, cloud_percentage, index) => {
        const tooltipContent = ReactDOMServer.renderToString(
            <DateTooltip date={date} provider={provider} image={image} cloud_percentage={cloud_percentage} index={index} />
        );
        tippy(`#menu-item-${index}`, {
            content: tooltipContent,
            allowHTML: true,
            theme: 'light',
            animation: 'scale',
            delay: [500, 0],
            interactive: true,
            appendTo: document.body,
        });
    };

    return (
        <div className="sidebar-bottom" ref={setsidebarRef}>
            <Container maxWidth="md" className="tab-content container-sidebar">
                <Row className="pt-2 pb-2">
                    {accusationDates && selectedDate ? (
                        <Col xs={12} className="d-flex align-items-center justify-content-center">
                            <FormControl sx={{ minWidth: 200 }}>
                                <Select
                                    value={selectedDate.date}
                                    onChange={changeSelectedDate}
                                    variant="outlined"
                                    MenuProps={{
                                        anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'right'
                                        },
                                        transformOrigin: {
                                            vertical: 'top',
                                            horizontal: 'right'
                                        },
                                        PaperProps: {
                                            style: {
                                                maxHeight: 220,
                                                overflowY: 'auto',
                                                marginTop: '2px',
                                            },
                                        },
                                    }}
                                    sx={{
                                        height: '35px',
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'top',
                                            gap: '8px',
                                        },
                                    }}
                                >
                                    {accusationDates.map((item, index) => (
                                        <MenuItem
                                            key={index}
                                            value={item.date}
                                            id={`menu-item-${index}`}
                                            onMouseEnter={() => itemShowTooltip(
                                                item.date,
                                                item.provider + (item.provider === "PS" ? " | High Resolution" : ""),
                                                item.image,
                                                item.cloud_percentage,
                                                index
                                            )}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                ...(item.provider === "PS" && {
                                                    border: '1px solid #FFA726',
                                                    margin: '4px',
                                                    borderRadius: '4px',

                                                }),
                                            }}
                                        >
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}${item.image}`}
                                                alt={item.date}
                                                style={{ height: '32px', width: '32px', objectFit: 'cover' }}
                                            />
                                            <span>{item.date}</span>
                                            {item.provider === "PS" && (
                                                <span style={{
                                                    background: '#FFA726',
                                                    color: 'white',
                                                    padding: '0 4px',
                                                    borderRadius: '2px',
                                                    fontSize: '0.70rem',
                                                    height: "22px",
                                                    marginTop: "2px",
                                                }}>
                                                    HR
                                                </span>
                                            )}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Col>
                    ) : (
                        <Col xs={12} className="d-flex align-items-center justify-content-center">
                            <Row>
                                <div className="col-12 text-center justify-content-center d-flex">
                                    <img src={spinner} alt="loading" style={{ height: "50px" }} />
                                </div>
                                <div className="col-12 text-center">
                                    <span style={{ fontSize: "15px", fontWeight: "600" }}>
                                        {t("Loading ...")}
                                    </span>
                                </div>
                            </Row>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default SidebarBottom;
