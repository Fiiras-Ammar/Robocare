import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, UNSAFE_NavigationContext } from "react-router-dom";
import Activate from "./containers/Activate";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import ResetPassword from "./containers/ResetPassword";
import ResetPaswwordConfirm from "./containers/ResetPasswordConfirm";
import Layout from "./hocs/Layout";
import { Provider } from "react-redux";
import { store } from "./store";
import DashboardMUI from "./containers/Dashboard";
import "./assets/css/style.css";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import icon from "./assets/images/favicon.ico";
import AddTask from "./components/task/add";
import DetailsTask from "./components/task/details";
import SnackBarAlert from "./utils/SnackBarAlert";
import CalendarDashboard from "./components/task/calendar/CalendarDashboard.js";
import PublicRoutes from "./utils/PublicRoutes.js";
import { colormap } from "./utils/colorMap.js";
import Pricing from "./components/pricing/Pricing";
import Quote from "./components/quote/Quote";
import ComparisonTask from "./components/ComparisonTask/ComparisonTask";
import CompareTaskSpacial from "./components/CompareTaskSpatial/CompareSpatialTask";
import {checkAuthenticated} from "./actions/auth";

const App = () => {
  useEffect(() => {
    const favicon = document.getElementById("favicon");
    favicon.setAttribute("href", icon);
  }, []);

  const histogramData = [
    {
      min: -1.0,
      max: 1,
      histogram: [
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 8, 7, 9, 5, 7, 8, 8, 9, 13, 18,
          10, 11, 6, 14, 9, 11, 8, 6, 3, 10, 7, 10, 7, 2, 9, 8, 6, 5, 4, 8, 5,
          7, 7, 6, 5, 10, 10, 11, 6, 14, 8, 13, 12, 21, 24, 27, 23, 21, 23, 33,
          36, 22, 46, 44, 41, 45, 42, 40, 40, 36, 32, 58, 50, 44, 47, 55, 54,
          52, 50, 41, 49, 43, 43, 44, 49, 49, 38, 35, 31, 35, 17, 25, 19, 18,
          15, 22, 13, 8, 14, 19, 11, 16, 11, 12, 12, 13, 8, 6, 6, 0, 2, 5, 3, 1,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0,
        ],
        [
          -1.0, -0.9921875, -0.984375, -0.9765625, -0.96875, -0.9609375,
          -0.953125, -0.9453125, -0.9375, -0.9296875, -0.921875, -0.9140625,
          -0.90625, -0.8984375, -0.890625, -0.8828125, -0.875, -0.8671875,
          -0.859375, -0.8515625, -0.84375, -0.8359375, -0.828125, -0.8203125,
          -0.8125, -0.8046875, -0.796875, -0.7890625, -0.78125, -0.7734375,
          -0.765625, -0.7578125, -0.75, -0.7421875, -0.734375, -0.7265625,
          -0.71875, -0.7109375, -0.703125, -0.6953125, -0.6875, -0.6796875,
          -0.671875, -0.6640625, -0.65625, -0.6484375, -0.640625, -0.6328125,
          -0.625, -0.6171875, -0.609375, -0.6015625, -0.59375, -0.5859375,
          -0.578125, -0.5703125, -0.5625, -0.5546875, -0.546875, -0.5390625,
          -0.53125, -0.5234375, -0.515625, -0.5078125, -0.5, -0.4921875,
          -0.484375, -0.4765625, -0.46875, -0.4609375, -0.453125, -0.4453125,
          -0.4375, -0.4296875, -0.421875, -0.4140625, -0.40625, -0.3984375,
          -0.390625, -0.3828125, -0.375, -0.3671875, -0.359375, -0.3515625,
          -0.34375, -0.3359375, -0.328125, -0.3203125, -0.3125, -0.3046875,
          -0.296875, -0.2890625, -0.28125, -0.2734375, -0.265625, -0.2578125,
          -0.25, -0.2421875, -0.234375, -0.2265625, -0.21875, -0.2109375,
          -0.203125, -0.1953125, -0.1875, -0.1796875, -0.171875, -0.1640625,
          -0.15625, -0.1484375, -0.140625, -0.1328125, -0.125, -0.1171875,
          -0.109375, -0.1015625, -0.09375, -0.0859375, -0.078125, -0.0703125,
          -0.0625, -0.0546875, -0.046875, -0.0390625, -0.03125, -0.0234375,
          -0.015625, -0.0078125, 0.0, 0.0078125, 0.015625, 0.0234375, 0.03125,
          0.0390625, 0.046875, 0.0546875, 0.0625, 0.0703125, 0.078125,
          0.0859375, 0.09375, 0.1015625, 0.109375, 0.1171875, 0.125, 0.1328125,
          0.140625, 0.1484375, 0.15625, 0.1640625, 0.171875, 0.1796875, 0.1875,
          0.1953125, 0.203125, 0.2109375, 0.21875, 0.2265625, 0.234375,
          0.2421875, 0.25, 0.2578125, 0.265625, 0.2734375, 0.28125, 0.2890625,
          0.296875, 0.3046875, 0.3125, 0.3203125, 0.328125, 0.3359375, 0.34375,
          0.3515625, 0.359375, 0.3671875, 0.375, 0.3828125, 0.390625, 0.3984375,
          0.40625, 0.4140625, 0.421875, 0.4296875, 0.4375, 0.4453125, 0.453125,
          0.4609375, 0.46875, 0.4765625, 0.484375, 0.4921875, 0.5, 0.5078125,
          0.515625, 0.5234375, 0.53125, 0.5390625, 0.546875, 0.5546875, 0.5625,
          0.5703125, 0.578125, 0.5859375, 0.59375, 0.6015625, 0.609375,
          0.6171875, 0.625, 0.6328125, 0.640625, 0.6484375, 0.65625, 0.6640625,
          0.671875, 0.6796875, 0.6875, 0.6953125, 0.703125, 0.7109375, 0.71875,
          0.7265625, 0.734375, 0.7421875, 0.75, 0.7578125, 0.765625, 0.7734375,
          0.78125, 0.7890625, 0.796875, 0.8046875, 0.8125, 0.8203125, 0.828125,
          0.8359375, 0.84375, 0.8515625, 0.859375, 0.8671875, 0.875, 0.8828125,
          0.890625, 0.8984375, 0.90625, 0.9140625, 0.921875, 0.9296875, 0.9375,
          0.9453125, 0.953125, 0.9609375, 0.96875, 0.9765625, 0.984375,
          0.9921875, 1,
        ],
      ],
      percentile: [0.0457358427961934, 0.7439802942536936],
    },
  ];

  // Google Client ID (replace with your own or use an environment variable)
  const GOOGLE_CLIENT_ID = '218668211013-h0v9r6on4pu4t698h2udbh8s6vugo3g4.apps.googleusercontent.com';
  useEffect(() => {
    const initializeAuth = async () => {
      await store.dispatch(checkAuthenticated());
    };
    
    initializeAuth();
  }, []);
  return (
    <Provider store={store}>
      <SnackBarAlert />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route element={<PublicRoutes />}>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/quote" element={<Quote />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/password/reset/confirm/:uid/:token"
                element={<ResetPaswwordConfirm />}
              />
              <Route path="/test" element={<CalendarDashboard />} />
              <Route path="/activate/:uid/:token" element={<Activate />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route path="/dashboard/*" element={<DashboardMUI />} />
              <Route
                path="/task/add/:project_name/:id_project"
                element={<AddTask />}
              />
              <Route path="/task/detail/:id_task" element={<DetailsTask />} />
              <Route path="/task/detail/:id_task/comparison/task" element={<ComparisonTask />} />
              <Route path="/task/detail/:id_task/comparison/task/spatial" element={<CompareTaskSpacial />} />
            </Route>
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
};


export default App;