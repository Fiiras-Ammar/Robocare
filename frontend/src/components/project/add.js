import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Row from "react-bootstrap/esm/Row";
import { TextField } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProject } from "../../actions/project";
import { LOADING_BEGIN, LOADING_END } from "../../utils/types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getType } from "../../actions/project";
import { showSnackbar } from "../../actions/snackbar";
import { useTranslation } from "react-i18next";

const AddProject = ({ open, handleClose }) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    bgcolor: "background.paper",
    borderRadius: "5px",
    boxShadow: 24,
    p: 4,
  };
  const [formData, setFormData] = useState({
    name: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const { name } = formData;
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    dispatch({
      type: LOADING_BEGIN,
      payload: 1,
    });
    e.preventDefault();
    dispatch(addProject(user.id, name))
      .then((res) => {
        if (res.status === 200) {
          dispatch(
            showSnackbar("success", undefined, res.data.message, "top", "right")
          );
          handleClose();
          if (window.location.pathname === "/dashboard/projects/list") {
            window.location.reload();
          } else {
            setTimeout(() => {
              navigate("/dashboard/projects/list");
            }, 500);
          }
        } else {
        }
      })
      .catch((error) => {});
    dispatch({
      type: LOADING_END,
    });
  };
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style} className="custom-modal">
            <Typography
              id="transition-modal-title"
              variant="h5"
              component="h2"
              className="text-center"
            >
              {t("Create Farm")}
            </Typography>
            <Form onSubmit={(e) => onSubmit(e)}>
              <Row className="mt-3 mb-3">
                <div className="col-md-12 d-flex justify-content-center">
                  <FormControl sx={{ m: 1, minWidth: "100%" }} size="small">
                    <TextField
                      fullWidth
                      id="outlined-name-input"
                      label={t("Farm name")}
                      type="text"
                      name="name"
                      size="small"
                      value={name}
                      onChange={(e) => onChange(e)}
                      required
                    />
                  </FormControl>
                </div>
              </Row>
              <Row className="mt-3">
                <div className="col-md-12 text-center">
                  <Button variant="contained" type="submit">
                    {t("Save")}
                  </Button>
                </div>
              </Row>
            </Form>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default AddProject;
