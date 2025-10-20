from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import CustomUser

class CustomUserAdminForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        is_superuser = cleaned_data.get("is_superuser")
        is_auditor = cleaned_data.get("is_auditor")
        if is_superuser and not is_auditor:
            raise ValidationError("Um superusuário deve obrigatoriamente ser um auditor (is_auditor=True).")
        return cleaned_data

@admin.register(CustomUser)
class UserAdmin(DjangoUserAdmin):
    form = CustomUserAdminForm

    list_display = (
        "email", "full_name", "cpf", "is_auditor", "is_staff", "is_superuser", "is_active"
    )
    list_filter = (
        "is_staff", "is_superuser", "is_active", "is_auditor", "interest_area", "field_of_work"
    )
    search_fields = ("email", "first_name", "last_name", "cpf")
    ordering = ("email",)

    fieldsets = (
        (None, {
            "fields": ("email", "password")
        }),
        ("Informações pessoais", {
            "fields": ("first_name", "last_name", "cpf", "linkedin_url", "interest_area", "field_of_work", "is_auditor")
        }),
        ("Permissões", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        ("Datas importantes", {
            "fields": ("last_login", "date_joined")
        }),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "cpf", "password1", "password2", "is_auditor", "is_staff", "is_superuser", "is_active"),
        }),
    )

    filter_horizontal = ("groups", "user_permissions",)
    readonly_fields = ("last_login", "date_joined")