import React, { useState } from "react";
import BasicDatePicker from "../../../utils/BasicDatePicker";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIndexArray, getForecastPredict } from "../../../actions/graph";
import dayjs from "dayjs";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Form from "react-bootstrap/Form";
import { Box, Slider, Typography } from "@mui/material";
import { LOADING_BEGIN } from "../../../utils/types";
import SaveIcon from "@mui/icons-material/Save";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Graph from "./graph";
import { showSnackbar } from "../../../actions/snackbar";
import { useTranslation } from "react-i18next";
import { Button, Row } from "react-bootstrap";
import {
  handleFilterData,
  handleFilterDataByCloudPercentage,
  findMinMaxValues,
} from "../../../utils/graphDataFilter.js";
import { get_task_notifications } from "./../../../actions/notification";
const GraphLayout = ({ clickEvent }) => {
  const dispatch = useDispatch();
  const start_end_dates = useSelector(
    (state) => state.graphReducer.graph_dates
  );
  const taskId = useSelector((state) => state.mapReducer.taskIdDetails);
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [indexText, setindexText] = useState("vegetation");
  const today = dayjs();
  const [formData, setFormData] = useState({
    StartDate: today.subtract(1, "year"),
    EndtDate: today,
    index: "ndvi",
  });
  const [attemptCount, setAttemptCount] = useState(0);
  const [graphDataReady, setgraphDataReady] = useState(false);
  const data_graph = useSelector((state) => state.graphReducer.graph_data);
  const [dataPredict, setdataPredict] = useState([]);
  const [dataPredictIndex, setdataPredictIndex] = useState([]);
  const [notifications, setnotifications] = useState([]);
  const marks = [
    {
      value: 10,
      label: "10 %",
    },
    {
      value: 20,
      label: "20 %",
    },
    {
      value: 30,
      label: "30 %",
    },
    {
      value: 40,
      label: "40 %",
    },
  ];

  useEffect(() => {
    setFormData({
      ...formData,
      StartDate: today.subtract(1, "year"),
      EndtDate: today,
      cloud_percentage: 40,
    });
  }, []);

  const { StartDate, EndtDate, index, cloud_percentage } = formData;
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onChangeIndex = (e) => {
    setFormData({ ...formData, index: e.target.value });

    switch (e.target.value) {
      case "ndvi":
        setindexText("vegetation");
        break;
      case "ndre":
        setindexText("Nitrogen Index");
        break;
      case "ndwi":
        setindexText("Water content");
        break;
      case "gci":
        setindexText("Plant Health Index");
        break;
      case "psri":
        setindexText("Plant Senescence Index");
        break;
      case "ndmi":
        setindexText("Soil moisture index");
        break;
      default:
        setindexText("vegetation");
    }
  };

  useEffect(() => {
    if (!taskId) return;
    dispatch(getForecastPredict(taskId)).then((response) => {
      if (response.status === 200) {
        setdataPredict(response.data.results);
      }
    });
    dispatch(get_task_notifications(taskId)).then((res) => {
      if (res.status === 200) {
        setnotifications(res.data.data);
      }
    });
  }, [taskId]);
  useEffect(() => {
    if (!notifications) return;
  }, [notifications]);

  const onChangeSlider = (e, value) => {
    setFormData({ ...formData, cloud_percentage: value });
  };
  function valuetext(value) {
    return `${value} %`;
  }

  useEffect(() => {
    if (!taskId) return;
    if (data_graph) {
      setLoading(false);
      return;
    }

    dispatch(getIndexArray(taskId)).then((res) => {
      if (res.status === 200) {
        setgraphDataReady(true);
        setLoading(false);
      }
    });
  }, [taskId, data_graph]);

  useEffect(() => {
    if (!data_graph) return;
    const ndviElement = data_graph.find((item) => item.index === "ndvi");
    let dataFiltred = [];
    let dataSmoothedFiltred = [];
    dataFiltred = handleFilterData(ndviElement.data, StartDate, EndtDate);
    dataSmoothedFiltred = handleFilterData(
      ndviElement.data_smoothed,
      StartDate,
      EndtDate
    );
    const { minValue, maxValue } = findMinMaxValues(
      dataFiltred,
      dataSmoothedFiltred
    );
    const arr = {
      data: dataFiltred,
      data_smoothed: dataSmoothedFiltred,
      min: minValue,
      max: maxValue,
    };
    setdata(arr);
    if (dataPredict.length !== 0) {
      const ElementPredict = dataPredict["ndvi"];
      setdataPredictIndex(ElementPredict.data_predict);
    }
  }, [data_graph, dataPredict]);

  const onSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    // Validation: Check if StartDate, EndtDate, and index are not empty
    if (
      !StartDate ||
      !EndtDate ||
      !index ||
      !StartDate.isValid() ||
      !EndtDate.isValid()
    ) {
      dispatch(
        showSnackbar(
          "error",
          undefined,
          t("Please checkout all fields !"),
          "top",
          "right"
        )
      );
      setLoading(false);
    } else if (!StartDate.isBefore(EndtDate)) {
      dispatch(
        showSnackbar(
          "error",
          undefined,
          t("Start date must be before end date !"),
          "top",
          "right"
        )
      );
    } else {
      const indexElement = data_graph.find((item) => item.index === index);
      // Function to handle filtering based on start and end dates
      let dataFiltred = [];
      let dataSmoothedFiltred = [];
      let dataFiltredByCloudPercentage = [];
      let dataSmoothedFiltredByCloudPercentage = [];
      dataFiltred = handleFilterData(indexElement.data, StartDate, EndtDate);
      dataSmoothedFiltred = handleFilterData(
        indexElement.data_smoothed,
        StartDate,
        EndtDate
      );
      dataFiltredByCloudPercentage = handleFilterDataByCloudPercentage(
        dataFiltred,
        cloud_percentage
      );
      dataSmoothedFiltredByCloudPercentage = handleFilterDataByCloudPercentage(
        dataSmoothedFiltred,
        cloud_percentage
      );
      const { minValue, maxValue } = findMinMaxValues(
        dataFiltred,
        dataSmoothedFiltred
      );
      const arr = {
        data: dataFiltredByCloudPercentage,
        data_smoothed: dataSmoothedFiltredByCloudPercentage,
        min: minValue,
        max: maxValue,
      };
      setdata(arr);
      const ElementPredict = dataPredict[index];
      setdataPredictIndex(ElementPredict.data_predict);
      setLoading(false);
    }
    setLoading(false);
  };
  return (
    <Row className="pt-2 pb-2">
      <Form onSubmit={(e) => onSubmit(e)}>
        <div className="row">
          <div className="col-md-4">
            <BasicDatePicker
              disabled={loading}
              className="graph_date_input"
              label={t("start date")}
              value={StartDate}
              name={"StartDate"}
              onChange={(e) => onChange(e)}
            />
          </div>
          <div className="col-md-4">
            <BasicDatePicker
              disabled={loading}
              className="graph_date_input"
              label={t("end date")}
              value={EndtDate}
              name={"EndtDate"}
              onChange={(e) => onChange(e)}
            />
          </div>
          <div className="col-md-4">
            <FormControl
              sx={{ mt: 1, mb: 1 }}
              size="small"
              className="m-select col-sm-12 "
            >
              <InputLabel id="demo-select-index-label">{t("Index")}</InputLabel>
              <Select
                disabled={loading}
                labelId="demo-select-index-label"
                id="demo-select-index"
                label="Index"
                fullWidth
                onChange={(e) => onChangeIndex(e)}
                name="Index"
                defaultValue={"ndvi"}
                value={index}
              >
                <MenuItem value="ndvi">{t("vegetation")}</MenuItem>
                <MenuItem value="ndwi">{t("Water content")}</MenuItem>
                <MenuItem value="ndre">{t("Nitrogen Index")}</MenuItem>
                <MenuItem value="gci">{t("Plant Health Index")}</MenuItem>
                <MenuItem value="psri">{t("Plant Senescence Index")}</MenuItem>
                <MenuItem value="ndmi">{t("Soil moisture index")}</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-12">
            <Typography id="input-slider" gutterBottom>
              {t('Cloud percentage')}
            </Typography>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-11">
            <Slider
              aria-label="Temperature"
              defaultValue={40}
              getAriaValueText={valuetext}
              valueLabelDisplay="on"
              marks={marks}
              min={10}
              max={40}
              step={10}
              disabled={loading}
              name="cloud_percentage"
              value={cloud_percentage}
              onChange={onChangeSlider}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 d-flex justify-content-center">
            <LoadingButton
              size="small"
              color="primary"
              type="submit"
              loading={loading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained"
            >
              <span>{t("Process")}</span>
            </LoadingButton>
          </div>
        </div>
        <div className="row" style={{ marginLeft: "10px" }}>
          {indexText && data ? (
            <Graph
              vegetationIndex={indexText}
              data={data}
              datapredict={dataPredictIndex}
              notifications={notifications}
            />
          ) : (
            <div>
              En cours de traitement.. cela peut prendre quelques minutes.
            </div>
          )}
          <div className="col-md-12 text-center mt-2">
            <Button className="btn btn-login" onClick={() => clickEvent(0)}>
              {t("Show details")}
            </Button>
          </div>
        </div>
      </Form>
    </Row>
  );
};

export default GraphLayout;
