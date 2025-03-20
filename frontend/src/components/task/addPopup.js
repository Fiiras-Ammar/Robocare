import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Row from 'react-bootstrap/esm/Row';
import {Checkbox, TextField, FormControlLabel} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Form from "react-bootstrap/Form";
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    getCulture,
    getDensity,
    getDensityAll,
    getIrrigation,
    getTexture,
    getVariety,
    getCultureByCategory,
    getNonTreeCultureIds
} from '../../actions/project';
import {useNavigate} from 'react-router-dom';
import {useEffect} from 'react';
import CustomButton from '../CustomButton';
import {IoIosAdd} from 'react-icons/io';
import {MdOutlineCancel} from 'react-icons/md';
import {useTranslation} from 'react-i18next';
import cookies from 'js-cookie';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';

const AddTaskPopup = ({open, handleClose, projects}) => {
    const [opensnack, setopensnack] = useState(false)
    const [message, setmessage] = useState(null)
    const {t} = useTranslation();

    const [isPlantationDateValid, setIsPlantationDateValid] = useState(false);
    const [isIntensificationDateValid, setIsIntensificationDateValid] = useState(false);

    const [isEfficiencyValid, setIsEfficiencyValid] = useState(false);

    const [intensifiedChecked, setintensifiedChecked] = useState(false);
    const [treePlantation, setTreePlantation] = useState(true);
    const [intraAndInterLine, setIntraAndInterLine] = useState(false);

    const [type, settype] = useState(null)
    const [project, setProject] = useState(null);
    const langue = cookies.get("i18next") || "en";
    const [categorizedCultures, setCategorizedCultures] = useState([]);
    const [listCulture, setlistCulture] = useState(null)
    const [nonTreeCultureIds, setNonTreeCultureIds] = useState([])



    const [listTexture, setlistTexture] = useState(null)

    const [listIrrigation, setlistIrrigation] = useState(null)

    const [listVariety, setlistVariety] = useState(null)
    const [listIntensificationVariety, setlistIntensificationVariety] = useState(null)
    const [listIntensificationDensity, setlistIntensificationDensity] = useState(null)

    const [listDensity, setlistDensity] = useState(null)
    const handleCloseSnackBar = () => {
        setopensnack(false);
    };
    const handleOpenSnackBar = (type, msg) => {
        setopensnack(true);
        settype(type)
        setmessage(msg)
    }

    const handleIntensifiedCheckBox = (event) => {
        setintensifiedChecked(event.target.checked);
        if (!event.target.checked) {
            setFormData(prevState => ({
                ...prevState,
                intensificationDate: null,
                intensificationCulture: '',
            }));
        }
    };

    useEffect(() => {
        dispatch(getCultureByCategory(langue)).then((res) => {
            if (res.data) {
                setCategorizedCultures(res.data);
                setlistCulture(res.data.reduce((acc, category) => {
                    return [...acc, ...category.cultures];
                }, []));
            }
        });
        dispatch(getTexture(langue)).then((res) => {
            setlistTexture(res.data)
        });
        dispatch(getIrrigation(langue)).then((res) => {
            setlistIrrigation(res.data)
        });
    }, []);

    useEffect(() => {
        dispatch(getNonTreeCultureIds()).then((res) => {
            setNonTreeCultureIds(res.data)
        });
    }, []);
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
    const [formData, setFormData] = useState({
        name: '',
        plantationDate: null,
        culture: '',
        texture: '',
        salinity: null,
        density: '',
        irrigation: '',
        efficiency: null,
        variety: '',
        intensificationDate: null,
        intensificationCulture: '',
        intensificationVariety: '',
        intensificationDensity: '',
        inter_line: '',
        intra_line: '',
        seeding_density: ''
    });


    const olive_tree_cultures = ["a17a408e-d234-4aad-bf28-fe5c25e2eeb8", "7bd57d1b-428f-4f09-b7c0-45ef023eb110", "0c838d48-b13c-4a8e-be50-ba10d25b595c", "b91f3872-e17a-4202-9a3f-847504bfc9e6"]
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const {
        name,
        plantationDate,
        culture,
        texture,
        salinity,
        density,
        irrigation,
        efficiency,
        variety,
        intensificationDate,
        intensificationCulture,
        intensificationVariety,
        intensificationDensity,
        inter_line,
        intra_line,
        seeding_density
    } = formData;
    const onChange = e => {
        if (e.target.name === 'salinity') {
            const value = e.target.value === '' ? null : Number(e.target.value);
            setFormData({
                ...formData,
                [e.target.name]: value
            });
        } else {
            setFormData({...formData, [e.target.name]: e.target.value});
        }
        if (e.target.name === "culture" && nonTreeCultureIds.includes(e.target.value)) {
            setFormData(prevState => ({
                ...prevState,
                "inter_line": "",
                "intra_line": ""
            }));

            setTreePlantation(false)
        } else if (e.target.name === "culture" && !nonTreeCultureIds.includes(e.target.value)) {
            setFormData(prevState => ({
                ...prevState,
                seeding_density: ""
            }));
            setTreePlantation(true)
        }
        if (e.target.name === "culture" && olive_tree_cultures.includes(e.target.value)) {
            setIntraAndInterLine(true)
        } else if (e.target.name === "culture" && !olive_tree_cultures.includes(e.target.value)) {
            setIntraAndInterLine(false)
        }

    };

    const onSubmit = e => {
        e.preventDefault();
        let isValid = true;
        setIsPlantationDateValid(false);
        setIsIntensificationDateValid(false);
        setIsEfficiencyValid(false);

        if (plantationDate && /^\d{4}-(0[1-9]|1[0-2])$/.test(plantationDate)) {
            if (intensificationDate === null) {
                setIsPlantationDateValid(true);
            } else if (plantationDate > intensificationDate) {
                setIsPlantationDateValid(false);
                isValid = false;


            }
        }

        if (intensificationDate && /^\d{4}-(0[1-9]|1[0-2])$/.test(intensificationDate)) {
            if (plantationDate === null) {
                setIsIntensificationDateValid(true);

            } else if (plantationDate > intensificationDate) {

                setIsIntensificationDateValid(false);
                isValid = false;

            }
        }

        if (efficiency != null && (efficiency < 1 || efficiency > 100)) {
            setIsEfficiencyValid(true);
            isValid = false;
        }


        if (isValid) {

            navigate(`/task/add/${project.project_name}/${project.id}`, {
                state: {
                    name: name,
                    plantationDate: plantationDate,
                    culture: culture,
                    texture: texture,
                    salinity: salinity,
                    irrigation: irrigation,
                    efficiency: efficiency,
                    variety: variety,
                    intensificationDate: intensificationDate,
                    inter_line: inter_line,
                    intra_line: intra_line,
                    seeding_density: seeding_density,
                    intensificationCulture: intensificationCulture,
                    intensificationVariety: intensificationVariety,
                    intensificationDensity: intensificationDensity,
                }
            });
        }

    }
    useEffect(() => {
        if (!culture) {
            setlistVariety(null)
            setlistDensity(null)
            return;
        }
        dispatch(getVariety(culture)).then((res) => {
            setlistVariety(res.data)
        })
        dispatch(getDensity(culture)).then((res) => {
            setlistDensity(res.data)
        })
    }, [culture])
    useEffect(() => {
        if (!intensificationCulture) {
            setlistIntensificationVariety(null)
            setlistIntensificationDensity(null)
            return;
        }
        dispatch(getVariety(intensificationCulture)).then((res) => {
            setlistIntensificationVariety(res.data)
        })
        dispatch(getDensity(intensificationCulture)).then((res) => {
            setlistIntensificationDensity(res.data)
        })
    }, [intensificationCulture])


    const handleChange = e => {
        setProject(projects[e.target.value]);
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const maxDate = `${currentYear}-${currentMonth}`;


    const renderCultureMenuItems = () => {
        if (!categorizedCultures || categorizedCultures.length === 0) return null;

        return categorizedCultures.map(category => [
            <MenuItem
                key={category.id}
                disabled
                sx={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    backgroundColor: '#f0f0f0',
                    color: 'black',
                    pointerEvents: 'none'
                }}
            >
                {category.name}
            </MenuItem>,
            ...(category.cultures || []).map(culture => (
                <MenuItem
                    key={culture.id}
                    value={culture.id}
                    sx={{ pl: 3, color: 'gray' }}
                >
                    {culture.name}
                </MenuItem>
            ))
        ]).flat();
    };
    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{backdrop: Backdrop}}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}

            >
                <Fade in={open}>
                    <Box sx={style} className='custom-modal'>
                        <Typography id="transition-modal-title" variant="h5" component="h2" className='text-center'>
                            {t("Please fill out the following information to create a new field")}
                        </Typography>
                        <Form className="mt-5" onSubmit={e => onSubmit(e)}>
                            <Row>
                                <div className='col-md-12'>
                                    <FormControl>
                                        <Typography variant="h6" component="h2"
                                                    className=''>{t("Plot information")}</Typography>
                                    </FormControl>
                                </div>
                            </Row>
                            <Row className='mt-3 mb-3'>
                                <div className='col-md-6'>
                                    <FormControl required sx={{m: 1, minWidth: "100%"}} size="small">
                                        <InputLabel id="demo-select-project-label">{t("Project")}</InputLabel>
                                        <Select
                                            labelId="demo-select-project-label"
                                            id="demo-select-project"
                                            value={project?.project_name}
                                            label="Project"
                                            fullWidth
                                            onChange={handleChange}
                                            name='project'
                                            required
                                        >
                                            {/* <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem> */}
                                            {projects && projects.length > 0 && projects.map((item, index) => (
                                                <MenuItem key={item.id} value={index}>
                                                    {item.project_name}
                                                </MenuItem>
                                            ))}

                                        </Select>
                                    </FormControl>
                                </div>
                                <div className='col-md-6'>
                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Field name")}
                                            type="text"
                                            name='name'
                                            size="small"
                                            value={name}
                                            onChange={e => onChange(e)}
                                            required
                                        />
                                    </FormControl>
                                </div>
                                <Row>
                                    <div className='col-md-12'>
                                        <FormControl>
                                            <Typography variant="h6" component="h2"
                                                        className=''>{t("Plantation")}</Typography>
                                        </FormControl>
                                    </div>
                                </Row>
                            </Row>
                            <Row className='mt-3 mb-3'>
                                <div className='col-md-6'>
                                    <FormControl required sx={{m: 1, minWidth: "100%"}} size="small">
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label={t("Plantation date")}
                                                views={['month', 'year']}
                                                openTo="month"
                                                value={plantationDate ? dayjs(plantationDate) : null}
                                                onChange={(newValue) => {
                                                    const formattedDate = newValue ? newValue.format('YYYY-MM') : null;
                                                    onChange({
                                                        target: {
                                                            name: 'plantationDate',
                                                            value: formattedDate
                                                        }
                                                    });
                                                    setIsPlantationDateValid(true);
                                                }}
                                                format="MM/YYYY"
                                                slotProps={{
                                                    textField: {
                                                        helperText: !isPlantationDateValid && plantationDate ? t("Please enter a valid plantation date") : "",
                                                        error: !isPlantationDateValid && plantationDate !== null,
                                                        required: true,
                                                        fullWidth: true,
                                                        size: "small",
                                                        InputLabelProps: {shrink: true},
                                                    },
                                                }}
                                                disableFuture
                                                maxDate={dayjs(maxDate)}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>
                                </div>
                                <div className="col-md-6">
                                    <FormControl required sx={{m: 1, minWidth: "100%"}} size="small">
                                        <InputLabel id="culture-select-label">{t("Crop type")}</InputLabel>
                                        <Select
                                            labelId="culture-select-label"
                                            id="culture-select"
                                            value={culture}
                                            label="Culture"
                                            fullWidth
                                            onChange={(e) => onChange(e)}
                                            name="culture"
                                            required
                                        >
                                            {renderCultureMenuItems()}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className='col-md-6'>
                                    <FormControl required sx={{m: 1, minWidth: "100%"}} size="small">
                                        <InputLabel id="demo-select-small-label">{t("Variety")}</InputLabel>
                                        <Select
                                            labelId="demo-select-small-label"
                                            id="demo-select-small"
                                            value={variety}
                                            label="Variety"
                                            fullWidth
                                            onChange={e => onChange(e)}
                                            name='variety'
                                        >
                                            {/* <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem> */}
                                            {listVariety && listVariety.length > 0 && listVariety.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                {/* <div className='col-md-6'>
                                    <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                                        <InputLabel id="demo-select-small-label">{t("Density")}</InputLabel>
                                        <Select
                                            labelId="demo-select-small-label"
                                            id="demo-select-small"
                                            value={density}
                                            label="density"
                                            fullWidth
                                            onChange={e => onChange(e)}
                                            name='density'
                                        >

                                            {listDensity && listDensity.length > 0 && listDensity.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div> */}

                                {treePlantation && <div className='col-md-6'>

                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Inter line (meters)")}
                                            type="number"
                                            name='inter_line'
                                            inputProps={{min: 0, step: 0.1}}
                                            size="small"
                                            value={inter_line}
                                            onChange={e => onChange(e)}
                                            required={treePlantation}
                                        />
                                    </FormControl>
                                </div>}

                                {treePlantation && <div className='col-md-6'>

                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Intra line (meters)")}
                                            type="number"
                                            name='intra_line'
                                            inputProps={{min: 0, step: 0.1}}
                                            size="small"
                                            value={intra_line}
                                            onChange={e => onChange(e)}
                                            required={treePlantation}
                                        />
                                    </FormControl>
                                </div>}

                                {!treePlantation && <div className='col-md-6'>

                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Seeding density (KG/Ha)")}
                                            type="number"
                                            name='seeding_density'
                                            inputProps={{min: 0, step: 0.1}}
                                            size="small"
                                            value={seeding_density}
                                            onChange={e => onChange(e)}
                                            required={!treePlantation}
                                        />
                                    </FormControl>
                                </div>}
                            </Row>
                            {intraAndInterLine && <Row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={intensifiedChecked}
                                            onChange={handleIntensifiedCheckBox}
                                        />}
                                    label={t("Interplanting (Intensification)")}
                                />
                                {intensifiedChecked && (
                                    <div className="row">
                                        <div className="col-md-6">
                                            <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        label={t("Intensification date")}
                                                        views={['month', 'year']}
                                                        openTo="month"
                                                        value={intensificationDate ? dayjs(intensificationDate) : null}
                                                        onChange={(newValue) => {
                                                            const formattedDate = newValue ? newValue.format('YYYY-MM') : null;
                                                            onChange({
                                                                target: {
                                                                    name: 'intensificationDate',
                                                                    value: formattedDate
                                                                }
                                                            });
                                                            setIsIntensificationDateValid(true);
                                                        }}
                                                        format="MM/YYYY"
                                                        slotProps={{
                                                            textField: {
                                                                helperText: !isIntensificationDateValid && intensificationDate ? t("Please enter a valid intensification date") : "",
                                                                error: !isIntensificationDateValid && intensificationDate !== null,
                                                                required: true,
                                                                fullWidth: true,
                                                                size: "small",
                                                                InputLabelProps: { shrink: true },
                                                            },
                                                        }}
                                                        disableFuture
                                                        maxDate={dayjs(maxDate)}
                                                    />
                                                </LocalizationProvider>
                                            </FormControl>
                                        </div>

                                        <div className="col-md-6">
                                            <FormControl required sx={{m: 1, minWidth: "100%"}} size="small">
                                                <InputLabel id="intensification-culture-select-label">
                                                    {t("Intensification Crop type")}
                                                </InputLabel>
                                                <Select
                                                    labelId="intensification-culture-select-label"
                                                    id="intensification-culture-select"
                                                    value={intensificationCulture}
                                                    label="Intensification Culture"
                                                    fullWidth
                                                    onChange={(e) => onChange(e)}
                                                    name="intensificationCulture"
                                                >
                                                    {renderCultureMenuItems()}
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="col-md-6">
                                            <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                                                <InputLabel id="demo-select-small-label">{t("Intensification Variety")}</InputLabel>
                                                <Select
                                                    labelId="demo-select-small-label"
                                                    id="demo-select-small"
                                                    value={intensificationVariety}
                                                    label="Intensification Variety"
                                                    fullWidth
                                                    onChange={e => onChange(e)}
                                                    name='intensificationVariety'
                                                >
                                                    {listIntensificationVariety && listIntensificationVariety.length > 0 && listIntensificationVariety.map((item) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>

                                        <div className="col-md-6">
                                            <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                                                <InputLabel id="demo-select-small-label">{t("Intensification Density")}</InputLabel>
                                                <Select
                                                    labelId="demo-select-small-label"
                                                    id="demo-select-small"
                                                    value={intensificationDensity}
                                                    label="Intensification Density"
                                                    fullWidth
                                                    onChange={e => onChange(e)}
                                                    name='intensificationDensity'
                                                >
                                                    {listIntensificationDensity && listIntensificationDensity.length > 0 && listIntensificationDensity.map((item) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                )}
                            </Row>
                            }

                            <Row>
                                <div className='col-md-12'>
                                    <FormControl>
                                        <Typography variant="h6" component="h2" className=''>{t("Soil")}</Typography>
                                    </FormControl>
                                </div>
                            </Row>
                            <Row>
                                <div className='col-md-6'>
                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <InputLabel id="demo-select-small-label">{t("Texture")}</InputLabel>
                                        <Select
                                            labelId="demo-select-small-label"
                                            id="demo-select-small"
                                            value={texture}
                                            label="Texture"
                                            fullWidth
                                            onChange={e => onChange(e)}
                                            name='texture'
                                        >
                                            {/* <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem> */}
                                            {listTexture && listTexture.length > 0 && listTexture.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className='col-md-6'>
                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-salinity-input"
                                            label={t("Water Salinity")}
                                            type="number"
                                            name='salinity'
                                            size="small"
                                            value={salinity}
                                            onChange={e => onChange(e)}
                                            InputProps={{
                                                inputProps: {
                                                    min: 0,
                                                    step: 0.1
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </div>
                            </Row>
                            <Row>
                                <div className='col-md-12'>
                                    <FormControl>
                                        <Typography variant="h6" component="h2"
                                                    className=''>{t("Irrigation system")}</Typography>
                                    </FormControl>
                                </div>
                            </Row>
                            <Row>
                                <div className='col-md-6'>
                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <InputLabel id="demo-select-small-label">{t("Type")}</InputLabel>
                                        <Select
                                            labelId="demo-select-small-label"
                                            id="demo-select-small"
                                            value={irrigation}
                                            label="Type"
                                            fullWidth
                                            onChange={e => onChange(e)}
                                            name='irrigation'
                                        >
                                            {/* <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem> */}
                                            {listIrrigation && listIrrigation.length > 0 && listIrrigation.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item[`name_${currentLanguageCode.toLowerCase()}`]}
                                                </MenuItem>
                                            ))}

                                        </Select>
                                    </FormControl>
                                </div>
                                <div className='col-md-6'>
                                    <FormControl sx={{m: 1, minWidth: "100%"}} size="small">
                                        <TextField
                                            fullWidth
                                            id="outlined-name-input"
                                            label={t("Efficiency (1-100)%")}
                                            type="number"
                                            name='efficiency'
                                            size="small"
                                            value={efficiency ?? ''}
                                            onChange={e => {
                                                const value = e.target.value === '' ? null : Number(e.target.value);
                                                onChange({
                                                    target: {
                                                        name: 'efficiency',
                                                        value: value
                                                    }
                                                });
                                            }}
                                            error={isEfficiencyValid}
                                            helperText={isEfficiencyValid ? "Please enter a valid number between 1 and 100" : ""}
                                        />
                                    </FormControl>
                                </div>
                            </Row>

                            <Row className='mt-3'>
                                <div className='col-md-3'></div>
                                <div className='col-md-6 text-center d-flex justify-content-around'>
                                    <CustomButton type="submit" color='IconColor' size="medium"
                                                  startIcon={<IoIosAdd/>}>{t("Draw Field")}</CustomButton>
                                    <CustomButton startIcon={<MdOutlineCancel/>}
                                                  onClick={handleClose}>{t("Cancel")}</CustomButton>
                                </div>
                            </Row>
                        </Form>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
}

export default AddTaskPopup
