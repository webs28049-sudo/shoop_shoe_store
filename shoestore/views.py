from django.shortcuts import render,redirect
from .models import Shoe_store
from .forms import LoginForms
# Create your views here.

def Home(request):
    if request.method == 'POST':
        dataform = LoginForms(request.POST, request.FILES) # تأكد أن الاسم صحيح

        if dataform.is_valid():
           
            dataform.save()
            return redirect('Home')
        
    else:
        dataform =LoginForms ()

    products= Shoe_store.objects.all()

    
    return render(request, 'shop/index.html',{'dataform':dataform, 'products': products })