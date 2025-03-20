import React, { useState, useEffect, useRef }from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { useTranslation } from 'react-i18next';




function createData(period, water_quantity, irrigation_time, tour_span) {
//   const density = population / size;
  return { period, water_quantity, irrigation_time, tour_span };
}

// let rows = [
//   createData("January days 1 to 10", 4.54, "45 mn", "12 h"),
//   createData("January days 11 to 20", 4.49, "45 mn", "12 h"),
//   createData("Rest of January", 4.96, "50 mn", "12 h"),
  
//   createData("February days 1 to 10", 5.89, "59 mn", "12 h"),
//   createData("February days 11 to 20", 5.18, "52 mn", "12 h"),
//   createData("Rest of February", 5.79, "58 mn", "12 h"),
  
//   createData("March days 1 to 10", 6.82, "1 h 8 mn", "14 h"),
//   createData("March days 11 to 20", 6.91, "1 h 9 mn", "14 h"),
//   createData("Rest of March", 7.32, "1 h 13 mn", "14 h"),
  
//   createData("April days 1 to 10", 7.88, "1 h 19 mn", "14 h"),
//   createData("April days 11 to 20", 8.95, "1 h 30 mn", "14 h"),
//   createData("Rest of April", 9.33, "1 h 33 mn", "14 h"),
  
//   createData("May days 1 to 10", 10.33, "1 h 43 mn", "16 h"),
//   createData("May days 11 to 20", 11.58, "1 h 56 mn", "16 h"),
//   createData("Rest of May", 11.11, "1 h 51 mn", "16 h"),
  
//   createData("June days 1 to 10", 11.75, "1 h 58 mn", "17 h"),
//   createData("June days 11 to 20", 12.84, "2 h 8 mn", "17 h"),
//   createData("Rest of June", 13.68, "2 h 17 mn", "17 h"),
  
//   createData("July days 1 to 10", 13.74, "2 h 17 mn", "19 h"),
//   createData("July days 11 to 20", 13.6, "2 h 16 mn", "19 h"),
//   createData("Rest of July", 13.68, "2 h 17 mn", "19 h"),
  
//   createData("August days 1 to 10", 12.96, "2 h 10 mn", "19 h"),
//   createData("August days 11 to 20", 11.87, "1 h 59 mn", "19 h"),
//   createData("Rest of August", 11.18, "1 h 52 mn", "19 h"),
  
//   createData("September days 1 to 10", 9.85, "1 h 38 mn", "18 h"),
//   createData("September days 11 to 20", 9.32, "1 h 33 mn", "18 h"),
//   createData("Rest of September", 8.14, "1 h 21 mn", "18 h"),
  
//   createData("October days 1 to 10", 7.03, "1 h 10 mn", "15 h"),
//   createData("October days 11 to 20", 7.01, "1 h 10 mn", "15 h"),
//   createData("Rest of October", 6.32, "1 h 3 mn", "15 h"),
  
//   createData("November days 1 to 10", 5.9, "59 mn", "13 h"),
//   createData("November days 11 to 20", 5.13, "51 mn", "13 h"),
//   createData("Rest of November", 5.01, "50 mn", "13 h"),
  
//   createData("December days 1 to 10", 4.37, "44 mn", "12 h"),
//   createData("December days 11 to 20", 4.03, "40 mn", "12 h"),
//   createData("Rest of December", 4.0, "40 mn", "12 h"),
  
  
// ];

export default function StickyHeadTable(data) {
  const { t } = useTranslation();
  const columns = [
    { id: 'period_name', label: `${t('Period')}`, minWidth: 50, align: 'center' },
    { id: 'needed_water_litre_plant_day', label: `${t('Advised Water Quantity (liters/plant/day)')}`, minWidth: 300, align: 'center' },
    {
      id: 'irrigation_time',
      label: `${t('Advised Irrigation Time')}`,
      minWidth: 200,
      align: 'center',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'irrigation_span',
      label: `${t('Irrigation Tour Span')}`,
      minWidth: 170,
      align: 'center',
      format: (value) => value.toLocaleString('en-US'),
    },
  ];

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(36);
  let data_value = data.data

  // if(data != []){rows = data}
  if (!data_value.map) return

  // useEffect(() => {  
  //   if (!data_value.map) return

  // })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    // <div></div>

    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data_value != [] && data_value
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[36, 25, 100]}
        component="div"
        count={data_value.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
