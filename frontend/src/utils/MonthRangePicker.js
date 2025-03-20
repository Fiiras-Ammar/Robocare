import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import {useTranslation} from "react-i18next";

const longMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const shortMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const smallScreen = window.innerWidth < 600;

const MonthRangePicker = ({handleMonthRange}) => {
  const [rangeValue, setRangeValue] = useState([0, 11]);
  const [months, setMonths] = useState(longMonths);
  const {t} = useTranslation();

  const handleChange = (event, newRangevalue) => {
    setRangeValue(newRangevalue);
  };

  useEffect(()=>{
    handleMonthRange(rangeValue)
  },[rangeValue])

  useEffect(()=>{
    if(smallScreen){
      setMonths(shortMonths)
    }
  }, [])

  return (
    <Box>
      <Slider
        value={rangeValue}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={0}
        max={11}
        marks={months.map((month, index) => ({ value: index, label: t(month) }))}
        valueLabelFormat={(rangeValue) => t(months[rangeValue])}

        style={{color:"#909090"}}
        sx={{
          '& .MuiSlider-markLabel': {
            fontSize: smallScreen ? '0.75rem' : '1rem',
          },
        }}
      />
    </Box>
  );
};

export default MonthRangePicker;
