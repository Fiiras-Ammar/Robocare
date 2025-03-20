import React, { useEffect, useState } from "react";
import { RiMenuUnfoldFill, RiMenuFoldFill } from "react-icons/ri";
import $ from "jquery";
import { isMobile } from "react-device-detect";
import { setClickEventFail, setClickEventSucess } from "../../../actions/map";
import { useDispatch } from "react-redux";

const SidebarToggleButton = () => {
  const [isOpen, setisOpen] = useState(!isMobile); // Open by default on desktop, closed on mobile
  const [toogleButton, settoogleButton] = useState(null);
  const dispatch = useDispatch();

  const toogleSidebar = () => {
    if (isOpen) {
      $(".sidebar").addClass("sidebar-closed");
      $(".sidebar-bottom").addClass("sidebar-closed");
      $(".leaflet-control-scale.leaflet-control").addClass("left-10");
      $("#sidebar-toogle-button-wrapper").addClass("sidebar-toogle-button-closed");
      dispatch(setClickEventSucess());
      setisOpen(false);
    } else {
      $(".sidebar").removeClass("sidebar-closed");
      $(".sidebar-bottom").removeClass("sidebar-closed");
      $(".leaflet-control-scale.leaflet-control").removeClass("left-10");
      $("#sidebar-toogle-button-wrapper").removeClass("sidebar-toogle-button-closed");
      dispatch(setClickEventFail());
      setisOpen(true);
    }
  };

  // Apply default closed styles only on mobile when component mounts
  useEffect(() => {
    if (isMobile) {
      $(".sidebar").addClass("sidebar-closed");
      $(".sidebar-bottom").addClass("sidebar-closed");
      $(".leaflet-control-scale.leaflet-control").addClass("left-10");
      $("#sidebar-toogle-button-wrapper").addClass("sidebar-toogle-button-closed");
      dispatch(setClickEventSucess());
    }
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (isOpen) {
        dispatch(setClickEventFail());
      } else {
        dispatch(setClickEventSucess());
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!toogleButton) return;

    if (isMobile) {
      toogleButton.addEventListener("touchstart", disableMapInteractions);
      toogleButton.addEventListener("touchmove", disableMapInteractions);
    }
    toogleButton.addEventListener("mouseenter", disableMapInteractions);
    toogleButton.addEventListener("mouseleave", enableMapInteractions);
    return () => {
      toogleButton.removeEventListener("mouseenter", disableMapInteractions);
      toogleButton.removeEventListener("mouseleave", enableMapInteractions);
      toogleButton.removeEventListener("touchstart", disableMapInteractions);
      toogleButton.removeEventListener("touchend", enableMapInteractions);
      toogleButton.removeEventListener("touchmove", enableMapInteractions);
    };
  }, [toogleButton]);

  const disableMapInteractions = () => {
    dispatch(setClickEventFail());
  };
  const enableMapInteractions = () => {
    dispatch(setClickEventSucess());
  };

  return (
      <div id="sidebar-toogle-button-wrapper" onClick={toogleSidebar} ref={settoogleButton}>
        {isOpen ? (
            <RiMenuFoldFill className="sidebar-close-icon" />
        ) : (
            <RiMenuUnfoldFill className="sidebar-open-icon" />
        )}
      </div>
  );
};

export default SidebarToggleButton;
