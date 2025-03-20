import React, {useEffect, useMemo, useState} from "react";

import { Box, Grid} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import DownloadIcon from '@mui/icons-material/Download';

import "../../assets/scss/cards.scss";
import "../../assets/css/card.css";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import LoadingData from "../../utils/loadingdata";
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import "react-data-table-component-extensions/dist/index.css";
import Tooltip from "@mui/material/Tooltip";
import {

    getSensorList,
    listSensorDataByTask,
} from "../../actions/project";

import FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import IconButton from "@mui/material/IconButton";

const Sensor = ({}) => {
    const [sensorData, setSensorData] = useState([]);
    const [indexSensorSelect, setindexSensorSelect] = useState(0);
    const [pendingSensorData, setpendingSensorData] = useState(true);
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const [listSensor, setlistSensor] = useState(null);
    useEffect(() => {
        dispatch(getSensorList()).then((response) => {
            setlistSensor(response.data.data);
            setindexSensorSelect(response.data.data[0].task);
        });
    }, []);
    useEffect(() => {
        if (indexSensorSelect !== 0) {
            dispatch(listSensorDataByTask(indexSensorSelect)).then((res) => {
                setSensorData(res.data.data);
                setpendingSensorData(false);
            });
        }
    }, [indexSensorSelect]);
    const handleChangeSensor = (e) => {
        setpendingSensorData(true);
        setindexSensorSelect(e.target.value);
    };
    const HoverCell = ({value, truncate = true}) => {
        const [isHovered, setIsHovered] = useState(false);
        const maxLength = 10;
        const displayValue =
            truncate && value.toString().length > maxLength
                ? `${value.toString().substring(0, maxLength)}...`
                : value.toString();

        return (
            <Tooltip
                title={value}
                arrow
                componentsProps={{
                    tooltip: {
                        sx: {
                            bgcolor: "white",
                            color: "black",
                            border: "1px solid black",
                            "& .MuiTooltip-arrow": {
                                color: "white",
                                "&::before": {
                                    border: "1px solid black",
                                },
                            },
                        },
                    },
                }}
            >
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        maxWidth: "80px",
                    }}
                >
                    {truncate ? (isHovered ? value : displayValue) : value}
                </div>
            </Tooltip>
        );
    };
    const columns = [
        {
            name: <HoverCell value={t("Time")} truncate={false}/>,
            selector: (row) => row.time,
            sortable: true,
            minWidth: "13%",
            cell: (row) => <HoverCell value={row.time} truncate={false}/>,
            cellExport: (row) => row.time,
        },
        {
            name: <HoverCell value={t("Charge")}/>,
            selector: (row) => parseFloat(row.charge).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.charge).toString()}/>,
            cellExport: (row) => parseFloat(row.charge).toString(),
        },
        {
            name: <HoverCell value={t("Temperature")}/>,
            selector: (row) => parseFloat(row.temperature).toString(),
            cell: (row) => (
                <HoverCell value={parseFloat(row.temperature).toString()}/>
            ),
            cellExport: (row) => parseFloat(row.temperature).toString(),
        },
        {
            name: <HoverCell value={t("Humidity")}/>,
            selector: (row) => parseFloat(row.humidity).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.humidity).toString()}/>,
            cellExport: (row) => parseFloat(row.humidity).toString(),
        },
        {
            name: <HoverCell value={t("Pressure")}/>,
            selector: (row) => parseFloat(row.pressure).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.pressure).toString()}/>,
            cellExport: (row) => parseFloat(row.pressure).toString(),
        },
        {
            name: <HoverCell value={t("adc")}/>,
            selector: (row) => parseFloat(row.adc).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.adc).toString()}/>,
            cellExport: (row) => parseFloat(row.adc).toString(),
        },
        {
            name: <HoverCell value={t("ts")}/>,
            selector: (row) => parseFloat(row.ts).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.ts).toString()}/>,
            cellExport: (row) => parseFloat(row.ts).toString(),
        },
        {
            name: <HoverCell value={t("mv1")}/>,
            selector: (row) => parseFloat(row.mv1).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.mv1).toString()}/>,
            cellExport: (row) => parseFloat(row.mv1).toString(),
        },
        {
            name: <HoverCell value={t("mv2")}/>,
            selector: (row) => parseFloat(row.mv2).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.mv2).toString()}/>,
            cellExport: (row) => parseFloat(row.mv2).toString(),
        },
        {
            name: <HoverCell value={t("mv3")}/>,
            selector: (row) => parseFloat(row.mv3).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.mv3).toString()}/>,
            cellExport: (row) => parseFloat(row.mv3).toString(),
        },
        {
            name: <HoverCell value={t("et0")}/>,
            selector: (row) => parseFloat(row.et0).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.et0).toString()}/>,
            cellExport: (row) => parseFloat(row.et0).toString(),
        },
        {
            name: <HoverCell value={t("Rain")}/>,
            selector: (row) => parseFloat(row.rain).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.rain).toString()}/>,
            cellExport: (row) => parseFloat(row.rain).toString(),
        },
        {
            name: <HoverCell value={t("Radiation")}/>,
            selector: (row) => parseFloat(row.radiation).toString(),
            cell: (row) => <HoverCell value={parseFloat(row.radiation).toString()}/>,
            cellExport: (row) => parseFloat(row.radiation).toString(),
        },
    ];
    const customStyleDatatable = {

        headCells: {
            style: {
                fontSize: "12px",
                fontWeight: "600",
                justifyContent: "center",
                className: "boEoOa",
                position: "relative",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                lineHeight: "normal",
                paddingLeft: "5px",
                paddingRight: "5px",
            },
        },
        cells: {
            style: {
                position: "relative",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                lineHeight: "normal",
                paddingLeft: "16px",
                paddingRight: "16px",
                wordBreak: "break-word",
                fontSize: "13px",
            },
        },
    };
    const tableData = {
        columns,
        data: sensorData,
        print: false,
        export: false,
        exportHeaders: true,
    };

    const getPlainColumnNames = (columns) => {
        return columns.map(col => typeof col.name === 'string' ? col.name : col.name.props.value);
    };

    const customExport = async (columns, data) => {
        try {
            const plainColumnNames = getPlainColumnNames(columns);
            const updatedColumns = [...plainColumnNames, 'Irrigation'];
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sensor');
            const borderStyle = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'}
            };
            const headerFill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FF7AB563'}
            };

            const headerRow = worksheet.addRow(updatedColumns);
            headerRow.eachCell({includeEmpty: true}, (cell) => {
                cell.font = {color: {argb: 'OOOOOOO0'}, bold: true};
                cell.alignment = {horizontal: 'center'};
                cell.border = borderStyle;
                cell.fill = headerFill;
            });
            data.forEach(row => {
                const dataRow = worksheet.addRow(columns.map(col => col.selector(row)).concat(''));
                dataRow.eachCell({includeEmpty: true}, (cell) => {
                    cell.alignment = {horizontal: 'center'};
                    cell.border = borderStyle;
                });
            });
            updatedColumns.forEach((col, index) => {
                const maxLength = Math.max(
                    ...data.map(row => columns[index] ? columns[index].selector(row).toString().length : 0),
                    col.length
                );
                const width = maxLength + 2;
                worksheet.getColumn(index + 1).width = width;
            });
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {type: 'application/octet-stream'});
            FileSaver.saveAs(blob, 'Sensor data.xlsx');
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };
    return (
        <Box sx={{flexGrow: 1, m: 2}}>
            <>
                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid item xs={12}>
                        <div className="intro-text">
                            <h2>{t("Sensor Data")}</h2>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{my: 2}}>
                        <FormControl
                            required
                            fullWidth={true}
                            size="small"
                            color="IconColor"
                        >
                            <InputLabel id="demo-select-sensor-label">
                                {t("Sensors")}
                            </InputLabel>
                            <Select
                                labelId="demo-select-sensor-label"
                                id="demo-select-sensor"
                                label="Sensors"
                                value={indexSensorSelect}
                                fullWidth
                                onChange={handleChangeSensor}
                                name="sensor"
                                required
                            >
                                {listSensor &&
                                    listSensor.length > 0 &&
                                    listSensor.map((item) => (
                                        <MenuItem key={item["task"]} value={item["task"]}>
                                            {item["sensor_name"]}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        {sensorData.length > 0 ? (
                            <Box position="relative">

                                <>
                                    <DataTableExtensions {...tableData}>
                                        <DataTable
                                            customStyles={customStyleDatatable}
                                            pagination
                                            progressPending={pendingSensorData}
                                            progressComponent={<LoadingData/>}
                                            highlightOnHover
                                            responsive
                                        />
                                    </DataTableExtensions>
                                    <IconButton
                                        onClick={() => customExport(columns, sensorData)}
                                        sx={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            color: '#1E90FF',

                                        }}
                                    >
                                        <DownloadIcon/>
                                    </IconButton>
                                </>
                            </Box>

                        ) : (
                            <Grid item xs={12}>
                                <Typography variant="body1" align="center" sx={{py: 2}}>
                                    There are no records to display
                                </Typography>
                            </Grid>
                        )}
                    </Grid>

                </Grid>
            </>


        </Box>
    );
};
export default Sensor;
