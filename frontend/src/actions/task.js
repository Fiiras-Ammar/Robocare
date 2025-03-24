import axiosInstance from "../utils/axiosConfig";
import {
  NDVI_SUCESS,
  NDVI_FAIL,
  DETAIL_TASK_SUCESS,
  DETAIL_TASK_FAIL,
  SELECTED_DATE_SUCCESS,
  SELECTED_DATE_FAIL,
  SELECTED_DATE_INITIAL_SUCCESS,
  SELECTED_DATE_INITIAL_FAIL,
  ACCUSATION_DATES_SUCCESS,
  ACCUSATION_DATES_FAIL,
  SET_DETAILS_TASK_FORM_SUCCESS,
  SET_TREE_COUNT_ARRAY_SUCCESS,
  SET_TREE_COUNT_ARRAY_FAIL,
  SET_TREE_COUNT_VALUE_SUCCESS,
  SET_TREE_COUNT_VALUE_FAIL,
  TASK_IMAGE_SIDEBAR_SUCCESS,
  TASK_IMAGE_SIDEBAR_FAIL,
  REQUEST_EMPTY,
  REQUEST_EXIST,
  HISTOGRAM_SUCCESS,
  HISTOGRAM_FAIL,
  LOADING_BEGIN,
  DETAIL_TASK_SUCESS_SELECTED_DATE,

  ACCUSATION_DATES_SUCCESS_RIGHT,
  ACCUSATION_DATES_FAIL_RIGHT,
  SELECTED_DATE_SUCCESS_RIGHT,
  SELECTED_DATE_FAIL_RIGHT,
  DETAIL_TASK_SUCESS_RIGHT,
  DETAIL_TASK_FAIL_RIGHT,
  SET_DETAILS_TASK_FORM_SUCCESS_RIGHT,
  SELECTED_DATE_INITIAL_SUCCESS_RIGHT,
  SELECTED_DATE_INITIAL_FAIL_RIGHT,


  ACCUSATION_DATES_SUCCESS_LEFT,
  ACCUSATION_DATES_FAIL_LEFT,
  SELECTED_DATE_SUCCESS_LEFT,
  SELECTED_DATE_FAIL_LEFT,
  DETAIL_TASK_SUCESS_LEFT,
  DETAIL_TASK_FAIL_LEFT,
  SET_DETAILS_TASK_FORM_SUCCESS_LEFT,
  SELECTED_DATE_INITIAL_SUCCESS_LEFT,
  SELECTED_DATE_INITIAL_FAIL_LEFT,




  ACCUSATION_DATES_SUCCESS_SPATIAL_RIGHT,
  ACCUSATION_DATES_FAIL_SPATIAL_RIGHT,
  SELECTED_DATE_SUCCESS_SPATIAL_RIGHT,
  SELECTED_DATE_FAIL_SPATIAL_RIGHT,
  DETAIL_TASK_SUCESS_SPATIAL_RIGHT,
  DETAIL_TASK_FAIL_SPATIAL_RIGHT,
  SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_RIGHT,
  SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_RIGHT,
  SELECTED_DATE_INITIAL_FAIL_SPATIAL_RIGHT,


  ACCUSATION_DATES_SUCCESS_SPATIAL_LEFT,
  ACCUSATION_DATES_FAIL_SPATIAL_LEFT,
  SELECTED_DATE_SUCCESS_SPATIAL_LEFT,
  SELECTED_DATE_FAIL_SPATIAL_LEFT,
  DETAIL_TASK_SUCESS_SPATIAL_LEFT,
  DETAIL_TASK_FAIL_SPATIAL_LEFT,
  SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_LEFT,
  SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_LEFT,
  SELECTED_DATE_INITIAL_FAIL_SPATIAL_LEFT,
} from "../utils/types";

