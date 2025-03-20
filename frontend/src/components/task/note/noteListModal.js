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
import { addSubscription } from '../../../actions/task';
import { Chip, FormControl, FormControlLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Radio, RadioGroup, Tooltip } from '@mui/material';
// import logo_sat from '../../assets/images/satellite.gif'
import Button from 'react-bootstrap/esm/Button';
import { showSnackbar } from '../../../actions/snackbar';
import { BsFileEarmarkExcelFill } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";

import loading from '../../../assets/images/loading_small.svg'
import { add_request, get_request_high_resolution } from "../../../actions/requestHighResolution";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Spinner from 'react-bootstrap/Spinner';
import { get_filenames, setSheetName } from "../../../actions/note";
import NoteModal from "./noteModal";


const NoteListModal = ({ open, handleClose, handleNoteModal, idTask }) => {

    const filenames = useSelector(state => state.noteReducer.fileNames)
    const [ListNames, setListNames] = useState(null)
    const [openNoteModal, setopenNoteModal] = useState(null)
    const [datasheetName, setdatasheetName] = useState(null)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(get_filenames(idTask))
    }, [open])
    useEffect(() => {
    }, [filenames])

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

    const handleOpenNoteModal = (name) => {
        dispatch(setSheetName(name))
        handleNoteModal()
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
                    <Box sx={style} className='custom-modal'>
                        <Row className='mt-3 mb-3'>
                            <div className='col-12'>
                                <Typography id="transition-modal-title " className='text-center' variant="h5" component="h2" >
                                    Technical spreadsheets List
                                </Typography>
                            </div>
                        </Row>
                        {/* <Row className='mt-3 mb-3'>
                            <div className='col-12'>
                                <Typography id="transition-modal-title" className='text-center' component="h4" >
                                    Find all technical spreadsheets in one convenient place: your files list.
                                </Typography>
                            </div>
                        </Row> */}
                        <Row className='mt-3 mb-3 justify-content-center'>
                            <div className='col-md-6 '>
                                <List sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    position: 'relative',
                                    overflow: 'auto',
                                    // maxHeight: 200,
                                    '& ul': { padding: 20 },
                                }}>
                                    {filenames && filenames.map((item, index) => {
                                        return (
                                            <ListItem disablePadding key={index} onClick={() => handleOpenNoteModal(item)}>
                                                <ListItemButton>
                                                    <BsFileEarmarkExcelFill color='#5fb000' />
                                                    <ListItemText primary={item} sx={{ marginLeft: "5px" }} />
                                                    <ListItemIcon sx={{ minWidth: "0px" }}>
                                                        <BiEdit color='#6f9d2f' />
                                                    </ListItemIcon>
                                                </ListItemButton>
                                            </ListItem>
                                        )
                                    })}
                                </List>
                            </div>
                        </Row>
                        <Row className='mt-3 mb-3'>
                            <div className='col-md-6 offset-3 d-flex justify-content-around'>
                                {/* <CustomButton color='DeleteTask' startIcon={<AiOutlineDelete />} onClick={handleDeleteTask}>Delete</CustomButton>
                                <CustomButton startIcon={<MdOutlineCancel />} onClick={handleClose}>Cancel</CustomButton> */}
                                {/* {isOnDemandRequest === 0 ? (
                                    <Button className="btn btn-login" onClick={handleRequest} disabled={loadingBtn}>{loadingBtn ? <span> loading < Spinner animation="border" size="sm" /></span> : "Request Imagery now"}</Button>
                                ) : isOnDemandRequest === 1 ? (
                                    <Tooltip title={<span>
                                        <WarningAmberIcon color="#ed6c02" className="tooltip-icon" />
                                        You can't request new imagery until all requests are finished !
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
                                        <span><Button className="btn btn-login" disabled>Request Imagerry now</Button></span>


                                    </Tooltip>
                                ) : (
                                    ""
                                )} */}
                                <Button variant="light" onClick={handleClose}>Close</Button>
                            </div>
                        </Row>
                    </Box>
                </Fade>
            </Modal>
        </div >
    );
}

export default NoteListModal