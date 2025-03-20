import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button, Col, Row } from "react-bootstrap";
import EditTaskPopup from "./EditTaskPopup";

const SurveyHeader = ({ editSurvey }) => {
  const { t } = useTranslation();

  const [modalOpenEditTask, setmodalOpenEditTask] = useState(false);
  const taskIdDetailsEdit = useSelector(
    (state) => state.mapReducer.taskIdDetails
  );
  const taskNameDetailsEdit = useSelector(
    (state) => state.mapReducer.taskNameDetails
  );

  const handleOpenEditTaskModal = () => {
    setmodalOpenEditTask(true);
  };
  const handleCloseEditTaskModal = () => {
    setmodalOpenEditTask(false);
  };
  const handleOpenDroneApp = () => {
    if (taskNameDetailsEdit === "Safsaf") {
      window.open(
        "https://app.drone.robocare.tn/login/?username=Bouassida&&password=ps8uWFjH2f696eZ4T",
        "_blank"
      );
    } else if (taskNameDetailsEdit === "Taous") {
      window.open(
        "https://app.drone.robocare.tn/login/?username=fruitflynet2&&password=H0127JB4369MsbROs",
        "_blank"
      );
    } else if (taskIdDetailsEdit === "0470c399-4d09-4e5d-8912-92018c495d9b") {
      window.open(
        "https://app.drone.robocare.tn/login/?username=Bouassida&&password=ps8uWFjH2f696eZ4T",
        "_blank"
      );
    }
  };

  return (
    <Row className="pt-2 pb-2">
      <Col xs={12} className="d-flex align-items-center">
        <div className="icon-wrapper d-flex justify-content-center align-item-center">
          {/* <TbMapSearch className="task-title-icon" /> */}

          <i className="fg-lg fg-layer-alt-edit task-title-icon"></i>
        </div>

        <div className="area-title align-items-center d-flex">
          <span className="task-title">{t("Field Details")}</span>
          {editSurvey ? (
            <div className="edit-enquete">
              <Button
                className="btn btn-login"
                onClick={() => handleOpenEditTaskModal(taskIdDetailsEdit)}
              >
                {t("Edit survey")}
              </Button>
            </div>
          ) : (
            ""
          )}
          {taskNameDetailsEdit === "Safsaf" ||
            taskNameDetailsEdit === "Taous" ||
            taskIdDetailsEdit === "0470c399-4d09-4e5d-8912-92018c495d9b" ? (
            <div className="edit-enquete">
              <Button
                className="btn btn-login"
                onClick={() => handleOpenDroneApp()}
              >
                {t("Drone data")}
              </Button>
            </div>
          ) : (
            ""
          )}
        </div>
      </Col>
      {/* <EditTaskPopup open={modalOpenEditTask} handleClose={handleCloseEditTaskModal}> */}
      <EditTaskPopup
        open={modalOpenEditTask}
        handleClose={handleCloseEditTaskModal}
      />
    </Row>
  );
};

export default SurveyHeader;