export const add_task =
  (
    project,
    area_of_interest,
    surface,
    task_name,
    culture,
    texture,
    salinity,
    irrigation,
    efficiency,
    variety,
    plantation_date,
    intensification_date,
    inter_line,
    intra_line,
    seeding_density,intensification_culture,intensification_variety,intensification_density
  ) =>
  async (dispatch) => {
    dispatch({
      type: LOADING_BEGIN,
    });
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({
      project,
      area_of_interest,
      surface,
      task_name,
      culture,
      texture,
      salinity,
      irrigation,
      efficiency,
      variety,
      plantation_date,
      intensification_date,
      inter_line,
      intra_line,
      seeding_density,intensification_culture,intensification_variety,intensification_density
    });

    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/add/`,
        body,
        config
      );

      dispatch({
        type: NDVI_SUCESS,
        payload: res.data.data.data,
      });
      return res.data.data;
    } catch (err) {
      dispatch({
        type: NDVI_FAIL,
      });
      return err;
    }
  };

export const edit_task =
  (
    id,
    task_name,
    age,
    culture,
    texture,
    salinity,
    density,
    irrigation,
    efficiency,
    variety,
    plantation_date,
    intensification_culture,
    intensification_variety,
    intensification_density,
    intensification_date

  ) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({
      id,
      task_name,
      age,
      culture,
      texture,
      salinity,
      density,
      irrigation,
      efficiency,
      variety,
      plantation_date,
      intensification_culture,
      intensification_variety,
      intensification_density,
      intensification_date
    });
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/edit/`,
        body,
        config
      );

      dispatch({
        type: NDVI_SUCESS,
        payload: res.data.data.data,
      });
      return res.data.data;
    } catch (err) {
      dispatch({
        type: NDVI_FAIL,
      });

      return err;
    }
  };

// export const Detail_Task = (id, date, provider) => async dispatch => {

//     const config = {
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     }
//     const body = JSON.stringify({ id, date, provider });
//     try {
//         const res = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/task/detail/`, body, config);

//         dispatch({
//             type: DETAIL_TASK_SUCESS,
//             payload: res.data.data.data
//         })
//         return res.data.data
//     } catch (err) {
//         dispatch({
//             type: DETAIL_TASK_FAIL
//         })
//         return err
//     }
// }
export const Task_Center = (id, user_id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/task/center/${id}/${user_id}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const Detail_Task =
  (id, provider = "S2", date = "") =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ id, provider, date });
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/get/`,
        body,
        config
      );
      dispatch({
        type: DETAIL_TASK_SUCESS,
        payload: res.data.data,
      });
      dispatch({
        type: DETAIL_TASK_SUCESS_SELECTED_DATE,
        payload: date,
      });
      return res.data.data;
    } catch (err) {
      dispatch({
        type: DETAIL_TASK_FAIL,
      });
      return err;
    }
  };

export const setHasHighResOrdersState = (id) => (dispatch) => {
  dispatch({
    type: REQUEST_EXIST,
    payload: [1, 2],
  });
};

export const get_area_by_task_id = (id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/task/area/${id}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const get_task_tree_count = (id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/task/count_tree/${id}/`,
      config
    );
    if (res.status === 200) {
      dispatch({
        type: SET_TREE_COUNT_VALUE_SUCCESS,
        payload: res.data.data.region_count["count"],
      });
      dispatch({
        type: SET_TREE_COUNT_ARRAY_SUCCESS,
        payload: res.data.data.local_index.result,
      });
    } else {
      dispatch({
        type: SET_TREE_COUNT_VALUE_FAIL,
      });
      dispatch({
        type: SET_TREE_COUNT_ARRAY_FAIL,
      });
    }
  } catch (err) {
    return err;
  }
};

export const Set_detail_from_data = (data) => async (dispatch) => {
  dispatch({
    type: SET_DETAILS_TASK_FORM_SUCCESS,
    payload: data,
  });
};

export const Sensor_data = (url) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
  };
  try {
    const res = await axiosInstance.get(url, config);
    return res;
  } catch (err) {
    return err;
  }
};

export const get_dates = (id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/get-dates/${id}/`,
      config
    );

    return res;
  } catch (err) {
    return err;
  }
};

export const get_dates_sentinel = (id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/api/get-dates/sentinel/${id}/`,
        config
    );

    return res;
  } catch (err) {
    return err;
  }
};

