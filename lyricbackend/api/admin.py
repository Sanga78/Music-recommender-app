from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser,Song
# Register your models here.
class CustomUserAdmin(UserAdmin):
    add_fieldsets = (
        (None,{
            'classes':('wide',),
            'fields': ('username','email','password','confirmPassword')
        }
        ),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Song)