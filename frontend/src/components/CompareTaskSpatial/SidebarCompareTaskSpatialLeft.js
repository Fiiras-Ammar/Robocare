import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {isMobile} from "react-device-detect";
import {
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Chip,
    Box,
    Tooltip,
    IconButton,
} from "@mui/material";
import {styled} from '@mui/material/styles';
import {InfoOutlined} from '@mui/icons-material';
import indexes from "../../utils/indexes.json";
import {

    setCheckboxLayerStateSpatialLeft,
    setClickEventFailSpatialLeft,
    setClickEventSucessSpatialLeft,
} from "../../actions/map";
import {
    getHistogramSpatialLeft,
} from "../../actions/histogram";
import {HISTOGRAM_FAIL_SPATIAL_LEFT} from "../../utils/types";

const StyledTooltip = styled(({className, ...props}) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    '& .MuiTooltip-tooltip': {
        backgroundColor: 'white',
        color: 'black',
        border: '1px solid black',
        maxWidth: 320,
        fontSize: theme.typography.pxToRem(12),
        '& h4': {
            margin: '0 0 8px 0',
        },
    },
    '& .MuiTooltip-arrow': {
        color: 'white',
        '&::before': {
            border: '1px solid black',
        },
    },
}));

const SidebarCompareTaskSpatialLeft = () => {
    const [sidebarRef, setSidebarRef] = useState(null);
    const dispatch = useDispatch();
    const [selectedIndex, setSelectedIndex] = useState(null);
    const selected_date_spatial_left = useSelector((state) => state.mapReducer.SelectedDateSpatialLeft);
    const id_task = useSelector((state) => state.mapReducer.taskIdDetailsSpatialLeft);
    const [providerIndexList, setProviderIndexList] = useState([]);
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const checkboxState = null
    const [selectedDateLeft, setSelectedDateLeft] = useState(selected_date_spatial_left);

    useEffect(() => {
        setSelectedDateLeft(selected_date_spatial_left)
    }, [selected_date_spatial_left]);
    useEffect(() => {
        if (!selectedDateLeft ) {
            setIsLoading(true);
            return;
        }

        const newProviderIndexList = indexes[selectedDateLeft.provider] || [];
        setProviderIndexList(newProviderIndexList);
        setIsLoading(false);

        if (checkboxState === null || checkboxState === undefined) {
            const defaultIndex = newProviderIndexList.length > 1
                ? newProviderIndexList[1].id
                : (newProviderIndexList[0]?.id || "NDVI");

            setSelectedIndex(defaultIndex);
            dispatch(setCheckboxLayerStateSpatialLeft(defaultIndex));
            if (selectedDateLeft.date ) {
                dispatch(getHistogramSpatialLeft(
                    id_task,
                    selectedDateLeft.date,
                    selectedDateLeft.provider,
                    defaultIndex
                ));

            }
        }
    }, [selectedDateLeft, checkboxState, dispatch, id_task]);
    const handleSelectChange = (event) => {
        const selectedId = event.target.value;
        setSelectedIndex(selectedId);
        dispatch({type: HISTOGRAM_FAIL_SPATIAL_LEFT});

        if (selectedId && selectedDateLeft?.date ) {
            dispatch(setCheckboxLayerStateSpatialLeft(selectedId));
            dispatch(getHistogramSpatialLeft(
                id_task,
                selectedDateLeft.date,
                selectedDateLeft.provider,
                selectedId
            ));

        }
    };
    useEffect(() => {
        if (!sidebarRef) return;
        const events = isMobile ? ["touchstart", "touchmove"] : ["mouseenter"];
        events.forEach(event => sidebarRef.addEventListener(event, disableMapInteractions));
        sidebarRef.addEventListener("mouseleave", enableMapInteractions);
        return () => {
            events.forEach(event => sidebarRef.removeEventListener(event, disableMapInteractions));
            sidebarRef.removeEventListener("mouseleave", enableMapInteractions);
        };
    }, [sidebarRef]);

    const disableMapInteractions = () => dispatch(setClickEventFailSpatialLeft());
    const enableMapInteractions = () => dispatch(setClickEventSucessSpatialLeft());

    const renderBandBadges = (bands) => (
        <Box display="flex" gap={1} mt={1}>
            {bands.map((band, index) => (
                <Chip
                    key={index}
                    label={band.band}
                    className={band.badge}
                    style={{color: "white", fontSize: "10px", marginBottom: '10px'}}
                />
            ))}
        </Box>
    );
    const selectedIndexItem = providerIndexList.find(item => item.id === selectedIndex);
    return (
        <div
            ref={setSidebarRef}
            style={{
                backgroundColor: "#ffffff",
                position: "absolute",
                margin: "0px",
                transition: "0.5s",
                zIndex: 9999,
                padding: "10px 0px",
                borderRadius: "5px",
                maxWidth: "360px",
                height: "51px",
                right: isMobile ? "2px" : "1%",
                bottom: "10px",
                paddingRight: isMobile ? "10px" : ""
            }}
        >
            {isLoading ? (
                <div className="d-flex align-items-center justify-content-center" style={{height: '50px'}}>
                    <div className="text-center">
                        <div className="mt-2">
                            <span style={{fontSize: '15px', fontWeight: '600'}}>
                                {t('Loading ...')}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <Box display="flex" alignItems="center">
                    <FormControl fullWidth>
                        <InputLabel id="index-select-label">{t('Select Index')}</InputLabel>
                        <Select
                            labelId="index-select-label"
                            value={selectedIndex}
                            onChange={handleSelectChange}
                            label="Select Index"
                            displayEmpty

                            style={{marginLeft: "10px", height: "30px"}}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        backgroundColor: "#f0f0f0",
                                        border: "1px solid #ccc",
                                        marginTop: isMobile ? "-10px" : "-2.5%",
                                        fontSize: '10px',
                                        maxWidth: "265px",
                                        marginRight: "2px",

                                    },
                                },
                                anchorOrigin: {
                                    vertical: isMobile ? "top" : "bottom",
                                    horizontal: "center",
                                },

                                transformOrigin: {
                                    vertical: "bottom",
                                    horizontal: "center",
                                },
                            }}
                        >
                            {providerIndexList.slice(1).map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    <Box display="flex" alignItems="center">
                                        <span style={{fontSize: "12px"}}>{t(item.index)}</span>
                                        {!isMobile && (
                                            <Box style={{fontSize: "12px"}} ml={1}>{renderBandBadges(item.bands)}</Box>
                                        )}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {selectedIndexItem && !isMobile && (
                        <StyledTooltip
                            title={
                                <div>
                                    <h4>{selectedIndexItem.index}</h4>
                                    <div dangerouslySetInnerHTML={{__html: selectedIndexItem.description}}/>

                                    <Box mt={2}>
                                        {renderBandBadges(selectedIndexItem.bands || [])}
                                    </Box>
                                </div>
                            }
                            arrow
                            placement="top"
                        >
                            <IconButton>
                                <InfoOutlined style={{color: 'black'}}/>
                            </IconButton>
                        </StyledTooltip>
                    )}
                </Box>
            )}
        </div>
    );
};

export default SidebarCompareTaskSpatialLeft;