export const change_selected_date = (date, provider) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_SUCCESS,
      payload: { date: date, provider: provider },
    });
  } else {
    dispatch({
      type: SELECTED_DATE_FAIL,
      payload: null,
    });
  }
};

export const change_selected_date_initial = (date) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_INITIAL_SUCCESS,
      payload: date,
    });
  } else {
    dispatch({
      type: SELECTED_DATE_INITIAL_FAIL,
      payload: null,
    });
  }
};

export const get_task_sensor = (id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/task/sensor/${id}/`,
      config
    );

    return res;
  } catch (err) {
    return err;
  }
};

export const change_accusation_dates = (dates) => async (dispatch) => {
  if (dates) {
    dispatch({
      type: ACCUSATION_DATES_SUCCESS,
      payload: dates,
    });
  } else {
    dispatch({
      type: ACCUSATION_DATES_FAIL,
      payload: null,
    });
  }
};

export const getImageByDate = (id, date) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/get-date-image/${id}/${date}/`,
      config
    );
    return res.data.data;
  } catch (err) {
    return err;
  }
};

export const deleteTask = (id_task) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/task/delete/${id_task}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const addSubscription =
  (task, user, date_of_request, subscription) => async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ task, user, date_of_request, subscription });
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_URL}/api/task/subscription/add/`,
        body,
        config
      );

      return res;
    } catch (err) {
      return err;
    }
  };

export const submitHighResOrder =
  (task, user, order_date, max_cloud, subscription) => async (dispatch) => {
    const body = JSON.stringify({ task, user, order_date, max_cloud });
    try {
      const res = await axiosInstance({
        url: `${process.env.REACT_APP_API_URL}/api/highres/order/submit/`,
        method: "POST",
        data: body,
      });
      return res;
    } catch (err) {
      return null;
    }
}
export const getOrders = (task_id) => async dispatch => {
    // const body = JSON.stringify({ task });
    try {

        const res = await axiosInstance({ url: `${process.env.REACT_APP_API_URL}/api/highres/orders/list/${task_id}/`, method: 'GET', timeout: 10000 })
        return res
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            return {"status":503}
    }
    }
}

export const getHighResOrdersForUser = (user_id) => async dispatch => {
    try {

        const res = await axiosInstance({ url: `${process.env.REACT_APP_API_URL}/api/user/highres/orders/list/${user_id}/`, method: 'GET', timeout: 10000 })
        return res
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            return {"status":503}
    }
  }
};

// export const downloadOrderReport = (task, user, date_of_request) => async dispatch => {
export const downloadOrderReport = (order_id, task, filename) => async dispatch => {

  const body = JSON.stringify({ order_id, task });
  try {
    const res = await axiosInstance({
      url: `${process.env.REACT_APP_API_URL}/api/highres/order/download/`,
      responseType: "blob",
      method: "POST",
      data: body,
    });
    // , body, config);
    const pdfData = new Blob([res.data], { type: "application/pdf" });

    try {
      const contentDisposition = res.headers;
      // const filename = contentDisposition.split('filename=')[1]
      // // .split(';')[0].replace(/"/g, '');
    } catch (error) {}

    const url = window.URL.createObjectURL(pdfData);

        const tempoLink = document.createElement("a");
        tempoLink.href = url;
        tempoLink.setAttribute(
            "download", `${filename}_High_Resolution_Report.pdf`
        );
        document.body.appendChild(tempoLink);
        tempoLink.click();
        document.body.removeChild(tempoLink);
        window.URL.revokeObjectURL(url)

    return res;
  } catch (err) {
    return err;
  }
};

export const get_task_sidebar_image = (id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_URL}/api/task/check_image_sidebar/${id}/`,
      config
    );
    if (res.status === 200) {
      dispatch({
        type: TASK_IMAGE_SIDEBAR_SUCCESS,
        payload: res.data.data.url,
      });
    } else {
      dispatch({
        type: TASK_IMAGE_SIDEBAR_FAIL,
      });
    }
    return res;
  } catch (err) {
    return err;
  }
};

