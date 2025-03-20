from django.urls import path
from . import views

urlpatterns = [
    path("project/list/<str:pk>/", views.List_Project),
    path("project/detail/<str:pk>/", views.Detail_Project),
    path("project/add/", views.Add_Project),
    path("task/add/", views.Add_Task),
    path("task/edit/", views.Edit_Task),
    path("task/detail/", views.Details_Task),
    path("task/detail/<str:id_task>/", views.Details_Task_initial),
    path("task/area/<str:id_task>/", views.getAreaByTaskId),
    path("task/delete/<str:id_task>/", views.Delete_Task),
    path("task/check_image_sidebar/<str:id_task>/", views.getImageSidebar),
#     path("service/task/detail/", views.Service_Details_Task),
    path("culture/list/", views.List_Culture),
    path("texture/list/", views.List_Texture),
    path("irrigation/list/", views.List_Irrigation),

    path("get-dates/<str:id>/", views.Get_dates),
    path("get-dates/sentinel/<str:id>/", views.Get_dates_sentinel),
    path("variety/list/<str:pk>/", views.Variety_By_Culture),
    path("variety/list/", views.List_Variety),
    path("density/list/<str:pk>/", views.Density_By_Culture),
    path("density/list/", views.List_Density),
    path("task/subscription/add/", views.Add_Subscription),
    path("task/subscription/check_exist/<str:pk>/",
         views.check_exist_subscription),
    path("task/subscription/request/add/", views.add_Request),
    path("task/note/save/", views.save_note),
    path("task/note/get/<str:pk>/<str:label>/", views.get_note),
    path("task/note/get-spreadsheet-names/<str:pk>/", views.getSpreadsheetNames),
    path("task/surface/sum/", views.total_surface),
    path("sensor/sum/", views.total_sensor),
    path("task/sum/", views.total_task),
    path("task/count_tree/<str:task_id>/", views.count_tree),
    path("sensor-data/list/<str:task_id>", views.fetchSensorDataForTask),
    path("sensor-data/list", views.fetchAllSensorData),
    path("sensor/list/", views.getSensorList),
    path("index/graph/dates/", views.getIndexDates),
    # path('index/graph/get_mean/<str:task_id>/', views.getIndexMean),
    path("index/png/<str:offset>/", views.generaatepng),
    path("index/task/png/<str:taskid>/", views.getPng),
    path("statistics/", views.getClientStatistics),
    path("index/task/png-side/<str:taskid>/", views.getPngside),
    path("index/task/png-side-all/<str:offset>/", views.getPngsideAll),
    path("task/map/<str:id_task>/", views.Details_Task_Map),
    path("task/details-simple/<str:id_task>/", views.Details_Task_Simple),
    path("events/<str:id_task>/", views.getRelatedEvents),
    path("events/user/<str:id_user>/", views.getUserRelatedEvents),
    path("events/<str:id_task>/type/<str:id_type>/",
         views.getRelatedEventsByType),
    path("products/type/all/", views.getAllProductsTypes),
    path("products/type/<str:id_type>/", views.getProductsByType),
    path("disease/all/", views.getAllDiseases),
    path("fertilisation/product/all/", views.getAllFertilisationProducts),
    path("stades/all/", views.getAllStadesPhenologique),
    path("disease/actors/<str:disease_id>/", views.getDiseasesActorById),
    path("event/add/", views.Add_Event),
    path("event/adds/", views.Add_Events),
    path("event/edit/<str:id_event>/", views.Edit_Event),
    path("event/delete/<str:id_event>/", views.Delete_Event),
    path("delete-multiple-event/", views.Destroy_events),
    path("user/task/list/<str:id_user>/", views.listTaskByUser),
    path("user/tasks/filter/", views.getFiltredTasks),
    path("user/tasks/graphdata/compare/", views.getTasksGraphDataCompare),
    path("task/graph_data/get/<str:id_task>/", views.getTaskGraphData),
    path("task/graph_data/run/<str:id_task>/", views.runTaskGraphData),
    path("task/check/graph_data/", views.checkGraphData),
    ###### planet ms#######
    path("user/highres/orders/list/<str:user_id>/",
         views.list_planet_orders_for_user),
    path("highres/orders/list/<str:task_id>/", views.list_planet_orders),
    path("highres/order/submit/", views.submit_planet_order),
    path("highres/order/download/", views.retrieve_planet_report),
    path("highres/order/files/upload/", views.receive_planet_order_files),

    # user logging endpoints
    path("logout/", views.Logout),
    path("user/history/all/<str:id>/", views.GetAllUserHistory),
    path("user/history/statistics/<str:id>/",
         views.GetAllUserHistoryStatistics),
    path("users/all/", views.GetAllUsers),
    path("user/<str:id>/", views.GetSingleUser),
    # **************************
    # forecast data for specific task
    path("task/graph_data/forecast/train/<str:task_id>/",
         views.TaskdataForecastTrain),
    path("user/tasks/graph_data/forecast/train/<str:user_id>/",
         views.UserTaskdataForecastTrain),
    path(
        "task/graph_data/forecast/predict/<str:task_id>/", views.TaskdataForecastPredict
    ),
    path(
        "user/tasks/graph_data/forecast/predict/<str:user_id>/", views.UserTaskdataForecastPredict
    ),

    path(
        "task/graph_data/forecast/predict/get/<str:task_id>/",
        views.TaskdataForecastPredictGet,
    ),
    path(
        "task/graph_data/indexforecast/get/<str:task_id>/",
        views.TaskIndexForecastGet,
    ),

    path(
        "task/graph_data/forecast/predict/alerts/<str:user_id>/",
        views.TaskdataForecastAlerts,
    ),

    path(
        "task/graph_data/forecast/insert/static/",
        views.insertStaticForecastData,
    ),



    path("user/notifications/get/<str:user_id>/", views.UserNotificationGet),
    path("user/notifications/get/head/<str:user_id>/",
         views.UserNotificationGetHead),
    path("task/notifications/get/<str:task_id>/", views.TaskNotificationGet),
    path("user/delete/forecast/", views.deletePredict),
    path("task/forecast/params/add/", views.forecastParamsAdd),
    path("task/forecast/params/get/<str:task_id>/", views.forecastParamsGet),

    path("task/filter/culture/<str:culture_id>/", views.filterTasksByCulture),
    path("user/task/delete/forecast/<str:user_id>/", views.deleteForecastByUser),

    path("task/graph_data/pattern/add/", views.addDataPattern),
    path("task/graph_data/pattern/get/<str:task_id>/", views.getDataPattern),


    ### pattern related alerts ##########
    path("user/pattern/alerts/list/<str:user_id>/<int:limit>/",
         views.getPatternAlertNotificationsByUser),
    path("task/pattern/alerts/list/<str:user_id>/<str:task_id>/<int:limit>/",
         views.getPatternAlertNotificationsByTask),
    path("task/self/pattern/alerts/list/<str:user_id>/<str:task_id>/<int:limit>/",
         views.getSelfPatternAlertNotificationsByTask),
    path("task/indexforecast/alerts/list/<str:user_id>/<str:task_id>/<int:limit>/",
         views.getIndexForecastAlertNotificationsByTask),

    path("user/indexforecast/alerts/list/<str:user_id>/<int:limit>/",
         views.getIndexForecastAlertNotificationsByUser),

    # comparaison, change in task indices

    path("task/get/index/difference/", views.GetIndexDifference),
    path("task/get/compare/", views.createMainTifCompare),
    path("task/get/index/compare/", views.createIndexTifComparator),

    path("task/get/", views.createMainTif),
    path("task/get/index/", views.createIndexTif),
    path("task/center/<str:task_id>/<str:user_id>/", views.getTaskCenter),
    path("task/sensor/<str:task_id>/", views.getTaskSensor),

    path("visit/field/delete/file/<str:file_id>/", views.delete_visit_file),
    path('visit/field/download/file/<str:file_id>/', views.visit_field_download_file),
    path("quote/add/", views.Add_Quote),
    path("task/histogram/static/get/", views.getHistogramStatic),
    path("task/histogram/static/set/", views.setHistogramStatic),
    path("task/histogram/productivity/get/", views.getHistogramProductivity),
    path("task/notifications/create/<str:task_id>/",
         views.createTaskNotifications),

    path("anomaly/type/add/", views.Anomaly_Type_Add),
    path("anomaly/type/all/", views.GetAllAnomalyTypes),
    path("anomaly/delete/file/<str:file_id>/", views.delete_anomaly_file),
    path('anomaly/download/file/<str:file_id>/', views.anomaly_download_file),


    ##### sensor levels alerts

    path("user/notifications/humidity/<str:user_id>/<int:limit>/", views.getSensorHumidityNotificationsByUser),
    path("task/notifications/humidity/<str:user_id>/<str:task_id>/<int:limit>/", views.getHumidityAlertNotificationsByTask),
    path("user/notifications/humidity/state/", views.alterNotificationState),

    path("user/notifications/sensor/battery/<str:user_id>/<int:limit>/", views.getSensorBatteryNotificationsByUser),

    path("language/change/", views.set_user_language),
    path("get/language/user/<str:user_id>/", views.get_user_language),

    path("task/self/graph_data/pattern/add/", views.addSelfDataPattern),
    path("task/self/graph_data/pattern/get/<str:task_id>/", views.getSelfDataPattern),
    path("task/self/pattern/get/dates/<str:task_id>/", views.getSelfPatternDate),

    path("task/anomaly/<str:task_id>/",views.getAnomalyByTask),
    path("task/update/plantation/date/", views.updatePlantationDate),

    path("task/reference/comparison/add/", views.addTaskReferenceComparison),
    path("task/reference/comparison/list/", views.ListTaskReferenceComparison),
    path("task/reference/comparison/delete/", views.DeleteTaskReferenceComparison),
    path("task/reference/comparison/detail/<str:id_task_reference>/", views. DetailsTaskReferenceComparison),
    path("task/reference/comparison/update/", views.updateTaskReferenceComparison),

    path("task/graph_data/comparision/get/<str:id_task>/", views.getTaskGraphDataComparison),
    path("task/graph_data/comparision/get/<str:id_task>/<str:date>/", views.getTaskGraphDataComparison),
    path("task/graph_data/get/periode/<str:id_task>/", views.getTaskGraphDataDate),
    path("task/graph_data/comparision/borns/", views.getTaskGraphDataComparisonBorns),
    path("task/age/get/<str:id_task>/", views.getTaskAge),
    path("user/authorized/update/<str:user_id>/", views.update_user_authorized),

    path('users/export/excel/', views.export_users_excel),
    path('users/export/excel/paying/', views.export_paying_users_excel),
    path('users/export/excel/demo/expired/', views.export_demo_expired_users_excel),

    path('users/export/excel/demo/not_expired/', views.export_demo_not_expired_users_excel),

    path("task/get/comparaison/meme-task/left/", views.getCompaisonMemeTaskLeft),
    path("task/get/comparaison/meme-task/right/", views.getCompaisonMemeTaskRight),
    path("task/get/index/comparaison/meme-task/left/", views.getIndexCompaisonMemeTaskLeft),
    path("task/get/index/comparaison/meme-task/right/", views.getIndexCompaisonMemeTaskRight),

    path("invoice/list/<str:id_user>/", views.ListInvoice),
    path("task/list/", views.getAllTasks),

    path('users/tasks/export/excel/', views.export_users_fields_excel),
    path('task/update/tree-hectar/', views.TaskUpdateNbTreePerHectar),

    path('show/notification/task/add/', views.AddShowNotificationTask),

    path('culture/list/with-categorie/', views.List_Culture_By_Category),

    path('non-tree-cultures-ids/list', views.getNonTreeCulturesIds),
    path('last-image-date/statistic/<str:id_user>/', views.getLastDateImages),
]
