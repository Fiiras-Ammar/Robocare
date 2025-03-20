import React, { useEffect } from "react";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Row from 'react-bootstrap/esm/Row';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addSubscription, submitHighResOrder, getOrders} from '../../../actions/task';
import { FormControl, FormControlLabel, Radio, RadioGroup, date } from '@mui/material';
import logo_sat from '../../../assets/images/satellite.gif'
import Button from 'react-bootstrap/esm/Button';
import { showSnackbar } from '../../../actions/snackbar';
import { get_request_high_resolution } from "../../../actions/requestHighResolution";
import Spinner from 'react-bootstrap/Spinner';
import { useTranslation } from 'react-i18next';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

const RequestHighResolutionPopup = ({ open, handleClose }) => {

    const [Subscription, setSubscription] = useState(0)
    const userId = useSelector(state => state.auth.user.id);
    const taskId = useSelector(state => state.mapReducer.taskIdDetails)
    const subscriptionData = useSelector(state => state.requestReducer.requests)
    const [loadingBtn, setloadingBtn] = useState(false)
    const [sliderValue, setSliderValue] = useState(0);
    const { t } = useTranslation();

    const changeSubscription = (event) => {
        setSubscription(event.target.value);
    }
    useEffect(() => {
        if (!subscriptionData) return
        const subscriptionArray = {
            "On-Demand": 0,
            "Monthly": 1,
            "Weekly": 2
        }
        const value = subscriptionArray[subscriptionData.subscription]
        if (value) {
            setSubscription(value);
        }

    }, [subscriptionData])

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        borderRadius: '5px',
        boxShadow: 24,
        p: 4,
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const submitSubscription = (e) => {
    //     setloadingBtn(true)
    //     const today = new Date();
    //     const year = today.getFullYear();
    //     const month = String(today.getMonth() + 1).padStart(2, '0');
    //     const day = String(today.getDate()).padStart(2, '0');
    //     const date = `${year}-${month}-${day}`;
    //     dispatch(addSubscription(taskId, userId, date, Subscription)).then(res => {
    //         if (res.status == 200) {
    //             setloadingBtn(false)
    //             dispatch(showSnackbar("success", undefined, res.data.message, "top", "right"))
    //             dispatch(get_request_high_resolution(taskId))
    //             handleClose()
    //         } else if (res.status == 203) {
    //             dispatch(showSnackbar("error", undefined, res.data.message, "top", "right"))
    //             handleClose()
    //             setloadingBtn(false)
    //         } else if (res.status == 201) {
    //             dispatch(showSnackbar("warning", undefined, res.data.message, "top", "right"))
    //             setloadingBtn(false)
    //         }
    //     })

    // }
    const submitOrder = (e) => {
        setloadingBtn(true)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        const order_date = document.getElementById("pl_order_date").value;
        const order_cloud = document.getElementById("pl_order_cloud").value;

        dispatch(submitHighResOrder(taskId, userId, order_date, order_cloud,Subscription)).then(res => {
            if (res.status == 200) {
                setloadingBtn(false)
                dispatch(showSnackbar("success", undefined, res.data.message, "top", "right"))
                dispatch(get_request_high_resolution(taskId))
                handleClose()
            } else if (res.status == 203) {
                dispatch(showSnackbar("error", undefined, res.data.message, "top", "right"))
                handleClose()
                setloadingBtn(false)
            } else if (res.status == 201) {
                dispatch(showSnackbar("warning", undefined, res.data.message, "top", "right"))
                setloadingBtn(false)
            }else if (res.status == 204) {
                dispatch(showSnackbar("warning", undefined, "No imagery available for the given date and cloud coverage", "top", "right"))
                setloadingBtn(false)
            }
        })

    }
    const getOrdersList = (e) => {
        setloadingBtn(true)

        dispatch(getOrders(taskId,Subscription)).then(res => {
            // if (res.status == 200) {
            //     setloadingBtn(false)
            //     dispatch(showSnackbar("success", undefined, res.data.message, "top", "right"))
                // dispatch(get_request_high_resolution(taskId))
            //     handleClose()
            // } else if (res.status == 203) {
            //     dispatch(showSnackbar("error", undefined, res.data.message, "top", "right"))
            //     handleClose()
            //     setloadingBtn(false)
            // } else if (res.status == 201) {
            //     dispatch(showSnackbar("warning", undefined, res.data.message, "top", "right"))
            //     setloadingBtn(false)
            // }
        })

    }
    

    const handleSliderChange = (e)=>{
        setSliderValue(e.target.value);
    }

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <Row className='mt-3 mb-3'>
                            <div className='col-12'>
                                <Typography id="transition-modal-title " className='text-center' variant="h5" component="h2" >
                                    {t("High-Resolution Satellite Imagery Subscription")}
                                </Typography>
                            </div>
                        </Row>
                        <Row className='mt-3 mb-3 justify-content-center'>
                            <div className='col-md-2 col-sm-6'>
                                <img src={logo_sat} width={"100%"} />
                            </div>
                        </Row>
                        <Row className='mt-3 mb-3'>
                            <div className='col-12'>
                                <Typography id="transition-modal-title" component="h4" >
                                    {/* {t("Choose Image Uate Frequency: Select whether you want to receive high-resolution satellite imagery on a weekly, monthly, or on-demand basis.")} */}
                                    {t("Set high resolution imagery acquisition date and maximum cloud cover.")}
                                </Typography>
                            </div>
                        </Row>
                        <Row>
                            <div className='col-6 justify-content-center'>
                                <input type="date" id="pl_order_date" name="order date" min="2018-08-01"  max={new Date().toISOString().split('T')[0]} defaultValue={new Date().toISOString().split('T')[0]} />
                                
                            </div>
                            <div className='col-6'>
                                <input type="range" id="pl_order_cloud" name="order cloud" onChange={handleSliderChange} defaultValue={0}/>
                                <span className='col-1'>{sliderValue}%</span>
                                <CloudQueueIcon/>
                            </div>
                        </Row>
                        {/* <Row className='mt-3 mb-3'>
                            <div className='col-12'>
                                <FormControl>
                                    <RadioGroup
                                        aria-labelledby="demo-radio-buttons-group-label"
                                        name="radio-buttons-group"
                                        row
                                        value={Subscription}
                                        defaultValue="0"
                                        onChange={changeSubscription}
                                    >
                                        <FormControlLabel value="0" control={<Radio />} label={t("On-Demand")} />
                                        <FormControlLabel value="1" control={<Radio />} label={t("Monthly")} />
                                        <FormControlLabel value="2" control={<Radio />} label={t("Weekly")} />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </Row> */}
                        <Row className='mt-3 mb-3'>
                            <div className='col-md-6 offset-3 d-flex justify-content-around'>
                                {/* <CustomButton color='DeleteTask' startIcon={<AiOutlineDelete />} onClick={handleDeleteTask}>Delete</CustomButton>
                                <CustomButton startIcon={<MdOutlineCancel />} onClick={handleClose}>Cancel</CustomButton> */}
                                <Button className="btn btn-login" onClick={submitOrder} disabled={loadingBtn}>{loadingBtn ? <span> {t("loading")} < Spinner animation="border" size="sm" /></span> : t("Submit")}</Button>
                                {/* disabled={loadingBtn}>{loadingBtn ? <span> {t("loading")} < Spinner animation="border" size="sm" /></span> :  */}
                                <Button variant="light" onClick={handleClose}>{t("Cancel")}</Button>
                            </div>
                        </Row>
                    </Box>
                </Fade>
            </Modal>
        </div >
    );
}

export default RequestHighResolutionPopup