from django.contrib import admin

from .models import IrrigationCalendarRequest, IrrigationCalendarData

admin.site.register(IrrigationCalendarRequest)
admin.site.register(IrrigationCalendarData)