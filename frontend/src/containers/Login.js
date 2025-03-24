import React, { useState, useEffect } from 'react';
import { 
  TextField,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Divider,
  Typography,
  Link as MuiLink
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import LoginIcon from '@mui/icons-material/Login';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, load_user, setUpRefreshInterval, logout } from '../actions/auth';
import { showSnackbar } from '../actions/snackbar';
import { useTranslation } from 'react-i18next';
import image from '../assets/images/crop.b3a902767e85f1b371c1.png';
import logo from '../assets/images/LOGO-ROBOCARE-FINAL-SEPT-2021-1-200x80.png';
import FacebookIcon from '../assets/images/facebook.png';
import '../assets/css/login.css';
import GoogleAuth from './GoogleAuth';
import { auth } from './firebaseConfig';
import { 
  signInWithCredential,
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult 
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { CONST_LOGIN_SUCCESS, KEEP_ME_SIGN_IN_CHECKED,CONST_LOGIN_FAIL } from "../utils/types.js";
import CircularProgress from '@mui/material/CircularProgress';

import axiosInstance from '../utils/axiosConfig';





const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingbtn, setLoadingbtn] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [googleLoading, setGoogleLoading] = useState(false);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);



  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const reset = query.get('reset');
    const activate = query.get('activate');

    if (reset === 'true') {
      dispatch(showSnackbar('success', t('Your password has been changed successfully. You can now log in with your new password.')));
    }
    if (activate === 'true') {
      dispatch(showSnackbar('success', t('Your account has been confirmed successfully. You can now log in.')));
    }
  }, [dispatch, t]);

  useEffect(() => {
    document.body.classList.add('background-body');
    return () => document.body.classList.remove('background-body');
  }, []);



  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && isAuthenticated) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate, isAuthenticated]);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      
      // 1. Récupération du Token CSRF
      const csrfResponse = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/auth/csrf/`,
        { withCredentials: true }
      );
      console.log("CSRF Token obtenu:", csrfResponse.data.csrfToken);
  
      // 2. Authentification avec Google (Firebase)
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      console.log("Token ID obtenu (début):", idToken.substring(0, 20) + "...");
  
      // 3. Envoi au Backend
      console.log("Envoi de la requête à:", `${process.env.REACT_APP_API_URL}/auth/user/auth/google/`);
      
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/auth/user/auth/google/`,
        { id_token: idToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfResponse.data.csrfToken,
          },
          withCredentials: true
        }
      );
  
      // 4. Gestion du succès
      if (response.status === 200) {
        console.log("Authentification réussie. Réponse serveur:", response.data);
  
        // Stocker les tokens
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
  
        // Dispatch login success
        dispatch({
          type: CONST_LOGIN_SUCCESS,
          payload: {
            access: response.data.access,
            refresh: response.data.refresh
          }
        });
  
        // Charger les données utilisateur
        await dispatch(load_user());
  
        // Gérer l'intervalle de rafraîchissement
        if (rememberMe) {
          dispatch(setUpRefreshInterval());
        } else {
          dispatch(logout());
        }
  
        // Rediriger et afficher le succès
        navigate('/dashboard', { replace: true });
        dispatch(showSnackbar('success', t('Login successful!')));
      }
  
    } catch (error) {
      console.error('Google auth failed:', error);
  
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        const errorMessage = error.response.data?.error || 
                            error.response.data?.detail || 
                            'Google login failed. Try again.';
        
        dispatch(showSnackbar('error', t(errorMessage)));
      } else if (error.request) {
        console.error('Error request:', error.request);
        dispatch(showSnackbar('error', t('No response received from server')));
      } else {
        console.error('Error message:', error.message);
        dispatch(showSnackbar('error', t('Error setting up request')));
      }
  
      dispatch({ type: CONST_LOGIN_FAIL });
    } finally {
      setGoogleLoading(false);
    }
  };
  

  const onSubmit = (e) => {
    e.preventDefault();
    setLoadingbtn(true);

    dispatch(login(email, password, rememberMe))
      .then((res) => {
        if (res.status === 200) {
          dispatch(load_user()).then(() => {
            navigate('/dashboard');
            rememberMe ? dispatch(setUpRefreshInterval()) : dispatch(logout());
          });
        } else if (res.response?.status === 401) {
          dispatch(showSnackbar('error', t('Please verify your credentials!')));
        } else {
          dispatch(showSnackbar('error', t('You are not authorized to log in')));
        }
      })
      .catch(() => {
        dispatch(showSnackbar('error', t('Something went wrong! Please try again later')));
      })
      .finally(() => setLoadingbtn(false));
  };


  return (
    <div className="login-page-container">
      <div className="login-content">
        <div className="left-block-login">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-sm-12 col-md-8 text-center slogon">
                {t("The solution for modern agricultural care")}
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-sm-12 col-md-6 text-center mb-4 mt-4">
                <img src={image} style={{ width: '100%' }} alt="crop" />
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-4 text-center">
                <MuiLink href="https://www.robocare.tn/" target="_blank">
                  <Button className="btn-learn-more">
                    {t("Learn More")}
                  </Button>
                </MuiLink>
              </div>
            </div>
          </div>
        </div>

        <div className="right-block-login">
          <div className="form-wrapper">
            <div className="logo-container">
              <img
                src={logo}
                alt="RoboCare Logo"
                className="login-logo"
              />
            </div>

            <div className="social-buttons">
              <Button className="social-btn">
                <img src={FacebookIcon} alt="Facebook" className="social-icon" />
              </Button>
              <Button 
  className="social-btn google-btn"
  onClick={handleGoogleSignIn}
  disabled={googleLoading}
  startIcon={googleLoading ? <CircularProgress size={20} /> : null}
>
  {googleLoading ? t('Signing in...') : t('Sign in with Google')}
</Button>
            </div>

            <div className="or-separator">
              <Divider flexItem className="divider" />
              <Typography variant="body2" className="or-text">
                or
              </Typography>
              <Divider flexItem className="divider" />
            </div>

            <FormControl component="form" onSubmit={onSubmit}>
              <TextField
                fullWidth
                label={t("Email")}
                variant="outlined"
                margin="normal"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label={t("Password")}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <div className="form-footer">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.value)}
                    />
                  }
                  label={t("Keep me signed in")}
                />
                <Button
                  component={Link}
                  to="/reset-password"
                  variant="text"
                  color="primary"
                  className="reset-pass-link"
                >
                  {t("Reset Password?")}
                </Button>
              </div>
              <LoadingButton
                fullWidth
                variant="contained"
                size="large"
                className="login-btn"
                loading={loadingbtn}
                type="submit"
                sx={{
                  backgroundColor: '#6f9d2f',
                  '&:hover': { backgroundColor: '#618a27' },
                }}
                startIcon={<LoginIcon />}
              >
                {t("Login")}
              </LoadingButton>
              <Button
                fullWidth
                variant="text"
                component={Link}
                to="/signup"
                className="signup-link"
              >
                {t("Start free trial")}
              </Button>
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;