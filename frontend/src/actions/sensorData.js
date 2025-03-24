import axiosInstance from '../utils/axiosConfig.js'
import {
    TASK_WEATHER_SUCCESS,
    TASK_WEATHER_FAIL,
    DETAIL_TASK_SUCESS,
    DETAIL_TASK_FAIL
} from '../utils/types.js'

export const getSensorData = (task_id) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    const apiUrl = `${process.env.REACT_APP_API_URL}/api/sensor-data/list/${task_id}`
    
    try {
        const res = await axiosInstance.get(`${apiUrl}`, config);
        if (res.status === 200) {
            // dispatch({
            //     type: TASK_WEATHER_SUCCESS,
            //     payload: res.data
            // })

            return res;
        } else {
            // dispatch({
            //     type: TASK_WEATHER_FAIL
            // })
        }
        return res
    } catch (err) {
        return err
    }
}



// export const getTaskForecast = (lat, lng) => async dispatch => {
//     const config = {
//         headers: {
//             'Content-Type': 'application/json',
//         }
//     }

//     const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max,weather_code,et0_fao_evapotranspiration&forecast_days=16`;

//     try {
//         const res = await axiosInstance.get(`${apiUrl}`, config);
//         if (res.status === 200) {
//             dispatch({
//                 type: TASK_WEATHER_SUCCESS,
//                 payload: res.data
//             })

//             return res.data;
//         } else {
//             dispatch({
//                 type: TASK_WEATHER_FAIL
//             })
//         }
//         return res
//     } catch (err) {
//         dispatch({
//             type: TASK_WEATHER_FAIL
//         })
//     }

// }

// export const Detail_Task_Map = (id) => async dispatch => {

//     const config = {
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     }
//     try {
//         const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/task/map/${id}/`, config);

//         dispatch({
//             type: DETAIL_TASK_SUCESS,
//             payload: res.data.data
//         })
//         return res
//     } catch (err) {
//         dispatch({
//             type: DETAIL_TASK_FAIL
//         })
//         return err
//     }
// }

// export const getTaskWeather = (lat, lng) => async dispatch => {
//     const config = {
//         headers: {
//             'Content-Type': 'application/json',
//         }
//     }

//     const apiKey = "36a6378349df7d5824ea0e58deb42342";
//     const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
//     // axiosInstance.get(`${apiUrl}&appid=${apiKey}`).then(displayWeatherInfo);

//     try {
//         const res = await axiosInstance.get(`${apiUrl}`, config);
//         if (res.status === 200) {
//             dispatch({
//                 type: TASK_WEATHER_SUCCESS,
//                 payload: res.data
//             })

//             return res.data;
//         } else {
//             dispatch({
//                 type: TASK_WEATHER_FAIL
//             })
//         }
//         return res
//     } catch (err) {
//         dispatch({
//             type: TASK_WEATHER_FAIL
//         })
//     }

// }
