import axios from "axios";

import {
  DETAIL_TASK_FAIL,
  GRAPH_DATA_ARRAY_FAIL,
  GRAPH_DATA_ARRAY_SUCCESS,
  GRAPH_START_END_DATE_END_FAIL,
  GRAPH_START_END_DATE_SUCCESS,
} from "../utils/types.js";

export const getStartEndDate = () => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/index/graph/dates/`,
      config
    );
    dispatch({
      type: GRAPH_START_END_DATE_SUCCESS,
      payload: res.data.data,
    });
    return res;
  } catch (err) {
    dispatch({
      type: GRAPH_START_END_DATE_END_FAIL,
    });
    return err;
  }
};

export const getIndexArray = (task_id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/task/graph_data/get/${task_id}/`,
      config
    );
    if (res.status === 200) {
      dispatch({
        type: GRAPH_DATA_ARRAY_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: GRAPH_DATA_ARRAY_FAIL,
      });
    }
    return res;
  } catch (err) {
    dispatch({
      type: GRAPH_DATA_ARRAY_FAIL,
    });
    return err;
  }
};

export const getForecastPredict = (task_id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/task/graph_data/forecast/predict/get/${task_id}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const getIndexForecast = (task_id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/task/graph_data/indexforecast/get/${task_id}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};



export const addForecastParams =
  (task, bestYear, BadYears) => async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ task, bestYear, BadYears });

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/task/forecast/params/add/`,
        body,
        config
      );
      return res;
    } catch (err) {
      return err;
    }
  };

export const getForecastParams = (task) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/task/forecast/params/get/${task}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const ForecastTrain = (task) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/task/graph_data/forecast/train/${task}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const ForecastPredict = (taskid) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/task/graph_data/forecast/predict/${taskid}/`,

      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const getPattern = (taskid) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/task/graph_data/pattern/get/${taskid}/`,
        config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const getSelfPattern = (taskid) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/task/self/graph_data/pattern/get/${taskid}/`,
        config
    );
    return res;
  } catch (err) {
    return err;
  }
};
export const get_date_self_pattern = (id) => async dispatch => {

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/self/pattern/get/dates/${id}/`, config);
    return res
  } catch (err) {
    return err
  }
}

export const get_anomaly_tasks = (id) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/task/anomaly/${id}/`, config);
    return res
  } catch (err) {
    return err
  }
}


export const getIndexArrayComparison = (task_id,date) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/task/graph_data/comparision/get/${task_id}/${date}/`,
        config
    );

    return res;
  } catch (err) {
    return err;
  }
};

export const getGraphDataSelfTask = (task_id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/task/graph_data/get/periode/${task_id}/`,
        config
    );
    return res;
  } catch (err) {
    return err;
  }
};
