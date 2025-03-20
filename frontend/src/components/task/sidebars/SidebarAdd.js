import React, { useEffect, useState } from "react";
import "../../../../node_modules/font-gis/css/font-gis.css";
import "../../../assets/scss/sidebars.scss";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setClickEventFail, setClickEventSucess } from "../../../actions/map";
import { AiOutlineCheck } from "react-icons/ai";
import { FormControl, TextField } from "@mui/material";

import {
  getCulture,
  getDensityAll,
  getIrrigation,
  getTexture,
  getVarietyAll,
} from "../../../actions/project";
import { add_task } from "../../../actions/task";
import SurveyHeader from "./SurveyHeader";
import cookies from "js-cookie";

const SidebarAdd = ({ id_project, state }) => {
  const { t } = useTranslation();
  const [sidebarRef, setsidebarRef] = useState(null);
  const {
    name,
    culture,
    texture,
    salinity,
    irrigation,
    efficiency,
    variety,
    plantationDate,
    intensificationDate,
    inter_line,
    intra_line,
    seeding_density,intensificationCulture,intensificationVariety,intensificationDensity
  } = state;
  const AreaSurface = useSelector((state) => state.mapReducer.AreaSurface);
  const AreaOfIntrest = useSelector((state) => state.mapReducer.AreaOfIntrest);
  const [sidebarToogle, setsidebarToogle] = useState(true);
  const [listCulture, setlistCulture] = useState(null);
  const [listTexture, setlistTexture] = useState(null);
  const [listIrrigation, setlistIrrigation] = useState(null);
  const [selectedVariety, setselectedVariety] = useState(null);
  const [selectedDensity, setselectedDensity] = useState(null);
  const [listVariety, setlistVariety] = useState(null);
  const [listDensty, setlistDensty] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const langue = cookies.get("i18next") || "en";

  useEffect(() => {
    if (!sidebarRef) return;

    if (isMobile) {
      sidebarRef.addEventListener("touchstart", disableMapInteractions); // On touchstart
      sidebarRef.addEventListener("touchmove", disableMapInteractions); // On touchmove
    }
    sidebarRef.addEventListener("mouseenter", disableMapInteractions);
    sidebarRef.addEventListener("mouseleave", enableMapInteractions);
    return () => {
      sidebarRef.removeEventListener("mouseenter", disableMapInteractions);
      sidebarRef.removeEventListener("mouseleave", enableMapInteractions);
      sidebarRef.removeEventListener("touchstart", disableMapInteractions);
      sidebarRef.removeEventListener("touchend", enableMapInteractions);
      sidebarRef.removeEventListener("touchmove", enableMapInteractions);
    };
  }, [sidebarRef]);

  const disableMapInteractions = () => {
    dispatch(setClickEventFail());
  };
  const enableMapInteractions = () => {
    dispatch(setClickEventSucess());
  };

  useEffect(() => {
    dispatch(getCulture(langue)).then((res) => {
      setlistCulture(res.data);
    });
    dispatch(getTexture(langue)).then((res) => {
      setlistTexture(res.data);
    });
    dispatch(getIrrigation(langue)).then((res) => {
      setlistIrrigation(res.data);
    });
    dispatch(getVarietyAll()).then((res) => {
      setlistVariety(res.data);
    });
    dispatch(getDensityAll()).then((res) => {
      setlistDensty(res.data);
    });
  }, []);

  useEffect(() => {
    if (!listVariety) return;
    const selectedItem = listVariety.find((item) => item.id === variety);
    if (selectedItem) {
      setselectedVariety(selectedItem);
    } else {
      setselectedVariety(null);
    }
  }, [listVariety, variety]);

  // useEffect(() => {
  //   if (!listDensty) return;
  //   const selectedItem = listDensty.find((item) => item.id === density);
  //   if (selectedItem) {
  //     setselectedDensity(selectedItem);
  //   } else {
  //     setselectedDensity(null);
  //   }
  // }, [listDensty, density]);
  const AddTask = () => {
    dispatch(
      add_task(
        id_project,
        AreaOfIntrest,
        AreaSurface,
        name,
        culture,
        texture,
        salinity,
        irrigation,
        efficiency,
        variety,
        plantationDate,
        intensificationDate,
        inter_line,
        intra_line,
        seeding_density,intensificationCulture,intensificationVariety,intensificationDensity
      )
    ).then((res) => {
      navigate(`/task/detail/${res.task.id}`);
    });
  };
  return (
    <div className="sidebar" ref={setsidebarRef}>
      <Container maxWidth="md" className="container-sidebar container-border">
        <Row className="">
          <Col
            xs="12"
            className="d-flex task-title-container align-items-center"
          >
            <div className="icon-wrapper d-flex justify-content-center align-item-center">
              <i className="fg-lg fg-location-poi-o task-title-icon"></i>
            </div>
            <span className="task-title">{name}</span>
          </Col>
        </Row>
      </Container>
      <Container maxWidth="md" className="container-sidebar container-border">
        <Row className="justify-content-center">
          <Col
            xs="8"
            className="d-flex task-title-container align-items-center justify-content-center"
          >
            {AreaOfIntrest ? (
              <Button
                variant="contained"
                style={{
                  backgroundColor: "#6f9d2f",
                  color: "#fff",
                }}
                size="small"
                startIcon={<AiOutlineCheck />}
                onClick={AddTask}
              >
                {t("Confirm & continue")}
              </Button>
            ) : (
              <Button
                disabled
                variant="contained"
                style={{
                  backgroundColor: "#7f7f7f",
                  color: "#fff",
                }}
                size="small"
                startIcon={<AiOutlineCheck />}
              >
                {t("You have to draw your field !")}
              </Button>
            )}
          </Col>
        </Row>
      </Container>
      <Container maxWidth="md" className="container-sidebar container-border">
        <Row className="">
          <Col
            xs="12"
            className="d-flex task-title-container align-items-center"
          >
            <i className="fg-lg fg-measure-area task-area-icon"></i>

            <span className="task-area">{t("Area :")}</span>
            <span className="area-value">{AreaSurface} Ha</span>
          </Col>
        </Row>
      </Container>
      <Container maxWidth="md" className="container-sidebar container-border">
        <SurveyHeader editSurvey={0} />
      </Container>
      <Container maxWidth="md" className="container-sidebar container-border">
        <Row className="">
          <Col
            xs={6}
            className="d-flex"
            style={{ paddingRight: "20px", paddingLeft: "20px" }}
          >
            <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
              {listCulture &&
                listCulture.length > 0 &&
                listCulture.map((item) => (
                  <React.Fragment key={item.id}>
                    {item.id === culture && (
                      <TextField
                        key={item.id}
                        id="outlined-read-only-input"
                        label={t("Culture")}
                        value={item.name_fr}
                        InputProps={{
                          readOnly: true,
                        }}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    )}
                  </React.Fragment>
                ))}
            </FormControl>
          </Col>
          <Col
            xs={6}
            className="d-flex"
            style={{ paddingRight: "20px", paddingLeft: "20px" }}
          >
            <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
              {selectedVariety ? (
                <React.Fragment key={selectedVariety.id}>
                  {
                    <TextField
                      key={selectedVariety.id}
                      id="outlined-read-only-input"
                      label={t("Variety")}
                      value={selectedVariety.name_fr}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  }
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {
                    <TextField
                      id="outlined-read-only-input"
                      label={t("Variety")}
                      value=""
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  }
                </React.Fragment>
              )}
            </FormControl>
          </Col>
          {/* <Col
            xs={6}
            className="d-flex"
            style={{ paddingRight: "20px", paddingLeft: "20px" }}
          >
            <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
              {selectedDensity ? (
                <React.Fragment key={selectedDensity.id}>
                  {
                    <TextField
                      key={selectedDensity.id}
                      id="outlined-read-only-input"
                      label={t("Density")}
                      value={selectedDensity.name_fr}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  }
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {
                    <TextField
                      id="outlined-read-only-input"
                      label={t("Density")}
                      value=""
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  }
                </React.Fragment>
              )}
            </FormControl>
          </Col> */}
          <Col
            xs={6}
            className="d-flex"
            style={{ paddingRight: "20px", paddingLeft: "20px" }}
          >
            <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
              <TextField
                id="outlined-read-only-input"
                label={t("Plantation date")}
                value={plantationDate}
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </FormControl>
          </Col>
          {seeding_density && seeding_density !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                  <TextField
                      id="outlined-read-only-input"
                      label={t("Seeding density")}
                      value={seeding_density}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                  />
                </FormControl>
              </Col>
          )}

          {seeding_density && seeding_density !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                  <TextField
                      id="outlined-read-only-input"
                      label={t("Seeding density")}
                      value={seeding_density}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                  />
                </FormControl>
              </Col>
          )}
          {texture && texture !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                  {listTexture &&
                      listTexture.length > 0 &&
                      listTexture.map((item) => (
                          <React.Fragment key={item.id}>
                            {item.id === texture && (
                                <TextField
                                    key={item.id}
                                    id="outlined-read-only-input"
                                    label={t("Texture")}
                                    value={item.name_fr}
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            )}
                          </React.Fragment>
                      ))}
                </FormControl>
              </Col>
          )}
          {salinity && salinity !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                  <TextField
                      id="outlined-read-only-input"
                      label={t("Water Salinity")}
                      value={salinity}
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
            <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
              {listIrrigation &&
                  listIrrigation.length > 0 &&
                  listIrrigation.map((item) => (
                      <React.Fragment key={item.id}>
                        {item.id === irrigation && (
                            <TextField
                                key={item.id}
                                id="outlined-read-only-input"
                                label={t("Irrigation Type")}
                                value={item.name_fr}
                                InputProps={{
                                  readOnly: true,
                                }}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                            />
                        )}
                      </React.Fragment>
                  ))}
            </FormControl>
          </Col>
          {efficiency && efficiency !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                  <TextField
                      id="outlined-read-only-input"
                      label={t("Efficiency (1-100)%")}
                      value={efficiency}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                  />
                </FormControl>
              </Col>
          )}
          {intensificationDate && intensificationDate !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                  <TextField
                      id="outlined-read-only-input"
                      label={t("Intensification Date")}
                      value={intensificationDate}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                  />
                </FormControl>
              </Col>
          )}
          {intensificationCulture && intensificationCulture !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                  {listCulture &&
                      listCulture.length > 0 &&
                      listCulture.map((item) => (
                          <React.Fragment key={item.id}>
                            {item.id === intensificationCulture && (
                                <TextField
                                    key={item.id}
                                    id="outlined-read-only-input"
                                    label={t("Intensification Culture")}
                                    value={item.name_fr}
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            )}
                          </React.Fragment>
                      ))}
                </FormControl>
              </Col>
          )}

          {intensificationVariety && intensificationVariety !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                  {listVariety &&
                      listVariety.length > 0 &&
                      listVariety.map((item) => (
                          <React.Fragment key={item.id}>
                            {item.id === intensificationVariety && (
                                <TextField
                                    key={item.id}
                                    id="outlined-read-only-input"
                                    label={t("Intensification Variety")}
                                    value={item.name_fr}
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            )}
                          </React.Fragment>
                      ))}
                </FormControl>
              </Col>
          )}
          {intensificationDensity && intensificationDensity !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl required sx={{ m: 1, minWidth: "100%" }} size="small">
                  {listVariety &&
                      listDensty.length > 0 &&
                      listDensty.map((item) => (
                          <React.Fragment key={item.id}>
                            {item.id === intensificationDensity && (
                                <TextField
                                    key={item.id}
                                    id="outlined-read-only-input"
                                    label={t("Intensification Density")}
                                    value={item.name_fr}
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            )}
                          </React.Fragment>
                      ))}
                </FormControl>
              </Col>
          )}
          {inter_line && inter_line !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                  <TextField
                      id="outlined-read-only-input"
                      label={t("Inter line")}
                      value={inter_line}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                  />
                </FormControl>
              </Col>
          )}
          {intra_line && intra_line !== '' && (
              <Col
                  xs={6}
                  className="d-flex"
                  style={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                  <TextField
                      id="outlined-read-only-input"
                      label={t("Intra line")}
                      value={intra_line}
                      InputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                  />
                </FormControl>
              </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default SidebarAdd;
