import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkAuthenticated,
  load_user,
  refreshToken,
  setUpRefreshInterval,
} from "../actions/auth.js";

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const rememberMeState = useSelector((state) => state.auth.rememberMe);

  useEffect(() => {
    dispatch(refreshToken());
    dispatch(checkAuthenticated());
    dispatch(load_user());
  }, [dispatch]);

  useEffect(() => {
    if (!rememberMeState) return;

    dispatch(setUpRefreshInterval());
  }, [rememberMeState]);
  return (
    <div>
      {/* <Navbar /> */}
      {children}
    </div>
  );
};

export default Layout;
