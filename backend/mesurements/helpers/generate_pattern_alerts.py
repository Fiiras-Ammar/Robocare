from ..models import (
    Task,
    GraphData,
    Alert,
    PatternAlert,
    PatternSelfAlert
)
from django.utils import timezone
from ..views import retrieve_pattern_data
import datetime
import pandas as pd
import os

def create_alert(data_point,pattern_instance, interpolated_pattern_dates, interpolated_daily_pattern_data, task):
    try:
        print("dates !!!! ", pattern_instance._meta.model_name)
        ndvi_date = datetime.datetime.strptime(data_point['date'], '%Y-%m-%d').strftime("%m-%d")
        ndvi_value = data_point['value']
        cloud_percentage = data_point['cloud_percentage']
        user_id = task.project.user.id
        
        
        
        if((ndvi_date in interpolated_pattern_dates) and (cloud_percentage <= 20)):
            matching_pattern_date_index = interpolated_pattern_dates.index(ndvi_date)
            matching_ndvi_value_in_pattern = interpolated_daily_pattern_data[matching_pattern_date_index]
                                
            pattern_date = interpolated_daily_pattern_data[matching_pattern_date_index]['date']
            ndvi_graph_value = ndvi_value
            patt_value = interpolated_daily_pattern_data[matching_pattern_date_index]['value']
            
            pattern_type = "auto pattern" if pattern_instance._meta.model_name == "patternself" else  "preset pattern"
            
            if(pattern_type == "auto pattern"):
                print("alert for auto pattern !!!!!!!!!!!!!!!!!!!!!!!!!")
                print(pattern_instance)
                
            difference = round(ndvi_value  - patt_value, 4)
            
            if(difference >= 0 and user_id == 154):
                return
            
            alert_index = "ndvi"
            
            if(difference >= 0.08 or difference <= -0.08):
                description = f"NDVI level exceeds the {pattern_type}" if difference >= 0.08 else f"NDVI level is below the {pattern_type}"
                if (pattern_type == "preset pattern"):
                
                    print(f"############### alerts detected !!!!! for new {pattern_type} instance {data_point}#############")
                    
                    
                    time = datetime.datetime.strptime(data_point['date'], "%Y-%m-%d")
                    
                    PatternAlert.objects.create(
                        task = task,
                        time = timezone.make_aware(time, timezone.get_current_timezone()),
                        viewed = False,
                        description = description,
                        context = pattern_instance,
                        index = alert_index,
                        measured_value = ndvi_value,
                        reference_value = patt_value,
                        difference = difference,
                    )   
                else:
                    print(f"############### alerts detected !!!!! for new {pattern_type} instance {data_point}#############")
                    
                    
                    time = datetime.datetime.strptime(data_point['date'], "%Y-%m-%d")
                    
                    PatternSelfAlert.objects.create(
                        task = task,
                        time = timezone.make_aware(time, timezone.get_current_timezone()),
                        viewed = False,
                        description = description,
                        context = pattern_instance,
                        index = alert_index,
                        measured_value = ndvi_value,
                        reference_value = patt_value,
                        difference = difference,
                    )   
                    

    except Exception as e:
        print(e)
            
def generate_pattern_alerts_for_new_graph_data(graph_data_instance, new_instance, pattern_type="default_pattern"):
    
    print("pattern_type", pattern_type)
    current_year = datetime.datetime.today().year
    try:
        ndvi_data = [obj for obj in graph_data_instance.data if (datetime.datetime.strptime(obj['date'], "%Y-%m-%d").year == current_year)]
  
        task = graph_data_instance.task
        
        task_pattern_data, pattern_instance, smoothed_data = retrieve_pattern_data(task.id, pattern_type)
        
        interpolated_daily_pattern_data = task_pattern_data.reindex(pd.date_range(start=task_pattern_data.index.min(), end=task_pattern_data.index.max(), freq='D')).interpolate(method='linear')
        interpolated_daily_pattern_data = interpolated_daily_pattern_data.reset_index()
        interpolated_daily_pattern_data['date']  = interpolated_daily_pattern_data['index'].dt.strftime("%m-%d")
        interpolated_daily_pattern_data = interpolated_daily_pattern_data.to_dict(orient="records")
        
        
        interpolated_pattern_dates = [obj['date'] for obj in interpolated_daily_pattern_data]
        latest_ndvi_data_point = list(ndvi_data)[-1]
        if(new_instance):
            for data_point in ndvi_data:  
                # print(f"############### generating alerts for new {pattern_type} instance {data_point}#############")
                create_alert(data_point,pattern_instance, interpolated_pattern_dates,interpolated_daily_pattern_data, task)
        else:
            # print(f"############### generating alerts for updated data {latest_ndvi_data_point} | {pattern_type} #############")
            create_alert(latest_ndvi_data_point,pattern_instance, interpolated_pattern_dates,interpolated_daily_pattern_data, task)
            
                    
    except Exception as e:
        print(e)            
        

def generate_pattern_alerts_for_new_pattern(pattern_instance):
    print("generating alerts for new pattern")
    try:
        density = pattern_instance.density
        variety = pattern_instance.variety
        concerned_tasks = Task.objects.filter(density=density, variety=variety)
    
        for task in concerned_tasks:
            task_graph_data = GraphData.objects.filter(task=task, index="ndvi").first()
            generate_pattern_alerts_for_new_graph_data(graph_data_instance=task_graph_data, new_instance=True, pattern_type="default_pattern")
    
    except Exception as e:
        print(e)
        
        

def generate_self_pattern_alerts_for_new_pattern(pattern_instance):
    print("generating alerts for new auto pattern")
    try:
        task = pattern_instance.task
        task_graph_data = GraphData.objects.filter(task=task, index="ndvi").first()
        generate_pattern_alerts_for_new_graph_data(graph_data_instance=task_graph_data, new_instance=True, pattern_type="auto_pattern")
    
    except Exception as e:
        print(e)
        
    
