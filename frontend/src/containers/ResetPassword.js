import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResetPasswordFail,
  check_exist_email,
  reset_password,
} from "../actions/auth";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Button } from "@mui/material";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import logo from "../assets/images/logo_login.png";
import Alert from "react-bootstrap/Alert";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import LoadingButton from "@mui/lab/LoadingButton";
import { showSnackbar } from "../actions/snackbar";
import LockResetIcon from "@mui/icons-material/LockReset";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

const ResetPassword = () => {
  const isResetPassword = useSelector((state) => state.auth.isResetPassword);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });
  const dispatch = useDispatch();
  const [loadingbtn, setloadingbtn] = useState(false);
  useEffect(() => {
  }, [loadingbtn]);
  const { email } = formData;
  const { t } = useTranslation();
  const btnSX = {
    backgroundColor: "#6f9d2f",
    paddingTop: "2px",
    paddingBottom: "2px",
    paddingRight: "30px",
    paddingLeft: "30px",
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
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    setloadingbtn(true);
    e.preventDefault();
    dispatch(check_exist_email(email)).then((res) => {
      if (res.data.exists) {
        dispatch(reset_password(email)).then((res) => {
          setloadingbtn(false);
        });
      } else {
        dispatch(
          showSnackbar(
            "error",
            undefined,
            t("email does not exist !"),
            "top",
            "right"
          )
        );
        setloadingbtn(false);
      }
      // setloadingbtn(false);
    });
  };

  useEffect(() => {
    document.body.classList.add("background-body");
    return () => {
      document.body.classList.remove("background-body");
      dispatch(ResetPasswordFail());
    };
  }, [dispatch]);

  return (
    <Container
      style={{
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <Row>
        <div className="d-flex justify-content-center col-12">
          <div className="col-md-4 text-center mb-3">
            <img src={logo} alt="logo" style={{ width: "100%" }} />
          </div>
        </div>
      </Row>
      {isResetPassword ? (
        <Row>
          <div className="col-md-12">
            <Alert variant="success">
              {t(
                "An email has been sent to your inbox with instructions to reset your password.Please check your email and follow the instructions to complete the process.If you don't receive an email from us within the next few minutes, please check your spam folder or contact our support team for assistance."
              )}
            </Alert>
          </div>
          <div className=" col-md-12 mt-2 signup-p d-flex justify-content-center">
            <Link to="/" className="btn btn-login btn btn-primary m-2">
              {t("Return Home")}
            </Link>
          </div>
        </Row>
      ) : (
        <Row>
          <div className="col-md-6 offset-md-3">
            <Card className="card-login">
              <div className="col-md-12 right-block-login">
                <Form onSubmit={(e) => onSubmit(e)} className="container mb-3">
                  <h5>{t("Forgot your password?")}</h5>
                  <p>
                    {t(
                      "Type in your email below and we'll send you instructions on how to reset it."
                    )}
                  </p>
                  <div className="form-group mb-3">
                    <input
                      className="form-control"
                      type="email"
                      placeholder="E-mail"
                      name="email"
                      value={email}
                      onChange={(e) => onChange(e)}
                      required
                    />
                  </div>
                  <div className="col-md-12 d-flex justify-content-around">
                    {/* <Button className="btn btn-login" type="submit">{t("Reset Password")}</Button> */}
                    <LoadingButton
                      sx={btnSX}
                      size="small"
                      type="submit"
                      loading={loadingbtn}
                      loadingPosition="start"
                      variant="contained"
                      startIcon={<LockResetIcon />}
                    >
                      <span>{t("Reset Password")}</span>
                    </LoadingButton>
                    <Button
                      sx={btnSX}
                      size="small"
                      onClick={() => navigate("/")}
                      loadingPosition="start"
                      variant="contained"
                      startIcon={<KeyboardReturnIcon />}
                    >
                      <span>{t("back to login")}</span>
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          </div>
        </Row>
      )}
    </Container>
  );
};
export default ResetPassword;
