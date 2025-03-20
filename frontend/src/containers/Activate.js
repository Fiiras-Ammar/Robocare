import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verify } from "../actions/auth";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
// import Card from "react-bootstrap/Card";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Row from "react-bootstrap/Row";
import { useParams } from "react-router-dom";
import logo from "../assets/images/logo_login.png";
import Typography from "@mui/material/Typography";
import { showSnackbar } from "../actions/snackbar";
import { useTranslation } from "react-i18next";


//const Activate = ({ verify, isAuthenticated }) => {
const Activate = () => {
  const dispatch = useDispatch();
  const [verified, setverified] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  let { uid } = useParams();
  let { token } = useParams();
  /*const verify_account = e => {
        verify(uid, token);
        setverified(true)
    }*/
  const verify_account = () => {
    dispatch(verify(uid, token))
      .then((res) => {

        window.location.href = "https://app.satellite.robocare.tn/";

        if (res && res.status === 204) {
          setverified(true);
        } else {
          dispatch(
            showSnackbar(
              "error",
              undefined,
              t(res.response.data.detail),
              "top",
              "right"
            )
          );
        }
      })
      .catch((err) => {
      });
  };
  useEffect(() => {
    document.body.classList.add("background-body");
    if (verified) {
      return navigate("/?activate=true");
    }
    return () => {
      document.body.classList.remove("background-body");
    };
  });
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
        <div className="col-md-4 offset-md-4 text-center justify-content-center mb-3">
          <img src={logo} alt="logo" style={{ width: "85%" }} />
        </div>
      </Row>
      <Row>
        <div className="col-md-10 offset-md-1 p-3">
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {"Account Confirmation Page"}
              </Typography>
              <Typography variant="body2">
                To confirm your account, simply click on the "Confirm Account"
                button below. This will verify your email address and confirm
                your registration with our service.
              </Typography>
            </CardContent>
            <CardActions>
              <Button className="btn btn-login" onClick={verify_account}>
                Confirm Account
              </Button>
            </CardActions>
          </Card>
        </div>
      </Row>
    </Container>
  );
};

export default Activate;
