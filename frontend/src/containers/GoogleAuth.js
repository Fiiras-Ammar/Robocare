/*
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../actions/snackbar';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const GoogleAuth = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSuccess = async (credentialResponse) => {
    try {
      onSuccess(credentialResponse); // Pass raw credential to parent
    } catch (error) {
      dispatch(showSnackbar('error', t('Google login failed. Try again.')));
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => dispatch(showSnackbar('error', t('Google login failed. Try again.')))}
      useOneTap
      shape="circle"
      theme="filled_blue"
      size="large"
      logo_alignment="left"
      text="signin_with"
      locale="en_US"
    />
  );
};

export default GoogleAuth;*/