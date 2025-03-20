import React, { useEffect, useState, useRef } from "react";
import { BsCloudSunFill, BsCloudSun } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { setClickEventFail, setClickEventSucess } from "../../../actions/map";

const WeatherToggleButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const toggleButton = useRef(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkScreenSize = () => {
            const mobileBreakpoint = 768;
            setIsMobileView(window.innerWidth < mobileBreakpoint);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        const weatherCard = document.querySelector(".weather-card");
        const toggleButtonWrapper = document.querySelector("#weather-toggle-button-wrapper");

        if (weatherCard && toggleButtonWrapper) {
            weatherCard.classList.add("weather-card-hidden");
            toggleButtonWrapper.classList.add("weather-toggle-button-closed");
        }

        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

    const toggleWeatherCard = () => {
        const weatherCard = document.querySelector(".weather-card");
        const toggleButtonWrapper = document.querySelector("#weather-toggle-button-wrapper");

        if (isOpen) {
            weatherCard.classList.add("weather-card-hidden");
            toggleButtonWrapper.classList.add("weather-toggle-button-closed");
            dispatch(setClickEventSucess());
        } else {
            weatherCard.classList.remove("weather-card-hidden");
            toggleButtonWrapper.classList.remove("weather-toggle-button-closed");
            dispatch(setClickEventFail());
        }
        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        if (!toggleButton.current) return;

        const disableMap = () => dispatch(setClickEventFail());
        const enableMap = () => dispatch(setClickEventSucess());

        if (isMobileView) {
            toggleButton.current.addEventListener("touchstart", disableMap);
            toggleButton.current.addEventListener("touchmove", disableMap);
            toggleButton.current.addEventListener("touchend", enableMap);
        }
        toggleButton.current.addEventListener("mouseenter", disableMap);
        toggleButton.current.addEventListener("mouseleave", enableMap);

        return () => {
            if (toggleButton.current) {
                toggleButton.current.removeEventListener("mouseenter", disableMap);
                toggleButton.current.removeEventListener("mouseleave", enableMap);
                toggleButton.current.removeEventListener("touchstart", disableMap);
                toggleButton.current.removeEventListener("touchend", enableMap);
                toggleButton.current.removeEventListener("touchmove", disableMap);
            }
        };
    }, [toggleButton, isMobileView]);

    if (isMobileView) {
        return null;
    }

    return (
        <div
            id="weather-toggle-button-wrapper"
            onClick={toggleWeatherCard}
            ref={toggleButton}
        >
            {isOpen ? (
                <BsCloudSunFill className="weather-close-icon" />
            ) : (
                <BsCloudSun className="weather-open-icon" />
            )}
        </div>
    );
};

export default WeatherToggleButton;
