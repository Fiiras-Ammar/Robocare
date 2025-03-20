import datetime
from django_extensions.management.jobs import DailyJob
from mesurements.models import Task, GraphData, DataForecast, TaskImage,Histogram
from mesurements.functions import (
    calculateIndexHistory,
    sarimax_forecast,
    sarimax_forecast_predict,
    createAlerts,
    updateIndexHistory, cordinates_to_polygon, get_available_dates
)

import ee
from ... import params as service_account
import concurrent.futures
from functools import partial
from mesurements.serializers import TaskSerializer
import threading
from concurrent.futures import ThreadPoolExecutor
from django.template.loader import render_to_string
from authentification.models import UserAccount
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from datetime import timedelta
from django.utils import timezone
import requests
import time
from datetime import datetime,date

credentials = ee.ServiceAccountCredentials(
    service_account.private_key, service_account.private_key
)
ee.Initialize(credentials)

MAX_THREADS = 10
planet_ms_url = "https://planet.ms.robocare.tn"


class Job(DailyJob):
    help = "DailyJob to fetch sensors data."

    def email_expired_acount_in_one_week(self):
        print("Begin send expiration warning")

        now = timezone.now()
        twenty_one_days_ago = now - timedelta(days=21)
        expired_users = UserAccount.objects.filter(
            is_not_demo=False,
            created__date=twenty_one_days_ago.date(),
            is_authorized=True,
            is_staff=False,
        )
        #print('List of user Sended mail will expired in One week', expired_users)

        for user in expired_users:
            context_email = {
                "user": user.firstname + " " + user.lastname,
                "contact": "https://robocare.tn/?page_id=13",
                "expired": (user.created + timedelta(days=30)).strftime("%d-%m-%Y"),
            }
            if user.language == 'fr':
                html_message = render_to_string(
                    "emails/demo_account_will_be_expired_fr.html", context=context_email
                )
                subject = "Rappel: votre démo RoboCare expire dans une semaine!"

            else:
                html_message = render_to_string(
                    "emails/demo_account_will_be_expired_en.html", context=context_email
                )
                subject = "Reminder: Your RoboCare Demo Expires in One Week!"

            plain_message = strip_tags(html_message)
            message = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            message.attach_alternative(html_message, "text/html")
            try:
                message.send()
                print("Mail of expired acount in one week sended to ",user.email)
            except Exception as e:
                print(e)
        print("End send expiration warning")


    def demo_account_expired(self):
        print("Begin send email expiration accounts")

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        expired_users = UserAccount.objects.filter(
            is_not_demo=False,
            created__date__lt=thirty_days_ago.date(),
            is_authorized=True,
            is_staff=False,
        )
        #print('List of user Sended mail will expired account', expired_users)
        for user in expired_users:
            user.is_authorized = False
            user.save()
            context_email = {
                "user": user.firstname + " " + user.lastname,
                "contact": "https://robocare.tn/?page_id=13",
                "expired": user.created.strftime("%d-%m-%Y"),
            }
            if user.language == 'fr':
                html_message = render_to_string(
                    "emails/demo_account_expired_fr.html", context=context_email
                )
                subject = "Votre compte a expiré"
            else:
                html_message = render_to_string(
                    "emails/demo_account_expired_en.html", context=context_email
                )
                subject = "Your account has expired"
            plain_message = strip_tags(html_message)
            message = EmailMultiAlternatives(
                subject=subject,
                body=plain_message,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            message.attach_alternative(html_message, "text/html")
            try:
                message.send()
                print("Mail of demo account expired sended to ",user.email)

            except Exception as e:
                print(e)
        print("End send email expiration accounts")

    def get_local_index_for_item(item, ndvi, ndre, gci, ndwi,ndmi):
        box = ee.Geometry.Polygon(item["bounds"])
        mean_ndvi = ndvi.reduceRegion(
            **{
                "reducer": ee.Reducer.mean(),
                "geometry": box,
                "scale": 10,
            }
        ).getInfo()
        mean_ndre = ndre.reduceRegion(
            **{
                "reducer": ee.Reducer.mean(),
                "geometry": box,
                "scale": 10,
            }
        ).getInfo()
        mean_gci = gci.reduceRegion(
            **{
                "reducer": ee.Reducer.mean(),
                "geometry": box,
                "scale": 10,
            }
        ).getInfo()
        mean_ndwi = ndwi.reduceRegion(
            **{
                "reducer": ee.Reducer.mean(),
                "geometry": box,
                "scale": 10,
            }
        ).getInfo()

        mean_ndmi = ndmi.reduceRegion(
            **{
                "reducer": ee.Reducer.mean(),
                "geometry": box,
                "scale": 10,
            }
        ).getInfo()
        item["mean_ndvi"] = mean_ndvi.get("ndvi", None)
        item["mean_ndre"] = mean_ndre.get("ndre", None)
        item["mean_gci"] = mean_gci.get("gci", None)
        item["mean_ndwi"] = mean_ndwi.get("ndwi", None)
        item["mean_ndmi"] = mean_ndwi.get("ndmi", None)

        return item

    @staticmethod
    def getLocalIndex(region, start_date, end_date, detectionList):
        try:
            polygon = ee.Geometry.Polygon(region)
            image = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterDate(start_date, end_date)
                .filterBounds(polygon)
                .sort("CLOUD_COVERAGE_ASSESSMENT")
                .first()
                .clip(polygon)
            )

            ndvi = image.normalizedDifference(["B8", "B4"]).rename("ndvi")
            ndre = image.normalizedDifference(["B8", "B5"]).rename("ndre")
            gci = image.expression(
                "(nir/ green - 1)",
                {"nir": image.select("B8"), "green": image.select("B3")},
            ).rename("gci")
            ndwi = image.normalizedDifference(
                ["B8", "B3"]).rename("ndwi")
            ndmi = image.normalizedDifference(["B8", "B11"]).rename("ndmi")

            # Use ThreadPoolExecutor for concurrent execution
            with concurrent.futures.ThreadPoolExecutor() as executor:
                # Use functools.partial to pass additional arguments to the function
                partial_func = partial(
                    Job.get_local_index_for_item,
                    ndvi=ndvi,
                    ndre=ndre,
                    gci=gci,
                    ndwi=ndwi,
                    ndmi=ndmi,
                )
                results = list(executor.map(partial_func, detectionList))

            return results
        except ee.EEException as e:
            #print(str(e))
            return str(e)

    def execute(self):
        self.email_expired_acount_in_one_week()
        self.demo_account_expired()
        ############################inportation des image haut resolution pour mohamed mesouid et saber alger ###############
        allowed_user_hr_ids_special = {"355", "342"}
        allowed_user_hr_ids = {"2", "96", "117", "142", "158", "242", "253", "266", "274", "278", "342", "348", "355"}
        hr_tasks = Task.objects.filter(project__user_id__in=allowed_user_hr_ids)
        now_hr = date.today()
        initial_cloud_cover = 10
        max_cloud_cover = 40
        for task in hr_tasks:
            polygon = cordinates_to_polygon(task.area_of_interest[0])
            list_date = get_available_dates(polygon)
            last_date = list_date["last_date"]
            print("task", task.id, task.task_name)
            print("last_date", datetime.strptime(last_date, "%Y-%m-%d").date())
            last_histogram = Histogram.objects.filter(task_id=task.id).order_by('-date').first()

            days_difference_last_image_sentinel = (now_hr - datetime.strptime(last_date, "%Y-%m-%d").date()).days
            days_difference_last_image_hr = (now_hr - last_histogram.date).days
            print("days_difference_last_image_sentinel", days_difference_last_image_sentinel)
            print("days_difference_last_image_hr", days_difference_last_image_hr)

            if str(task.project.user_id) in allowed_user_hr_ids_special:
                nb_days_max = 4
            else:
                nb_days_max = 9
            if days_difference_last_image_sentinel > nb_days_max and days_difference_last_image_hr > nb_days_max:
                print('yes')
                task_data = TaskSerializer(task).data
                task_id = task_data['id']
                task_name = task_data['task_name']
                cloud_cover = initial_cloud_cover
                coordinates = list(task.area_of_interest[0])
                coordinates = [list(coord) for coord in coordinates]
                coords_swapped = [[coordinate[1], coordinate[0]]
                                  for coordinate in coordinates]

                now_hr_str = now_hr.strftime('%Y-%m-%d')

                while cloud_cover <= max_cloud_cover:
                    print("cloud_cover", cloud_cover)
                    try:

                        response = requests.post(
                            url=planet_ms_url,
                            json={
                                "taskid": task_id,
                                "project": task_name,
                                "aoi": coords_swapped,
                                "date": now_hr_str,
                                "max-cloud-percentage": int(cloud_cover),
                            },
                        )
                        print("response", response)
                        if response.status_code == 200:
                            data = response.json()
                            time_acquired = data["properties"]["acquired"].split(".")[0].split("T")[0]
                            cloud_cover = data["properties"]["cloud_cover"]

                            print("Order date:", time_acquired)
                            print("Order cloud cover:", cloud_cover)
                            break
                        elif response.status_code == 400:
                            error_message = response.json()
                            print(f"Error response: {error_message}")

                        else:
                            print(
                                f"Requête échouée avec code {response.status_code}. Réessai avec cloud cover: {cloud_cover + 10}")

                    except Exception as e:
                        print(f"Erreur lors de la requête : {e}")

                    cloud_cover += 10
                    time.sleep(2)
                        ######################################################################

        # executing empty sample job
        # elements = PlantCount.objects.all()
        # print("elements ================================")
        # print(elements)
        # print("================================================================")
        # end_date = datetime.date.today()
        # start_date = end_date - datetime.timedelta(days=30)
        # end_date_str = end_date.strftime("%Y-%m-%d")
        # start_date_str = start_date.strftime("%Y-%m-%d")
        # print("Getting local indices in", start_date_str, "-", end_date_str)
        # for element in elements:
        #     task = Task.objects.get(id=element.task.id)
        #     coordinates = list(task.area_of_interest[0])
        #     coordinates = [list(coord) for coord in coordinates[:-1]]
        #     coords_swapped = [
        #         [coordinate[1], coordinate[0]] for coordinate in coordinates
        #     ]
        #     print(element.region_count["detection_list"])
        #     result = self.getLocalIndex(
        #         coords_swapped,
        #         start_date_str,
        #         end_date_str,
        #         element.region_count["detection_list"],
        #     )
        #     print("local indices", result)
        #     element.local_index = {"result": result}
        #     element.save()
        # print(
        #     "===================================================================================="
        # )
        # print(
        #     "===================================================================================="
        # )
        # print("                 Count Data fetched successfully")
        # print(
        #     "===================================================================================="
        # )
        # print(
        #     "===================================================================================="
        # )
        # Create an event to signal the completion of the first part of the work
        now = timezone.now()

        print(f"Begin Calculation of graph data on {now}")
        tasks = Task.objects.all()
        taskserializer = TaskSerializer(tasks, many=True)
        for task in taskserializer.data:
            try:
                print("Task_id",task["id"])
                #print("task", task)
                #print("task", task)
                graphdata = GraphData.objects.filter(task=task["id"])
                print("Existing graph data count",graphdata.count())
                if graphdata.exists() and graphdata.count() >= 5:
                    if graphdata.count() == 5:
                        print("Add NDMI graph data")
                        threads = []
                        index_names = ["ndmi"]
                        for index_name in index_names:
                            thread = threading.Thread(
                                target=calculateIndexHistory,
                                args=(task["id"], index_name),
                            )
                            threads.append(thread)
                            thread.start()
                        for thread in threads:
                            thread.join()
                    # Select any record from the queryset
                    selected_record = graphdata.get(index="ndvi")
                    data = selected_record.data
                    print("record type index", selected_record.index)
                    last_date = data[-1]["date"]
                    print("last_date", last_date)
                    # add a day to last date so the last date from database won't be included
                    last_date_datetime = datetime.datetime.strptime(
                        last_date, "%Y-%m-%d")
                    last_date = (last_date_datetime + datetime.timedelta(days=1)).strftime(
                        "%Y-%m-%d"
                    )
                    # Set end_date to today's date
                    end_date = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime(
                        "%Y-%m-%d"
                    )
                    try:
                        task = Task.objects.get(id=task["id"])
                    except Task.DoesNotExist:
                        print("task does not exist !")
                    coordinates = list(task.area_of_interest[0])
                    coordinates = [list(coord) for coord in coordinates[:-1]]
                    coords_swapped = [[coordinate[1], coordinate[0]]
                                      for coordinate in coordinates]
                    polygon = ee.Geometry.Polygon(coords_swapped)
                    collection = (
                        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                        .filterBounds(polygon)
                        .filterMetadata("CLOUD_COVERAGE_ASSESSMENT", "less_than", 10)
                        .filterDate(last_date, end_date)
                    )
                    #print("lastdate", last_date)
                    #print("end_date", end_date)
                    # Extract dates from the Image Collection
                    info = collection.getInfo()
                    dates = [
                        ee.Date(x["properties"]["system:time_start"]
                                ).format("YYYY-MM-dd").getInfo()
                        for x in info["features"]
                    ]
                    #print(dates)
                    if not dates:
                        # if their is not new dates then our data is updated to available dates
                        #print("task graph data is up to date ! ")
                        print("")
                    else:
                        for item in graphdata:
                            updateIndexHistory(task, collection, last_date,
                                               end_date, item, polygon)
                else:
                    threads = []
                    #print("No graph data found for task:", task["id"])
                    index_names = ["ndvi", "ndwi", "ndre", "gci", "psri","ndmi"]
                    # Create and start threads for each index
                    for index_name in index_names:
                        print("Add ",index_name,' data Graph')
                        thread = threading.Thread(
                            target=calculateIndexHistory,
                            args=(task["id"], index_name),
                            # daemon=True,  # Set the thread as daemon
                        )
                        threads.append(thread)
                        thread.start()
                    # Wait for all threads to complete
                    for thread in threads:
                        thread.join()
            except GraphData.DoesNotExist:
                print(
                    "This block will not be executed as filter won't raise DoesNotExist."
                )
        now2 = timezone.now()

        print(f"End Calculation of graph data on {now2}")

        allowed_user_ids = {"242", "96", "95", "139", "154", "233"}
        for user_id in allowed_user_ids:
            #print(f"checking forecast train for user id {user_id} tasks")
            tasks = Task.objects.filter(project__user__id=user_id)
            taskserializer = TaskSerializer(tasks, many=True)
            # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
            index_names = ["ndvi"]
            threads = []  # Create a list to store threads
            for task in taskserializer.data:
                try:
                    #print("task", task)
                    threads2 = []
                    graph_data = GraphData.objects.filter(task=task["id"])
                    if not graph_data or graph_data.count() < 1:
                        print(
                            "task should have all indexs data to perferm the forecasting")
                    else:
                        for index_name in index_names:
                            thread = threading.Thread(
                                target=sarimax_forecast,
                                args=(task["id"], index_name),
                                daemon=True,  # Set the thread as daemon
                            )
                            thread.start()
                            threads2.append(thread)  # Add thread to the list
                        # Wait for all threads to finish
                        for thread in threads2:
                            thread.join()
                except GraphData.DoesNotExist:
                    print(
                        "This block will not be executed as filter won't raise DoesNotExist."
                    )

        # calculate and save prediction for clients
        """
        for user_id in allowed_user_ids:
            #print(f"checking forecast data for user id {user_id} tasks")
            tasks = Task.objects.filter(project__user__id=user_id)
            for task in tasks:
                forecast_params = DataForecast.objects.filter(task=task.id)
                # index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
                index_names = ["ndvi"]
                # Check if forecast_params exist and if there are exactly 5 records
                if len(forecast_params) == 1:
                    # Check if the JsonField fields are not empty
                    non_empty_fields = [
                        fp
                        for fp in forecast_params
                        if fp.data_predict and fp.data_predict_fortnite
                    ]

                    if len(non_empty_fields) == 1:
                        print(
                            f"data forecast of ndvi already saved for task {task.task_name} with the id {task.id}  "
                        )

                    else:
                        num_workers = (
                            6  # Number of parallel workers, one for each index
                        )
                        executor = ThreadPoolExecutor(max_workers=num_workers)
                        futures = []

                        # Iterate over each index name and its corresponding parameters
                        for index_name in index_names:
                            # Get the corresponding params field value
                            params = getattr(
                                forecast_params.get(
                                    index=index_name), "params", None
                            )
                            #print("params", params)
                            future = executor.submit(
                                sarimax_forecast_predict, task.id, index_name, params
                            )
                            futures.append(future)

                        # Wait for all threads to complete and gather results
                        results = {}
                        for index_name, future in zip(index_names, futures):
                            try:
                                result = future.result()
                                results[index_name] = result
                            except Exception as e:
                                results[index_name] = str(e)
                else:
                    print(
                        f"task with id {task.id} and name {task.task_name} should have all indexs params to predict forecast"
                    )

        for user_id in allowed_user_ids:
            tasks = Task.objects.filter(project__user__id=user_id)
            for task in tasks:
                #print(f"task {task.id} - {task.task_name}")
                graphdata = GraphData.objects.filter(task=task.id)
                predictdata = DataForecast.objects.filter(
                    task=task.id, index="ndvi"
                ).first()
                # serializer = GraphDataTaskSerializer(graphdata, many=True)
                # check if data exist and all 5 index where calculated
                if predictdata:
                    if (
                            graphdata.exists()
                            and graphdata.count() == 6
                            and predictdata.data_predict
                            and predictdata.data_predict_fortnite
                    ):
                        # Select any record from the queryset
                        selected_record = graphdata.get(index="ndvi")
                        data = selected_record.data
                        # print("record type index", selected_record.index)
                        last_date = data[-1]["date"]
                        # add a day to last date so the last date from database won't be included
                        last_date_datetime = datetime.datetime.strptime(
                            last_date, "%Y-%m-%d"
                        )
                        last_date = (
                                last_date_datetime + datetime.timedelta(days=1)
                        ).strftime("%Y-%m-%d")
                        # Set end_date to today's date
                        end_date = (
                                datetime.datetime.now() + datetime.timedelta(days=1)
                        ).strftime("%Y-%m-%d")
                        coordinates = list(task.area_of_interest[0])
                        coordinates = [list(coord)
                                       for coord in coordinates[:-1]]
                        coords_swapped = [
                            [coordinate[1], coordinate[0]] for coordinate in coordinates
                        ]
                        polygon = ee.Geometry.Polygon(coords_swapped)
                        collection = (
                            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                            .filterBounds(polygon)
                            .filterMetadata(
                                "CLOUD_COVERAGE_ASSESSMENT", "less_than", 10
                            )
                            .filterDate(last_date, end_date)
                        )
                        # Extract dates from the Image Collection
                        info = collection.getInfo()
                        dates = [
                            ee.Date(x["properties"]["system:time_start"])
                            .format("YYYY-MM-dd")
                            .getInfo()
                            for x in info["features"]
                        ]
                        if not dates:
                            # if their is not new dates then our data is updated to available dates
                            print(
                                f"no new satellite image for the task {task.id}")
                            # return Response(
                            #     {
                            #         "message": f"Get graph data for task: {id_task} succeed!",
                            #         "data": serializer.data,
                            #     },
                            #     status=status.HTTP_200_OK,
                            # )
                        else:
                            #print("dates", dates)

                            for item in graphdata:
                                updateIndexHistory(
                                    task, collection, last_date, end_date, item, polygon
                                )
                        ndvi_data = GraphData.objects.filter(
                            task=task.id, index="ndvi").first()
                        createAlerts(task, dates, ndvi_data, predictdata)
                    else:
                        print(
                            f"task {task.id, task.task_name} has no graphdata")
                else:
                    print(
                        f"task {task.id, task.task_name} has no dataforecast")
        """

        pass

        # tasks = Task.objects.all()
        # taskserializer = TaskSerializer(tasks, many=True)
        # for task in taskserializer.data:
        #     try:
        #         print("task", task)
        #         graph_data = GraphData.objects.filter(task=task["id"])
        #         if not graph_data:
        #             threads = []
        #             print("No graph data found for task:", task["id"])
        #             index_names = ["ndvi", "ndwi", "ndre", "gci", "psri"]
        #             # Use ThreadPoolExecutor for concurrent execution
        #             with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        #                 # Create and start threads for each index
        #                 for index_name in index_names:
        #                     thread = threading.Thread(
        #                         target=calculateIndexHistory,
        #                         args=(task["id"], index_name),
        #                         # daemon=True,  # Set the thread as daemon
        #                     )
        #                     threads.append(thread)
        #                     thread.start()
        #                 # Wait for all threads to complete
        #                 for thread in threads:
        #                     thread.join()
        #     except GraphData.DoesNotExist:
        #         print(
        #             "This block will not be executed as filter won't raise DoesNotExist."
        #         )
