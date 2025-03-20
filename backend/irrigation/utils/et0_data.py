import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
from datetime import datetime, timedelta
import json

cache_session = requests_cache.CachedSession('.cache', expire_after = -1)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

api_url = "https://archive-api.open-meteo.com/v1/archive"

end_date_year = datetime.now().year - 1

end_date = datetime.strptime(f"31-12-{end_date_year}","%d-%m-%Y")

start_date = (end_date - timedelta(days=365 * 10))

end_date_str = end_date.strftime("%Y-%m-%d")
start_date_str = start_date.strftime("%Y-%m-%d")

def get_et0_data(location_pt):
    
    params = {
    "latitude": location_pt[0],
    "longitude": location_pt[1],
    "start_date": start_date_str,
    "end_date": end_date_str,
    "daily": "et0_fao_evapotranspiration"
    }
    try:
        responses = openmeteo.weather_api(api_url, params=params)
    
        daily_data = responses[0].Daily()
        daily_et0_fao_evapotranspiration = daily_data.Variables(0).ValuesAsNumpy()

        daily_data_data = {"date": pd.date_range(
            start = pd.to_datetime(daily_data.Time(), unit = "s", utc = True),
            end = pd.to_datetime(daily_data.TimeEnd(), unit = "s", utc = True),
            freq = pd.Timedelta(seconds = daily_data.Interval()),
            inclusive = "left"
        )}


        daily_data_data["et0"] = daily_et0_fao_evapotranspiration
        
        
        data_list = []
        
        for i,val in enumerate(daily_data_data["date"]):
            # data_list.append({"date":daily_data_data['date'][i], "et0":daily_data_data['et0'][i]})
            # data_list.append({"date":daily_data_data['date'][i], "et0":daily_et0_fao_evapotranspiration[i]})
            data_list.append({"date":val, "et0":daily_et0_fao_evapotranspiration[i]})
    except Exception as e:
        data_list = None
        
    # daily_et0_df = pd.DataFrame(data = daily_data_data)
        
    return data_list