export const set_smart_control_command = (command) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ command });
  try {
    const res = await axiosInstance.post(
      "https://smart-irrigation.robocare.tn/api/control",
      body,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const get_smart_control_command_status = () => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ command: "" });
  try {
    const res = await axiosInstance.post(
      "https://smart-irrigation.robocare.tn/api/control",
      body,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const change_accusation_dates_right = (dates) => async (dispatch) => {
  if (dates) {
    dispatch({
      type: ACCUSATION_DATES_SUCCESS_RIGHT,
      payload: dates,
    });
  } else {
    dispatch({
      type: ACCUSATION_DATES_FAIL_RIGHT,
      payload: null,
    });
  }
};

export const change_selected_date_right = (date, provider) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_SUCCESS_RIGHT,
      payload: { date: date, provider: provider },
    });
  } else {
    dispatch({
      type: SELECTED_DATE_FAIL_RIGHT,
      payload: null,
    });
  }
};

export const Detail_Task_right = (id, provider = "S2", date_left = "", date_right = "") =>async (dispatch) => {
          const config = {
            headers: {
              "Content-Type": "application/json",
            },
          };
          const body = JSON.stringify({ id, provider, date_left,date_right });
          try {
            const res = await axiosInstance.post(
                `${process.env.REACT_APP_API_URL}/api/task/get/comparaison/meme-task/right/`,
                body,
                config
            );

            dispatch({
              type: DETAIL_TASK_SUCESS_RIGHT,
              payload: res.data.data,
            });
            return res.data.data;
          } catch (err) {
            dispatch({
              type: DETAIL_TASK_FAIL_RIGHT,
            });
            return err;
          }
        };
export const Set_detail_from_data_right = (data) => async (dispatch) => {
  dispatch({
    type: SET_DETAILS_TASK_FORM_SUCCESS_RIGHT,
    payload: data,
  });
};

export const change_selected_date_initial_right = (date) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_INITIAL_SUCCESS_RIGHT,
      payload: date,
    });
  } else {
    dispatch({
      type: SELECTED_DATE_INITIAL_FAIL_RIGHT,
      payload: null,
    });
  }
};



export const change_accusation_dates_left = (dates) => async (dispatch) => {
  if (dates) {
    dispatch({
      type: ACCUSATION_DATES_SUCCESS_LEFT,
      payload: dates,
    });
  } else {
    dispatch({
      type: ACCUSATION_DATES_FAIL_LEFT,
      payload: null,
    });
  }
};

export const change_selected_date_left = (date, provider) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_SUCCESS_LEFT,
      payload: { date: date, provider: provider },
    });
  } else {
    dispatch({
      type: SELECTED_DATE_FAIL_LEFT,
      payload: null,
    });
  }
};

export const Detail_Task_left = (id, provider = "S2", date_left = "", date_right = "") => async (dispatch) => {
          const config = {
            headers: {
              "Content-Type": "application/json",
            },
          };
          const body = JSON.stringify({ id, provider, date_left,date_right });
          try {
            const res = await axiosInstance.post(
                `${process.env.REACT_APP_API_URL}/api/task/get/comparaison/meme-task/left/`,
                body,
                config
            );

            dispatch({
              type: DETAIL_TASK_SUCESS_LEFT,
              payload: res.data.data,
            });
            return res.data.data;
          } catch (err) {
            dispatch({
              type: DETAIL_TASK_FAIL_LEFT,
            });
            return err;
          }
        };
export const Set_detail_from_data_left = (data) => async (dispatch) => {
  dispatch({
    type: SET_DETAILS_TASK_FORM_SUCCESS_LEFT,
    payload: data,
  });
};

export const change_selected_date_initial_left = (date) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_INITIAL_SUCCESS_LEFT,
      payload: date,
    });
  } else {
    dispatch({
      type: SELECTED_DATE_INITIAL_FAIL_LEFT,
      payload: null,
    });
  }
};

