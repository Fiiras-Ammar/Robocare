import { combineReducers } from "redux";
import auth from "./auth";
import mapReducer from "./mapReducer";

export default combineReducers({
    auth,
    mapReducer
})