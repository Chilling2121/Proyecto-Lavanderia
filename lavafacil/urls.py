"""
URL configuration for lavafacil project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from lavanderia import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('clientes/', views.clientes_list, name='clientes_list'),
    path('clientes/buscar/', views.clientes_search, name='clientes_search'),
    path('clientes/historial/<int:cliente_id>/', views.cliente_historial, name='cliente_historial'),
    path('clientes/crear/', views.cliente_create, name='cliente_create'),
    path('clientes/editar/<int:cliente_id>/', views.cliente_edit, name='cliente_edit'),
    path('clientes/eliminar/<int:cliente_id>/', views.cliente_delete, name='cliente_delete'),
    path('servicios/', views.servicios_list, name='servicios_list'),
    path('servicios/buscar/', views.servicios_search_api, name='servicios_search_api'),
    path('servicios/nuevo/', views.servicio_create, name='servicio_create'),
    path('servicios/<int:servicio_id>/editar/', views.servicio_edit, name='servicio_edit'),
    path('servicios/<int:servicio_id>/eliminar/', views.servicio_delete, name='servicio_delete'),
    path('ordenes/', views.ordenes_list, name='ordenes_list'),
    path('ordenes/buscar/', views.ordenes_search, name='ordenes_search'),
    path('ordenes/nueva/', views.orden_create, name='orden_create'),
    path('ordenes/nueva-parcial/<int:cliente_id>/', views.orden_create_partial, name='orden_create_partial'),
    path('ordenes/api/buscar-cliente/', views.orden_cliente_search_api, name='orden_cliente_search_api'),
    path('ordenes/<int:orden_id>/', views.orden_detail, name='orden_detail'),
    path('ordenes/<int:orden_id>/registrar-pago/', views.orden_register_payment, name='orden_register_payment'),
    path('ordenes/<int:orden_id>/ticket/', views.orden_ticket, name='orden_ticket'),
    path('seguimiento/', views.seguimiento_list, name='seguimiento_list'),
    path('seguimiento/<int:orden_id>/avanzar/', views.seguimiento_advance_status, name='seguimiento_advance_status'),
    path('pagos/', views.pagos_list, name='pagos_list'),
    path('pagos/buscar/', views.pagos_search, name='pagos_search'),
    path('usuarios/', views.usuarios_list, name='usuarios_list'),
    path('usuarios/buscar/', views.usuarios_search, name='usuarios_search'),
    path('usuarios/nuevo/', views.usuario_create, name='usuario_create'),
    path('usuarios/<int:id>/editar/', views.usuario_update, name='usuario_update'),
    path('usuarios/<int:id>/toggle/', views.usuario_toggle_status, name='usuario_toggle_status'),
    path('reportes/', views.reportes_dashboard, name='reportes_dashboard'),
    path('configuracion/', views.configuracion_update, name='configuracion'),
    path('', views.home_redirect, name='home_redirect'),
]
