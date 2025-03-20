import React, { useState, forwardRef } from 'react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { TextField } from '@mui/material';
import { useTranslation } from "react-i18next";
import { Button } from 'react-bootstrap';
const provider = new OpenStreetMapProvider();

const CustomAddressSearch = forwardRef (({ onCoordsFound }, ref) => {
  const [locationInput, setLocationInput] = useState("");
  const { t } = useTranslation();

  const latlngRegex = /^\s*(-?\d+(\.\d+)?)\s*[\s,]\s*(-?\d+(\.\d+)?)\s*$/;

  const handleInputKeyPress = async (e) => {
    if (e.key === 'Enter') {
      let latlngArray;
      let match = locationInput.match(latlngRegex)
      if (match) {
        latlngArray = [match[1], match[3]]
      } else {
        try {
          let res = await provider.search({ query: locationInput })
          if (res && res.length > 0) {
            latlngArray = res[0].bounds[0];
          }
        } catch (error) {
        }
      }
      if (latlngArray) {
        onCoordsFound(latlngArray)
      }
    }
  }

  return (
    <div id='location_input_div' className='col-md-6' style={{zIndex: "700",}} ref={ref}>
      <TextField
        fullWidth
        id="location_input"
        placeholder={t("Enter address or coordinates")}
        type="text"
        name='name'
        size="small"
        onKeyUp={handleInputKeyPress}
        value={locationInput}
        onChange={e => setLocationInput(e.target.value)}
        sx={{
          width: "80%",
          minWidth: "max-content",
          border: 0,
          background: "transparent",
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none',
            },
          }
        }}
        inputProps={{
          disableUnderline: true, style: { border: 'none' }, 
          spellCheck: 'false',
          autoComplete: 'off',
          autoCorrect: 'off'
        }}
      />
      <Button onClick={() => setLocationInput('')} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: "20%", background: "transparent", border: "0", color: "grey", minWidth: "50px" }}>x</Button>
    </div>
  )
})
export default CustomAddressSearch;
