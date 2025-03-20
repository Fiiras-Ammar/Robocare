import React from 'react';
import { useSelector } from 'react-redux';
import {useTranslation} from "react-i18next";

const DEMLegend = () => {
    const DetailVegetationLayers = useSelector((state) => state.mapReducer.DetailVegetationLayers);
    const { t } = useTranslation();

    if (!DetailVegetationLayers?.terrain_model?.colormap) return null;

    const colormap = DetailVegetationLayers.terrain_model.colormap;

    const uniqueColors = new Set(colormap.map(color => `rgb(${color[0]}, ${color[1]}, ${color[2]})`));

    const reversedColors = [...uniqueColors];

    const gradientStyle = `linear-gradient(to right, ${reversedColors.join(', ')})`;

    return (
        <div className="dem-legend mt-2 p-2 border rounded">
            <div
                style={{
                    margin: 0,
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    letterSpacing: '0.00938em',
                }}
            >
                {t("Altitude Legend")}

            </div>
            <div
                className="legend-bar"
                style={{
                    background: gradientStyle,
                    height: '20px',
                    width: '100%',
                }}
            />
            <div
                className="legend-labels"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '5px',
                    color: '#000',
                }}
            >
                <span style={{fontSize: '14px'}}>{t("Lower Altitude")}</span>

                <span style={{fontSize: '14px'}}>{t("Higher Altitude")}</span>
            </div>
        </div>
    );
};

export default DEMLegend;
