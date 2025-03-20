import React, { useEffect, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import { Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { hideSnackbar } from "../actions/snackbar";

const SnackBarAlert = ({ }) => {

    // const vert = vertical || 'top'
    // const horz = horizontal || 'right'
    // const autohide = autoHide || 6000;
    // const alertType = alert || 'error'
    const dispatch = useDispatch();
    const alert = useSelector(state => state.snackbarReducer.alert);
    const open = useSelector(state => state.snackbarReducer.open);
    const message = useSelector(state => state.snackbarReducer.message);
    const vert = useSelector(state => state.snackbarReducer.vertical);
    const horiz = useSelector(state => state.snackbarReducer.horizental);
    const autoHide = useSelector(state => state.snackbarReducer.autohide);
    const [Position, setPosition] = useState([])
    const handleClose = () => {
        dispatch(hideSnackbar());
    };

    return (
         vert && horiz && <Snackbar open={open} autoHideDuration={autoHide} onClose={handleClose} anchorOrigin={{ vertical: vert, horizontal: horiz }}>
            <Alert severity={alert} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}
export default SnackBarAlert