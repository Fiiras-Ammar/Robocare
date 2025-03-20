import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CompareTaskButton = ({ position, onClick }) => {
    const map = useMap();
    const { t } = useTranslation();

    useEffect(() => {
        const createCompareControl = L.Control.extend({
            onAdd: function() {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                const button = L.DomUtil.create('a', 'leaflet-control-create-compare', container);

                const svgIcon = `
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="3" width="9" height="18" rx="2" ry="2"/>
                        <rect x="15" y="3" width="9" height="18" rx="2" ry="2"/>
                        <text x="3" y="13" font-size="6" fill="currentColor">A</text>
                        <text x="17" y="13" font-size="6" fill="currentColor">B</text>
                    </svg>
                `;

                button.innerHTML = svgIcon;
                button.href = '#';
                button.title = t('Compare plots Temporal');
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';

                L.DomEvent.on(button, 'click', function(e) {
                    L.DomEvent.preventDefault(e);
                    onClick();
                });

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

export default CompareTaskButton;
