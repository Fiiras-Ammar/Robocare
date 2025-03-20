from django.utils.deprecation import MiddlewareMixin
from .models import UserHistory
from datetime import datetime, timezone
from uuid import UUID


class UserHistoryMiddleware(MiddlewareMixin):

    allowedUrls = [
        "/auth/jwt/create/",
        "/api/logout/",
        "/api/statistics/",
        "/api/task/details-simple/",
        "/api/task/detail/",
    ]
    labels = [
        "Sign In",
        "Logout",
        "Visualize Dashboard Statistics",
        "Visualize Task Details",
        "Visualize Task Details",
    ]

    def process_response(self, request, response):
        # This method is called after the view
        # You can modify the response here
        if request.user.is_authenticated:
            now = datetime.now(timezone.utc)
            path = request.get_full_path()
            index = [
                self.allowedUrls.index(l)
                for l in self.allowedUrls
                if path.startswith(l)
            ]

            if len(index) > 0 and index[0] >= 0:
                history = UserHistory()
                history.user = request.user
                history.date_of_request = now
                print("self.labels[index[0]]", self.labels[index[0]])
                history.label = self.labels[index[0]]
                uid = path.split("/")[-2]

                try:
                    uuid_obj = UUID(uid, version=4)
                    if str(uuid_obj) == uid:
                        history.request_from = uid
                    else:
                        history.request_from = ""
                except ValueError:
                    history.request_from = ""

                history.request_call = path
                history.description = ""
                history.duration = 0
                elements = UserHistory.objects.filter(
                    user__email=request.user.email
                ).order_by("-date_of_request")
                length = len(elements)

                # if older data exists for current user
                if length > 0:
                    lastOne = elements[0]

                    tdelta = now - lastOne.date_of_request
                    lastOne.duration = tdelta.seconds
                    lastOne.save()
                    # if current data is different from last one
                    if lastOne.request_call != history.request_call:
                        history.save()
                else:
                    history.save()

        return response
