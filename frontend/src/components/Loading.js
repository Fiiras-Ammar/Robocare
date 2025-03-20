// components/Loading.js
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <CircularProgress />
  </div>
);

export default Loading;