import React, { useEffect, useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { MdDashboard } from "react-icons/md";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { check_staff } from "../actions/project";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TaskIcon from '@mui/icons-material/Task';
import GroupIcon from '@mui/icons-material/Group';
import SensorsIcon from '@mui/icons-material/Sensors';
import {Event} from "@mui/icons-material";
import CompareIcon from '@mui/icons-material/Compare';

const MainListItems = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isStaff, setisStaff] = useState(0);
  const userId = useSelector((state) => state.auth.user?.id);

  const handleNavigateToProjects = () => {
    navigate("/dashboard/projects/list");
  };
  const handleNavigateToCompare = () => {
    navigate("/dashboard/compare/index");
  };
  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };
  const handleNavigateToUsers = () => {
    navigate("/dashboard/users");
  };
  const handleNavigateToNotifications = () => {
    navigate("/dashboard/notifications");
  };
  const handleNavigateToSensors = () => {
    navigate("/dashboard/sensor");
  };

  const handleNavigateToCalendar = () => {
    navigate("/dashboard/calendar");
  };
  const handleTaskCompareReference = () => {
    navigate("/dashboard/compare/reference");
  };


  useEffect(() => {
    if (!userId) return;
    dispatch(check_staff(userId)).then((response) => {
      if (response.status == 200) {
        setisStaff(response.data["staff"]);
      }
    });
  }, [userId]);
  return (
    <React.Fragment>
      <ListItemButton onClick={handleNavigateToDashboard}>
        <ListItemIcon className="MainIcons">
          <MdDashboard />
        </ListItemIcon>
        <ListItemText primary={t("Dashboard")} />
      </ListItemButton>
      <ListItemButton onClick={handleNavigateToProjects}>
        <ListItemIcon className="MainIcons">
          <FolderOpenIcon/>
        </ListItemIcon>
        <ListItemText primary={t("Projects")} />
      </ListItemButton>
      {isStaff ? (
        <ListItemButton onClick={handleNavigateToCompare}>
          <ListItemIcon className="MainIcons">
            <TaskIcon />
          </ListItemIcon>
          <ListItemText primary={t("Compare Fields")} />
        </ListItemButton>
      ) : (
        ""
      )}
      {isStaff ? (
        <ListItemButton onClick={handleNavigateToUsers}>
          <ListItemIcon className="MainIcons">
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary={t("Users")} />
        </ListItemButton>
      ) : (
        ""
      )}
      {isStaff ? (
          <ListItemButton onClick={handleNavigateToSensors}>
            <ListItemIcon className="MainIcons">
              <SensorsIcon/>
            </ListItemIcon>
            <ListItemText primary={t("Sensors")} />
          </ListItemButton>
      ) : (
          ""
      )}
      <ListItemButton onClick={handleNavigateToNotifications}>
        <ListItemIcon className="MainIcons">
          <NotificationsIcon />
        </ListItemIcon>
        <ListItemText primary={t("Notifications")} />
      </ListItemButton>

      <ListItemButton onClick={handleNavigateToCalendar}>
        <ListItemIcon className="Event">
          <Event/>
        </ListItemIcon>
        <ListItemText primary={t("Event calandar")} />
      </ListItemButton>
      {isStaff ? (
          <ListItemButton onClick={handleTaskCompareReference}>
            <ListItemIcon className="TaskCompareReference">
              <CompareIcon/>
            </ListItemIcon>
            <ListItemText primary={t("Field Reference")} />
          </ListItemButton>
      ) : (
          ""
      )}
    </React.Fragment>
  );
};
export default MainListItems;
