from ..models import (
    Task,
    GraphData,
    DataForecast,
    Alert,
    ForecastAlert,
    IndexForecast
)
from django.utils import timezone
# from ..views import retrieve_pattern_data
import datetime
import pandas as pd
import os

def create_alert(data_point,forecast_instance, interpolated_forecast_dates, interpolated_daily_forecast_data, task):
    try:
        
        ndvi_date = datetime.datetime.strptime(data_point['date'], '%Y-%m-%d').strftime("%Y-%m-%d")
        ndvi_value = data_point['value']
        cloud_percentage = data_point['cloud_percentage']
        user_id = task.project.user.id
                
        if((ndvi_date in interpolated_forecast_dates) and (cloud_percentage <= 20)):
            matching_forecast_date_index = interpolated_forecast_dates.index(ndvi_date)
            # matching_ndvi_value_in_forecast = interpolated_daily_forecast_data[matching_forecast_date_index]
                                
            # forecast_date = interpolated_daily_forecast_data[matching_forecast_date_index]['date']
            # ndvi_graph_value = ndvi_value
            
            forecast_value = interpolated_daily_forecast_data[matching_forecast_date_index]['value']
            difference = round(ndvi_value  - forecast_value, 4)
            
            if(difference >= 0 and user_id == 154):
                return
                
            alert_index = "ndvi"
            
            if(difference >= 0.08 or difference <= -0.08):
                
                print("Generating forecast alert instance")
                description = "NDVI level exceeds the forecasted value" if difference >= 0.08 else "NDVI level is below the forecasted value"
            
                time = datetime.datetime.strptime(data_point['date'], "%Y-%m-%d")
                
                ForecastAlert.objects.create(
                    task = task,
                    time = timezone.make_aware(time, timezone.get_current_timezone()),
                    viewed = False,
                    description = description,
                    context = forecast_instance,
                    index = alert_index,
                    measured_value = ndvi_value,
                    reference_value = forecast_value,
                    difference = difference,
                )    

    except Exception as e:
        print(e)
            
def generate_forecast_alerts_for_new_graph_data(graph_data_instance, new_instance):
    current_year = datetime.datetime.today().year
    try:
        ndvi_data = [obj for obj in graph_data_instance.data if (datetime.datetime.strptime(obj['date'], "%Y-%m-%d").year == current_year)]
  
        task = graph_data_instance.task
        
        # task_pattern_data, pattern_instance = retrieve_pattern_data(task.id)
        
        forecast_data = IndexForecast.objects.get(task=task.id, index='ndvi')
        neural_meta_cast = forecast_data.neural_meta_predict
        neural_meta_cast = pd.DataFrame(neural_meta_cast)
        
        neural_meta_cast["date"] = pd.to_datetime(neural_meta_cast["date"])
        
        # neural_meta_cast = neural_meta_cast[(neural_meta_cast['date'] >= start_date) & (neural_meta_cast['date'] <= end_date)]

        # Now set 'date' as the DataFrame index
        neural_meta_cast.set_index("date", inplace=True)
            
        interpolated_daily_forecast_data = neural_meta_cast.reindex(pd.date_range(start=neural_meta_cast.index.min(), end=neural_meta_cast.index.max(), freq='D')).interpolate(method='linear')
        interpolated_daily_forecast_data = interpolated_daily_forecast_data.reset_index()
        interpolated_daily_forecast_data['date']  = interpolated_daily_forecast_data['index'].dt.strftime("%Y-%m-%d")
        interpolated_daily_forecast_data = interpolated_daily_forecast_data.to_dict(orient="records")
        
        
        interpolated_forecast_dates = [obj['date'] for obj in interpolated_daily_forecast_data]
        latest_ndvi_data_point = list(ndvi_data)[-1]
        
        if(new_instance):
            for data_point in ndvi_data:  
                # print(f"############### generating forecast alerts for new instance {data_point}#############")
                create_alert(data_point,forecast_data, interpolated_forecast_dates,interpolated_daily_forecast_data, task)
        else:
            # print(f"############### generating forecast alerts for updated data {latest_ndvi_data_point} #############")
            create_alert(latest_ndvi_data_point,forecast_data, interpolated_forecast_dates,interpolated_daily_forecast_data, task)
                    
    except Exception as e:
        print(e)            
        

def generate_forecast_alerts_for_new_forecast(forecast_instance):
    print("generating alerts for new forecast")
    try:
        task = forecast_instance.task
        
        task_graph_data = GraphData.objects.get(task=task, index="ndvi")
        generate_forecast_alerts_for_new_graph_data(graph_data_instance=task_graph_data, new_instance=True)
    
    except Exception as e:
        print(e)
        
    
