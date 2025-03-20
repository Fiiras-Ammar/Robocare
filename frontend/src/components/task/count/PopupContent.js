import React from "react";

const PopupContent = ({ data }) => {


    return (
        <div>
            <span><b>Plant NDVI:</b> {data.mean_ndvi ? data.mean_ndvi.toFixed(2) : 'calculating...'}</span><br />
            <span><b>Plant NDRE:</b> {data.mean_ndre ? data.mean_ndre.toFixed(2) : 'calculating...'}</span><br />
            <span><b>Plant GCI:</b> {data.mean_gci ? data.mean_gci.toFixed(2) : 'calculating...'}</span><br />
            <span><b>Plant NDWI:</b> {data.mean_ndwi ? data.mean_ndwi.toFixed(2) : 'calculating...'}</span><br />
            <span><b>Plant PSRI:</b> {data.mean_psri ? data.mean_psri.toFixed(2) : 'calculating...'}</span><br />
            <span> {data.index ? <><b>index:</b> {data.index} </> : ''}</span>
        </div>
    )
}

export default PopupContent
