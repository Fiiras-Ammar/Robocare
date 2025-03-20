# utils.py

import os
from django.core.files.storage import default_storage
from django.db.models import FileField


def file_cleanup(sender, instance, **kwargs):
    print("File cleanup signal triggered")
    for field in sender._meta.get_fields():
        print("Checking field:", field)
        if isinstance(field, FileField):
            f = getattr(instance, field.name)
            print("Field:", field.name)
            if f and hasattr(f, "path"):
                print("File path:", f.path)
                try:
                    default_storage.delete(f.path)
                    print(f"Deleted file: {f.path}")
                except Exception as e:
                    print(f"Error deleting file: {e}")
