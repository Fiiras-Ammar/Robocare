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
import '../assets/css/login.css';
import { auth } from './firebaseConfig';
import { CONST_LOGIN_SUCCESS, KEEP_ME_SIGN_IN_CHECKED, CONST_LOGIN_FAIL } from "../utils/types.js";
import axiosInstance from '../utils/axiosConfig';
import GoogleAuth from '../components/auth/GoogleAuth';
import FacebookAuth from '../components/auth/FacebookAuth';

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

  const onSubmit = (e) => {
    e.preventDefault();
    setLoadingbtn(true);

    dispatch(login(email, password, rememberMe))
      .then((res) => {
        if (res.data && res.data.access) {
          // Set axios default headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
          
          // Load user data and handle navigation
          dispatch(load_user()).then(() => {
            if (rememberMe) {
              dispatch(setUpRefreshInterval());
            }
            navigate('/dashboard', { replace: true });
            dispatch(showSnackbar('success', t('Login successful!')));
          });
        } else {
          dispatch(showSnackbar('error', t('Login failed. Please try again.')));
        }
      })
      .catch((error) => {
        dispatch(showSnackbar('error', t('Something went wrong! Please try again later')));
      })
      .finally(() => {
        setLoadingbtn(false);
      });
  };

  return (
    <div className="login-page-container">
      <div className="login-content">
        <div className="left-block-login">
          <h2 className="slogan">
            {t("Smart Agriculture for a Sustainable Future")}
          </h2>
          <img src={image} alt="Login" className="login-image" />
          <Button
            component={MuiLink}
            href="https://www.robocare.tn/"
            target="_blank"
            className="learn-more-btn"
          >
            {t("Learn More")}
          </Button>
        </div>
        <div className="right-block-login">
          <div className="form-wrapper">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="login-logo" />
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label={t("Remember me")}
              />
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
                {t("Don't have an account? Sign up")}
              </Button>

              <div className="social-auth-section">
                <div className="or-separator">
                  <div className="divider"></div>
                  <span className="or-text">{t('or')}</span>
                  <div className="divider"></div>
                </div>
                <div className="social-buttons-container">
                  <FacebookAuth handleFacebookSignIn={() => {}} />
                  <GoogleAuth rememberMe={rememberMe} />
                </div>
              </div>
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;