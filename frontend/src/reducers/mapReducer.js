import {
  LAYERS_OVERLAY_SUCESS,
  LAYERS_OVERLAY_FAIL,
  AREA_OF_INTEREST_SUCESS,
  AREA_OF_INTEREST_FAIL,
  AREA_SURFACE_SUCESS,
  AREA_SURFACE_FAIL,
  NDVI_SUCESS,
  NDVI_FAIL,
  LOADING_BEGIN,
  LOADING_END,
  DETAIL_TASK_SUCESS,
  DETAIL_TASK_SUCESS_SELECTED_DATE,
  DETAIL_TASK_FAIL,
  SELECTED_DATE_SUCCESS,
  SELECTED_DATE_FAIL,
  SELECTED_DATE_INITIAL_SUCCESS,
  SELECTED_DATE_INITIAL_FAIL,
  ACCUSATION_DATES_SUCCESS,
  ACCUSATION_DATES_FAIL,
  CLICK_EVENT_STATE_SUCCESS,
  CLICK_EVENT_STATE_FAIL,
  SET_DETAILS_TASK_FORM_SUCCESS,
  SET_DETAILS_TASK_FORM_FAIL,
  CHECKBOX_STATE_SUCCESS,
  CHECKBOX_STATE_FAIL,
  SET_TREE_COUNT_ARRAY_SUCCESS,
  SET_TREE_COUNT_ARRAY_FAIL,
  SET_TREE_COUNT_VALUE_SUCCESS,
  SET_TREE_COUNT_VALUE_FAIL,
  SET_IS_CHECKED_COUNT_CHECKBOX_SUCCESS,
  SET_IS_CHECKED_COUNT_CHECKBOX_FAIL,
  TASK_IMAGE_SIDEBAR_SUCCESS,
  TASK_IMAGE_SIDEBAR_FAIL,
  CHECKBOX_DEM_STATE_FAIL,

  CHECKBOX_STATE_SUCCESS_RIGHT,
  CHECKBOX_STATE_FAIL_RIGHT,
  CLICK_EVENT_STATE_SUCCESS_RIGHT,
  CLICK_EVENT_STATE_FAIL_RIGHT,
  ACCUSATION_DATES_SUCCESS_RIGHT,
  ACCUSATION_DATES_FAIL_RIGHT,
  SELECTED_DATE_SUCCESS_RIGHT,
  SELECTED_DATE_FAIL_RIGHT,
  DETAIL_TASK_SUCESS_RIGHT,
  DETAIL_TASK_FAIL_RIGHT,
  SET_DETAILS_TASK_FORM_SUCCESS_RIGHT,
  SET_DETAILS_TASK_FORM_FAIL_RIGHT,
  SELECTED_DATE_INITIAL_SUCCESS_RIGHT,
  SELECTED_DATE_INITIAL_FAIL_RIGHT,

  CHECKBOX_STATE_SUCCESS_LEFT,
  CHECKBOX_STATE_FAIL_LEFT,
  CLICK_EVENT_STATE_SUCCESS_LEFT,
  CLICK_EVENT_STATE_FAIL_LEFT,
  ACCUSATION_DATES_SUCCESS_LEFT,
  ACCUSATION_DATES_FAIL_LEFT,
  SELECTED_DATE_SUCCESS_LEFT,
  SELECTED_DATE_FAIL_LEFT,
  DETAIL_TASK_SUCESS_LEFT,
  DETAIL_TASK_FAIL_LEFT,
  SET_DETAILS_TASK_FORM_SUCCESS_LEFT,
  SET_DETAILS_TASK_FORM_FAIL_LEFT,
  SELECTED_DATE_INITIAL_SUCCESS_LEFT,
  SELECTED_DATE_INITIAL_FAIL_LEFT,
  CHECKBOX_DEM_STATE_SUCCESS,

  CHECKBOX_STATE_SUCCESS_SPATIAL_LEFT,
  CHECKBOX_STATE_FAIL_SPATIAL_LEFT,
  CLICK_EVENT_STATE_SUCCESS_SPATIAL_LEFT,
  CLICK_EVENT_STATE_FAIL_SPATIAL_LEFT,
  ACCUSATION_DATES_SUCCESS_SPATIAL_LEFT,
  ACCUSATION_DATES_FAIL_SPATIAL_LEFT,
  SELECTED_DATE_SUCCESS_SPATIAL_LEFT,
  SELECTED_DATE_FAIL_SPATIAL_LEFT,
  DETAIL_TASK_SUCESS_SPATIAL_LEFT,
  DETAIL_TASK_FAIL_SPATIAL_LEFT,
  SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_LEFT,
  SET_DETAILS_TASK_FORM_FAIL_SPATIAL_LEFT,
  SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_LEFT,
  SELECTED_DATE_INITIAL_FAIL_SPATIAL_LEFT,

  CHECKBOX_STATE_SUCCESS_SPATIAL_RIGHT,
  CHECKBOX_STATE_FAIL_SPATIAL_RIGHT,
  CLICK_EVENT_STATE_SUCCESS_SPATIAL_RIGHT,
  CLICK_EVENT_STATE_FAIL_SPATIAL_RIGHT,
  ACCUSATION_DATES_SUCCESS_SPATIAL_RIGHT,
  ACCUSATION_DATES_FAIL_SPATIAL_RIGHT,
  SELECTED_DATE_SUCCESS_SPATIAL_RIGHT,
  SELECTED_DATE_FAIL_SPATIAL_RIGHT,
  DETAIL_TASK_SUCESS_SPATIAL_RIGHT,
  DETAIL_TASK_FAIL_SPATIAL_RIGHT,
  SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_RIGHT,
  SET_DETAILS_TASK_FORM_FAIL_SPATIAL_RIGHT,
  SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_RIGHT,
  SELECTED_DATE_INITIAL_FAIL_SPATIAL_RIGHT,
} from "../utils/types";

