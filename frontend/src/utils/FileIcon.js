import React from "react";

import {styled} from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ArticleIcon from '@mui/icons-material/Article';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';


const FileIcon = (fileName) => {

    const StyledIcon = styled("div")(({theme, color}) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        "& svg": {
            fontSize: "24px",
            color: color ? color : theme.palette.text.primary,
        },
    }));
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
        case "jpg":
        case "jpeg":
        case "png":
            return <StyledIcon color="#3f51b5"><ImageIcon/></StyledIcon>;
        case "pdf":
            return <StyledIcon color="#ff5722"><PictureAsPdfIcon/></StyledIcon>;
        case "doc":
        case "docx":
            return <StyledIcon color="#2196f3"><DescriptionIcon/></StyledIcon>;
        case "xls":
        case "xlsx":
            return <StyledIcon color="#4caf50"><TableChartIcon/></StyledIcon>;
        case "txt":
            return <StyledIcon color="#ff9800"><ArticleIcon/></StyledIcon>;
        case "csv":
        case "ppt":
        case "pptx":
            return <StyledIcon color="#9c27b0"><InsertDriveFileIcon/></StyledIcon>;
        default:
            return <StyledIcon color="#757575"><InsertDriveFileIcon/></StyledIcon>;
    }

};
export default FileIcon;
