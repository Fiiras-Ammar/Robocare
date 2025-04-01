import React, { useEffect, useState } from "react";
import "../assets/css/login.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import logo from "../assets/images/logo_login.png";
import image from "../assets/images/crop.b3a902767e85f1b371c1.png";
import { Card } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { signup } from "../actions/auth";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { connect, useDispatch, useSelector } from "react-redux";
import SnackbarAlert from "../utils/SnackBarAlert";
import Alert from "react-bootstrap/Alert";
import { loadingBegin, loadingEnd } from "../actions/map";
import Loading from "../utils/loading";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import { TextField } from "@mui/material";
import { showSnackbar } from "../actions/snackbar";
import { useTranslation } from "react-i18next";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme, useMediaQuery } from '@mui/material';
import GoogleAuth from '../components/auth/GoogleAuth';
import FacebookAuth from '../components/auth/FacebookAuth';

const Signup = () => {
  const [value, setValue] = useState(null);
  const [accountCreated, setaccountCreated] = useState(false);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowRePassword = () => setShowRePassword((show) => !show);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleMouseDownٌRePassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    dispatch(loadingBegin(1));
  }, []);
  useEffect(() => {
    setTimeout(() => dispatch(loadingEnd(0)), 1000);
  }, []);

  const btnSX = {
    backgroundColor: "#6f9d2f",
    paddingTop: "2px",
    paddingBottom: "2px",
    paddingRight: "60px",
    paddingLeft: "60px",
    borderRadius: "5px",
    "&:hover": {
      backgroundColor: "#618a27",
    },
    "& span": {
      textTransform: "capitalize",
      fontSize: "16px",
    },
    "& span.MuiLoadingButton-loadingIndicator": {
      left: "30px",
    },
  };
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    company: "",
    phone: "",
    email: "",
    password: "",
    re_password: "",
  });
  const { firstname, lastname, company, phone, email, password, re_password } =
    formData;

  const navigate = useNavigate();
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onPhoneChange = (phone) => setFormData({ ...formData, phone });
  const [loadingbtn, setLoadingbtn] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const onSubmit = (e) => {
    setLoadingbtn(true);
    e.preventDefault();
    if (password === re_password) {
      const phoneValue = phone || "";

      dispatch(signup(
        firstname,
        lastname,
        company,
        phoneValue,
        email,
        password,
        re_password
      ))
        .then((res) => {
          if (res.status != 201) {
            let messages = [];

            for (var key in res.response.data) {
              if (res.response.data.hasOwnProperty(key)) {
                messages.push(res.response.data[key].join(" "));
              }
            }
            dispatch(
              showSnackbar(
                "error",
                undefined,
                messages.join(" "),
                "top",
                "right"
              )
            );
            setLoadingbtn(false);
          } else {
            setLoadingbtn(false);
            setaccountCreated(true);
          }
        })
        .catch((error) => {
          dispatch(
            showSnackbar(
              "error",
              undefined,
              t("something went wrong !"),
              "top",
              "right"
            )
          );
          setLoadingbtn(false);
        });
    } else {
      dispatch(
        showSnackbar(
          "error",
          undefined,
          t("Error ! password and re-password does not match, please check"),
          "top",
          "right"
        )
      );
      setLoadingbtn(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("background-body");
    if (isAuthenticated) {
      return navigate("/dashboard");
    }

    return () => {
      document.body.classList.remove("background-body");
    };
  });

  return (
    <div className="login-page-container">
      <div className="login-content">
        <div className="left-block-login">
          <h2 className="slogan">
            {t("Join the Future of Smart Agriculture")}
          </h2>
          <img src={image} alt="Signup" className="login-image" />
          <Button
            component="a"
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
              <img src={logo} alt="logo" className="login-logo" />
            </div>
            {accountCreated ? (
              <>
                <Alert variant="success">
                  {t(
                    "An email has been sent to your inbox with instructions to confirm your account.Please check your email and follow the instructions to complete the process.If you don't receive an email from us within the next few minutes, please check your spam folder or quote our support team for assistance."
                  )}
                </Alert>
                <div className="mt-4 text-center">
                  <Link to="/" className="btn btn-login btn-primary">
                    {t("Return Home")}
                  </Link>
                </div>
              </>
            ) : (
              <Form onSubmit={(e) => onSubmit(e)} className="text-center">
                <h3>{t("Fill out this form to start your free trial!")}</h3>
                <Row>
                  <div className="col-md-6 mb-4">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="sign-up-input"
                    >
                      <TextField
                        id="outlined-size-small"
                        type="text"
                        label={t("Firstname")}
                        name="firstname"
                        value={firstname}
                        onChange={(e) => onChange(e)}
                        required
                        size="small"
                      />
                    </FormControl>
                  </div>
                  <div className="col-md-6 mb-4">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="sign-up-input"
                    >
                      <TextField
                        id="outlined-size-small"
                        type="text"
                        label={t("Lastname")}
                        name="lastname"
                        value={lastname}
                        onChange={(e) => onChange(e)}
                        required
                        size="small"
                      />
                    </FormControl>
                  </div>
                </Row>
                <Row>
                  <div className="col-md-6 mb-4">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="sign-up-input"
                    >
                      <TextField
                        id="outlined-size-small"
                        type="text"
                        label={t("Company")}
                        name="company"
                        value={company}
                        onChange={(e) => onChange(e)}
                        required
                        size="small"
                      />
                    </FormControl>
                  </div>
                  <div className="col-md-6 mb-4">
                    <PhoneInput
                      className="form-control"
                      placeholder={t("Phone")}
                      name="phone"
                      value={value}
                      onChange={onPhoneChange}
                    />
                  </div>
                </Row>
                <Row>
                  <div className="col-md-12 mb-4">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="sign-up-input"
                    >
                      <TextField
                        id="outlined-size-small"
                        type="email"
                        label="E-mail"
                        name="email"
                        value={email}
                        onChange={(e) => onChange(e)}
                        required
                        size="small"
                      />
                    </FormControl>
                  </div>
                </Row>
                <Row>
                  <div className="col-md-6 mb-4">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="sign-up-input"
                    >
                      <InputLabel htmlFor="outlined-adornment-password">
                        {t("Password")} *
                      </InputLabel>
                      <OutlinedInput
                        size="small"
                        id="outlined-adornment-password"
                        type={showPassword ? "text" : "password"}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password *"
                        name="password"
                        value={password}
                        onChange={(e) => onChange(e)}
                        minLength="6"
                        required
                      />
                    </FormControl>
                  </div>
                  <div className="col-md-6 mb-4">
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className="sign-up-input"
                    >
                      <InputLabel htmlFor="outlined-adornment-password">
                        {t("Confirm Password")} *
                      </InputLabel>
                      <OutlinedInput
                        size="small"
                        id="outlined-adornment-password"
                        type={showRePassword ? "text" : "password"}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowRePassword}
                              onMouseDown={handleMouseDownٌRePassword}
                              edge="end"
                            >
                              {showRePassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Confirm Password *"
                        name="re_password"
                        value={re_password}
                        onChange={(e) => onChange(e)}
                        minLength="6"
                        required
                      />
                    </FormControl>
                  </div>
                </Row>
                <Row className="justify-content-center">
                  <div className="col-12">
                    <LoadingButton
                      sx={{
                        ...btnSX,
                        width: '100%',
                        paddingRight: '0',
                        paddingLeft: '0',
                      }}
                      size="small"
                      type="submit"
                      loading={loadingbtn}
                      loadingPosition="start"
                      variant="contained"
                    >
                      <span>{t("Start free trial")}</span>
                    </LoadingButton>
                  </div>
                </Row>

                <div className="social-auth-section">
                  <div className="or-separator">
                    <div className="divider"></div>
                    <span className="or-text">{t('or')}</span>
                    <div className="divider"></div>
                  </div>
                  <div className="social-buttons-container">
                    <FacebookAuth handleFacebookSignIn={() => {}} />
                    <GoogleAuth handleGoogleSignIn={() => {}} />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="signup-p">
                    {t("Already registered?")}{" "}
                    <Link to="/" className="signin-link">
                      {t("Sign in here")}
                    </Link>
                  </p>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
