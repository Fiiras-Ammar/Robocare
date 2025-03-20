import React from 'react';
import { useTranslation } from "react-i18next";

const LegendHistogram = ({ lowestVegParam, densestVegParam }) => {
    const { t } = useTranslation();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', marginRight: '10px' }}></div>
                <span style={{ fontWeight: "bold",fontSize:"14px" }}>{t(lowestVegParam)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#198754', marginRight: '10px' }}></div>
                <span style={{ fontWeight: "bold",fontSize:"14px" }}>{t(densestVegParam)}</span>
            </div>
        </div>
    );
};

export default LegendHistogram;
