import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FormControl } from "@mui/material";
import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  getCulture,
  getDensityAll,
  getIrrigation,
  getTexture,
  getVarietyAll,
} from "../../../actions/project";
import dayjs from "dayjs";

const SurveyEdit = () => {
  const { t } = useTranslation();
  const currentLanguageCode = cookies.get("i18next") || "en";
  const dispatch = useDispatch();

  const ageDetailsEdit = useSelector((state) => state.mapReducer.ageDetails);
  const plantationDateDetailsEdit = useSelector((state) => state.mapReducer.plantationDateDetails);
  const intensificationplantationDateDetailsEdit = useSelector((state) => state.mapReducer.intensificationplantationDateDetails);
  const nbTreeDetails = useSelector((state) => state.mapReducer.nbTreeDetails);
  const nbTreesPerHectare = useSelector((state) => state.mapReducer.nbTreePerHectarDetails);

  const [selectedVarietyEdit, setselectedVarietyEdit] = useState(null);
  const [selectedIntensificationVarietyEdit, setselectedIntensificationVarietyEdit] = useState(null);
  const [selectedIntensificationDensityEdit, setselectedIntensificationDensityEdit] = useState(null);
  const [selectedDensityEdit, setselectedDensityEdit] = useState(null);
  const [selectedCultureEdit, setselectedCultureEdit] = useState(null);
  const [selectedIntensificationCultureEdit, setselectedIntensificationCultureEdit] = useState(null);
  const [selectedTextureEdit, setselectedTextureEdit] = useState(null);
  const [selectedIrrigationEdit, setselectedIrrigationEdit] = useState(null);
  const [modalOpenEditTask, setmodalOpenEditTask] = useState(false);
  const [listCultureEdit, setlistCultureEdit] = useState(null);
  const [listIntensificationCultureEdit, setlistIntensificationCultureEdit] = useState(null);
  const [listTextureEdit, setlistTextureEdit] = useState(null);
  const [listIrrigationEdit, setlistIrrigationEdit] = useState(null);
  const [listVarietyEdit, setlistVarietyEdit] = useState(null);
  const [listIntensificationVarietyEdit, setlistIntensificationVarietyEdit] = useState(null);
  const [listIntensificationDensityEdit, setlistIntensificationDensityEdit] = useState(null);
  const [listDenstyEdit, setlistDenstyEdit] = useState(null);
  const langue = cookies.get("i18next") || "en";

  const salinityDetailsEdit = useSelector(
    (state) => state.mapReducer.salinityDetails
  );
  const efficiencyDetailsEdit = useSelector(
    (state) => state.mapReducer.efficiencyDetails
  );
  const cultureDetailsEdit = useSelector(
    (state) => state.mapReducer.cultureDetails
  );
  const textureDetailsEdit = useSelector(
    (state) => state.mapReducer.textureDetails
  );
  const densityDetailsEdit = useSelector(
    (state) => state.mapReducer.densityDetails
  );
  const varietyDetailsEdit = useSelector(
    (state) => state.mapReducer.varietyDetails
  );
  const irrigationTypeDetailsEdit = useSelector(
    (state) => state.mapReducer.irrigationTypeDetails
  );
  const intensificationVarietyDetailsEdit = useSelector(
      (state) => state.mapReducer.intensificationVarietyDetails
  );
  const intensificationCultureDetailsEdit = useSelector(
      (state) => state.mapReducer.intensificationCultureDetails
  );
  const intensificationDensityDetailsEdit = useSelector(
      (state) => state.mapReducer.intensificationDensityDetails
  );
  useEffect(() => {
    if (!listCultureEdit) {
      dispatch(getCulture(langue)).then((res) => {
        setlistCultureEdit(res.data);
      });
    }
  }, []);
  useEffect(() => {
    if (!listIntensificationCultureEdit) {
      dispatch(getCulture(langue)).then((res) => {
        setlistIntensificationCultureEdit(res.data);
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
    if (!listIntensificationVarietyEdit) {
      dispatch(getVarietyAll()).then((res) => {
        setlistIntensificationVarietyEdit(res.data);
      });
    }
  }, []);
  useEffect(() => {
    if (!listIntensificationDensityEdit) {
      dispatch(getDensityAll()).then((res) => {
        setlistIntensificationDensityEdit(res.data);
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

  useEffect(() => {
    if (!listVarietyEdit) return;
    const selectedItem = listVarietyEdit.find(
      (item) => item.id === varietyDetailsEdit
    );
    if (selectedItem) {
      setselectedVarietyEdit(selectedItem);
    } else {
      setselectedVarietyEdit(null);
    }
  }, [listVarietyEdit, varietyDetailsEdit]);

  useEffect(() => {
    if (!listIntensificationVarietyEdit) return;
    const selectedItem = listIntensificationVarietyEdit.find(
        (item) => item.id === intensificationVarietyDetailsEdit
    );
    setselectedIntensificationVarietyEdit(selectedItem || null);
  }, [listIntensificationVarietyEdit, intensificationVarietyDetailsEdit]);
  useEffect(() => {
    if (!listIntensificationDensityEdit) return;
    const selectedItem = listIntensificationDensityEdit.find(
        (item) => item.id === intensificationDensityDetailsEdit
    );
    setselectedIntensificationDensityEdit(selectedItem || null);
  }, [listIntensificationDensityEdit, intensificationDensityDetailsEdit]);
  useEffect(() => {
    if (!listCultureEdit) return;
    const selectedItem = listCultureEdit.find(
      (item) => item.id === cultureDetailsEdit
    );
    if (selectedItem) {
      setselectedCultureEdit(selectedItem);
    }
  }, [listCultureEdit, cultureDetailsEdit]);
  useEffect(() => {
    if (!listIntensificationCultureEdit) return;
    const selectedItem = listIntensificationCultureEdit.find(
      (item) => item.id === intensificationCultureDetailsEdit
    );
    if (selectedItem) {
      setselectedIntensificationCultureEdit(selectedItem);
    }
  }, [listIntensificationCultureEdit, intensificationCultureDetailsEdit]);

  useEffect(() => {
    if (!listTextureEdit) return;
    const selectedItem = listTextureEdit.find(
      (item) => item.id === textureDetailsEdit
    );
    if (selectedItem) {
      setselectedTextureEdit(selectedItem);
    } else {
      setselectedTextureEdit(null);
    }
  }, [listTextureEdit, textureDetailsEdit]);

  useEffect(() => {
    if (!listIrrigationEdit) return;
    const selectedItem = listIrrigationEdit.find(
      (item) => item.id === irrigationTypeDetailsEdit
    );
    if (selectedItem) {
      setselectedIrrigationEdit(selectedItem);
    } else {
      setselectedIrrigationEdit(null);
    }
  }, [listIrrigationEdit, irrigationTypeDetailsEdit]);

  useEffect(() => {
    if (!listDenstyEdit) return;
    const selectedItem = listDenstyEdit.find(
      (item) => item.id === densityDetailsEdit
    );
    if (selectedItem) {
      setselectedDensityEdit(selectedItem);
    } else {
      setselectedDensityEdit(null);
    }
  }, [listDenstyEdit, densityDetailsEdit]);
  const calculateAge = () => {
    if (plantationDateDetailsEdit) {
      const now = dayjs();
      const plantationDate = dayjs(plantationDateDetailsEdit);
      const ageInYears = now.diff(plantationDate, "year");
      return ageInYears;
    }
    return "";
  };
  const calculateIntensificationAge = () => {
    if (intensificationplantationDateDetailsEdit) {
      const now = dayjs();
      const plantationDate = dayjs(intensificationplantationDateDetailsEdit);
      const ageInYears = now.diff(plantationDate, "year");
      return ageInYears;
    }
    return "";
  };
  return (
      <Row className="pt-2 pb-2">
        {selectedCultureEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Culture")}
                    value={
                      selectedCultureEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {selectedVarietyEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Variety")}
                    value={
                      selectedVarietyEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {selectedDensityEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Density")}
                    value={
                      selectedDensityEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {calculateAge() !== "" && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Age")}
                    value={calculateAge()}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Tree count")}
                    value={nbTreeDetails}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Tree count /Ha")}
                    value={nbTreesPerHectare}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        {plantationDateDetailsEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Plantation date")}
                    value={plantationDateDetailsEdit}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {selectedTextureEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Texture")}
                    value={
                      selectedTextureEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {salinityDetailsEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Water Salinity")}
                    value={salinityDetailsEdit}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {selectedIrrigationEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Irrigation Type")}
                    value={
                      selectedIrrigationEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {efficiencyDetailsEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Efficiency")}
                    value={efficiencyDetailsEdit}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {intensificationplantationDateDetailsEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Intensification Plantation date")}
                    value={intensificationplantationDateDetailsEdit}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {intensificationCultureDetailsEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Intensification Culture")}
                    value={
                      intensificationCultureDetailsEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {intensificationVarietyDetailsEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Intensification Variety")}
                    value={
                      intensificationVarietyDetailsEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
        {intensificationDensityDetailsEdit && (
            <Col
                xs={6}
                className="d-flex"
                style={{ paddingRight: "20px", paddingLeft: "20px" }}
            >
              <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                <TextField
                    label={t("Intensification Density")}
                    value={
                      intensificationDensityDetailsEdit[
                          `name_${currentLanguageCode.toLowerCase()}`
                          ]
                    }
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
              </FormControl>
            </Col>
        )}
      </Row>
  );
};

export default SurveyEdit
