import React, { useEffect } from "react";
import $ from "jquery";
import { useSelector } from "react-redux";
import spinner from "../assets/images/Spinner-green.svg"
const LoadingData = () => {

    return (
        <img src={spinner} />
    )
}

export default LoadingData;