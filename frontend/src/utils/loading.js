import React, { useEffect } from "react";
import $ from "jquery";
import { useSelector } from "react-redux";

const Loading = () => {
  const loadingState = useSelector((state) => state.mapReducer.LoadingState);

  useEffect(() => {
    if (loadingState === 1) {
      $(".loading").addClass("active");
      $(".loading").removeClass("loading-white");
      $(".loading").addClass("loading-green");
    } else if (loadingState === 2) {
      $(".loading").addClass("active");
      $(".loading").removeClass("loading-green");
      $(".loading").addClass("loading-white");
    } else if (loadingState === 0) {
      $(".loading").removeClass("active");
    }
  }, [loadingState]);
  return <div className="loading"></div>;
};

export default Loading;
