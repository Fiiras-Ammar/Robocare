import { Container } from "@mui/material";
import "../../src/assets/scss/profile.scss";
import { FormControl, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import {
  getCurrentUser,
  updateCurrentUserInformations,
  updateCurrentUserPassword,
} from "../actions/profile";
import { IoIosSave, IoIosSwitch } from "react-icons/io";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showSnackbar } from "../actions/snackbar";
import PhoneInput from "react-phone-number-input";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isInfosEditable, setIsInfosEditable] = useState(false);
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);
  const [isCurrentPasswordIncorrect, setIsCurrentPasswordIncorrect] =
    useState(false);
  const [isPasswordsNotMatch, setIsPasswordsNotMatch] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    company: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    new_password: "",
    re_new_password: "",
    current_password: "",
  });

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onPasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  const onPhoneChange = (phone) => setFormData({ ...formData, phone }); // Update the phone value separately

  const reverseInfosEditable = (e) => {
    setIsInfosEditable(!isInfosEditable);
  };

  const reversePasswordEditable = (e) => {
    setIsPasswordEditable(!isPasswordEditable);
  };

  const updateUserInformations = (e) => {
    dispatch(updateCurrentUserInformations(formData)).then((response) => {
      if (response.status === 200) {
        dispatch(
          showSnackbar(
            "success",
            undefined,
            t("Informations changed successfully"),
            "top",
            "right"
          )
        );
        setFormData(response.data);
      } else {
        dispatch(
          showSnackbar(
            "error",
            undefined,
            t(
              "An error occured when trying to update your informations, please try agian later"
            ),
            "top",
            "right"
          )
        );
      }
    });
  };

  const updateUserPassword = (e) => {
    if (passwordData.new_password !== passwordData.re_new_password) {
      setIsPasswordsNotMatch(true);
    } else {
      setIsPasswordsNotMatch(false);
      dispatch(updateCurrentUserPassword(passwordData))
        .then((response) => {
          if (response.status === 204) {
            localStorage.removeItem("access");

            dispatch(
              showSnackbar(
                "success",
                undefined,
                t("Password changed please signin with your new password"),
                "top",
                "right"
              )
            );
            navigate("/");
          } else {
            if (response.response.data.current_password) {
              setIsCurrentPasswordIncorrect(true);
            }
          }
        })
        .catch((error) => {
          dispatch(
            showSnackbar(
              "error",
              undefined,
              t(
                "An error occured when trying to update your password, please try agian later"
              ),
              "top",
              "right"
            )
          );
          console.error(error);
        });
    }
  };

  useEffect(() => {
    dispatch(getCurrentUser()).then((response) => {
      if (response.status === 200) {
        setFormData(response.data);
      }
    });
  }, []);

  return (
    <Grid container spacing={2} sx={{ p: 2, flex: 1 }}>
      <Grid item xs={12}>
        <div className="mod-profile">
          <div className="m-wrapper">
            <div className="m-headline">
              <h2>{t("Profile Settings")}</h2>
            </div>

            <div className="m-content row">
              <div className="col-12 col-md-6 pt-4">
                <FormControl fullWidth variant="outlined">
                  <TextField
                    id="outlined-first-name"
                    type="text"
                    label={t("First Name")}
                    name="first_name"
                    value={formData.firstname}
                    onChange={(e) => onChange(e)}
                    required
                    size="small"
                    color="IconColor"
                    disabled={!isInfosEditable}
                  />
                </FormControl>
              </div>
              <div className="col-12 col-md-6 pt-4">
                <FormControl fullWidth variant="outlined">
                  <TextField
                    id="outlined-last-name"
                    type="text"
                    label={t("Last Name")}
                    name="last_name"
                    value={formData.lastname}
                    onChange={(e) => onChange(e)}
                    required
                    size="small"
                    color="IconColor"
                    disabled={!isInfosEditable}
                  />
                </FormControl>
              </div>
              <div className="col-12 col-md-6 pt-4">
                <FormControl fullWidth variant="outlined">
                  <PhoneInput
                    className="form-control"
                    placeholder={t("Phone")}
                    name="phone"
                    value={formData.phone ?? ""}
                    onChange={onPhoneChange}
                    size="small"
                    color="IconColor"
                    disabled={!isInfosEditable}
                  />
                </FormControl>
              </div>
              <div className="col-12 col-md-6 pt-4">
                <FormControl fullWidth variant="outlined">
                  <TextField
                    id="outlined-company"
                    type="text"
                    label={t("Company")}
                    name="company"
                    value={formData.company ?? ""}
                    onChange={(e) => onChange(e)}
                    color="IconColor"
                    size="small"
                    disabled={!isInfosEditable}
                  />
                </FormControl>
              </div>
            </div>

            <div className="m-buttons pt-3 d-flex justify-content-center">
              {isInfosEditable ? (
                <div className="m-button">
                  <CustomButton
                    className="col-sm-12 col-lg-auto w-auto"
                    color="IconColor"
                    size="medium"
                    startIcon={<IoIosSave />}
                    onClick={updateUserInformations}
                  >
                    {t("Save Changes")}
                  </CustomButton>
                </div>
              ) : (
                <div className="m-button">
                  <CustomButton
                    className="col-sm-12 col-lg-auto w-auto"
                    color="IconColor"
                    size="medium"
                    startIcon={<IoIosSwitch />}
                    onClick={reverseInfosEditable}
                  >
                    {t("Edit Informations")}
                  </CustomButton>
                </div>
              )}

              {isPasswordEditable ? (
                <div className="m-passwords">
                  <div className="row">
                    <div className="col-12 col-md-6 pt-4">
                      <FormControl fullWidth variant="outlined">
                        <TextField
                          id="outlined-current-password"
                          type="password"
                          label={t("Current Password")}
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={(e) => onPasswordChange(e)}
                          size="small"
                          color="IconColor"
                          error={isCurrentPasswordIncorrect}
                          helperText={
                            isCurrentPasswordIncorrect
                              ? t("Invalid password.")
                              : ""
                          }
                        />
                      </FormControl>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 col-md-6 pt-4">
                      <FormControl fullWidth variant="outlined">
                        <TextField
                          id="outlined-new-password"
                          type="password"
                          label={t("New Password")}
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={(e) => onPasswordChange(e)}
                          size="small"
                          color="IconColor"
                          error={isPasswordsNotMatch}
                          helperText={
                            isPasswordsNotMatch
                              ? t("Passwords do not match")
                              : ""
                          }
                        />
                      </FormControl>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 col-md-6 pt-4">
                      <FormControl fullWidth variant="outlined">
                        <TextField
                          id="outlined-re-new-password"
                          type="password"
                          label={t("Renew Password")}
                          name="re_new_password"
                          value={passwordData.re_new_password}
                          onChange={(e) => onPasswordChange(e)}
                          size="small"
                          color="IconColor"
                          error={isPasswordsNotMatch}
                          helperText={
                            isPasswordsNotMatch
                              ? t("Passwords do not match")
                              : ""
                          }
                        />
                      </FormControl>
                    </div>
                  </div>
                  <div className="row pt-5 justify-content-center">
                    <CustomButton
                      className="col-sm-12 col-lg-auto w-auto"
                      color="IconColor"
                      size="medium"
                      startIcon={<IoIosSave />}
                      onClick={updateUserPassword}
                    >
                      {t("Save Password Changes")}
                    </CustomButton>
                  </div>
                </div>
              ) : (
                <div className="m-button">
                  <CustomButton
                    className="col-sm-12 col-lg-auto w-auto"
                    color="IconColor"
                    size="medium"
                    startIcon={<IoIosSwitch />}
                    onClick={reversePasswordEditable}
                  >
                    {t("Edit Password")}
                  </CustomButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default Profile;
