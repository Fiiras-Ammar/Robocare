import axiosInstance from '../utils/axiosConfig';
import {
    TASK_WEATHER_SUCCESS,
    TASK_WEATHER_FAIL,
    DETAIL_TASK_SUCESS,
    DETAIL_TASK_FAIL
} from '../utils/types'

export const getTaskHistory = (lat, lng, start_date, end_date) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    const apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start_date}&end_date=${end_date}&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max,et0_fao_evapotranspiration,temperature_2m_mean`;

    try {
        const res = await axiosInstance.get(`${apiUrl}`, config);
        if (res.status === 200) {
            dispatch({
                type: TASK_WEATHER_SUCCESS,
                payload: res.data
            })

            return res.data;
        } else {
            dispatch({
                type: TASK_WEATHER_FAIL
            })
        }
        return res
    } catch (err) {
        return err
    }
}

export const getTaskForecast = (lat, lng) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max,weather_code,et0_fao_evapotranspiration&forecast_days=16`;

    try {
        const res = await axiosInstance.get(`${apiUrl}`, config);
        if (res.status === 200) {
            dispatch({
                type: TASK_WEATHER_SUCCESS,
                payload: res.data
            })

            return res.data;
        } else {
            dispatch({
                type: TASK_WEATHER_FAIL
            })
        }
        return res
    } catch (err) {
        dispatch({
            type: TASK_WEATHER_FAIL
        })
    }

}

export const Detail_Task_Map = (id) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/task/map/${id}/`, config);
        return res
    } catch (err) {
        dispatch({
            type: DETAIL_TASK_FAIL
        })
        return err
    }
}

export const getTaskWeather = (lat, lng) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    const apiKey = "36a6378349df7d5824ea0e58deb42342";
    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    // axiosInstance.get(`${apiUrl}&appid=${apiKey}`).then(displayWeatherInfo);

    try {
        const res = await axiosInstance.get(`${apiUrl}`, config);
        if (res.status === 200) {
            dispatch({
                type: TASK_WEATHER_SUCCESS,
                payload: res.data
            })

            return res.data;
        } else {
            dispatch({
                type: TASK_WEATHER_FAIL
            })
        }
        return res
    } catch (err) {
        dispatch({
            type: TASK_WEATHER_FAIL
        })
    }

}

export const getTaskForecastWithPeriod = (lat, lng,start_date,end_date) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max,weather_code,et0_fao_evapotranspiration&start_date=${start_date}&end_date=${end_date}`;

    try {
        const res = await axiosInstance.get(`${apiUrl}`, config);

        return res.data

    } catch (err) {
        return err

    }

}
