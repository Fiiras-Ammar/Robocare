import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "react-bootstrap/Button";
import Typography from "@mui/material/Typography";
import Row from "react-bootstrap/esm/Row";
import { TextField } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDensityAll,
  getIrrigation,
  getTexture,
  getVarietyAll,
  getVariety,
  getDensity,
  getCultureByCategory
} from "../../../actions/project";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { edit_task } from "../../../actions/task";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import {showSnackbar} from "../../../actions/snackbar";
import ListSubheader from "@mui/material/ListSubheader";


const EditTaskPopup = ({ open, handleClose }) => {
  const [opensnack, setopensnack] = useState(false);
  const [message, setmessage] = useState(null);
  const [isAgeValid, setIsAgeValid] = useState(false);
  const [isEfficiencyValid, setIsEfficiencyValid] = useState(false);
  const [type, settype] = useState(null);

  const id_task = useSelector((state) => state.mapReducer.taskIdDetails);
  const Ename = useSelector((state) => state.mapReducer.taskNameDetails);
  const Eage = useSelector((state) => state.mapReducer.ageDetails);
  const Eplantation_date = useSelector((state) => state.mapReducer.plantationDateDetails);
  const Eintensification_date = useSelector((state) => state.mapReducer.intensificationplantationDateDetails);
  const Eculture = useSelector((state) => state.mapReducer.cultureDetails);
  const Eintensificaionculture = useSelector((state) => state.mapReducer.intensificationCultureDetails);
  const Etexture = useSelector((state) => state.mapReducer.textureDetails);
  const Edensity = useSelector((state) => state.mapReducer.densityDetails);
  const Eirrigation = useSelector(
    (state) => state.mapReducer.irrigationTypeDetails
  );
  const Esalinity = useSelector((state) => state.mapReducer.salinityDetails);
  const Eefficiency = useSelector(
    (state) => state.mapReducer.efficiencyDetails
  );
  const Evariety = useSelector((state) => state.mapReducer.varietyDetails);
  const EIntensificationvariety = useSelector((state) => state.mapReducer.intensificationVarietyDetails);
  const EIntensificationdensity = useSelector((state) => state.mapReducer.intensificationDensityDetails);

  const [listCultureEdit, setlistCultureEdit] = useState(null);
  const [listIntensificaionCultureEdit, setlistIntensificaionCultureEdit] = useState(null);
  const [listTextureEdit, setlistTextureEdit] = useState(null);
  const [listIrrigationEdit, setlistIrrigationEdit] = useState(null);
  const [listVarietyEdit, setlistVarietyEdit] = useState(null);
  const [listIntensificationVarietyEdit, setlistIntensificationVarietyEdit] = useState(null);
  const [listIntensificationDensityEdit, setlistIntensificationDensityEdit] = useState(null);
  const [listDenstyEdit, setlistDenstyEdit] = useState(null);

  const [listVariety, setlistVariety] = useState(null);
  const [listIntensificationVariety, setIntensificationlistVariety] = useState(null);
  const [listIntensificationDensity, setIntensificationlistDensity] = useState(null);
  const [listDensity, setlistDensity] = useState(null);


  const handleCloseSnackBar = () => {
    setopensnack(false);
  };
  const handleOpenSnackBar = (type, msg) => {
    setopensnack(true);
    settype(type);
    setmessage(msg);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    bgcolor: "background.paper",
    borderRadius: "5px",
    boxShadow: 24,
    p: 4,
  };
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    culture: "",
    texture: "",
    salinity: "",
    density: "",
    irrigation: "",
    efficiency: "",
    variety: "",
    intensificationvariety: "",
    intensificationdensity: "",
    plantation_date: "",
    intensification_date: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [DensityArray, setDensityArray] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const {
    name,
    age,
    culture,
    intensificationculture,
    texture,
    salinity,
    density,
    irrigation,
    efficiency,
    variety,
    intensificationvariety,
    intensificationdensity,
    plantation_date,
    intensification_date
  } = formData;
  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'intensification_date' || name === 'plantation_date') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? value.split('T')[0] : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const currentLanguageCode = cookies.get("i18next") || "en";
  const { t } = useTranslation();
  const langue = cookies.get("i18next") || "en";
  const allowedCultureIds = [
    'a17a408e-d234-4aad-bf28-fe5c25e2eeb8',
    '7bd57d1b-428f-4f09-b7c0-45ef023eb110',
    '0c838d48-b13c-4a8e-be50-ba10d25b595c'
  ];
  useEffect(() => {
    if (!listCultureEdit) {
      dispatch(getCultureByCategory(langue)).then((res) => {
        setlistCultureEdit(res.data);
      });
    }
  }, []);
  useEffect(() => {
    if (!listIntensificaionCultureEdit) {
      dispatch(getCultureByCategory(langue)).then((res) => {
        setlistIntensificaionCultureEdit(res.data);
      });
    }
  }, []);
  useEffect(() => {
    if (!listCultureEdit) {
      dispatch(getTexture(langue)).then((res) => {
        setlistTextureEdit(res.data);
      });
    }
  }, []);
  useEffect(() => {
    if (!listIrrigationEdit) {
      dispatch(getIrrigation(langue)).then((res) => {
        setlistIrrigationEdit(res.data);
      });
    }
  }, []);
  useEffect(() => {
    if (!listVarietyEdit) {
      dispatch(getVarietyAll()).then((res) => {
        setlistVarietyEdit(res.data);
      });
    }
  }, []);


  useEffect(() => {
    if (!listDenstyEdit) {
      dispatch(getDensityAll()).then((res) => {
        setlistDenstyEdit(res.data);
      });
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    let isValid = true;
    setIsAgeValid(false);
    setIsEfficiencyValid(false);

    if (efficiency !== null && efficiency !== '' && (efficiency < 1 || efficiency > 100)) {
      setIsEfficiencyValid(true);
      isValid = false;
    }

    const intensificationFields = {
      intensification_date: formData.intensification_date,
      intensificationvariety: formData.intensificationvariety,
      intensificationculture: formData.intensificationculture,
      intensificationdensity: formData.intensificationdensity
    };

    const filledFields = Object.values(intensificationFields).filter(value =>
        value !== null && value !== '' && value !== undefined
    ).length;



    const updatedFormData = { ...formData };

    if (!allowedCultureIds.includes(updatedFormData.culture)) {
      updatedFormData.intensificationculture = null;
      updatedFormData.intensificationvariety = null;
      updatedFormData.intensificationdensity = null;
      updatedFormData.intensification_date = null;
    }

    if (updatedFormData.salinity === "") {
      updatedFormData.salinity = null;
    }
    if (updatedFormData.efficiency === "") {
      updatedFormData.efficiency = null;
    }
    if (updatedFormData.texture === "") {
      updatedFormData.texture = null;
    }
    if (updatedFormData.irrigation === "") {
      updatedFormData.irrigation = null;
    }

    if (isValid) {
      dispatch(
          edit_task(
              id_task,
              updatedFormData.name,
              updatedFormData.age,
              updatedFormData.culture,
              updatedFormData.texture,
              updatedFormData.salinity,
              updatedFormData.density,
              updatedFormData.irrigation,
              updatedFormData.efficiency,
              updatedFormData.variety,
              updatedFormData.plantation_date,
              updatedFormData.intensificationculture,
              updatedFormData.intensificationvariety,
              updatedFormData.intensificationdensity,
              updatedFormData.intensification_date
          )
      )
          .then((res) => {
            window.location.reload();
          })
          .catch((error) => {
            dispatch(
                showSnackbar(
                    "error",
                    undefined,
                    t("An error occurred while saving the changes"),
                    "top",
                    "right"
                )
            );
          });
    }
  };
  useEffect(() => {
    if (
        Eculture !== null ||
        Eintensificaionculture !== null ||
        Eirrigation !== null ||
        Edensity !== null ||
        Ename !== null ||
        Eage !== null ||
        Eplantation_date !== null ||
        Eintensification_date !== null ||
        Evariety !== null ||
        EIntensificationvariety !== null ||
        EIntensificationdensity !== null
    ) {
      const getIdValue = (value) => {
        if (!value) return "";
        return typeof value === 'object' && value.id ? value.id : value;
      };

      setFormData({
        name: Ename || "",
        age: Eage || "",
        culture: getIdValue(Eculture),
        intensificationculture: getIdValue(Eintensificaionculture),
        texture: getIdValue(Etexture),
        salinity: Esalinity || "",
        density: getIdValue(Edensity),
        irrigation: getIdValue(Eirrigation),
        efficiency: Eefficiency || "",
        variety: getIdValue(Evariety),
        intensificationvariety: getIdValue(EIntensificationvariety),
        intensificationdensity: getIdValue(EIntensificationdensity),
        plantation_date: Eplantation_date || "",
        intensification_date: Eintensification_date || ""
      });

      const loadInitialData = async () => {
        if (Eculture) {
          const [varietyRes, densityRes] = await Promise.all([
            dispatch(getVariety(getIdValue(Eculture))),
            dispatch(getDensity(getIdValue(Eculture)))
          ]);
          setlistVariety(varietyRes.data);
          setlistDensity(densityRes.data);
        }

        if (Eintensificaionculture) {
          const [intVarietyRes, intDensityRes] = await Promise.all([
            dispatch(getVariety(getIdValue(Eintensificaionculture))),
            dispatch(getDensity(getIdValue(Eintensificaionculture)))
          ]);
          setIntensificationlistVariety(intVarietyRes.data);
          setIntensificationlistDensity(intDensityRes.data);
        }
      };

      loadInitialData();
    }
  }, [Ename, Eculture, Eintensificaionculture]);
  useEffect(() => {
    if (!formData.culture) {
      setlistVariety(null);
      setlistDensity(null);
      return;
    }
    dispatch(getVariety(formData.culture)).then((res) => {
      setlistVariety(res.data);
    });
    dispatch(getDensity(formData.culture)).then((res) => {
      setlistDensity(res.data);
    });
  }, [formData.culture]);
  useEffect(() => {
    if (!formData.intensificationculture) {
      setIntensificationlistVariety(null);
      setIntensificationlistDensity(null);
      return;
    }
    dispatch(getVariety(formData.intensificationculture)).then((res) => {
      setIntensificationlistVariety(res.data);
    });
    dispatch(getDensity(formData.intensificationculture)).then((res) => {
      setIntensificationlistDensity(res.data);
    });
  }, [formData.intensificationculture]);
  const transformCultureData = (data) => {
    if (!data) return [];
    return data.map(category => ({
      category: category.name,
      id: category.id,
      cultures: category.cultures
    }));
  };

  const CultureSelect = ({ value, onChange, name, label, cultures, required = false }) => {
    const { t } = useTranslation();
    const groupedCultures = transformCultureData(cultures);

    return (
        <FormControl sx={{ m: 1, minWidth: "100%" }} size="small" required={required}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
              labelId={`${name}-label`}
              value={value || ""}
              label={label}
              onChange={onChange}
              name={name}
          >
            <MenuItem value="">
              <em>{t("None")}</em>
            </MenuItem>
            {groupedCultures.map((category) => [
              <ListSubheader
                  key={`header-${category.id}`}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    backgroundColor: '#f0f0f0',
                    color: 'black'
                  }}
              >
                {category.category}
              </ListSubheader>,
              ...category.cultures.map((culture) => (
                  <MenuItem
                      key={culture.id}
                      value={culture.id}
                      sx={{ pl: 3, color: 'gray' }}
                  >
                    {culture.name}
                  </MenuItem>
              ))
            ]).flat()}
          </Select>
        </FormControl>
    );
  };
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
            <Box sx={style} className="custom-modal">
              <Typography
                  id="transition-modal-title"
                  variant="h5"
                  component="h2"
                  className="text-center"
              >
                {t(
                    "Please fill out the following information to edit your field"
                )}
              </Typography>
              <Form onSubmit={(e) => onSubmit(e)}>
                <Row className="mt-3 mb-3">
                  <div className="col-md-6">
                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                      <TextField
                          fullWidth
                          id="outlined-name-input"
                          label={t("Field name")}
                          type="text"
                          name="name"
                          size="small"
                          value={name}
                          onChange={(e) => onChange(e)}
                          required
                      />
                    </FormControl>
                  </div>
                  <div className="col-md-6">
                    <CultureSelect
                        value={culture}
                        onChange={(e) => onChange(e)}
                        name="culture"
                        label={t("Culture")}
                        cultures={listCultureEdit}
                        required
                    />
                  </div>
                </Row>
                <Row>
                  <div className="col-md-6">
                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                      <InputLabel id="demo-select-small-label">
                        {t("Variety")}
                      </InputLabel>
                      <Select
                          labelId="demo-select-small-label"
                          id="demo-select-small"
                          value={variety}
                          label="Variety"
                          fullWidth
                          onChange={(e) => onChange(e)}
                          name="variety"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {listVariety && listVariety.length > 0 ? (
                            listVariety.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    value={item.id}
                                    selected={item.id === Evariety}
                                >
                                  {item.name_fr}
                                </MenuItem>
                            ))
                        ) : listVarietyEdit && listVarietyEdit.length > 0 ? (
                            listVarietyEdit.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    value={item.id}
                                    selected={item.id === Evariety}
                                >
                                  {item.name_fr}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">
                              <em>{t("No varieties available")}</em>
                            </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-md-6">
                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                      <InputLabel id="demo-select-small-label">
                        {t("Density")}
                      </InputLabel>
                      <Select
                          labelId="demo-select-small-label"
                          id="demo-select-small"
                          value={density}
                          label="density"
                          fullWidth
                          onChange={(e) => onChange(e)}
                          name="density"
                      >
                        {listDensity && listDensity.length > 0 ? (
                            listDensity.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    value={item.id}
                                    selected={item.id === Edensity}
                                >
                                  {item.name_fr}
                                </MenuItem>
                            ))
                        ) : listDenstyEdit && listDenstyEdit.length > 0 ? (
                            listDenstyEdit.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    value={item.id}
                                    selected={item.id === Edensity}
                                >
                                  {item.name_fr}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="">
                              <em>{t("No densities available")}</em>
                            </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </div>
                </Row>
                <Row className="mt-3 mb-3">
                  {/*<div className="col-md-6">
                  <FormControl
                    required
                    sx={{ m: 1, minWidth: "100%" }}
                    size="small"
                  >
                    <TextField
                      fullWidth
                      id="outlined-name-input"
                      label="Age"
                      type="number"
                      name="age"
                      size="small"
                      value={age}
                      onChange={(e) => onChange(e)}
                      required
                    />
                  </FormControl>
                </div>*/}
                  <div className="col-md-6">
                    <FormControl
                        required
                        sx={{ m: 1, minWidth: "100%" }}
                        size="small"
                    >
                      <TextField
                          fullWidth
                          id="outlined-plantation-date-input"
                          label={t("Plantation Date")}
                          type="date"
                          name="plantation_date"
                          size="small"
                          value={plantation_date}
                          onChange={(e) => onChange(e)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          required
                      />
                    </FormControl>
                  </div>
                </Row>
                <Row>
                  <div className="col-md-12">
                    <FormControl>
                      <Typography variant="h6" component="h2" className="">
                        {t("Floor")}
                      </Typography>
                    </FormControl>
                  </div>
                </Row>
                <Row>
                  <div className="col-md-6">
                    <FormControl
                        sx={{ m: 1, minWidth: "100%" }}
                        size="small"
                    >
                      <InputLabel id="demo-select-small-label">
                        {t("Texture")}
                      </InputLabel>
                      <Select
                          labelId="demo-select-small-label"
                          id="demo-select-small"
                          value={texture || ""}
                          label="Texture"
                          fullWidth
                          onChange={(e) => onChange(e)}
                          name="texture"
                      >
                        <MenuItem value="">
                          <em>{t("None")}</em>
                        </MenuItem>
                        {listTextureEdit &&
                            listTextureEdit.length > 0 &&
                            listTextureEdit.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name_fr}
                                </MenuItem>
                            ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-md-6">
                    <FormControl
                        sx={{ m: 1, minWidth: "100%" }}
                        size="small"
                    >
                      <TextField
                          label={t("Water Salinity")}
                          id="water-salinity"
                          type="number"
                          value={salinity}
                          fullWidth
                          onChange={(e) => onChange(e)}
                          name="salinity"
                          InputProps={{
                            inputProps: {
                              min: 0,
                              step: 0.1,
                            },
                          }}
                          size="small"
                      />
                    </FormControl>

                  </div>
                </Row>
                <Row>
                  <div className="col-md-12">
                    <FormControl>
                      <Typography variant="h6" component="h2" className="">
                        {t("Irrigation system")}
                      </Typography>
                    </FormControl>
                  </div>
                </Row>
                <Row>
                  <div className="col-md-6">
                    <FormControl
                        sx={{ m: 1, minWidth: "100%" }}
                        size="small"
                    >
                      <InputLabel id="demo-select-small-label">
                        {t("Type")}
                      </InputLabel>
                      {irrigation ? (
                          <Select
                              labelId="demo-select-small-label"
                              id="demo-select-small"
                              value={irrigation}
                              label="Type"
                              fullWidth
                              onChange={(e) => onChange(e)}
                              name="irrigation"
                          >
                            <MenuItem value="">
                              <em>{t("None")}</em>
                            </MenuItem>
                            {listIrrigationEdit &&
                                listIrrigationEdit.length > 0 &&
                                listIrrigationEdit.map((item) => (
                                    <MenuItem
                                        key={item.id}
                                        value={item.id}
                                        selected={item.id === Eirrigation}
                                    >
                                      {item.name_fr}
                                    </MenuItem>
                                ))}
                          </Select>
                      ) : (
                          <Select
                              labelId="demo-select-small-label"
                              id="demo-select-small"
                              value=""
                              label="Type"
                              fullWidth
                              onChange={(e) => onChange(e)}
                              name="irrigation"
                          >
                            <MenuItem value="">
                              <em>{t("None")}</em>
                            </MenuItem>
                            {listIrrigationEdit &&
                                listIrrigationEdit.length > 0 &&
                                listIrrigationEdit.map((item) => (
                                    <MenuItem
                                        key={item.id}
                                        value={item.id}
                                    >
                                      {item.name_fr}
                                    </MenuItem>
                                ))}
                          </Select>
                      )}
                    </FormControl>
                  </div>
                  <div className="col-md-6">
                    <FormControl
                        sx={{ m: 1, minWidth: "100%" }}
                        size="small"
                    >
                      <TextField
                          fullWidth
                          id="outlined-name-input"
                          label={t("Efficiency (1-100)%")}
                          type="number"
                          name="efficiency"
                          size="small"
                          value={efficiency}
                          onChange={(e) => onChange(e)}
                      />
                    </FormControl>
                  </div>
                </Row>


                {allowedCultureIds.includes(formData.culture) && (
                    <>
                      <Row>
                        <div className="col-md-12">
                          <FormControl>
                            <Typography variant="h6" component="h2">
                              {t("Intensification")}
                            </Typography>
                          </FormControl>
                        </div>
                      </Row>

                      <Row className="mt-3 mb-3">
                        <div className="col-md-6">
                          <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                            <TextField
                                fullWidth
                                id="outlined-intensification-date-input"
                                label={t("Intensification Date")}
                                type="date"
                                name="intensification_date"
                                size="small"
                                value={formData.intensification_date || ''}
                                onChange={onChange}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                            />
                          </FormControl>
                        </div>

                        <div className="col-md-6">
                          <CultureSelect
                              value={formData.intensificationculture}
                              onChange={(e) => onChange(e)}
                              name="intensificationculture"
                              label={t("Intensification Culture")}
                              cultures={listIntensificaionCultureEdit}
                          />
                        </div>
                        <div className="col-md-6">
                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                      <InputLabel>{t("Intensification Variety")}</InputLabel>
                      <Select
                          value={formData.intensificationvariety}
                          label={t("Intensification Variety")}
                          onChange={onChange}
                          name="intensificationvariety"
                      >
                        <MenuItem value="">
                          <em>{t("None")}</em>
                        </MenuItem>
                        {listIntensificationVariety?.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name_fr}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-md-6">
                    <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                      <InputLabel>{t("Intensification Density")}</InputLabel>
                      <Select
                          value={formData.intensificationdensity}
                          label={t("Intensification Density")}
                          onChange={onChange}
                          name="intensificationdensity"
                      >
                        <MenuItem value="">
                          <em>{t("None")}</em>
                        </MenuItem>
                        {listIntensificationDensity?.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name_fr}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </Row>
                    </>
                  )}




                <Row className="mt-3">
                  <div className="col-md-3"></div>
                  <div className="col-md-6 text-center d-flex justify-content-around">
                    {/* <CustomButton type="submit" color='IconColor' size="medium" startIcon={<IoIosAdd />}>Draw Field</CustomButton> */}
                    <Button className="btn btn-login" type="submit">
                      {t("Edit survey")}
                    </Button>
                    <Button variant="light" onClick={handleClose}>
                      {t("Cancel")}
                    </Button>

                    {/* <CustomButton startIcon={<MdOutlineCancel />} onClick={handleClose}>Cancel</CustomButton> */}
                  </div>
                </Row>
              </Form>
            </Box>
          </Fade>
        </Modal>
      </div>
  );
};

export default EditTaskPopup;
