import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Row from 'react-bootstrap/esm/Row';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { LOADING_BEGIN, LOADING_END } from '../../utils/types';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../CustomButton';
import { AiOutlineDelete } from 'react-icons/ai';
import { MdOutlineCancel } from "react-icons/md";
import { deleteTask } from '../../actions/task';
import { showSnackbar } from '../../actions/snackbar';

const DeleteProject = ({ open, handleClose, id_task }) => {

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

    const handleDeleteTask = (e) => {
        dispatch({
            type: LOADING_BEGIN
        })
        dispatch(deleteTask(id_task)).then(res => {
            if (res.status == 200) {
                dispatch(showSnackbar("success", undefined, res.data.message, "top", "right"))
                handleClose()
                if (window.location.pathname === '/dashboard/projects/list') {
                    window.location.reload();
                } else {
                    setTimeout(() => {

                        navigate('/dashboard/projects/list');

                    }, 500);
                }
            } else {

            }
        }).catch(error => {
        })
        dispatch({
            type: LOADING_END
        });
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
                        <Typography id="transition-modal-title" variant="h5" component="h2" >
                            Are you sure you want to delete this task? This action cannot be undone.
                        </Typography>
                        <Row className='mt-3 mb-3'>
                            <div className='col-md-6 offset-3 d-flex justify-content-around'>
                                <CustomButton color='DeleteTask' startIcon={<AiOutlineDelete />} onClick={handleDeleteTask}>Delete</CustomButton>
                                <CustomButton startIcon={<MdOutlineCancel />} onClick={handleClose}>Cancel</CustomButton>
                            </div>
                        </Row>
                    </Box>
                </Fade>
            </Modal>
        </div >
    );
}

export default DeleteProject