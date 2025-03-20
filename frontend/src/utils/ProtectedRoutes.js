import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuthenticated } from '../actions/auth';
import { store } from '../store';
import Loading from '../components/Loading';


const ProtectedRoutes = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const [checked, setChecked] = useState(false);
  
    useEffect(() => {
      const verifyAuth = async () => {
        await store.dispatch(checkAuthenticated());
        setChecked(true);
      };
      
      if (!isAuthenticated) verifyAuth();
      else setChecked(true);
    }, []);
  
    if (!checked) return <Loading />; // Show loading component
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  };
export default ProtectedRoutes;
