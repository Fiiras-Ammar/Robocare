import axios from "axios";
import {
  CONST_LOGIN_SUCCESS,
  CONST_LOGIN_FAIL,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  AYTHENTICATED_SUCCESS,
  AYTHENTICATED_FAIL,
  LOGOUT,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  SIGNUP_SUCCESS,
  SIGNUP_FAIL,
  ACTIVATION_SUCCESS,
  ACTIVATION_FAIL,
  SELECTED_PROJECT_FAIL,
  KEEP_ME_SIGN_IN_CHECKED,
  SET_REFRESH_INTERVAL,
  CLEAR_REFRESH_INTERVAL,
} from "../utils/types.js";
import { persistor } from "../store.js";

export const TimeOutLogOut = () => (dispatch) => {
  setTimeout(() => {
    dispatch(clearRefreshInterval());
    dispatch({ type: LOGOUT });
  }, 86400000); // 1 day
};

export const setUpRefreshInterval = () => (dispatch) => {
  if (window.refreshInterval) {
    clearInterval(window.refreshInterval);
  }
  window.refreshInterval = setInterval(() => {
    dispatch(refreshToken());
  }, 86400000); // Refresh every 1 day
  dispatch({
    type: SET_REFRESH_INTERVAL,
    payload: window.refreshInterval,
  });
};
export const clearRefreshInterval = () => (dispatch, getState) => {
  const { auth } = getState();
  if (auth.refreshIntervalId) {
    clearInterval(auth.refreshIntervalId);
    dispatch({
      type: CLEAR_REFRESH_INTERVAL,
    });
  }
};

export const refreshToken = () => async (dispatch) => {
  const config = {
    headers: { "Content-Type": "application/json" },
  };

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/jwt/refresh/`,
      { refresh: localStorage.getItem("refresh") },
      config
    );

    localStorage.setItem("access", res.data.access);
    return Promise.resolve();
    
  } catch (err) {
    dispatch(logout());
    return Promise.reject();
  }
};

export const checkAuthenticated = () => async (dispatch) => {
  if (localStorage.getItem("access")) {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/jwt/verify/`,
        { token: localStorage.getItem("access") }
      );
      
      dispatch({ type: AYTHENTICATED_SUCCESS });
      dispatch(load_user());
      
    } catch (err) {
      try {
        await dispatch(refreshToken());
        dispatch({ type: AYTHENTICATED_SUCCESS });
        dispatch(load_user());
      } catch (refreshError) {
        dispatch(logout());
      }
    }
  } else {
    dispatch({ type: AYTHENTICATED_FAIL });
  }
};
export const load_user = () => async (dispatch) => {
  const access = localStorage.getItem("access");
  
  if (!access) {
    dispatch({ type: AYTHENTICATED_FAIL });
    return;
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${access}`, // Keep JWT prefix
      Accept: "application/json",
    },
  };

  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/auth/users/me/`,
      config
    );

    dispatch({
      type: LOAD_USER_SUCCESS,
      payload: res.data,
    });
    dispatch({ type: AYTHENTICATED_SUCCESS });

  } catch (err) {
    // Handle 401 Unauthorized
    if (err.response?.status === 401) {
      try {
        await dispatch(refreshToken());
        return dispatch(load_user()); // Retry after refresh
      } catch (refreshError) {
        dispatch(logout());
      }
    } else {
      dispatch({ type: LOAD_USER_FAIL });
      dispatch({ type: AYTHENTICATED_FAIL });
    }
  }
};

export const login = (email, password, remember) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true // Required for CSRF cookie
  };

  try {
    const body = JSON.stringify({ email, password });
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/jwt/create/`, // Fixed environment variable
      body,
      config
    );

    dispatch({
      type: CONST_LOGIN_SUCCESS,
      payload: res.data,
    });

    if (remember) {
      dispatch({ type: KEEP_ME_SIGN_IN_CHECKED });
    }

    dispatch(load_user());
    dispatch(setUpRefreshInterval()); // Start token refresh cycle
    return res;

  } catch (err) {
    dispatch({ type: CONST_LOGIN_FAIL });
    return err;
  }
};

export const signup =
  (firstname, lastname, company, phone, email, password, re_password) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({
      firstname,
      lastname,
      company,
      phone,
      email,
      password,
      re_password,
    });
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/users/`,
        body,
        config
      );
      dispatch({
        type: SIGNUP_SUCCESS,
        payload: res.data,
      });
      dispatch(load_user());
      return res;
    } catch (err) {
      dispatch({
        type: SIGNUP_FAIL,
      });
      return err;
    }
  };

export const verify = (uid, token) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ uid, token });
  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/users/activation/`,
      body,
      config
    );

    dispatch({
      type: ACTIVATION_SUCCESS,
    });
    dispatch(load_user());
  } catch (err) {
    dispatch({
      type: ACTIVATION_FAIL,
    });
  }
};

export const check_exist_email = (email) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/auth/user/check-email/${email}/`,
      config
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const reset_password = (email) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ email });
  try {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/users/reset_password/`,
      body,
      config
    );
    dispatch({
      type: PASSWORD_RESET_SUCCESS,
    });
  } catch (err) {
    dispatch({
      type: PASSWORD_RESET_FAIL,
    });
  }
};

export const reset_password_confirm =
  (uid, token, new_password, re_new_password) => async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ uid, token, new_password, re_new_password });
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/users/reset_password_confirm/`,
        body,
        config
      );
      dispatch({
        type: PASSWORD_RESET_CONFIRM_SUCCESS,
      });
    } catch (err) {
      dispatch({
        type: PASSWORD_RESET_CONFIRM_FAIL,
      });
    }
  };

export const logout = () => async (dispatch) => {
  dispatch(clearRefreshInterval());
  dispatch({
    type: LOGOUT,
  });
  await persistor.purge();
};

export const ResetPasswordFail = () => {
  return {
    type: PASSWORD_RESET_FAIL,
  };
};
