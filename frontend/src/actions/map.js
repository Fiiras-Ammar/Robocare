import {
  LAYERS_OVERLAY_SUCESS,
  AREA_OF_INTEREST_SUCESS,
  AREA_SURFACE_SUCESS,
  LOADING_BEGIN,
  LOADING_END,
  CLICK_EVENT_STATE_SUCCESS,
  CLICK_EVENT_STATE_FAIL,
  CHECKBOX_STATE_SUCCESS,
  CHECKBOX_STATE_FAIL,
  SET_IS_CHECKED_COUNT_CHECKBOX_SUCCESS,
  SET_IS_CHECKED_COUNT_CHECKBOX_FAIL
  ,
  CHECKBOX_STATE_SUCCESS_RIGHT,
  CHECKBOX_STATE_FAIL_RIGHT,
  CLICK_EVENT_STATE_FAIL_RIGHT,
  CLICK_EVENT_STATE_SUCCESS_RIGHT,

  CHECKBOX_STATE_SUCCESS_LEFT,
  CHECKBOX_STATE_FAIL_LEFT,
  CLICK_EVENT_STATE_FAIL_LEFT,
  CLICK_EVENT_STATE_SUCCESS_LEFT,


  CHECKBOX_STATE_SUCCESS_SPATIAL_RIGHT,
  CHECKBOX_STATE_FAIL_SPATIAL_RIGHT,
  CLICK_EVENT_STATE_FAIL_SPATIAL_RIGHT,
  CLICK_EVENT_STATE_SUCCESS_SPATIAL_RIGHT,

  CHECKBOX_STATE_SUCCESS_SPATIAL_LEFT,
  CHECKBOX_STATE_FAIL_SPATIAL_LEFT,
  CLICK_EVENT_STATE_FAIL_SPATIAL_LEFT,
  CLICK_EVENT_STATE_SUCCESS_SPATIAL_LEFT,
} from "../utils/types";

export function LayersOverlayInizialize(layercontrol) {
  return {
    type: LAYERS_OVERLAY_SUCESS,
    layerControlState: layercontrol,
  };
}

export const AreaOfInterestizialize = (polygon) => async (dispatch) => {
  dispatch({
    type: AREA_OF_INTEREST_SUCESS,
    payload: polygon,
  });
};

export const AreaSurface = (area) => async (dispatch) => {
  dispatch({
    type: AREA_SURFACE_SUCESS,
    payload: area,
  });
};

export const loadingBegin = (type) => (dispatch) => {
  dispatch({
    type: LOADING_BEGIN,
    payload: type,
  });
};
export const loadingEnd = (type) => (dispatch) => {
  dispatch({
    type: LOADING_END,
    payload: type,
  });
};

export const setClickEventSucess = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_SUCCESS,
  });
};
export const setClickEventFail = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_FAIL,
  });
};

export const setCheckboxLayerState = (id) => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_SUCCESS,
    payload: id,
  });
};

export const removeCheckboxLayerState = () => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_FAIL,
  });
};

export const setCountCheckboxToChecked = () => (dispatch) => {
  dispatch({
    type: SET_IS_CHECKED_COUNT_CHECKBOX_SUCCESS,
  });
};

export const setCountCheckboxToUnchecked = () => (dispatch) => {
  dispatch({
    type: SET_IS_CHECKED_COUNT_CHECKBOX_FAIL,
  });
};

export const setCheckboxLayerStateRight = (id) => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_SUCCESS_RIGHT,
    payload: id,
  });
};
export const removeCheckboxLayerStateRight = () => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_FAIL_RIGHT,
  });
};
export const setClickEventFailRight = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_FAIL_RIGHT,
  });
};
export const setClickEventSucessRight = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_SUCCESS_RIGHT,
  });
};



export const setCheckboxLayerStateLeft = (id) => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_SUCCESS_LEFT,
    payload: id,
  });
};
export const removeCheckboxLayerStateLeft = () => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_FAIL_LEFT,
  });
};
export const setClickEventFailLeft = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_FAIL_LEFT,
  });
};
export const setClickEventSucessLeft = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_SUCCESS_LEFT,
  });
};




export const setCheckboxLayerStateSpatialRight = (id) => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_SUCCESS_SPATIAL_RIGHT,
    payload: id,
  });
};
export const removeCheckboxLayerStateSpatialRight = () => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_FAIL_SPATIAL_RIGHT,
  });
};
export const setClickEventFailSpatialRight = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_FAIL_SPATIAL_RIGHT,
  });
};
export const setClickEventSucessSpatialRight = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_SUCCESS_SPATIAL_RIGHT,
  });
};



export const setCheckboxLayerStateSpatialLeft = (id) => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_SUCCESS_SPATIAL_LEFT,
    payload: id,
  });
};
export const removeCheckboxLayerStateSpatialLeft = () => (dispatch) => {
  dispatch({
    type: CHECKBOX_STATE_FAIL_SPATIAL_LEFT,
  });
};
export const setClickEventFailSpatialLeft = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_FAIL_SPATIAL_LEFT,
  });
};
export const setClickEventSucessSpatialLeft = () => (dispatch) => {
  dispatch({
    type: CLICK_EVENT_STATE_SUCCESS_SPATIAL_LEFT,
  });
};
