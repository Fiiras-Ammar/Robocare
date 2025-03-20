import React, { useEffect } from "react";
import "../assets/css/style1.css";
import "../assets/css/dashboard.css";
import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import classNames from "classnames";
import { update_language } from "../actions/profile";
import { useSelector, useDispatch } from "react-redux";

const Language = ({ color = "#6f9d2f" }) => {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const languages = [
        {
            code: "fr",
            name: "Français",
            country_code: "fr",
        },
        {
            code: "en",
            name: "English",
            country_code: "gb",
        },
    ];

    const FlagIcon = ({ countryCode }) => (
        <span
            className={`flag-icon flag-icon-${countryCode} mx-2`}
            style={{ opacity: 1 }}
        ></span>
    );

    const currentLanguageCode = cookies.get("i18next") || "en";
    const currentLanguage = languages.find((l) => l.code === currentLanguageCode);
    const { t } = useTranslation();

    useEffect(() => {
        document.body.dir = currentLanguage.dir || "ltr";
    }, [currentLanguage, t]);

    const handleChangeLanguage = (code) => {
        i18next.changeLanguage(code);
        if (user && user.id) {
            const data = {
                id: user.id,
                language: code
            };
            dispatch(update_language(data));
        }
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-link dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                    fontSize: "15px",
                    textDecoration: "none",
                    color: color,
                }}
            >
                <FlagIcon countryCode={currentLanguage.country_code} />
                {currentLanguage.code.toUpperCase()}
            </button>
            <ul
                className="dropdown-menu language-dropdown"
                aria-labelledby="dropdownMenuButton1"
            >
                {languages
                    .filter(({ code }) => code !== currentLanguageCode)
                    .map(({ code, name, country_code }) => (
                        <li key={country_code}>
                            <a
                                className={classNames("dropdown-item lang-item")}
                                onClick={() => handleChangeLanguage(code)}
                            >
                                <FlagIcon countryCode={country_code} />
                                {code.toUpperCase()}
                            </a>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default Language;
