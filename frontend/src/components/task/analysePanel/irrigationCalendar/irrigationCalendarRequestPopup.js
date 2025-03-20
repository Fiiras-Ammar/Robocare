import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Row from 'react-bootstrap/esm/Row';
import { TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import TrackInvertedSlider from "./soilSlider.js"
import Select from '@mui/material/Select';
import Form from "react-bootstrap/Form";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCulture, getDensity, getIrrigation, getTexture, getVariety } from '../../../../actions/project';

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CustomButton from '../../../CustomButton';
import { IoIosCalendar } from 'react-icons/io';
import { MdOutlineCancel } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import cookies from 'js-cookie';

const IrrigationCalendarRequestForm = ({ open, handleClose, handleSubmit }) => {
    const [opensnack, setopensnack] = useState(false)
    const [message, setmessage] = useState(null)
    const { t } = useTranslation();

    const [isAgeValid, setIsAgeValid] = useState(false);
    const [isEfficiencyValid, setIsEfficiencyValid] = useState(false);

    const [type, settype] = useState(null)
    const [project, setProject] = useState(null);

    const [listCulture, setlistCulture] = useState(null)
    // const [Culture, setCulture] = useState(null)


    const [listTexture, setlistTexture] = useState(null)
    // const [Texture, setTexture] = useState(null)

    const [listIrrigation, setlistIrrigation] = useState(null)
    // const [Irrigation, setIrrigation] = useState(null)

    const [listVariety, setlistVariety] = useState(null)

    const [listDensity, setlistDensity] = useState(null)



    const handleCloseSnackBar = () => {
        setopensnack(false);
    };
    const handleOpenSnackBar = (type, msg) => {
        setopensnack(true);
        settype(type)
        setmessage(msg)
    }

    // useEffect(() => {
    //     dispatch(getCulture()).then((res) => {
    //         setlistCulture(res.data)
    //     })
    //     dispatch(getTexture()).then((res) => {
    //         setlistTexture(res.data)
    //     })
    //     dispatch(getIrrigation()).then((res) => {
    //         setlistIrrigation(res.data)
    //     })
    // }, [])

    const currentLanguageCode = cookies.get('i18next') || 'en';
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        bgcolor: 'background.paper',
        borderRadius: '5px',
        boxShadow: 24,
        p: 4,
    };
    const [formData, setFormData] = useState({ soil_type: null, source_rate: null, dripper_rate: null, drippers_number: null, foliage_diameter: null, inter_line: null, intra_line: null });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const { soil_type, source_rate, dripper_rate, drippers_number, foliage_diameter, inter_line, intra_line } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        let isValid = true;
        // setIsAgeValid(false);
        // setIsEfficiencyValid(false);

        // if (age <= 0) {
        //     setIsAgeValid(true);
        //     isValid = false;
        // }
        // if (efficiency < 1 || efficiency > 100) {
        //     setIsEfficiencyValid(true);
        //     isValid = false;
        // }

        if (isValid) {

            handleSubmit(formData)
        }

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
                        <Typography id="transition-modal-title" variant="h5" component="h2" className='text-center'>
                            {t("Please fill out the following information to generate your irrigation calendar")}
                        </Typography>
                        <Form onSubmit={e => onSubmit(e)}>
                            <Row>
                                <div className='col-md-12'>
                                    <FormControl>
                                        <Typography variant="h6" component="h2" className=''>{t("Irrigation system")}</Typography>
                                    </FormControl>
                                </div>
                            </Row>
                            <Row className='mt-3 mb-3'>

                                <div className='col-md-6'>
                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Source rate (liters/second)")}
                                            type="number"
                                            name='source_rate'
                                            inputProps={{ min: 0, step: 0.1 }}
                                            size="small"
                                            value={source_rate}
                                            onChange={e => onChange(e)}
                                            required
                                        />
                                    </FormControl>
                                </div>
                                <div className='col-md-6'>
                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Dripper rate (liters/hour)")}
                                            type="number"
                                            name='dripper_rate'
                                            inputProps={{ min: 0, step: 0.1 }}
                                            size="small"
                                            value={dripper_rate}
                                            onChange={e => onChange(e)}
                                            required
                                        />
                                    </FormControl>
                                </div>
                                <div className='col-md-6'>
                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Number of Drippers per plant")}
                                            type="number"
                                            name='drippers_number'
                                            inputProps={{ min: 1, step: 1 }}
                                            size="small"
                                            value={drippers_number}
                                            onChange={e => onChange(e)}
                                            required
                                        />
                                    </FormControl>
                                </div>

                            </Row>

                            <Row>
                                <div className='col-md-12'>
                                    <FormControl>
                                        <Typography variant="h6" component="h2" className=''>{t("Vegetation")}</Typography>
                                    </FormControl>
                                </div>
                            </Row>

                            <Row className='mt-3 mb-3'>
                                <div className='col-md-6'>
                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Foliage diameter (meters)")}
                                            type="number"
                                            name='foliage_diameter'
                                            size="small"
                                            value={foliage_diameter}
                                            inputProps={{ min: 0, step: 0.1 }}
                                            onChange={e => onChange(e)}
                                            required
                                        />
                                    </FormControl>
                                </div>

                                <div className='col-md-6'>

                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Inter line (meters)")}
                                            type="number"
                                            name='inter_line'
                                            inputProps={{ min: 0, step: 0.1 }}
                                            size="small"
                                            value={inter_line}
                                            onChange={e => onChange(e)}
                                            required
                                        />
                                    </FormControl>
                                </div>

                                <div className='col-md-6'>

                                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Intra line (meters)")}
                                            type="number"
                                            name='intra_line'
                                            inputProps={{ min: 0, step: 0.1 }}
                                            size="small"
                                            value={intra_line}
                                            onChange={e => onChange(e)}
                                            required
                                        />
                                    </FormControl>
                                </div>
                            </Row>

                            <Row>
                                <div className='col-md-12'>
                                    <FormControl>
                                        <Typography variant="h6" component="h2" className=''>{t("Soil type")}</Typography>
                                    </FormControl>
                                </div>
                            </Row>
                            <Row>
                                <div className='col-md-6'>
                                    <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <InputLabel id="demo-select-small-label">{t("Soil Type")}</InputLabel>
                                        <Select
                                            labelId="demo-select-small-label"
                                            id="demo-select-small"
                                            value={soil_type}
                                            label="Soil type"
                                            fullWidth
                                            onChange={e => onChange(e)}
                                            name='soil_type'
                                            required
                                        >
                                            <MenuItem value={"standard"}>Standard</MenuItem>
                                            <MenuItem value={"composite"}>Composite</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {/* <TrackInvertedSlider></TrackInvertedSlider> */}
                                </div>
                            </Row>

                            <Row className='mt-3'>
                                <div className='col-md-3'></div>
                                <div className='col-md-6 text-center d-flex justify-content-around'>
                                    <CustomButton type="submit" color='IconColor' size="medium" startIcon={<IoIosCalendar />}>{t("Generate Calendar")}</CustomButton>
                                    <CustomButton startIcon={<MdOutlineCancel />} onClick={handleClose}>{t("Cancel")}</CustomButton>
                                </div>
                            </Row>
                        </Form>
                    </Box>
                </Fade>
            </Modal>
        </div >
    );
}

export default IrrigationCalendarRequestForm