const initialState = {
  LayersOverlayState: null,
  AreaOfIntrest: null,
  AreaSurface: 0,
  LoadingState: 0,
  VegetationLayers: null,
  DetailVegetationLayers: null,
  date: null,
  SelectedDate: null,
  AccusationDates: null,
  clickEventCheck: true,
  taskIdDetails: null,
  taskNameDetails: null,
  surfaceDetails: null,
  ageDetails: null,
  plantationDateDetails: null,
  nbTreeDetails: null,
  nbTreePerHectarDetails: null,
  intensificationplantationDateDetails: null,
  cultureDetails: null,
  intensificationCultureDetails: null,
  intensificationDensityDetails: null,
  textureDetails: null,
  densityDetails: null,
  varietyDetails: null,
  intensificationVarietyDetails: null,
  irrigationTypeDetails: null,
  salinityDetails: null,
  efficiencyDetails: null,
  checkboxLayers: "NDVI",
  countryFrDetails: null,
  countryArDetails: null,
  countyFrDetails: null,
  countyArDetails: null,
  postcodeFrDetails: null,
  postcodeArDetails: null,
  stateFrDetails: null,
  stateArDetails: null,
  stateDistrictFrDetails: null,
  stateDistrictArDetails: null,
  imageSidebarArDetails: null,
  treeCountValue: null,
  treeCountLocalIndicesArray: [],
  isCheckedCountCheckbox: 0,

  checkboxLayersRight: "NDVI",
  clickEventCheckRight: true,
  AccusationDatesRight: null,
  SelectedDateRight: null,
  DetailVegetationLayersRight: null,
  taskIdDetailsRight: null,
  taskNameDetailsRight: null,
  surfaceDetailsRight: null,
  ageDetailsRight: null,
  cultureDetailsRight: null,
  textureDetailsRight: null,
  densityDetailsRight: null,
  varietyDetailsRight: null,
  irrigationTypeDetailsRight: null,
  salinityDetailsRight: null,
  efficiencyDetailsRight: null,
  countryFrDetailsRight: null,
  countryArDetailsRight: null,
  countyFrDetailsRight: null,
  countyArDetailsRight: null,
  postcodeFrDetailsRight: null,
  postcodeArDetailsRight: null,
  stateFrDetailsRight: null,
  stateArDetailsRight: null,
  stateDistrictFrDetailsRight: null,
  stateDistrictArDetailsRight: null,
  imageSidebarArDetailsRight: null,

  checkboxLayersLeft: "NDVI",
  clickEventCheckLeft: true,
  AccusationDatesLeft: null,
  SelectedDateLeft: null,
  DetailVegetationLayersLeft: null,
  taskIdDetailsLeft: null,
  taskNameDetailsLeft: null,
  surfaceDetailsLeft: null,
  ageDetailsLeft: null,
  cultureDetailsLeft: null,
  textureDetailsLeft: null,
  densityDetailsLeft: null,
  varietyDetailsLeft: null,
  irrigationTypeDetailsLeft: null,
  salinityDetailsLeft: null,
  efficiencyDetailsLeft: null,
  countryFrDetailsLeft: null,
  countryArDetailsLeft: null,
  countyFrDetailsLeft: null,
  countyArDetailsLeft: null,
  postcodeFrDetailsLeft: null,
  postcodeArDetailsLeft: null,
  stateFrDetailsLeft: null,
  stateArDetailsLeft: null,
  stateDistrictFrDetailsLeft: null,
  stateDistrictArDetailsLeft: null,
  imageSidebarArDetailsLeft: null,

  demCheckboxState: false,


  checkboxLayersSpatialLeft: "NDVI",
  clickEventCheckSpatialLeft: true,
  AccusationDatesSpatialeft: null,
  SelectedDateSpatialLeft: null,
  DetailVegetationLayersSpatialLeft: null,
  taskIdDetailsSpatialLeft: null,
  taskNameDetailsSpatialLeft: null,
  surfaceDetailsSpatialLeft: null,
  ageDetailsSpatialLeft: null,
  cultureDetailsSpatialLeft: null,
  textureDetailsSpatialLeft: null,
  densityDetailsSpatialLeft: null,
  varietyDetailsSpatialLeft: null,
  irrigationTypeDetailsSpatialLeft: null,
  salinityDetailsSpatialLeft: null,
  efficiencyDetailsSpatialLeft: null,
  countryFrDetailsSpatialLeft: null,
  countryArDetailsSpatialLeft: null,
  countyFrDetailsSpatialLeft: null,
  countyArDetailsSpatialLeft: null,
  postcodeFrDetailsSpatialLeft: null,
  postcodeArDetailsSpatialLeft: null,
  stateFrDetailsSpatialLeft: null,
  stateArDetailsSpatialLeft: null,
  stateDistrictFrDetailsSpatialLeft: null,
  stateDistrictArDetailsSpatialLeft: null,
  imageSidebarArDetailsSpatialLeft: null,

  checkboxLayersSpatialRight: "NDVI",
  clickEventCheckSpatialRight: true,
  AccusationDatesSpatialRight: null,
  SelectedDateSpatialRight: null,
  DetailVegetationLayersSpatialRight: null,
  taskIdDetailsSpatialRight: null,
  taskNameDetailsSpatialRight: null,
  surfaceDetailsSpatialRight: null,
  ageDetailsSpatialRight: null,
  cultureDetailsSpatialRight: null,
  textureDetailsSpatialRight: null,
  densityDetailsSpatialRight: null,
  varietyDetailsSpatialRight: null,
  irrigationTypeDetailsSpatialRight: null,
  salinityDetailsSpatialRight: null,
  efficiencyDetailsSpatialRight: null,
  countryFrDetailsSpatialRight: null,
  countryArDetailsSpatialRight: null,
  countyFrDetailsSpatialRight: null,
  countyArDetailsSpatialRight: null,
  postcodeFrDetailsSpatialRight: null,
  postcodeArDetailsSpatialRight: null,
  stateFrDetailsSpatialRight: null,
  stateArDetailsSpatialRight: null,
  stateDistrictFrDetailsSpatialRight: null,
  stateDistrictArDetailsSpatialRight: null,
  imageSidebarArDetailsSpatialRight: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case CHECKBOX_STATE_SUCCESS:
      return {
        ...state,
        checkboxLayers: payload,
      };
    case CHECKBOX_STATE_FAIL:
      return {
        ...state,
        checkboxLayers: null,
      };
    case LOADING_BEGIN:
      return {
        ...state,
        LoadingState: payload,
      };
    case LOADING_END:
      return {
        ...state,
        LoadingState: payload,
      };
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
    case AREA_SURFACE_SUCESS:
      return {
        ...state,
        AreaSurface: payload,
      };
    case AREA_SURFACE_FAIL:
      return {
        ...state,
        AreaSurface: null,
      };
    case NDVI_SUCESS:
      return {
        ...state,
        VegetationLayers: payload,
      };
    case DETAIL_TASK_SUCESS:
      return {
        ...state,
        DetailVegetationLayers: payload,
      };
    case DETAIL_TASK_SUCESS_SELECTED_DATE:
      return {
        ...state,
        selected_date: payload,
      };
    case DETAIL_TASK_FAIL:
      return {
        ...state,
        DetailVegetationLayers: null,
      };
    case NDVI_FAIL:
      return {
        ...state,
        VegetationLayers: null,
      };
    case SELECTED_DATE_SUCCESS:
      return {
        ...state,
        SelectedDate: payload,
      };
    case SELECTED_DATE_FAIL:
      return {
        ...state,
        SelectedDate: null,
      };
    case SELECTED_DATE_INITIAL_SUCCESS:
      return {
        ...state,
        SelectedDate: payload,
      };
    case SELECTED_DATE_INITIAL_FAIL:
      return {
        ...state,
        SelectedDate: null,
      };
    case ACCUSATION_DATES_SUCCESS:
      return {
        ...state,
        AccusationDates: payload,
      };
    case ACCUSATION_DATES_FAIL:
      return {
        ...state,
        AccusationDates: null,
      };
    case CLICK_EVENT_STATE_SUCCESS:
      return {
        ...state,
        clickEventCheck: true,
      };
    case CLICK_EVENT_STATE_FAIL:
      return {
        ...state,
        clickEventCheck: false,
      };
    case SET_DETAILS_TASK_FORM_SUCCESS:
      return {
        ...state,
        taskIdDetails: payload.id,
        taskNameDetails: payload.task_name,
        surfaceDetails: payload.surface,
        ageDetails: payload.age,
        plantationDateDetails: payload.plantation_date,
        nbTreeDetails: payload.nbTree,
        nbTreePerHectarDetails: payload.nbTreesPerHectare,
        intensificationplantationDateDetails: payload.intensification_date,
        cultureDetails: payload.culture,
        intensificationCultureDetails: payload.intensification_culture,
        intensificationDensityDetails: payload.intensification_density,
        textureDetails: payload.texture,
        densityDetails: payload.density,
        varietyDetails: payload.variety,
        intensificationVarietyDetails: payload.intensification_variety,
        irrigationTypeDetails: payload.irrigation,
        salinityDetails: payload.salinity,
        efficiencyDetails: payload.efficiency,

        countryFrDetails: payload.country_fr,
        countryArDetails: payload.country_ar,
        countyFrDetails: payload.county_fr,
        countyArDetails: payload.county_ar,
        postcodeFrDetails: payload.postcode_fr,
        postcodeArDetails: payload.postcode_ar,
        stateFrDetails: payload.state_fr,
        stateArDetails: payload.state_ar,
        stateDistrictFrDetails: payload.state_district_fr,
        stateDistrictArDetails: payload.state_district_ar,
        imageSidebarArDetails: payload.image_sidebar,
      };
    case SET_DETAILS_TASK_FORM_FAIL:
      return {
        ...state,
        taskIdDetails: null,
        taskNameDetails: null,
        surfaceDetails: null,
        ageDetails: null,
        plantationDateDetails: null,
        nbTreeDetails: null,
        nbTreePerHectarDetails: null,
        intensificationplantationDateDetails: null,
        cultureDetails: null,
        intensificationCultureDetails: null,
        intensificationDensityDetails: null,
        textureDetails: null,
        densityDetails: null,
        varietyDetails: null,
        intensificationVarietyDetails: null,
        irrigationTypeDetails: null,
        salinityDetails: null,
        efficiencyDetails: null,

        countryFrDetails: null,
        countryArDetails: null,
        countyFrDetails: null,
        countyArDetails: null,
        postcodeFrDetails: null,
        postcodeArDetails: null,
        stateFrDetails: null,
        stateArDetails: null,
        stateDistrictFrDetails: null,
        stateDistrictArDetails: null,
        imageSidebarArDetails: null,
      };
    case SET_TREE_COUNT_VALUE_SUCCESS:
      return {
        ...state,
        treeCountValue: payload,
      };
    case SET_TREE_COUNT_VALUE_FAIL:
      return {
        ...state,
        treeCountValue: null,
      };
    case SET_TREE_COUNT_ARRAY_SUCCESS:
      return {
        ...state,
        treeCountLocalIndicesArray: payload,
      };
    case SET_TREE_COUNT_ARRAY_FAIL:
      return {
        ...state,
        treeCountLocalIndicesArray: null,
      };
    case SET_IS_CHECKED_COUNT_CHECKBOX_SUCCESS:
      return {
        ...state,
        isCheckedCountCheckbox: 1,
      };
    case SET_IS_CHECKED_COUNT_CHECKBOX_FAIL:
      return {
        ...state,
        isCheckedCountCheckbox: 0,
      };
    case TASK_IMAGE_SIDEBAR_SUCCESS:
      return {
        ...state,
        imageSidebarArDetails: payload,
      };
    case TASK_IMAGE_SIDEBAR_FAIL:
      return {
        ...state,
        imageSidebarArDetails: null,
      };
    case CHECKBOX_STATE_SUCCESS_RIGHT:
      return {
        ...state,
        checkboxLayersRight: payload,
      };
    case CHECKBOX_STATE_FAIL_RIGHT:
      return {
        ...state,
        checkboxLayersRight: null,
      };
    case CLICK_EVENT_STATE_SUCCESS_RIGHT:
      return {
        ...state,
        clickEventCheckRight: true,
      };
    case CLICK_EVENT_STATE_FAIL_RIGHT:
      return {
        ...state,
        clickEventCheckRight: false,
      };
    case ACCUSATION_DATES_SUCCESS_RIGHT:
      return {
        ...state,
        AccusationDatesRight: payload,
      };
    case ACCUSATION_DATES_FAIL_RIGHT:
      return {
        ...state,
        AccusationDatesRight: null,
      };
    case SELECTED_DATE_SUCCESS_RIGHT:
      return {
        ...state,
        SelectedDateRight: payload,
      };
    case SELECTED_DATE_FAIL_RIGHT:
      return {
        ...state,
        SelectedDateRight: null,
      };
    case DETAIL_TASK_SUCESS_RIGHT:
      return {
        ...state,
        DetailVegetationLayersRight: payload,
      };
    case DETAIL_TASK_FAIL_RIGHT:
      return {
        ...state,
        DetailVegetationLayersRight: null,
      };
    case SET_DETAILS_TASK_FORM_SUCCESS_RIGHT:
      return {
        ...state,
        taskIdDetailsRight: payload.id,
        taskNameDetailsRight: payload.task_name,
        surfaceDetailsRight: payload.surface,
        ageDetailsRight: payload.age,
        cultureDetailsRight: payload.culture,
        textureDetailsRight: payload.texture,
        densityDetailsRight: payload.density,
        varietyDetailsRight: payload.variety,
        irrigationTypeDetailsRight: payload.irrigation,
        salinityDetailsRight: payload.salinity,
        efficiencyDetailsRight: payload.efficiency,

        countryFrDetailsRight: payload.country_fr,
        countryArDetailsRight: payload.country_ar,
        countyFrDetailsRight: payload.county_fr,
        countyArDetailsRight: payload.county_ar,
        postcodeFrDetailsRight: payload.postcode_fr,
        postcodeArDetailsRight: payload.postcode_ar,
        stateFrDetailsRight: payload.state_fr,
        stateArDetailsRight: payload.state_ar,
        stateDistrictFrDetailsRight: payload.state_district_fr,
        stateDistrictArDetailsRight: payload.state_district_ar,
        imageSidebarArDetailsRight: payload.image_sidebar,
      };
    case SET_DETAILS_TASK_FORM_FAIL_RIGHT:
      return {
        ...state,
        taskIdDetailsRight: null,
        taskNameDetailsRight: null,
        surfaceDetailsRight: null,
        ageDetailsRight: null,
        cultureDetailsRight: null,
        textureDetailsRight: null,
        densityDetailsRight: null,
        varietyDetailsRight: null,
        irrigationTypeDetailsRight: null,
        salinityDetailsRight: null,
        efficiencyDetailsRight: null,

        countryFrDetailsRight: null,
        countryArDetailsRight: null,
        countyFrDetailsRight: null,
        countyArDetailsRight: null,
        postcodeFrDetailsRight: null,
        postcodeArDetailsRight: null,
        stateFrDetailsRight: null,
        stateArDetailsRight: null,
        stateDistrictFrDetailsRight: null,
        stateDistrictArDetailsRight: null,
        imageSidebarArDetailsRight: null,
      };
    case SELECTED_DATE_INITIAL_SUCCESS_RIGHT:
      return {
        ...state,
        SelectedDateRight: payload,
      };
    case SELECTED_DATE_INITIAL_FAIL_RIGHT:
      return {
        ...state,
        SelectedDateRight: null,
      };

    case CHECKBOX_STATE_SUCCESS_LEFT:
      return {
        ...state,
        checkboxLayersLeft: payload,
      };
    case CHECKBOX_STATE_FAIL_LEFT:
      return {
        ...state,
        checkboxLayersLeft: null,
      };
    case CLICK_EVENT_STATE_SUCCESS_LEFT:
      return {
        ...state,
        clickEventCheckLeft: true,
      };
    case CLICK_EVENT_STATE_FAIL_LEFT:

      return {
        ...state,
        clickEventCheckLeft: false,
      };
    case ACCUSATION_DATES_SUCCESS_LEFT:

      return {
        ...state,
        AccusationDatesLeft: payload,
      };
    case ACCUSATION_DATES_FAIL_LEFT:

      return {
        ...state,
        AccusationDatesLeft: null,
      };
    case SELECTED_DATE_SUCCESS_LEFT:

      return {
        ...state,
        SelectedDateLeft: payload,
      };
    case SELECTED_DATE_FAIL_LEFT:

      return {
        ...state,
        SelectedDateLeft: null,
      };
    case DETAIL_TASK_SUCESS_LEFT:

      return {
        ...state,
        DetailVegetationLayersLeft: payload,
      };
    case DETAIL_TASK_FAIL_LEFT:

      return {
        ...state,
        DetailVegetationLayersLeft: null,
      };
    case SET_DETAILS_TASK_FORM_SUCCESS_LEFT:

      return {
        ...state,
        taskIdDetailsLeft: payload.id,
        taskNameDetailsLeft: payload.task_name,
        surfaceDetailsLeft: payload.surface,
        ageDetailsLeft: payload.age,
        cultureDetailsLeft: payload.culture,
        textureDetailsLeft: payload.texture,
        densityDetailsLeft: payload.density,
        varietyDetailsLeft: payload.variety,
        irrigationTypeDetailsLeft: payload.irrigation,
        salinityDetailsLeft: payload.salinity,
        efficiencyDetailsLeft: payload.efficiency,

        countryFrDetailsLeft: payload.country_fr,
        countryArDetailsLeft: payload.country_ar,
        countyFrDetailsLeft: payload.county_fr,
        countyArDetailsLeft: payload.county_ar,
        postcodeFrDetailsLeft: payload.postcode_fr,
        postcodeArDetailsLeft: payload.postcode_ar,
        stateFrDetailsLeft: payload.state_fr,
        stateArDetailsLeft: payload.state_ar,
        stateDistrictFrDetailsLeft: payload.state_district_fr,
        stateDistrictArDetailsLeft: payload.state_district_ar,
        imageSidebarArDetailsLeft: payload.image_sidebar,
      };
    case SET_DETAILS_TASK_FORM_FAIL_LEFT:

      return {
        ...state,
        taskIdDetailsLeft: null,
        taskNameDetailsLeft: null,
        surfaceDetailsLeft: null,
        ageDetailsLeft: null,
        cultureDetailsLeft: null,
        textureDetailsLeft: null,
        densityDetailsLeft: null,
        varietyDetailsLeft: null,
        irrigationTypeDetailsLeft: null,
        salinityDetailsLeft: null,
        efficiencyDetailsLeft: null,

        countryFrDetailsLeft: null,
        countryArDetailsLeft: null,
        countyFrDetailsLeft: null,
        countyArDetailsLeft: null,
        postcodeFrDetailsLeft: null,
        postcodeArDetailsLeft: null,
        stateFrDetailsLeft: null,
        stateArDetailsLeft: null,
        stateDistrictFrDetailsLeft: null,
        stateDistrictArDetailsLeft: null,
        imageSidebarArDetailsLeft: null,
      };
    case SELECTED_DATE_INITIAL_SUCCESS_LEFT:

      return {
        ...state,
        SelectedDateLeft: payload,
      };
    case SELECTED_DATE_INITIAL_FAIL_LEFT:

      return {
        ...state,
        SelectedDateLeft: null,
      };
      case CHECKBOX_DEM_STATE_SUCCESS:
      return {
        ...state,
        demCheckboxState: payload,
      };
    case CHECKBOX_DEM_STATE_FAIL:
      return {
        ...state,
        demCheckboxState: null,
      };




    case CHECKBOX_STATE_SUCCESS_SPATIAL_RIGHT:
      return {
        ...state,
        checkboxLayersSpatialRight: payload,
      };
    case CHECKBOX_STATE_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        checkboxLayersSpatialRight: null,
      };
    case CLICK_EVENT_STATE_SUCCESS_SPATIAL_RIGHT:
      return {
        ...state,
        clickEventCheckSpatialRight: true,
      };
    case CLICK_EVENT_STATE_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        clickEventCheckSpatialRight: false,
      };
    case ACCUSATION_DATES_SUCCESS_SPATIAL_RIGHT:
      return {
        ...state,
        AccusationDatesSpatialRight: payload,
      };
    case ACCUSATION_DATES_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        AccusationDatesSpatialRight: null,
      };
    case SELECTED_DATE_SUCCESS_SPATIAL_RIGHT:
      return {
        ...state,
        SelectedDateSpatialRight: payload,
      };
    case SELECTED_DATE_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        SelectedDateSpatialRight: null,
      };
    case DETAIL_TASK_SUCESS_SPATIAL_RIGHT:
      return {
        ...state,
        DetailVegetationLayersSpatialRight: payload,
      };
    case DETAIL_TASK_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        DetailVegetationLayersSpatialRight: null,
      };
    case SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_RIGHT:
      return {
        ...state,
        taskIdDetailsSpatialRight: payload.id,
        taskNameDetailsSpatialRight: payload.task_name,
        surfaceDetailsSpatialRight: payload.surface,
        ageDetailsSpatialRight: payload.age,
        cultureDetailsSpatialRight: payload.culture,
        textureDetailsSpatialRight: payload.texture,
        densityDetailsSpatialRight: payload.density,
        varietyDetailsSpatialRight: payload.variety,
        irrigationTypeDetailsSpatialRight: payload.irrigation,
        salinityDetailsSpatialRight: payload.salinity,
        efficiencyDetailsSpatialRight: payload.efficiency,

        countryFrDetailsSpatialRight: payload.country_fr,
        countryArDetailsSpatialRight: payload.country_ar,
        countyFrDetailsSpatialRight: payload.county_fr,
        countyArDetailsSpatialRight: payload.county_ar,
        postcodeFrDetailsSpatialRight: payload.postcode_fr,
        postcodeArDetailsSpatialRight: payload.postcode_ar,
        stateFrDetailsSpatialRight: payload.state_fr,
        stateArDetailsSpatialRight: payload.state_ar,
        stateDistrictFrDetailsSpatialRight: payload.state_district_fr,
        stateDistrictArDetailsSpatialRight: payload.state_district_ar,
        imageSidebarArDetailsSpatialRight: payload.image_sidebar,
      };
    case SET_DETAILS_TASK_FORM_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        taskIdDetailsSpatialRight: null,
        taskNameDetailsSpatialRight: null,
        surfaceDetailsSpatialRight: null,
        ageDetailsSpatialRight: null,
        cultureDetailsSpatialRight: null,
        textureDetailsSpatialRight: null,
        densityDetailsSpatialRight: null,
        varietyDetailsSpatialRight: null,
        irrigationTypeDetailsSpatialRight: null,
        salinityDetailsSpatialRight: null,
        efficiencyDetailsSpatialRight: null,

        countryFrDetailsSpatialRight: null,
        countryArDetailsSpatialRight: null,
        countyFrDetailsSpatialRight: null,
        countyArDetailsSpatialRight: null,
        postcodeFrDetailsSpatialRight: null,
        postcodeArDetailsSpatialRight: null,
        stateFrDetailsSpatialRight: null,
        stateArDetailsSpatialRight: null,
        stateDistrictFrDetailsSpatialRight: null,
        stateDistrictArDetailsSpatialRight: null,
        imageSidebarArDetailsSpatialRight: null,
      };
    case SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_RIGHT:
      return {
        ...state,
        SelectedDateSpatialRight: payload,
      };
    case SELECTED_DATE_INITIAL_FAIL_SPATIAL_RIGHT:
      return {
        ...state,
        SelectedDateSpatialRight: null,
      };



    case CHECKBOX_STATE_SUCCESS_SPATIAL_LEFT:
      return {
        ...state,
        checkboxLayersSpatialLeft: payload,
      };
    case CHECKBOX_STATE_FAIL_SPATIAL_LEFT:
      return {
        ...state,
        checkboxLayersSpatialLeft: null,
      };
    case CLICK_EVENT_STATE_SUCCESS_SPATIAL_LEFT:
      return {
        ...state,
        clickEventCheckSpatialLeft: true,
      };
    case CLICK_EVENT_STATE_FAIL_SPATIAL_LEFT:

      return {
        ...state,
        clickEventCheckSpatialLeft: false,
      };
    case ACCUSATION_DATES_SUCCESS_SPATIAL_LEFT:

      return {
        ...state,
        AccusationDatesSpatialLeft: payload,
      };
    case ACCUSATION_DATES_FAIL_SPATIAL_LEFT:

      return {
        ...state,
        AccusationDatesSpatialLeft: null,
      };
    case SELECTED_DATE_SUCCESS_SPATIAL_LEFT:

      return {
        ...state,
        SelectedDateSpatialLeft: payload,
      };
    case SELECTED_DATE_FAIL_SPATIAL_LEFT:

      return {
        ...state,
        SelectedDateSpatialLeft: null,
      };
    case DETAIL_TASK_SUCESS_SPATIAL_LEFT:

      return {
        ...state,
        DetailVegetationLayersSpatialLeft: payload,
      };
    case DETAIL_TASK_FAIL_SPATIAL_LEFT:

      return {
        ...state,
        DetailVegetationLayersSpatialLeft: null,
      };
    case SET_DETAILS_TASK_FORM_SUCCESS_SPATIAL_LEFT:

      return {
        ...state,
        taskIdDetailsSpatialLeft: payload.id,
        taskNameDetailsSpatialLeft: payload.task_name,
        surfaceDetailsSpatialLeft: payload.surface,
        ageDetailsSpatialLeft: payload.age,
        cultureDetailsSpatialLeft: payload.culture,
        textureDetailsSpatialLeft: payload.texture,
        densityDetailsSpatialLeft: payload.density,
        varietyDetailsSpatialLeft: payload.variety,
        irrigationTypeDetailsSpatialLeft: payload.irrigation,
        salinityDetailsSpatialLeft: payload.salinity,
        efficiencyDetailsSpatialLeft: payload.efficiency,

        countryFrDetailsSpatialLeft: payload.country_fr,
        countryArDetailsSpatialLeft: payload.country_ar,
        countyFrDetailsSpatialLeft: payload.county_fr,
        countyArDetailsSpatialLeft: payload.county_ar,
        postcodeFrDetailsSpatialLeft: payload.postcode_fr,
        postcodeArDetailsSpatialLeft: payload.postcode_ar,
        stateFrDetailsSpatialLeft: payload.state_fr,
        stateArDetailsSpatialLeft: payload.state_ar,
        stateDistrictFrDetailsSpatialLeft: payload.state_district_fr,
        stateDistrictArDetailsSpatialLeft: payload.state_district_ar,
        imageSidebarArDetailsSpatialLeft: payload.image_sidebar,
      };
    case SET_DETAILS_TASK_FORM_FAIL_SPATIAL_LEFT:

      return {
        ...state,
        taskIdDetailsSpatialLeft: null,
        taskNameDetailsSpatialLeft: null,
        surfaceDetailsSpatialLeft: null,
        ageDetailsSpatialLeft: null,
        cultureDetailsSpatialLeft: null,
        textureDetailsSpatialLeft: null,
        densityDetailsSpatialLeft: null,
        varietyDetailsSpatialLeft: null,
        irrigationTypeDetailsSpatialLeft: null,
        salinityDetailsSpatialLeft: null,
        efficiencyDetailsSpatialLeft: null,

        countryFrDetailsSpatialLeft: null,
        countryArDetailsSpatialLeft: null,
        countyFrDetailsSpatialLeft: null,
        countyArDetailsSpatialLeft: null,
        postcodeFrDetailsSpatialLeft: null,
        postcodeArDetailsSpatialLeft: null,
        stateFrDetailsSpatialLeft: null,
        stateArDetailsSpatialLeft: null,
        stateDistrictFrDetailsSpatialLeft: null,
        stateDistrictArDetailsSpatialLeft: null,
        imageSidebarArDetailsSpatialLeft: null,
      };
    case SELECTED_DATE_INITIAL_SUCCESS_SPATIAL_LEFT:

      return {
        ...state,
        SelectedDateSpatialLeft: payload,
      };
    case SELECTED_DATE_INITIAL_FAIL_SPATIAL_LEFT:

      return {
        ...state,
        SelectedDateSpatialLeft: null,
      };
    default:
      return {
        ...state,
      };
  }
}
