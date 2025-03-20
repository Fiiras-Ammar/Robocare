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
import { addSubscription, downloadOrderReport } from '../../../actions/task';
import { Chip, FormControl, FormControlLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Radio, RadioGroup, Tooltip } from '@mui/material';
// import logo_sat from '../../assets/images/satellite.gif'
import Button from 'react-bootstrap/esm/Button';
import { showSnackbar } from '../../../actions/snackbar';
import { BsFillCloudArrowDownFill } from "react-icons/bs";
import { TbMapSearch } from "react-icons/tb";

import { BsFileEarmarkPdfFill } from "react-icons/bs";
import loading from '../../../assets/images/loading_small.svg'
import { add_request, get_request_high_resolution } from "../../../actions/requestHighResolution";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Spinner from 'react-bootstrap/Spinner';
import { useTranslation } from 'react-i18next';
import { Col } from "react-bootstrap";

import {
    change_selected_date,
} from "../../../actions/task"

const HighResolutionPopup = ({ data, open, handleClose, openrequestmodal }) => {

    const allOrdersSuccess =  data.every(obj => obj["order_status"] === "success");

    const taskId = useSelector(state => state.mapReducer.taskIdDetails)
    const subscription = useSelector(state => state.requestReducer.requests)
    const taskName = useSelector(state => state.mapReducer.taskNameDetails)
    const [isOnDemandRequest, setisOnDemandRequest] = useState(1)
    const [loadingBtn, setloadingBtn] = useState(false)
    const { t } = useTranslation();
    // useEffect(() => {
    //     if (!subscription) return
    //     if (subscription.subscription == "On-Demand") {
    //         let checkNotReadyRequest = false
    //         subscription.HighResolutionRequests.map((item) => {
    //             if (!item.file) {
    //                 checkNotReadyRequest = true
    //             }
    //         })
    //         if (checkNotReadyRequest == false) {
    //             setisOnDemandRequest(0)
    //         } else {
    //             setisOnDemandRequest(1)
    //         }
    //     } else {
    //         setisOnDemandRequest(2)
    //     }
    // }, [subscription])


    useEffect(() => {
        if (!taskId) return
        dispatch(get_request_high_resolution(taskId))
    }, [open, taskId])

    const redirectRequest = (file) => {
        window.open(`${process.env.REACT_APP_API_URL}${file}`, "_blank");
    }


    const changeSelectedDate = (date, provider) => {
        handleClose()
        dispatch(change_selected_date(date, provider));
    };

    const handleRequest = () => {
        setloadingBtn(true)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        dispatch(add_request(date, subscription.id)).then(res => {
            if (res.status == 200) {
                setloadingBtn(false)
                dispatch(showSnackbar("success", undefined, res.data.message, "top", "right"))
                dispatch(get_request_high_resolution(taskId))
                handleClose()
            } else {
                dispatch(showSnackbar("error", t("something went wrong !"), "top", "right"))
                handleClose()
                setloadingBtn(false)
            }
        })
    }
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        borderRadius: '5px',
        boxShadow: 24,
        p: 4,
        width: "50%"
    };

    const dispatch = useDispatch();

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
                                    {t("High-Resolution Satellite Imagery orders for")} {taskName} {subscription && <Chip label={subscription.subscription} color="primary" size='small' onClick={openrequestmodal} />}
                                </Typography>
                            </div>
                        </Row>
                        {/* <Row className='mt-3 mb-3'>
                            <div className='col-12'>
                                <Typography id="transition-modal-title" className='text-center' component="h4" >
                                    {t("All your High resolution imagery orders.")}
                                </Typography>
                            </div>
                        </Row> */}
                        <Row className='mt-3 mb-3 justify-content-center'>
                            <div className='col-md-12 '>
                                <List sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    position: 'relative',
                                    overflow: 'auto',
                                    maxHeight: 200,
                                    '& ul': { padding: 20 },
                                }}>
                                    {/* {subscription && subscription.HighResolutionRequests.map((item, index) => { */}
                                {data && data.map((item,index) => {

                                        if (item.order_status === "running") {
                                            return (
                                                <ListItem disablePadding key={index}>
                                                    <ListItemButton >
                                                        {/* <BsFileEarmarkPdfFill color='#e94848' /> */}
                                                        <ListItemText primary={item.acquisition_date} />
                                                        <ListItemIcon>
                                                            <img src={loading} width={"20px"} />
                                                        </ListItemIcon>
                                                        {/* <span>{item.order_status}</span> */}
                                                    </ListItemButton>
                                                </ListItem>
                                            )
                                        } else {
                                            // Split the file path by '/'
                                            // const filePathParts = item.file.split('/');
                                            // Get the last part of the array, which is the file name
                                            // const fileName = filePathParts[filePathParts.length - 1];
                                            return (
                                                <ListItem disablePadding key={index} onClick={() => changeSelectedDate(item.acquisition_date, "PS")}>
                                                    {/* downloadOrderReport(item.order_id, taskId, `${taskName}_${item.acquisition_date}`) */}
                                                    <ListItemButton>
                                                        {/* <BsFileEarmarkPdfFill color='#e94848' />     */}
                                                        <ListItemText primary={item.acquisition_date} />
                                                        {/* <span>{item.order_status}</span> */}

                                                        <ListItemIcon>
                                                            <TbMapSearch fontSize={"1.5rem"} color='#6f9d2f' />

                                                        </ListItemIcon>
                                                    </ListItemButton>
                                                </ListItem>
                                            )
                                        }

                                    })}
                                </List>
                            </div>
                        </Row>
                        <Row className='mt-3 mb-3'>
                            <div className='col-md-6 offset-3 d-flex justify-content-around'>
                                {/* <CustomButton color='DeleteTask' startIcon={<AiOutlineDelete />} onClick={handleDeleteTask}>Delete</CustomButton>
                                <CustomButton startIcon={<MdOutlineCancel />} onClick={handleClose}>Cancel</CustomButton> */}
                                {isOnDemandRequest === 0 ? (
                                    <Button className="btn btn-login" onClick={handleRequest} disabled={loadingBtn}>{loadingBtn ? <span> t("loading") < Spinner animation="border" size="sm" /></span> : t("Request Imagery now")}</Button>
                                ) : isOnDemandRequest === 1 ? (
                                    <Tooltip title={<span>
                                        <WarningAmberIcon color="#ed6c02" className="tooltip-icon" />
                                        {t("You can't request new imagery until all requests are finished !")}
                                    </span>} PopperProps={{
                                        sx: {
                                            "& .MuiTooltip-tooltip": {
                                                border: "solid #663C00 1px",
                                                backgroundColor: "#FFF4E5",
                                                color: "#663C00",
                                                padding: "10px 10px",
                                                width: "max-content",
                                                display: "inline",
                                                "& .tooltip-icon": {
                                                    // Add your custom styles for the icon here
                                                    fontSize: '20px',
                                                    color: '#ed6c02',
                                                    marginRight: '8px',
                                                },
                                            }
                                        }
                                    }} followCursor>
                                        <span><Button className="btn btn-login" disabled={!allOrdersSuccess} onClick={openrequestmodal} >{t("Request Imagery now")}</Button></span>


                                    </Tooltip>
                                ) : (
                                    ""
                                )}
                                <Button variant="light" onClick={handleClose}>{t("Close")}</Button>
                            </div>
                        </Row>
                    </Box>
                </Fade>
            </Modal>
        </div >
    );
}

export default HighResolutionPopup
