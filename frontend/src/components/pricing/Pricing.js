import React from "react";
import {Container, Row} from "reactstrap";
import CardPricing from "./CardPricing";
import Grid from "@mui/material/Grid";

const Pricing = () => {
    const pricings = [
        {
            id: 1,
            title: "Demo account",
            description: "Experience our platform with a complimentary month-long demo.",
            icon: "bx-walk",
            duration:  "For a month" ,
            link: "/signup",
            features: [
                {title: "Free Live Support"},
                {title: "Unlimited User"},
                {title: "No Time Tracking"},
                {title: "Free Setup"},
            ],
        },
        {
            id: 2,
            title: "Premium account",
            description: "Unlock professional features and capabilities with our premium account.",
            icon: "bx-run",
            duration:  "Ask for premium account",
            link: "/quote",
            features: [
                {title: "Free Live Support"},
                {title: "Unlimited User"},
                {title: "No Time Tracking"},
                {title: "Free Setup"},
            ],
        },
    ];

    return (
        <React.Fragment>
            <Grid className="page-content d-flex align-items-center " sx={{height:"100vh"}}>
                <title>Pricing | Skote - React Admin & Dashboard Template</title>
                <Container fluid>
                    <Row className="justify-content-center">
                        {pricings.map((pricing, key) => (
                            <CardPricing pricing={pricing} key={"_pricing_" + key} />
                        ))}
                    </Row>
                </Container>
            </Grid>
        </React.Fragment>
    );
};
export default Pricing;


