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
  KEEP_ME_SIGN_IN_CHECKED,
  SET_REFRESH_INTERVAL,
  CLEAR_REFRESH_INTERVAL,
} from "../utils/types";

const initialState = {
  access: localStorage.getItem("access"),
  refresh: localStorage.getItem("refresh"),
  isAuthenticated: localStorage.getItem("access") ? null : false, 
  isAuthenticated: null,
  isResetPassword: null,
  user: null,
  rememberMe: false,
  refreshIntervalId: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case AYTHENTICATED_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: payload,
      };
      case AYTHENTICATED_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
      };
    case CONST_LOGIN_SUCCESS:
    localStorage.setItem("access", payload.access);
    if (payload.refresh) {
      localStorage.setItem("refresh", payload.refresh);
    }
    return {
      ...state,
      isAuthenticated: true,
      access: payload.access,
      refresh: payload.refresh || null,
    };
    case LOAD_USER_SUCCESS:
      return {
        ...state,
        user: payload,
      };
    case AYTHENTICATED_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case LOAD_USER_FAIL:
      return {
        ...state,
        user: null,
      };
    case CONST_LOGIN_FAIL:
    case SIGNUP_FAIL:
    case LOGOUT:
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return {
        ...state,
        access: null,
        refresh: null,
        isAuthenticated: false,
        user: null,
        rememberMe: false,
        refreshIntervalId: null,
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
      };
    case PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        isResetPassword: true,
      };
    case PASSWORD_RESET_FAIL:
      return {
        ...state,
        isResetPassword: false,
      };
    case KEEP_ME_SIGN_IN_CHECKED:
      return {
        ...state,
        rememberMe: true,
      };
    case SET_REFRESH_INTERVAL:
      return {
        ...state,
        refreshIntervalId: payload,
      };
    case CLEAR_REFRESH_INTERVAL:
      return {
        ...state,
        refreshIntervalId: null,
      };
    case PASSWORD_RESET_CONFIRM_FAIL:
    case PASSWORD_RESET_CONFIRM_SUCCESS:
    case SIGNUP_FAIL:
    case ACTIVATION_SUCCESS:
    case ACTIVATION_FAIL:
      return {
        ...state,
      };

    default:
      return state;
  }
}
