import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { IoInformationCircleSharp } from "react-icons/io5";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import DOMPurify from 'dompurify';
import parse from "html-react-parser";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getHistogram } from "../../../actions/histogram";
import {
  HISTOGRAM_FAIL,
  SET_HISTOGRAM_LOAD_FAIL,
  SET_HISTOGRAM_LOAD_SUCCESS,
} from "../../../utils/types";

const IndexCheckbox = ({ index, isChecked, onCheckboxChange,showCheckbox=true }) => {
  const [loading, setloading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selected_date = useSelector((state) => state.mapReducer.SelectedDate);
  const id_task = useSelector((state) => state.mapReducer.taskIdDetails);
  const checkedLayer = useSelector((state) => state.mapReducer.checkboxLayers);

  useEffect(() => {}, [index]);
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props} className="index-tooltip">
      {props.children}
    </Tooltip>
  );
  const handleCheckboxChange = (e) => {
    dispatch({
      type: HISTOGRAM_FAIL,
    });
    onCheckboxChange(index.id);
    const ischeck = e.target.checked;

    if (ischeck) {
      dispatch(
        getHistogram(
          id_task,
          selected_date.date,
          selected_date.provider,
          index.id
        )
      );
    }
  };

  return (
    <Row className="pt-2 pb-2">
      <Col xs="12">
        <Row>
          <Col xs="9" className="d-flex align-item-center gap-2 flex-column">
            <span className="index-span d-flex align-items-center" style={{ fontWeight: 'bold' }}>
              {t(index.index)}
            </span>
            <div className="d-flex align-item-center gap-2">
              {index.bands.map((item, key) => (
                <div className="d-flex align-items-center">
                  <span className={`custom-badge ${item.badge}`}>
                    {item.band}
                  </span>
                </div>
              ))}
            </div>
          </Col>
          <Col
            xs="3"
            className="d-flex flex-row gap-2 justify-content-end flex-column"
          >
            {showCheckbox && (
            <div className="d-flex align-items-center justify-content-end">
              <input
                type="checkbox"
                id={index.id}
                className="index-checkbox"
                name="layer"
                checked={index.id === checkedLayer}
                onChange={handleCheckboxChange}
              />
              <label for={index.id}></label>
            </div>
            )}
            <div className="d-flex align-items-center justify-content-end">
              <OverlayTrigger
                placement="right"
                delay={{ show: 0, hide: 0 }}
                overlay={(props) =>
                  renderTooltip({
                    ...props,
                    children: parse(DOMPurify.sanitize(t(index.description)))
                  })
                }
              >
                <div className="info-icon-wrapper d-flex justify-content-center align-items-center">
                  <IoInformationCircleSharp />
                </div>
              </OverlayTrigger>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
export default IndexCheckbox;
