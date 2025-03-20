import React, { useState } from "react";
import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import OwlCarousel from "react-owl-carousel";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  change_accusation_dates,
  change_selected_date,
  get_dates,
} from "../../../actions/task";
import { useTranslation } from "react-i18next";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const DatesCarousel = () => {
  const [accusationDates, setaccusationDates] = useState(null);
  const [selectedIndex, setselectedIndex] = useState(0);

  const [selectedDate, setselectedDate] = useState(null);

  const dates = useSelector((state) => state.mapReducer.AccusationDates);
  const selected_date_state = useSelector(
    (state) => state.mapReducer.SelectedDate
  );
  const taskIdDetailsEdit = useSelector(
    (state) => state.mapReducer.taskIdDetails
  );

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const options = {
    0: {
      items: 2,
    },
    330: {
      items: 3,
    },
    417: {
      items: 4,
    },
    600: {
      items: 4,
    },
    700: {
      items: 4,
    },
    1000: {
      items: 4,
    },
    1200: {
      items: 4,
    },
  };
  useEffect(() => {
    if (!taskIdDetailsEdit) return;
    dispatch(get_dates(taskIdDetailsEdit)).then((res_date) => {
      dispatch(change_accusation_dates(res_date.data.data["dates"]));
    });
  }, [taskIdDetailsEdit]);
  useEffect(() => {
    if (!selected_date_state) return;
    setselectedDate(selected_date_state);
  }, [selected_date_state]);
  useEffect(() => {
    setaccusationDates(dates);
  }, [dates]);

  const changeSelectedDate = (date, provider, index) => {
    setselectedIndex(index);
    dispatch(change_selected_date(date, provider));
  };
  return (
    <Row className="pt-2 pb-2">
      <Col xs={12} className="d-flex align-items-center justify-content-center">
        {accusationDates && selectedDate ? (
          <OwlCarousel
            className="owl-theme"
            loop
            margin={10}
            nav
            items={3}
            mouseDrag={true}
            dots={false}
            responsive={options}
            startPosition={selectedIndex}
            rewind={false}
          >
            {accusationDates.map((item, index) => (
              <div
                className={
                  selectedDate.date === item.date
                    ? "item owl-item-container active"
                    : "item owl-item-container"
                }
                key={index}
                onClick={() =>
                  changeSelectedDate(item.date, item.provider, index)
                }
              >
                <div className="item-inner-content">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${item.image}`}
                    alt={item.date}
                    className="owl-item-img"
                  />
                  <div className="owl-item-date">
                    {item.date} {item.provider}
                  </div>
                  {/* <div className="owl-item-date">{item.provider}</div> */}
                </div>
              </div>
            ))}
          </OwlCarousel>
        ) : (
          <div className="row">
            <div className="col-12 text-center justify-content-center d-flex">
              <div className="loading-div"></div>
            </div>
            <div className="col-12 text-center">
              <span style={{ fontSize: "15px", fontWeight: "600" }}>
                {t("Loading ...")}
              </span>
            </div>
          </div>
        )}
      </Col>
    </Row>
  );
};
export default DatesCarousel;
