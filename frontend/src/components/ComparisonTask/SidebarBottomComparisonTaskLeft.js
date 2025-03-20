import React, { useState, useEffect } from 'react';
import {Container, Select, MenuItem, FormControl, InputLabel} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    setClickEventFailLeft,
    setClickEventSucessLeft,
} from '../../actions/map';
import {
    change_accusation_dates_left,
    change_selected_date_left,
    get_dates_sentinel,
} from '../../actions/task';
import {CHECKBOX_STATE_SUCCESS_LEFT, HISTOGRAM_FAIL_LEFT} from "../../utils/types";

const SidebarBottomComparisonTaskLeft = () => {
    const [accusationDates, setAccusationDates] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [sidebarRef, setSidebarRef] = useState(null);

    const dates = useSelector((state) => state.mapReducer.AccusationDatesLeft);
    const selected_date_state = useSelector((state) => state.mapReducer.SelectedDateLeft);
    const taskIdDetailsEdit = useSelector((state) => state.mapReducer.taskIdDetailsLeft);

    const { t } = useTranslation();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!sidebarRef) return;
        const disableMapInteractions = () => dispatch(setClickEventFailLeft());
        const enableMapInteractions = () => dispatch(setClickEventSucessLeft);
        sidebarRef.addEventListener('mouseenter', disableMapInteractions);
        sidebarRef.addEventListener('mouseleave', enableMapInteractions);
        return () => {
            sidebarRef.removeEventListener('mouseenter', disableMapInteractions);
            sidebarRef.removeEventListener('mouseleave', enableMapInteractions);
        };
    }, [sidebarRef, dispatch]);

    useEffect(() => {
        if (!taskIdDetailsEdit) return;
        dispatch(get_dates_sentinel(taskIdDetailsEdit)).then((res_date) => {
            dispatch(change_accusation_dates_left(res_date.data.data['dates']));
        });
    }, [taskIdDetailsEdit, dispatch]);

    useEffect(() => {
        if (!selected_date_state) return;
        setSelectedDate(selected_date_state);
    }, [selected_date_state]);

    useEffect(() => {
        setAccusationDates(dates);
    }, [dates]);

    const handleDateChange = (event) => {
        const selectedDateObj = accusationDates.find(item => item.date === event.target.value);
        if (selectedDateObj) {
            setSelectedDate(selectedDateObj);
            dispatch(change_selected_date_left(selectedDateObj.date, selectedDateObj.provider));
            dispatch({ type: CHECKBOX_STATE_SUCCESS_LEFT, payload: null });
            dispatch({ type: HISTOGRAM_FAIL_LEFT });
        }
    };
    return (
        <div className="sidebar-bottom-right" ref={setSidebarRef}>
            <Container maxWidth="md" className="tab-content container-sidebar" >
                {accusationDates && selectedDate ? (
                    <div className="pt-2 pb-2">
                        <FormControl fullWidth>
                            <InputLabel id="index-select-label" shrink>
                                {t('Select date')}
                            </InputLabel>
                            <Select
                                value={selectedDate.date}
                                onChange={handleDateChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select date' }}
                                style={{ height: '35px', width: '150px' }}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    },
                                    transformOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    },
                                    PaperProps: {
                                        style: {
                                            maxHeight: 200,
                                            width: '150px',
                                        },
                                    },
                                }}
                            >
                                {accusationDates.map((item, index) => (
                                    <MenuItem key={index} value={item.date}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {item.date}
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                ) : (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: '50px' }}>
                        <div className="text-center">
                            <div className="mt-2">
                            <span style={{ fontSize: '15px', fontWeight: '600' }}>
                                {t('Loading ...')}
                            </span>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );


};

export default SidebarBottomComparisonTaskLeft;
