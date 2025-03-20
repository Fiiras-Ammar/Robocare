import React, {useState} from "react";
import "./Quote.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import logo from "../../assets/images/logo_login.png";
import {Card, FormHelperText, InputAdornment, OutlinedInput} from "@mui/material";
import Form from "react-bootstrap/Form";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import FormControl from "@mui/material/FormControl";
import {TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import LoadingButton from "@mui/lab/LoadingButton";
import submitQuote from './SubmitQuote';
import {showSnackbar} from "../../actions/snackbar";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

const Quote = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
        hectares: "",
        isDemoAccount: false,
    });
    const {firstname, lastname, company, phone, email, hectares, isDemoAccount} = formData;

    const [loadingbtn, setLoadingbtn] = useState(false);

    const onChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const onPhoneChange = (phone) => setFormData({...formData, phone});

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoadingbtn(true);
        const result = await submitQuote(formData);
        setLoadingbtn(false);
        if (result.success) {
            dispatch(
                showSnackbar(
                    "success",
                    undefined,
                    t("Your quote demande was sent successfully."),
                    "top",
                    "right"
                )
            );
            navigate("/");
        }
        else {
            dispatch(
                showSnackbar(
                    "error",
                    undefined,
                    t("please verify your credentials !"),
                    "top",
                    "right"
                )
            );
        }
    };

    return (
        <Container className="auth-container">
            <Row>
                <div className="d-flex justify-content-center col-12">
                    <div className="col-md-4 text-center mb-3">
                        <img src={logo} alt="logo" style={{width: "100%"}}/>
                    </div>
                </div>
                <div className="justify-content-center col-12 card-login">
                    <Card className="col-sm-12 right-block-login">
                        <Form onSubmit={onSubmit} className="text-center mb-2 container">
                            <h1>{t("Ask for quote")}</h1>
                            <Row>
                                {!isDemoAccount && (
                                    <>
                                        <div className="col-md-6 mb-4">
                                            <FormControl fullWidth variant="outlined">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="text"
                                                    label={t("Firstname")}
                                                    name="firstname"
                                                    value={firstname}
                                                    onChange={onChange}
                                                    required
                                                    size="small"
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <FormControl fullWidth variant="outlined" className="contact-input">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="text"
                                                    label={t("Lastname")}
                                                    name="lastname"
                                                    value={lastname}
                                                    onChange={onChange}
                                                    required
                                                    size="small"
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <FormControl fullWidth variant="outlined" className="contact-input">
                                                <TextField
                                                    id="outlined-size-small"
                                                    type="text"
                                                    label={t("Company")}
                                                    name="company"
                                                    value={company}
                                                    onChange={onChange}
                                                    required
                                                    size="small"
                                                />
                                            </FormControl>
                                        </div>
                                    </>
                                )}
                                <div className="col-md-6 mb-4">
                                    <PhoneInput
                                        className="form-control"
                                        placeholder={t("Phone")}
                                        name="phone"
                                        value={phone}
                                        onChange={onPhoneChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <FormControl fullWidth variant="outlined" className="contact-input">
                                        <TextField
                                            id="outlined-size-small"
                                            type="email"
                                            label="E-mail"
                                            name="email"
                                            value={email}
                                            onChange={onChange}
                                            required
                                            size="small"
                                        />
                                    </FormControl>
                                </div>
                                <div className="col-md-6 mb-4">
                                    <FormControl fullWidth variant="outlined">
                                        <TextField
                                            id="outlined-size-small"
                                            type="number"
                                            label={t("Number of hectares")}
                                            name="hectares"
                                            value={hectares}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value >= 0) {
                                                    onChange(e); // If positive, proceed with the onChange event
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (
                                                    (e.key >= '0' && e.key <= '9') ||
                                                    e.key === 'Backspace' ||
                                                    e.key === 'Delete' ||
                                                    e.key === 'ArrowLeft' ||
                                                    e.key === 'ArrowRight' ||
                                                    e.key === '.' ||
                                                    e.key === 'Tab' ||
                                                    e.key === 'Enter' ||
                                                    e.key === 'Home' ||
                                                    e.key === 'End'
                                                ) {
                                                    return;
                                                }
                                                e.preventDefault();
                                            }}
                                            required
                                            size="small"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">ha</InputAdornment>,
                                                inputProps: {
                                                    step: "0.01",
                                                },
                                            }}
                                        />
                                    </FormControl>
                                </div>
                            </Row>
                            <Row className="justify-content-center">
                                <div className="col-sm-6">
                                    <LoadingButton
                                        sx={btnSX}
                                        size="small"
                                        type="submit"
                                        loading={loadingbtn}
                                        loadingPosition="start"
                                        variant="contained"
                                    >
                                        <span>{t("Send")}</span>
                                    </LoadingButton>
                                </div>
                            </Row>
                        </Form>
                    </Card>
                </div>
            </Row>
        </Container>
    );
};

export default Quote;
