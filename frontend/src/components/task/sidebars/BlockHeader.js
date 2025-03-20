import React from "react";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { BsBoxArrowUpRight } from "react-icons/bs";

const BlockHeader = ({ title, icon, openModal, CustomIcon
 }) => {
    const { t } = useTranslation();

    return (
        <Row className="pt-2 pb-2">
            <Col xs={12}>
                <Row>
                    <Col xs={11} className="d-flex align-items-center">
                        <div className="icon-wrapper d-flex justify-content-between align-item-center">
                            {/* <TbMapSearch className="task-title-icon" /> */}
                            {icon && <i className={`fg-lg ${icon} task-title-icon`}></i>}
                            {CustomIcon && <CustomIcon className="task-title-icon" />}

                        </div>
                        <div className="area-title align-items-center d-flex">
                            <span className="task-title">{t(title)}</span>
                        </div>
                    </Col>
                    <Col xs={1} className="d-flex align-items-center no-padding">
                        {openModal && <span onClick={() => openModal(0)} style={{ cursor: "pointer" }}> <BsBoxArrowUpRight style={{ fontSize: "20px", cursor: "pointer" }} /></span>}
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default BlockHeader;
