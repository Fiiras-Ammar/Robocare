import * as React from 'react';
import { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect } from 'react';
import 'dayjs/locale/en-gb';
import dayjs from "dayjs";

export default function BasicDatePicker({ label, onChange, initialDate, name, value, className, disabled, minDate = dayjs('1900-01-01'), maxDate = dayjs('2100-01-01') }) {
    const [SelectedDate, setSelectedDate] = useState(null);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        onChange({ target: { name, value: date } }); // Call the onChange prop with the selected date
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} style={{ width: "100%" }} adapterLocale="en-gb">
            <DemoContainer components={['DatePicker']} style={{ width: "100%" }} size="small">
                <DatePicker
                    disabled={disabled}
                    label={label}
                    value={value}
                    name={name}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    className={className}
                    minDate={minDate}
                    maxDate={maxDate}
                />
            </DemoContainer>
        </LocalizationProvider>
    );
}