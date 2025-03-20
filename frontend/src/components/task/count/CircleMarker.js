import React from "react";

const CircleMarker = (data, color) => {


    return (
        data.map(item => (
            <CircleMarker
                key={item.maxx}
                center={[item.lat, item.lon]}
                radius={(item.maxx - item.minx) / 2}
                color={color}
            >
                {renderPopupContent(item)}
            </CircleMarker>
        ))
    )
}

export default CircleMarker