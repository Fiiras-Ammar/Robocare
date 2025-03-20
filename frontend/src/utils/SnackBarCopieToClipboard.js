import React from "react";
import Snackbar from '@mui/material/Snackbar';
import { SnackbarContent } from "@mui/material";

const SnackBarCopieToClipboard = ({ alert, open, message, handleClose, vertical, horizontal, autoHide }) => {
    const position = {
        vertical: vertical || 'top',
        horizontal: horizontal || 'right',
        autoHide: autoHide || 6000,
    };
    const alertType = alert || null
    return (
        <Snackbar open={open} autoHideDuration={autoHide} onClose={handleClose} anchorOrigin={position}>
            <SnackbarContent sx={{ minWidth: "200px!important", justifyContent: "center" }}
                message={message}
            />
        </Snackbar>
    );
}
export default SnackBarCopieToClipboard