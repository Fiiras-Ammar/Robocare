import React from 'react'
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CalendarIcon from "../../../assets/images/icons/calendar.svg";
const CalendarBlock = ({ openModal }) => {
    const { t } = useTranslation();

    return (
        <>
            <Row className="pt-2 pb-2">
                <Col xs={12} className="">
                    <span className="high-resolution-span">
                        {t("Manage and document your agricultural activities with our intuitive Calendar feature. Stay organized and in control by scheduling crucial events such as irrigation, fertilization, and other vital agricultural practices.")}
                    </span>
                </Col>
            </Row>
            <Row className="pt-2 pb-2 justify-content-center">
                <Col xs={4} className="">
                    {openModal && <img src={CalendarIcon} style={{ width: "100%" }} onClick={() => openModal(2)} className="calendar-icon"/>}
                </Col>
            </Row>
        </>
    )
}

export default CalendarBlock