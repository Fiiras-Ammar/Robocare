import { min } from "d3";
import Histogram from "../components/task/histogram/histogram";
import {

  HISTOGRAM_INITIAL_SUCCESS,
  HISTOGRAM_INITIAL_FAIL,
  HISTOGRAM_SUCCESS,
  HISTOGRAM_FAIL,
  SET_HISTOGRAM_LOAD_SUCCESS,
  SET_HISTOGRAM_LOAD_FAIL,
  SET_ACTIVE_TAB_SUCCESS,
  SET_ACTIVE_TAB_FAIL,
  SET_HISTOGRAM_INTERVAL_SUCCESS,
  SET_HISTOGRAM_INTERVAL_FAIL,
  SET_HISTOGRAM_PRODUCTIVITY_SUCCESS,
  SET_HISTOGRAM_PRODUCTIVITY_FAIL,
  SET_HISTOGRAM_CMAP_SUCCESS,
  SET_HISTOGRAM_CMAP_FAIL,

  HISTOGRAM_SUCCESS_RIGHT,
  HISTOGRAM_FAIL_RIGHT,

  HISTOGRAM_SUCCESS_LEFT,
  HISTOGRAM_FAIL_LEFT,


  HISTOGRAM_SUCCESS_SPATIAL_RIGHT,
  HISTOGRAM_FAIL_SPATIAL_RIGHT,

  HISTOGRAM_SUCCESS_SPATIAL_LEFT,
  HISTOGRAM_FAIL_SPATIAL_LEFT,
} from "../utils/types";

const initialState = {
  histogram: [],
  histogramProductivity: [],
  min: null,
  max: null,
  tif_path: null,
  loading: true,
  cmap: [],
  cmapProductivity: [],
  activeTab: 1,

  histogram_right: [],
  min_right: null,
  max_right: null,
  tif_path_right: null,
  loading_right: true,

  histogram_left: [],
  min_left: null,
  max_left: null,
  tif_path_left: null,
  loading_left: true,


  histogram_spatial_right: [],
  min_spatial_right: null,
  max_spatial_right: null,
  tif_path_spatial_right: null,
  loading_spatial_right: true,

  histogram_spatial_left: [],
  min_spatial_left: null,
  max_spatial_left: null,
  tif_path_spatial_left: null,
  loading_spatial_left: true,
};
export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case HISTOGRAM_INITIAL_SUCCESS:
      return {
        ...state,
        histogram: payload.index,
        tif_path: payload.index.tif_file,
        min: payload.index.percentile[0],
        //min: payload.index.min,
        //max: payload.index.max,
        max: payload.index.percentile[1],
        cmap: payload.colormap,
        loading: false,
      };
    case HISTOGRAM_INITIAL_FAIL:
      return {
        ...state,
        histogram: [],
        min: null,
        max: null,
        cmap: null,
        tif_path: null,
        loading: true,
      };
    case HISTOGRAM_SUCCESS:
      return {
        ...state,
        histogram: payload,
        min: payload[0],
        max: payload[1],
        cmap: payload.cmap,
        loading: false,
      };
    case HISTOGRAM_FAIL:
      return {
        ...state,
        histogram: [],
        min: null,
        max: null,
        cmap: null,
        loading: true,
      };
    case SET_ACTIVE_TAB_SUCCESS:
      return {
        ...state,
        activeTab: payload,
      };
    case SET_ACTIVE_TAB_FAIL:
      return {
        ...state,
        activeTab: 1,
      };
    case SET_HISTOGRAM_LOAD_SUCCESS:
      return {
        ...state,
        loading: true,
      };
    case SET_HISTOGRAM_LOAD_FAIL:
      return {
        ...state,
        loading: false,
      };
    case SET_HISTOGRAM_INTERVAL_SUCCESS:
      return {
        ...state,
        min: payload[0],
        max: payload[1],
      };
    case SET_HISTOGRAM_INTERVAL_FAIL:
      return {
        ...state,
        min: null,
        max: null,
      };
    case SET_HISTOGRAM_PRODUCTIVITY_SUCCESS:
      return {
        ...state,
        histogramProductivity: payload,
        min:payload.min,
        max:payload.max,
        cmapProductivity : payload.cmap,
        loading: false,
      };
    case SET_HISTOGRAM_PRODUCTIVITY_FAIL:
      return {
        ...state,
        histogramProductivity: [],
        cmapProductivity:null,
        loading: true,
      };
    case SET_HISTOGRAM_CMAP_SUCCESS:
      return {
        ...state,
        cmap: payload,
      };
    case SET_HISTOGRAM_CMAP_FAIL:
      return {
        ...state,
        cmap: [],
      };
       case HISTOGRAM_SUCCESS_RIGHT:
          return {
              ...state,
              histogram_right: payload,
              min_right: payload.percentile[0],
              max_right: payload.percentile[1],
              tif_path_right: payload.tif_file,
              loading_right: false,
          };
      case HISTOGRAM_FAIL_RIGHT:
          return {
              ...state,
              histogram_right: [],
              min_right: null,
              max_right: null,
              tif_path_right: null,
              loading_right: true,
          };
      case HISTOGRAM_SUCCESS_LEFT:
          return {
              ...state,
              histogram_left: payload,
              min_left: payload.min,
              max_left: payload.max,
              tif_path_left: payload.tif_file,
              loading_left: false,
          };

      case HISTOGRAM_FAIL_LEFT:
          return {
              ...state,
              histogram_left: [],
              min_left: null,
              max_left: null,
              tif_path_left: null,
              loading_left: true,
          };


    case HISTOGRAM_SUCCESS_SPATIAL_LEFT:
      return {
        ...state,
        histogram_spatial_left: payload,
        min_spatial_left: payload.percentile[0],
        max_spatial_left: payload.percentile[1],
        tif_path_spatial_left: payload.tif_file,
        loading_spatial_left: false,
      };

    case HISTOGRAM_FAIL_SPATIAL_LEFT:
      return {
        ...state,
        histogram_spatial_left: [],
        min_spatial_left: null,
        max_spatial_left: null,
        tif_path_spatial_left: null,
        loading_spatial_left: true,
      };

    case HISTOGRAM_SUCCESS_SPATIAL_RIGHT:
      return {
        ...state,
        histogram_spatial_right: payload,
        min_spatial_right: payload.percentile[0],
        max_spatial_right: payload.percentile[1],
        tif_path_spatial_right: payload.tif_file,
        loading_spatial_right: false,
      };
    case HISTOGRAM_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        histogram_spatial_right: [],
        min_spatial_right: null,
        max_spatial_right: null,
        tif_path_spatial_right: null,
        loading_spatial_right: true,
      };
    default:
      return {
        ...state,
      };
  }
}
