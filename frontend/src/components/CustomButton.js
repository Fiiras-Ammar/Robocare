import React, { useState } from 'react';
import Button from '@mui/material/Button';

const CustomButton = ({ children, ...props }) => {
  const [variant, setVariant] = useState('outlined');

  const handleMouseEnter = () => {
    setVariant('contained');
  };

  const handleMouseLeave = () => {
    setVariant('outlined');
  };

  return (
    <Button
      variant={variant}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Button>
    
  );
};

export default CustomButton;