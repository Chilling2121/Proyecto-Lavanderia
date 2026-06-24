from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, Q, ProtectedError
from django.utils import timezone
from django.http import HttpResponse
from django.contrib import messages
from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.core.serializers.json import DjangoJSONEncoder
import re
import json
from django.contrib.auth.models import User, Group
from .models import Orden, Pago, PrendaOrden, Cliente, Servicio, SeguimientoLavado


# Flujo secuencial de estados de lavado
ESTADOS_LAVADO = [
    'Recibida',
    'Clasificada',
    'En lavado',
    'En secado',
    'En planchado',
    'Empaquetada',
    'Lista para entrega',
    'Entregada',
]


def home_redirect(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return redirect('login')

@login_required
def dashboard(request):
    local_now = timezone.localtime(timezone.now())
    start_of_today = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_today = local_now.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    pedidos_hoy = Orden.objects.filter(fecha_recepcion__range=(start_of_today, end_of_today)).count()
    pedidos_pendientes = Orden.objects.exclude(estado_actual='Entregada').count()
    listos_entrega = Orden.objects.filter(estado_actual='Lista para entrega').count()
    ingresos_hoy = Pago.objects.filter(fecha_pago__range=(start_of_today, end_of_today)).aggregate(Sum('monto'))['monto__sum'] or 0.00
    
    ordenes_recientes = Orden.objects.select_related('cliente').order_by('-fecha_recepcion')[:5]
    
    total_prendas = PrendaOrden.objects.count()
    servicios_stats = []
    
    if total_prendas > 0:
        stats = PrendaOrden.objects.values('servicio__nombre').annotate(count=Count('id')).order_by('-count')
        for s in stats:
            percentage = int((s['count'] / total_prendas) * 100)
            servicios_stats.append({
                'nombre': s['servicio__nombre'],
                'percentage': percentage
            })
    else:
        servicios_stats = [
            {'nombre': 'Lavado Normal', 'percentage': 45},
            {'nombre': 'Lavado Delicado', 'percentage': 25},
            {'nombre': 'Planchado', 'percentage': 15},
            {'nombre': 'Lavado en Seco', 'percentage': 10},
            {'nombre': 'Otros', 'percentage': 5},
        ]
        
    context = {
        'pedidos_hoy': pedidos_hoy,
        'pedidos_pendientes': pedidos_pendientes,
        'listos_entrega': listos_entrega,
        'ingresos_hoy': ingresos_hoy,
        'ordenes_recientes': ordenes_recientes,
        'servicios_stats': servicios_stats,
    }
    
    return render(request, 'dashboard.html', context)


# ==========================================
#  MÓDULO DE CLIENTES
# ==========================================

@login_required
def clientes_list(request):
    clientes = Cliente.objects.all().order_by('-id')
    return render(request, 'clientes.html', {'clientes': clientes})

@login_required
def clientes_search(request):
    query = request.GET.get('search', '').strip()
    if query:
        clientes = Cliente.objects.filter(
            Q(nombre__icontains=query) | Q(telefono__icontains=query)
        ).order_by('-id')
    else:
        clientes = Cliente.objects.all().order_by('-id')
    return render(request, 'partials/clientes_table.html', {'clientes': clientes})

@login_required
def cliente_historial(request, cliente_id):
    try:
        cliente = Cliente.objects.get(id=cliente_id)
        ordenes = Orden.objects.filter(cliente=cliente).order_by('-fecha_recepcion').prefetch_related('prendas__servicio')
    except Cliente.DoesNotExist:
        cliente = None
        ordenes = []
    return render(request, 'partials/cliente_historial.html', {'cliente': cliente, 'ordenes': ordenes})

@login_required
def cliente_create(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        telefono = request.POST.get('telefono', '').strip()
        correo = request.POST.get('correo')
        direccion = request.POST.get('direccion')
        
        if not re.match(r'^\d{10}$', telefono):
            messages.error(request, "Error al registrar cliente: El número de celular debe tener exactamente 10 dígitos.")
            return redirect('clientes_list')
        
        Cliente.objects.create(
            nombre=nombre,
            telefono=telefono,
            correo=correo or None,
            direccion=direccion or None
        )
        messages.success(request, f"Cliente '{nombre}' registrado con éxito.")
    return redirect('clientes_list')

@login_required
def cliente_edit(request, cliente_id):
    if request.method == 'POST':
        try:
            cliente = Cliente.objects.get(id=cliente_id)
            nombre = request.POST.get('nombre')
            telefono = request.POST.get('telefono', '').strip()
            correo = request.POST.get('correo')
            direccion = request.POST.get('direccion')
            
            if not re.match(r'^\d{10}$', telefono):
                messages.error(request, "Error al editar cliente: El número de celular debe tener exactamente 10 dígitos.")
                return redirect('clientes_list')
            
            cliente.nombre = nombre
            cliente.telefono = telefono
            cliente.correo = correo or None
            cliente.direccion = direccion or None
            cliente.save()
            messages.success(request, f"Datos del cliente '{nombre}' actualizados con éxito.")
        except Cliente.DoesNotExist:
            messages.error(request, "Error al editar cliente: El cliente especificado no existe.")
    return redirect('clientes_list')

@login_required
def cliente_delete(request, cliente_id):
    if request.method == 'DELETE':
        try:
            cliente = Cliente.objects.get(id=cliente_id)
            nombre = cliente.nombre
            cliente.delete()
            response = HttpResponse("")
            response['HX-Trigger'] = '{"clientDeleted": "' + nombre + '"}'
            return response
        except Cliente.DoesNotExist:
            return HttpResponse(status=404)
    return redirect('clientes_list')


# ==========================================
#  MÓDULO DE SERVICIOS
# ==========================================

@login_required
def servicios_list(request):
    servicios = Servicio.objects.all().order_by('nombre')
    return render(request, 'servicios.html', {'servicios': servicios})

@login_required
def servicios_search_api(request):
    query = request.GET.get('search', '').strip()
    if query:
        servicios = Servicio.objects.filter(
            Q(nombre__icontains=query) | Q(descripcion__icontains=query)
        ).order_by('nombre')
    else:
        servicios = Servicio.objects.all().order_by('nombre')
    return render(request, 'partials/servicios_table.html', {'servicios': servicios})

@login_required
def servicio_create(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        tarifa = request.POST.get('tarifa')
        tipo_cobro = request.POST.get('tipo_cobro')
        
        Servicio.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            tarifa=tarifa,
            tipo_cobro=tipo_cobro
        )
        messages.success(request, f"Servicio '{nombre}' creado con éxito.")
        return redirect('servicios_list')
    
    return render(request, 'servicio_form.html')

@login_required
def servicio_edit(request, servicio_id):
    try:
        servicio = Servicio.objects.get(id=servicio_id)
    except Servicio.DoesNotExist:
        messages.error(request, "El servicio solicitado no existe.")
        return redirect('servicios_list')
    
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        tarifa = request.POST.get('tarifa')
        tipo_cobro = request.POST.get('tipo_cobro')
        
        servicio.nombre = nombre
        servicio.descripcion = descripcion
        servicio.tarifa = tarifa
        servicio.tipo_cobro = tipo_cobro
        servicio.save()
        
        messages.success(request, f"Servicio '{nombre}' actualizado con éxito.")
        return redirect('servicios_list')
        
    return render(request, 'servicio_form.html', {'servicio': servicio})

@login_required
def servicio_delete(request, servicio_id):
    if request.method == 'DELETE':
        try:
            servicio = Servicio.objects.get(id=servicio_id)
            nombre = servicio.nombre
            servicio.delete()
            response = HttpResponse("")
            response['HX-Trigger'] = '{"servicioDeleted": "' + nombre + '"}'
            return response
        except ProtectedError:
            return HttpResponse("Error: Este servicio está vinculado a órdenes existentes y no puede ser eliminado por seguridad. Puede modificar su tarifa en su lugar.", status=400)
        except Servicio.DoesNotExist:
            return HttpResponse(status=404)
    return redirect('servicios_list')


# ==========================================
#  MÓDULO DE ÓRDENES
# ==========================================

@login_required
def ordenes_list(request):
    ordenes = Orden.objects.select_related('cliente').order_by('-id')
    return render(request, 'ordenes.html', {'ordenes': ordenes})

@login_required
def ordenes_search(request):
    query = request.GET.get('search', '').strip()
    if query:
        id_filter = Q()
        if query.isdigit():
            id_filter = Q(id=int(query))
        ordenes = Orden.objects.filter(
            id_filter | Q(cliente__nombre__icontains=query)
        ).select_related('cliente').order_by('-id')
    else:
        ordenes = Orden.objects.select_related('cliente').order_by('-id')
    return render(request, 'partials/ordenes_table.html', {'ordenes': ordenes})

@login_required
def orden_cliente_search_api(request):
    query = request.GET.get('search', '').strip()
    if query:
        clientes = Cliente.objects.filter(
            Q(nombre__icontains=query) | Q(telefono__icontains=query)
        ).order_by('-id')[:5]
    else:
        clientes = []
    return render(request, 'partials/orden_cliente_results.html', {'clientes': clientes})

@login_required
def orden_create(request):
    if request.method == 'POST':
        cliente_id = request.POST.get('cliente_id')
        fecha_entrega_estimada_str = request.POST.get('fecha_entrega_estimada')
        observaciones = request.POST.get('observaciones', '')
        
        try:
            total = float(request.POST.get('total', 0.0))
            descuento = float(request.POST.get('descuento', 0.0))
            total_a_pagar = float(request.POST.get('total_a_pagar', 0.0))
            anticipo = float(request.POST.get('anticipo', 0.0))
        except (ValueError, TypeError):
            messages.error(request, "Error al procesar los montos de la orden.")
            return redirect('ordenes_list')
            
        metodo_pago = request.POST.get('metodo_pago', 'Efectivo')
        prendas_json = request.POST.get('prendas_json', '[]')
        
        if not cliente_id:
            messages.error(request, "Debe seleccionar un cliente para la orden de servicio.")
            return redirect('orden_create')
            
        try:
            prendas_data = json.loads(prendas_json)
        except json.JSONDecodeError:
            messages.error(request, "Error en el formato de los detalles de las prendas.")
            return redirect('orden_create')
            
        if not prendas_data:
            messages.error(request, "Debe agregar al menos una prenda a la orden.")
            return redirect('orden_create')
        
        fecha_entrega_estimada = None
        if fecha_entrega_estimada_str:
            fecha_entrega_estimada = parse_datetime(fecha_entrega_estimada_str)
            if fecha_entrega_estimada and timezone.is_naive(fecha_entrega_estimada):
                fecha_entrega_estimada = timezone.make_aware(fecha_entrega_estimada)
        
        try:
            with transaction.atomic():
                cliente = Cliente.objects.get(id=cliente_id)
                
                orden = Orden.objects.create(
                    cliente=cliente,
                    fecha_entrega_estimada=fecha_entrega_estimada,
                    total=total,
                    descuento=descuento,
                    total_a_pagar=total_a_pagar,
                    anticipo=anticipo,
                    saldo_pendiente=total_a_pagar - anticipo,
                    estado_pago='Liquidado' if anticipo >= total_a_pagar else ('Parcial' if anticipo > 0 else 'Pendiente'),
                    estado_actual='Recibida',
                    observaciones=observaciones or None
                )
                
                SeguimientoLavado.objects.create(
                    orden=orden,
                    estado='Recibida',
                    observaciones='Ingreso inicial de la orden de servicio al sistema.'
                )
                
                for p in prendas_data:
                    servicio = Servicio.objects.get(id=p['servicio_id'])
                    # Leer el precio unitario si se envía tarifa personalizada
                    precio_unitario = float(p['precio_unitario']) if p.get('precio_unitario') is not None else None
                    PrendaOrden.objects.create(
                        orden=orden,
                        tipo_prenda=p['tipo_prenda'],
                        cantidad=int(p.get('cantidad', 1)),
                        peso=float(p['peso']) if p.get('peso') else None,
                        servicio=servicio,
                        precio_unitario=precio_unitario,
                        es_delicada=bool(p.get('es_delicada', False)),
                        observaciones=p.get('observaciones', '') or None
                    )
                
                if anticipo > 0:
                    Pago.objects.create(
                        orden=orden,
                        monto=anticipo,
                        metodo_pago=metodo_pago,
                        tipo_pago='Anticipo',
                        observaciones='Abono inicial al registrar la orden'
                    )
                
                messages.success(request, f"Orden de servicio #{orden.id:06d} registrada con éxito.")
                return redirect('ordenes_list')
        except Cliente.DoesNotExist:
            messages.error(request, "El cliente seleccionado no existe.")
        except Exception as e:
            messages.error(request, f"Ocurrió un error inesperado al procesar la orden: {str(e)}")
            
        return redirect('orden_create')
        
    # GET: Cargar formulario
    servicios = Servicio.objects.all()
    servicios_data = [
        {
            'id': s.id,
            'nombre': s.nombre,
            'tarifa': float(s.tarifa),
            'tipo_cobro': s.tipo_cobro
        }
        for s in servicios
    ]
    
    context = {
        'clientes_frecuentes': Cliente.objects.annotate(num_ordenes=Count('ordenes')).order_by('-num_ordenes')[:5],
        'servicios_json': json.dumps(servicios_data),
        'active_tab': 'ordenes'
    }
    return render(request, 'nueva_orden.html', context)


@login_required
def orden_create_partial(request, cliente_id):
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return HttpResponse("<script>showToast('El cliente seleccionado no existe.', 'error')</script>", status=404)

    if request.method == 'POST':
        observaciones = request.POST.get('observaciones', '')
        try:
            total = float(request.POST.get('total', 0.0))
            descuento = float(request.POST.get('descuento', 0.0))
            total_a_pagar = float(request.POST.get('total_a_pagar', 0.0))
            anticipo = float(request.POST.get('anticipo', 0.0))
        except (ValueError, TypeError):
            return HttpResponse("<script>showToast('Error al procesar los montos de la orden.', 'error')</script>", status=400)
            
        metodo_pago = request.POST.get('metodo_pago', 'Efectivo')
        prendas_json = request.POST.get('prendas_json', '[]')
        fecha_entrega_estimada_str = request.POST.get('fecha_entrega_estimada')
        
        try:
            prendas_data = json.loads(prendas_json)
        except json.JSONDecodeError:
            return HttpResponse("<script>showToast('Error en el formato de los detalles de las prendas.', 'error')</script>", status=400)
            
        if not prendas_data:
            return HttpResponse("<script>showToast('Debe agregar al menos una prenda a la orden.', 'error')</script>", status=400)
        
        fecha_entrega_estimada = None
        if fecha_entrega_estimada_str:
            fecha_entrega_estimada = parse_datetime(fecha_entrega_estimada_str)
            if fecha_entrega_estimada and timezone.is_naive(fecha_entrega_estimada):
                fecha_entrega_estimada = timezone.make_aware(fecha_entrega_estimada)
        
        try:
            with transaction.atomic():
                orden = Orden.objects.create(
                    cliente=cliente,
                    fecha_entrega_estimada=fecha_entrega_estimada,
                    total=total,
                    descuento=descuento,
                    total_a_pagar=total_a_pagar,
                    anticipo=anticipo,
                    saldo_pendiente=total_a_pagar - anticipo,
                    estado_pago='Liquidado' if anticipo >= total_a_pagar else ('Parcial' if anticipo > 0 else 'Pendiente'),
                    estado_actual='Recibida',
                    observaciones=observaciones or None
                )
                
                SeguimientoLavado.objects.create(
                    orden=orden,
                    estado='Recibida',
                    observaciones='Ingreso inicial de la orden de servicio al sistema.'
                )
                
                for p in prendas_data:
                    servicio = Servicio.objects.get(id=p['servicio_id'])
                    precio_unitario = float(p['precio_unitario']) if p.get('precio_unitario') is not None else None
                    PrendaOrden.objects.create(
                        orden=orden,
                        tipo_prenda=p['tipo_prenda'],
                        cantidad=int(p.get('cantidad', 1)),
                        peso=float(p['peso']) if p.get('peso') else None,
                        servicio=servicio,
                        precio_unitario=precio_unitario,
                        es_delicada=bool(p.get('es_delicada', False)),
                        observaciones=p.get('observaciones', '') or None
                    )
                
                if anticipo > 0:
                    Pago.objects.create(
                        orden=orden,
                        monto=anticipo,
                        metodo_pago=metodo_pago,
                        tipo_pago='Anticipo',
                        observaciones='Abono inicial al registrar la orden'
                    )
            
            # Recuperar historial actualizado del cliente
            ordenes = Orden.objects.filter(cliente=cliente).order_by('-fecha_recepcion').prefetch_related('prendas__servicio')
            
            context = {
                'cliente': cliente,
                'ordenes': ordenes,
                'success_message': "Orden de servicio registrada con éxito."
            }
            # Retornar el fragmento del historial para que se renderice en el panel derecho
            response = render(request, 'partials/cliente_historial.html', context)
            # Agregar el script para disparar la notificación Toast
            # Nota: El HTML retornado incluirá al final un script para activar el toast
            return response
            
        except Exception as e:
            return HttpResponse(f"<script>showToast('Error al procesar la orden: {str(e)}', 'error')</script>", status=500)

    # GET: Cargar formulario parcial
    servicios = Servicio.objects.all()
    servicios_data = [
        {
            'id': s.id,
            'nombre': s.nombre,
            'tarifa': float(s.tarifa),
            'tipo_cobro': s.tipo_cobro
        }
        for s in servicios
    ]
    
    context = {
        'cliente': cliente,
        'servicios_json': json.dumps(servicios_data),
        'servicios': servicios
    }
    return render(request, 'partials/orden_create_partial.html', context)


# ==========================================
#  DETALLE DE ORDEN Y SEGUIMIENTO (PASO 7)
# ==========================================

@login_required
def orden_detail(request, orden_id):
    try:
        orden = Orden.objects.select_related('cliente').get(id=orden_id)
    except Orden.DoesNotExist:
        messages.error(request, "La orden solicitada no existe.")
        return redirect('ordenes_list')

    prendas = PrendaOrden.objects.filter(orden=orden).select_related('servicio')
    seguimientos = SeguimientoLavado.objects.filter(orden=orden).order_by('fecha_cambio')
    pagos = Pago.objects.filter(orden=orden).order_by('fecha_pago')

    # Determinar el siguiente estado disponible
    estado_actual = orden.estado_actual
    siguiente_estado = None
    if estado_actual in ESTADOS_LAVADO:
        idx = ESTADOS_LAVADO.index(estado_actual)
        if idx < len(ESTADOS_LAVADO) - 1:
            siguiente_estado = ESTADOS_LAVADO[idx + 1]

    # Calcular subtotal por prenda
    prendas_detalle = []
    for p in prendas:
        tarifa = float(p.precio_unitario if p.precio_unitario is not None else p.servicio.tarifa)
        if 'kg' in p.servicio.tipo_cobro.lower():
            subtotal = tarifa * float(p.peso or 0)
        else:
            subtotal = tarifa * p.cantidad
        prendas_detalle.append({
            'prenda': p,
            'subtotal': subtotal
        })

    context = {
        'orden': orden,
        'prendas_detalle': prendas_detalle,
        'seguimientos': seguimientos,
        'pagos': pagos,
        'siguiente_estado': siguiente_estado,
        'estados_lavado': ESTADOS_LAVADO,
        'estado_actual_idx': ESTADOS_LAVADO.index(estado_actual) if estado_actual in ESTADOS_LAVADO else 0,
    }

    return render(request, 'orden_detalle.html', context)



@login_required
def orden_register_payment(request, orden_id):
    if request.method == 'POST':
        try:
            orden = Orden.objects.get(id=orden_id)
        except Orden.DoesNotExist:
            return HttpResponse("<p style='color:var(--danger);'>Orden no encontrada.</p>", status=404)

        try:
            monto = float(request.POST.get('monto', 0))
        except (ValueError, TypeError):
            monto = 0

        metodo_pago = request.POST.get('metodo_pago', 'Efectivo')
        observaciones_pago = request.POST.get('observaciones_pago', '').strip()

        if monto <= 0:
            pagos = Pago.objects.filter(orden=orden).order_by('fecha_pago')
            return render(request, 'partials/orden_payment_panel.html', {
                'orden': orden, 'pagos': pagos, 'payment_error': 'El monto debe ser mayor a $0.00.'
            })

        saldo_actual = float(orden.saldo_pendiente)
        
        # Calcular cambio para pagos en Efectivo
        efectivo_recibido = monto
        cambio = 0.0
        monto_registrado = monto
        
        efectivo_entregado_str = request.POST.get('efectivo_entregado', '').strip()
        
        if monto > saldo_actual:
            monto_registrado = saldo_actual
            if metodo_pago == 'Efectivo':
                cambio = monto - saldo_actual
        elif efectivo_entregado_str and metodo_pago == 'Efectivo':
            try:
                efectivo_entregado_val = float(efectivo_entregado_str)
                if efectivo_entregado_val > monto:
                    efectivo_recibido = efectivo_entregado_val
                    cambio = efectivo_entregado_val - monto
            except ValueError:
                pass

        if metodo_pago == 'Efectivo' and cambio > 0:
            detalles_cambio = f"Recibido: ${efectivo_recibido:.2f} | Cambio: ${cambio:.2f}"
            if observaciones_pago:
                observaciones_db = f"{observaciones_pago} ({detalles_cambio})"
            else:
                observaciones_db = detalles_cambio
        else:
            observaciones_db = observaciones_pago or f"Pago registrado (${monto_registrado:.2f})"

        with transaction.atomic():
            tipo_pago = 'Saldo Final' if monto_registrado >= saldo_actual else 'Abono'

            Pago.objects.create(
                orden=orden,
                monto=monto_registrado,
                metodo_pago=metodo_pago,
                tipo_pago=tipo_pago,
                observaciones=observaciones_db
            )

            nuevo_anticipo = float(orden.anticipo) + monto_registrado
            nuevo_saldo = float(orden.total_a_pagar) - nuevo_anticipo

            orden.anticipo = nuevo_anticipo
            orden.saldo_pendiente = max(nuevo_saldo, 0)

            if orden.saldo_pendiente <= 0:
                orden.estado_pago = 'Liquidado'
            elif nuevo_anticipo > 0:
                orden.estado_pago = 'Parcial'

            orden.save()

        pagos = Pago.objects.filter(orden=orden).order_by('fecha_pago')

        context = {
            'orden': orden,
            'pagos': pagos,
            'cambio_info': {
                'monto_cobrado': monto_registrado,
                'efectivo_recibido': efectivo_recibido,
                'cambio': cambio
            } if cambio > 0 else None
        }

        response = render(request, 'partials/orden_payment_panel.html', context)
        response['HX-Trigger'] = 'paymentUpdated'
        return response

    return HttpResponse(status=405)


@login_required
def pagos_list(request):
    local_now = timezone.localtime(timezone.now())
    start_of_today = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_today = local_now.replace(hour=23, minute=59, second=59, microsecond=999999)

    pagos = Pago.objects.select_related('orden__cliente').order_by('-fecha_pago')

    pagos_hoy = Pago.objects.filter(fecha_pago__range=(start_of_today, end_of_today))
    
    total_recaudado = pagos_hoy.aggregate(Sum('monto'))['monto__sum'] or 0.00
    total_efectivo = pagos_hoy.filter(metodo_pago='Efectivo').aggregate(Sum('monto'))['monto__sum'] or 0.00
    total_transferencia = pagos_hoy.filter(metodo_pago='Transferencia').aggregate(Sum('monto'))['monto__sum'] or 0.00
    total_tarjeta = pagos_hoy.filter(metodo_pago='Tarjeta').aggregate(Sum('monto'))['monto__sum'] or 0.00

    context = {
        'pagos': pagos,
        'total_recaudado': total_recaudado,
        'total_efectivo': total_efectivo,
        'total_transferencia': total_transferencia,
        'total_tarjeta': total_tarjeta,
    }
    return render(request, 'pagos.html', context)


@login_required
def pagos_search(request):
    query = request.GET.get('search', '').strip()
    metodo = request.GET.get('metodo_pago', '').strip()
    tipo = request.GET.get('tipo_pago', '').strip()
    fecha_rango = request.GET.get('fecha_rango', '').strip()

    pagos = Pago.objects.select_related('orden__cliente').all().order_by('-fecha_pago')

    if query:
        id_filter = Q()
        if query.isdigit():
            id_filter = Q(orden__id=int(query))
        pagos = pagos.filter(
            id_filter | Q(orden__cliente__nombre__icontains=query)
        )

    if metodo:
        pagos = pagos.filter(metodo_pago=metodo)

    if tipo:
        pagos = pagos.filter(tipo_pago=tipo)

    if fecha_rango:
        if " to " in fecha_rango:
            try:
                start_str, end_str = fecha_rango.split(" to ")
                start_date = timezone.datetime.strptime(start_str, "%Y-%m-%d")
                end_date = timezone.datetime.strptime(end_str, "%Y-%m-%d")
                start_datetime = timezone.make_aware(start_date.replace(hour=0, minute=0, second=0, microsecond=0))
                end_datetime = timezone.make_aware(end_date.replace(hour=23, minute=59, second=59, microsecond=999999))
                pagos = pagos.filter(fecha_pago__range=(start_datetime, end_datetime))
            except ValueError:
                pass
        else:
            try:
                date_obj = timezone.datetime.strptime(fecha_rango, "%Y-%m-%d")
                start_datetime = timezone.make_aware(date_obj.replace(hour=0, minute=0, second=0, microsecond=0))
                end_datetime = timezone.make_aware(date_obj.replace(hour=23, minute=59, second=59, microsecond=999999))
                pagos = pagos.filter(fecha_pago__range=(start_datetime, end_datetime))
            except ValueError:
                pass

    return render(request, 'partials/pagos_table.html', {'pagos': pagos})


@login_required
def orden_ticket(request, orden_id):
    try:
        orden = Orden.objects.select_related('cliente').get(id=orden_id)
    except Orden.DoesNotExist:
        messages.error(request, "La orden solicitada no existe.")
        return redirect('ordenes_list')

    prendas = PrendaOrden.objects.filter(orden=orden).select_related('servicio')
    pagos = Pago.objects.filter(orden=orden).order_by('fecha_pago')

    prendas_detalle = []
    for p in prendas:
        tarifa = float(p.precio_unitario if p.precio_unitario is not None else p.servicio.tarifa)
        if 'kg' in p.servicio.tipo_cobro.lower():
            subtotal = tarifa * float(p.peso or 0)
        else:
            subtotal = tarifa * p.cantidad
        prendas_detalle.append({
            'prenda': p,
            'subtotal': subtotal
        })

    context = {
        'orden': orden,
        'prendas_detalle': prendas_detalle,
        'pagos': pagos,
    }
    return render(request, 'orden_ticket.html', context)

# ==========================================
# GESTIÓN DE USUARIOS
# ==========================================

@login_required
def usuarios_list(request):
    usuarios = User.objects.all().order_by('-is_active', 'first_name', 'username').prefetch_related('groups')
    total_usuarios = usuarios.count()
    activos_count = usuarios.filter(is_active=True).count()
    inactivos_count = usuarios.filter(is_active=False).count()
    context = {
        'usuarios': usuarios,
        'total_usuarios': total_usuarios,
        'activos_count': activos_count,
        'inactivos_count': inactivos_count,
        'active_tab': 'usuarios'
    }
    return render(request, 'usuarios.html', context)

@login_required
def usuarios_search(request):
    q = request.GET.get('q', '').strip()
    estado = request.GET.get('estado', '')
    
    usuarios = User.objects.all().order_by('-is_active', 'first_name', 'username').prefetch_related('groups')
    
    if q:
        usuarios = usuarios.filter(Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(email__icontains=q))
    if estado == 'activos':
        usuarios = usuarios.filter(is_active=True)
    elif estado == 'inactivos':
        usuarios = usuarios.filter(is_active=False)
        
    return render(request, 'partials/usuarios_table.html', {'usuarios': usuarios})

@login_required
def usuario_create(request):
    grupos = Group.objects.all()
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        rol_id = request.POST.get('rol')
        
        if password != confirm_password:
            messages.error(request, 'Las contraseñas no coinciden.')
        elif User.objects.filter(username=username).exists():
            messages.error(request, 'El nombre de usuario ya existe.')
        else:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            if rol_id:
                grupo = Group.objects.get(id=rol_id)
                user.groups.add(grupo)
            messages.success(request, 'Usuario creado exitosamente.')
            return redirect('usuarios_list')
            
    context = {
        'grupos': grupos,
        'active_tab': 'usuarios'
    }
    return render(request, 'usuario_form.html', context)

@login_required
def usuario_update(request, id):
    try:
        usuario = User.objects.get(id=id)
    except User.DoesNotExist:
        messages.error(request, 'El usuario solicitado no existe.')
        return redirect('usuarios_list')
    
    grupos = Group.objects.all()
    if request.method == 'POST':
        new_username = request.POST.get('username')
        if new_username != usuario.username and User.objects.filter(username=new_username).exists():
            messages.error(request, 'El nombre de usuario ya existe.')
            return redirect('usuario_update', id=id)

        usuario.username = new_username
        usuario.first_name = request.POST.get('first_name')
        usuario.last_name = request.POST.get('last_name')
        usuario.email = request.POST.get('email')
        
        password = request.POST.get('password')
        if password:
            confirm_password = request.POST.get('confirm_password')
            if password == confirm_password:
                usuario.set_password(password)
            else:
                messages.error(request, 'Las contraseñas no coinciden.')
                return redirect('usuario_update', id=id)
                
        rol_id = request.POST.get('rol')
        if rol_id:
            usuario.groups.clear()
            grupo = Group.objects.get(id=rol_id)
            usuario.groups.add(grupo)
            
        usuario.save()
        messages.success(request, 'Usuario actualizado exitosamente.')
        return redirect('usuarios_list')
        
    context = {
        'usuario': usuario,
        'grupos': grupos,
        'active_tab': 'usuarios'
    }
    return render(request, 'usuario_form.html', context)

@login_required
def usuario_toggle_status(request, id):
    if request.method == 'POST':
        try:
            usuario = User.objects.get(id=id)
        except User.DoesNotExist:
            messages.error(request, 'El usuario solicitado no existe.')
            return redirect('usuarios_list')
        
        if usuario == request.user:
            messages.error(request, 'No puedes desactivar tu propia cuenta.')
            return redirect('usuarios_list')
            
        usuario.is_active = not usuario.is_active
        usuario.save()
        estado = "activado" if usuario.is_active else "desactivado"
        messages.success(request, f'Usuario {estado} exitosamente.')
    return redirect('usuarios_list')

# ==========================================
# SEGUIMIENTO (KANBAN)
# ==========================================
@login_required
def seguimiento_list(request):
    ordenes_activas = Orden.objects.exclude(estado_actual='Entregada').select_related('cliente').prefetch_related('prendas').order_by('fecha_recepcion')
    
    # Parámetro para seguimiento individual o tomar la primera activa por defecto
    orden_id = request.GET.get('orden_id')
    orden_seleccionada = None
    seguimientos_orden = []
    
    if orden_id:
        try:
            orden_seleccionada = Orden.objects.select_related('cliente').prefetch_related('prendas').get(id=orden_id)
        except Orden.DoesNotExist:
            pass
            
    # Si no se seleccionó ninguna en particular pero hay activas, precargar la primera
    if not orden_seleccionada and ordenes_activas.exists():
        orden_seleccionada = ordenes_activas.first()
        
    if orden_seleccionada:
        seguimientos_orden = SeguimientoLavado.objects.filter(orden=orden_seleccionada).order_by('fecha_cambio')
        
    context = {
        'ordenes_activas': ordenes_activas,
        'orden_seleccionada': orden_seleccionada,
        'seguimientos_orden': seguimientos_orden,
    }
    return render(request, 'seguimiento.html', context)

@login_required
def seguimiento_advance_status(request, orden_id):
    if request.method == 'POST':
        from django.db import transaction
        from django.contrib import messages
        from django.shortcuts import redirect
        
        orden = get_object_or_404(Orden, id=orden_id)
        estados = ['Recibida', 'Clasificada', 'En lavado', 'En secado', 'En planchado', 'Empaquetada', 'Lista para entrega', 'Entregada']
        try:
            idx = estados.index(orden.estado_actual)
            if idx < len(estados) - 1:
                nuevo_estado = estados[idx + 1]
                
                # Validación contable: No entregar si tiene saldo pendiente
                if nuevo_estado == 'Entregada' and orden.saldo_pendiente > 0:
                    messages.error(request, f"No se puede entregar la orden #{orden.id:06d} porque tiene un saldo pendiente de ${orden.saldo_pendiente:.2f}. El pago total es obligatorio.")
                else:
                    with transaction.atomic():
                        orden.estado_actual = nuevo_estado
                        if nuevo_estado == 'Entregada':
                            from django.utils import timezone
                            orden.fecha_entrega_real = timezone.now()
                        orden.save()
                        
                        # Registrar en el historial de seguimiento
                        SeguimientoLavado.objects.create(
                            orden=orden,
                            estado=nuevo_estado,
                            observaciones=f"Estado avanzado a {nuevo_estado} desde la vista de seguimiento."
                        )
                        messages.success(request, f"Orden #{orden.id:06d} avanzada a {nuevo_estado} con éxito.")
        except ValueError:
            pass
            
        referer = request.META.get('HTTP_REFERER')
        if referer:
            return redirect(referer)
        return redirect('seguimiento_list')
    
    return HttpResponse(status=405)
