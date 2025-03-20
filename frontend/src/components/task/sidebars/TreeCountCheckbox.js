import { index } from "d3";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { IoInformationCircleSharp } from "react-icons/io5";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import * as DOMPurify from "dompurify";
import parse from "html-react-parser";
import { GiFruitTree } from "react-icons/gi";

import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { SET_IS_CHECKED_COUNT_CHECKBOX_FAIL, SET_IS_CHECKED_COUNT_CHECKBOX_SUCCESS } from "../../../utils/types";

const TreeCountCheckbox = ({ onCheckboxChange }) => {

    const { t } = useTranslation();
    const treeCount = useSelector((state) => state.mapReducer.treeCountValue)
    const dispatch = useDispatch()
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props} className="index-tooltip">
            {props.children}
        </Tooltip>
    );

    const handleOnChange = (event) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            dispatch({
                type: SET_IS_CHECKED_COUNT_CHECKBOX_SUCCESS
            })
        } else {
            dispatch({
                type: SET_IS_CHECKED_COUNT_CHECKBOX_FAIL
            })
        }
    }

    return (
        <Row className="pt-2 pb-2">
            <Col xs="12">
                <Row>
                    <Col xs="9" className="d-flex align-item-center gap-2 flex-column">
                        <span className="index-span d-flex align-items-center">
                            {t("plant Count with ai")}
                        </span>
                        <div className="d-flex align-items-center gap-2">
                            <GiFruitTree className="tree-count-icon" />
                            <span className="tree-number">{treeCount ? `${treeCount}` : t("tree count is not available!")}</span>
                        </div>
                    </Col>
                    <Col
                        xs="3"
                        className="d-flex flex-row gap-2 justify-content-end flex-column"
                    >
                        <div className="d-flex align-items-center justify-content-end">
                            <input
                                type="checkbox"
                                id="count-checkbox"
                                className="index-checkbox"
                                name="layer"
                                onChange={handleOnChange}
                            />
                            <label for="count-checkbox"></label>
                        </div>
                        <div className="d-flex align-items-center justify-content-end">
                            <OverlayTrigger
                                placement="right"
                                delay={{ show: 0, hide: 0 }}
                                overlay={(props) =>
                                    renderTooltip({
                                        ...props,
                                        children: t("This layer represents the locations of trees identified and interpreted by AI. Each marker on the map corresponds to a tree detected through artificial intelligence algorithms."),
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
export default TreeCountCheckbox;
