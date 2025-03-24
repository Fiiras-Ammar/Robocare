import axiosInstance from "../utils/axiosConfig.js";

import {

  HISTOGRAM_INITIAL_SUCCESS,
  HISTOGRAM_INITIAL_FAIL,
  SET_HISTOGRAM_INTERVAL_SUCCESS,
  SET_HISTOGRAM_PRODUCTIVITY_SUCCESS,
  SET_HISTOGRAM_PRODUCTIVITY_FAIL,
  SET_HISTOGRAM_INTERVAL,


  HISTOGRAM_SUCCESS_RIGHT,
  HISTOGRAM_FAIL_RIGHT,
  HISTOGRAM_SUCCESS_LEFT,
  HISTOGRAM_FAIL_LEFT,

  HISTOGRAM_SUCCESS_SPATIAL_RIGHT,
  HISTOGRAM_FAIL_SPATIAL_RIGHT,
  HISTOGRAM_SUCCESS_SPATIAL_LEFT,
  HISTOGRAM_FAIL_SPATIAL_LEFT,
} from "../utils/types.js";
/*export const getHistogram =
    (id, date, provider = "S2", index = "NDVI") =>
        async (dispatch, getState) => {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ id, date, provider, index });
            try {
                const res = await axiosInstance.post(
                    `${process.env.REACT_APP_API_URL}/api/task/get/index/`,
                    body,
                    config
                );

                const activeTab = getState().histogramReducer.activeTab;

                const modifiedData = JSON.parse(JSON.stringify(res.data.data));

                if (activeTab === 2) {
                    modifiedData.index.min = 0.1;
                    modifiedData.index.max = 0.3;
                }

                dispatch({
                    type: HISTOGRAM_INITIAL_SUCCESS,
                    payload: modifiedData,
                });
                return res;
            } catch (err) {
                dispatch({
                    type: HISTOGRAM_INITIAL_FAIL,
                });
                return err;
            }
        };
  export const getHistogramProductivity =
  (id, date, provider = "S2", index = "NDVI",zoneNbr) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id, date, provider, index,zoneNbr });
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/histogram/productivity/get/`,
        body,
        config
      );
      dispatch({
        type: SET_HISTOGRAM_PRODUCTIVITY_SUCCESS,
        payload: res.data.data,
      });
      return res;
    } catch (err) {
      dispatch({
        type: SET_HISTOGRAM_PRODUCTIVITY_FAIL,
      });
      return err;
    }
  };*/

export const getHistogram =
  (id, date, provider = "S2", index = "NDVI") =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id, date, provider, index });
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/get/index/`,
        body,
        config
      );

      dispatch({
        type: HISTOGRAM_INITIAL_SUCCESS,
        payload: res.data.data,
      });
      return res;
    } catch (err) {
      dispatch({
        type: HISTOGRAM_INITIAL_FAIL,
      });
      return err;
    }
  };

  export const getHistogramProductivity =
  (id, date, provider = "S2", index = "NDVI",zoneNbr) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id, date, provider, index,zoneNbr });
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/histogram/productivity/get/`,
        body,
        config
      );
      dispatch({
        type: SET_HISTOGRAM_PRODUCTIVITY_SUCCESS,
        payload: res.data.data,
      });
      return res;
    } catch (err) {
      dispatch({
        type: SET_HISTOGRAM_PRODUCTIVITY_FAIL,
      });
      return err;
    }
  };
export const getHistogramStatic =
  (index = "NDVI", density) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ index, density });
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/histogram/static/get/`,
        body,
        config
      );
      if (res.status === 200) {
        const interval = [
          parseFloat(res.data.data.min),
          parseFloat(res.data.data.max),
        ];
        dispatch({
          type: SET_HISTOGRAM_INTERVAL_SUCCESS,
          payload: interval,
        });
        return res;
      } else {
        // min =
      }
    } catch (err) {
      return err;
    }
  };

export const getHistogramRight =
    (id, date_left,date_right, provider = "S2", index = "NDVI") =>
        async (dispatch) => {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ id, date_left,date_right, provider, index });
            try {
                const res = await axiosInstance.post(
                    `${process.env.REACT_APP_API_URL}/api/task/get/index/comparaison/meme-task/right/`,
                    body,
                    config
                );
                dispatch({
                    type: HISTOGRAM_SUCCESS_RIGHT,
                    payload: res.data.data,
                });
                return res;
            } catch (err) {
                dispatch({
                    type: HISTOGRAM_FAIL_RIGHT,
                });
                return err;
            }
        };

export const getHistogramLeft =
    (id, date_left,date_right, provider = "S2", index = "NDVI") =>
        async (dispatch) => {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ id, date_left,date_right, provider, index });
            try {
                const res = await axiosInstance.post(
                    `${process.env.REACT_APP_API_URL}/api/task/get/index/comparaison/meme-task/left/`,
                    body,
                    config
                );
                dispatch({
                    type: HISTOGRAM_SUCCESS_LEFT,
                    payload: res.data.data,
                });
                return res;
            } catch (err) {
                dispatch({
                    type: HISTOGRAM_FAIL_LEFT,
                });
                return err;
            }
        };

export const getBornReferenceTask =
    (index = "NDVI", id_task,date) =>
        async (dispatch) => {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ index, id_task,date });
            try {
                const res = await axiosInstance.post(
                    `${process.env.REACT_APP_API_URL}/api/task/graph_data/comparision/borns/`,
                    body,
                    config
                );
                if (res.status === 200) {
                    const interval = [
                        parseFloat(res.data.data.min_month),
                        parseFloat(res.data.data.max_month),
                    ];
                    dispatch({
                        type: SET_HISTOGRAM_INTERVAL_SUCCESS,
                        payload: interval,
                    });
                    return res;
                } else {
                    // min =
                }
            } catch (err) {
                return err;
            }
        };

export const getHistogramSpatialRight =
    (id, date, provider = "S2", index = "NDVI") =>
        async (dispatch) => {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ id, date, provider, index });
            try {
                const res = await axiosInstance.post(
                    `${process.env.REACT_APP_API_URL}/api/task/get/index/`,
                    body,
                    config
                );

                dispatch({
                    type: HISTOGRAM_SUCCESS_SPATIAL_RIGHT,
                    payload: res.data.data.index,
                });
                return res;
            } catch (err) {
                dispatch({
                    type: HISTOGRAM_FAIL_SPATIAL_RIGHT,
                });
                return err;
            }
        };

export const getHistogramSpatialLeft =
    (id, date, provider = "S2", index = "NDVI") =>
        async (dispatch) => {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const body = JSON.stringify({ id, date, provider, index });
            try {
                const res = await axiosInstance.post(
                    `${process.env.REACT_APP_API_URL}/api/task/get/index/`,
                    body,
                    config
                );
                dispatch({
                    type: HISTOGRAM_SUCCESS_SPATIAL_LEFT,
                    payload: res.data.data.index,
                });
                return res;
            } catch (err) {
                dispatch({
                    type: HISTOGRAM_FAIL_SPATIAL_LEFT,
                });
                return err;
            }
        };