export const set_smart_control_connect = () => async () => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
        "https://smart-irrigation.robocare.tn/api/connect",
        config
    );
    return res;
  } catch (err) {
    return err;
  }
};



export const change_accusation_dates_spatial_right = (dates) => async (dispatch) => {
  if (dates) {
    dispatch({
      type: ACCUSATION_DATES_SUCCESS_SPATIAL_RIGHT,
      payload: dates,
    });
  } else {
    dispatch({
      type: ACCUSATION_DATES_FAIL_SPATIAL_RIGHT,
      payload: null,
    });
  }
};

export const change_selected_date_spatial_right = (date, provider) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_SUCCESS_SPATIAL_RIGHT,
      payload: { date: date, provider: provider },
    });
  } else {
    dispatch({
      type: SELECTED_DATE_FAIL_SPATIAL_RIGHT,
      payload: null,
    });
  }
};
export const Detail_Task_spatial_right =
    (id, provider = "S2", date = "") =>
        async (dispatch) => {
          const config = {
            headers: {
              "Content-Type": "application/json",
            },
          };
          const body = JSON.stringify({ id, provider, date });
          try {
            const res = await axiosInstance.post(
                `${process.env.REACT_APP_API_URL}/api/task/get/`,
                body,
                config
            );
            dispatch({
              type: DETAIL_TASK_SUCESS_SPATIAL_RIGHT,
              payload: res.data.data,
            });

            return res.data.data;
          } catch (err) {
            dispatch({
              type: DETAIL_TASK_FAIL_SPATIAL_RIGHT,
            });
            return err;
          }
        };
export const Set_detail_from_data_spatial_right = (data) => async (dispatch) => {
  dispatch({
    type: SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_RIGHT,
    payload: data,
  });
};

export const change_selected_date_initial_spatial_right = (date) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_RIGHT,
      payload: date,
    });
  } else {
    dispatch({
      type: SELECTED_DATE_INITIAL_FAIL_SPATIAL_RIGHT,
      payload: null,
    });
  }
};



export const change_accusation_dates_spatial_left = (dates) => async (dispatch) => {
  if (dates) {
    dispatch({
      type: ACCUSATION_DATES_SUCCESS_SPATIAL_LEFT,
      payload: dates,
    });
  } else {
    dispatch({
      type: ACCUSATION_DATES_FAIL_SPATIAL_LEFT,
      payload: null,
    });
  }
};

export const change_selected_date_spatial_left = (date, provider) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_SUCCESS_SPATIAL_LEFT,
      payload: { date: date, provider: provider },
    });
  } else {
    dispatch({
      type: SELECTED_DATE_FAIL_SPATIAL_LEFT,
      payload: null,
    });
  }
};
export const Detail_Task_spatial_left =
    (id, provider = "S2", date = "") =>
        async (dispatch) => {
          const config = {
            headers: {
              "Content-Type": "application/json",
            },
          };
          const body = JSON.stringify({ id, provider, date });
          try {
            const res = await axiosInstance.post(
                `${process.env.REACT_APP_API_URL}/api/task/get/`,
                body,
                config
            );
            dispatch({
              type: DETAIL_TASK_SUCESS_SPATIAL_LEFT,
              payload: res.data.data,
            });

            return res.data.data;
          } catch (err) {
            dispatch({
              type: DETAIL_TASK_FAIL_SPATIAL_LEFT,
            });
            return err;
          }
        };
export const Set_detail_from_data_spatial_left = (data) => async (dispatch) => {
  dispatch({
    type: SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_LEFT,
    payload: data,
  });
};

export const change_selected_date_initial_spatial_left = (date) => async (dispatch) => {
  if (date) {
    dispatch({
      type: SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_LEFT,
      payload: date,
    });
  } else {
    dispatch({
      type: SELECTED_DATE_INITIAL_FAIL_SPATIAL_LEFT,
      payload: null,
    });
  }
};

export const get_tasks_last_images_date = ( user_id) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/api/last-image-date/statistic/${user_id}/`,
        config
    );
    return res.data;
  } catch (err) {
    return err;
  }
};
