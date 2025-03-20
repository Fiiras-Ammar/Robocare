import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CompareTaskSpacialButton = ({ position, onClick }) => {
    const map = useMap();
    const { t } = useTranslation();

    useEffect(() => {
        const createCompareControl = L.Control.extend({
            onAdd: function() {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                const button = L.DomUtil.create('button', 'leaflet-control-compare', container);

                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="18" rx="2" ry="2"/>
                        <rect x="14" y="3" width="7" height="18" rx="2" ry="2"/>
                        <line x1="12" y1="9" x2="12" y2="15" />
                    </svg>
                `;

                button.title = t('Compare plots Spatial');
                button.type = 'button';
                button.style.cssText = `
                    background-color: #fff;
                    border: none;
                    padding: 6px; /* Reduced padding to maintain size */
                    width: 32px; /* Set a fixed width */
                    height: 32px; /* Set a fixed height */
                    border-radius: 4px;
                    cursor: pointer;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s;
                `;

                button.addEventListener('click', onClick);

                return container;
            }
        });

        const control = new createCompareControl({ position });
        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [map, position, onClick]);

    return null;
};

export default CompareTaskSpacialButton;
