import {
  PROJECT_ADD_FAIL,
  PROJECT_ADD_SUCCESS,
  PROJECT_LIST_FAIL,
  PROJECT_LIST_SUCCESS,
} from "../utils/projectTypes";

const initialState = {
  LayersOverlayState: null,
  AreaOfIntrest: null,
  // LoadingState: 0,
  VegetationLayers: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    // case LOADING_BEGIN:
    //   return {
    //     ...state,
    //     LoadingState: payload,
    //   };
    // case LOADING_END:
    //   return {
    //     ...state,
    //     LoadingState: 0,
    //   }
    case LAYERS_OVERLAY_SUCESS:
      return {
        ...state,
        LayersOverlayState: payload,
        LoadingState: false,
      };
    case LAYERS_OVERLAY_FAIL:
      return {
        ...state,
        LayersOverlayState: null,
      };
    case AREA_OF_INTEREST_SUCESS:
      return {
        ...state,
        AreaOfIntrest: payload,
      };
    case AREA_OF_INTEREST_FAIL:
      return {
        ...state,
        AreaOfIntrest: null,
      };
    case NDVI_SUCESS:
      return {
        ...state,
        VegetationLayers: payload,
      };
    case NDVI_FAIL:
      return {
        ...state,
        VegetationLayers: null,
      };
    default:
      return {
        ...state,
      };
  }
}
