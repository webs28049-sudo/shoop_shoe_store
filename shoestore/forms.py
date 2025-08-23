from django import forms
from .models import Loginstore

class LoginForms(forms.ModelForm):
    class Meta:
        model=Loginstore
        fields= '__all__'