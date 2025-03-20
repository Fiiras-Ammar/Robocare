import { configureStore,getDefaultMiddleware  } from "@reduxjs/toolkit";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import auth from "./reducers/auth.js";
import mapReducer from "./reducers/mapReducer.js";
import snackbarReducer from "./reducers/snackbarReducer.js";
import requestHighResolution from "./reducers/requestHighResolution.js";
import highResolutionServiceState from "./reducers/highResolutionServiceState.js";
import irrigationCalendarState from "./reducers/irrigationReducer.js";
import noteReducer from "./reducers/noteReducer.js";
import graphReducer from "./reducers/graphReducer.js";
import selectedProjectReducer from "./reducers/selectedProjectReducer.js";
import notificationReducer from "./reducers/notificationReducer.js";
import histogramReducer from "./reducers/histogramReducer.js";
import calendarReducer from "./reducers/calendarReducer.js";
import highResOrdersReducer from "./reducers/highResOrders.js";
import activePanelReducer from "./reducers/activePanelReducer";
const initialState = {};
const authPersistConfig = {
  key: "auth",
  version: 1,
  storage,
};
const selectedProjectPersistConfig = {
  key: "selectedProjectReducer",
  version: 1,
  storage,
};
// const middleware = [thunk];
const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: {
    ignoredActions: [
      "persist/PERSIST",
      "persist/REHYDRATE",
      "persist/PAUSE",
      "persist/PURGE",
      "persist/FLUSH",
      "persist/REGISTER",
    ],
  },
}).concat(thunk);
const persistAuthReducer = persistReducer(authPersistConfig, auth);
const persistSelectedProjectReducer = persistReducer(
    selectedProjectPersistConfig,
    selectedProjectReducer
);
const store = configureStore({
  reducer: {
    auth: persistAuthReducer,
    selectedProjectReducer: persistSelectedProjectReducer,
    mapReducer: mapReducer,
    snackbarReducer: snackbarReducer,
    requestReducer: requestHighResolution,
    highResServiceReducer: highResolutionServiceState,
    irrigationCalendarReducer: irrigationCalendarState,
    noteReducer: noteReducer,
    graphReducer: graphReducer,
    notificationReducer: notificationReducer,
    histogramReducer: histogramReducer,
    calendarReducer: calendarReducer,
    highResOrdersReducer: highResOrdersReducer,
    activePanelReducer: activePanelReducer,
  },
  preloadedState: initialState,
  middleware: customizedMiddleware,
  devTools:
      process.env.NODE_ENV !== "production" ? composeWithDevTools() : undefined,
});
const persistor = persistStore(store);

export { store, persistor };
