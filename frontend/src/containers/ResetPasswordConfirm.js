import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reset_password_confirm } from "../actions/auth";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import logo from "../assets/images/logo_login.png";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showSnackbar } from "../actions/snackbar";
import axiosInstance from "../utils/axiosConfig";
import LoadingButton from "@mui/lab/LoadingButton";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import LockResetIcon from "@mui/icons-material/LockReset";

const ResetPasswordConfirm = () => {
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loadingbtn, setLoadingbtn] = useState(false);
  const btnSX = {
    backgroundColor: "#6f9d2f",
    paddingTop: "2px",
    paddingBottom: "2px",
    paddingRight: "40px",
    paddingLeft: "40px",
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
    new_password: "",
    re_new_password: "",
  });
  let { uid } = useParams();
  let { token } = useParams();
  const { new_password, re_new_password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    setLoadingbtn(true);
    e.preventDefault();
    if (new_password === re_new_password) {
      dispatch(
        reset_password_confirm(uid, token, new_password, re_new_password)
      )
        .then(async (res) => {
          if (res.status === 204) {
            setLoadingbtn(false)
            setRequestSent(true)
            dispatch(
              showSnackbar(
                "success",
                t("Your password has been changed successfully."),
                "top",
                "right"
              )
            );
            return navigate("/?reset=true");
          } else {
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
          }
        })
        .catch((error) => {
          // Handle other types of errors (e.g., network errors)
          dispatch(
            showSnackbar(
              "error",
              undefined,
              "An error occurred. Please try again.",
              "top",
              "right"
            )
          );
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
    }
  };
  useEffect(() => {
    document.body.classList.add("background-body");
    return () => {
      document.body.classList.remove("background-body");
    };
  }, []);

  return (
    <Container
    style={{
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
      alignContent: "center",
    }}
  >
    <Row className="justify-content-center">
      <div className="col-md-4 text-center mb-3">
        <img src={logo} alt="logo" style={{ width: "100%" }} />
      </div>
    </Row>
    <Row>
      <div className="col-md-6 offset-md-3">
        <Card className="card-login">
          <Form onSubmit={(e) => onSubmit(e)} className="mb-3">
            <CardContent>
              <h5>{t("Reset Password")}</h5>
              <div className="form-group mb-3">
                <input
                  className="form-control"
                  type="password"
                  placeholder={t("New password")}
                  name="new_password"
                  value={new_password}
                  onChange={(e) => onChange(e)}
                  minLength="6"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  className="form-control"
                  type="password"
                  placeholder={t("Confirm new password")}
                  name="re_new_password"
                  value={re_new_password}
                  onChange={(e) => onChange(e)}
                  minLength="6"
                  required
                />
              </div>
              <div className="col-md-12">
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
              </div>
            </CardContent>
          </Form>
        </Card>
      </div>
    </Row>
  </Container>
  );
};
export default ResetPasswordConfirm;
