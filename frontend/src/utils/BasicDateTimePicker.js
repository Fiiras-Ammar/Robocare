import * as React from 'react';
import { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useEffect } from 'react';
import 'dayjs/locale/en-gb';

export default function BasicDateTimePicker({ label, onChange, initialDate, name, value, className, disabled }) {
    const [SelectedDate, setSelectedDate] = useState(null);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        onChange({ target: { name, value: date } }); // Call the onChange prop with the selected date
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} style={{ width: "100%" }} adapterLocale="en-gb">
            <DemoContainer components={['DatePicker']} style={{ width: "100%" }} size="small">
                <DateTimePicker
                    disabled={disabled}
                    label={label}
                    value={value}
                    name={name}
                    defaultValue={initialDate}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    className={className}
                />
            </DemoContainer>
        </LocalizationProvider>
    );
}