import React from "react";
import { Container } from "@mui/material";
import { Col, Row } from "react-bootstrap";
import cloudSVG from "../../../assets/images/cloud.svg"
import satelliteSVG from "../../../assets/images/satellite.svg"
import { useTranslation } from "react-i18next";

const DateTooltip = ({ provider, cloud_percentage, index }) => {
    const providerName = provider === "S2" ? "Sentinel 2" : provider === "L8" ? "Landsat 8" : "Landsat 9"
    const { t } = useTranslation();

    return (
        <div className="tipy-container" id={"date-tooltip-" + index}>
            <Container maxWidth="sm" className="d-flex flex-column">
                <Row className="justify-content-center">
                    <Col xs={12} className="d-flex justify-content-center align-items-center">
                        <span style={{ marginRight: "5px" }}><img src={satelliteSVG} alt="satellite" style={{ width: '30px' }} /></span>
                        <span title={providerName}>{provider}</span>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={12} className="d-flex justify-content-center align-items-center">
                        <span style={{ marginRight: "5px" }}><img src={cloudSVG} alt="cloud" style={{ width: '30px' }} /></span>
                        <span>{cloud_percentage && cloud_percentage === "-1" ? t("Undefined") : cloud_percentage+ "%"}</span>
                    </Col>
                </Row>
            </Container>        
        </div>
    )
}

export default DateTooltip