
# ==========================================
# MÓDULO DE CAJA (CORTE DE CAJA)
# ==========================================
from .models import TurnoCaja, MovimientoCaja

@login_required
@group_required('Administrador', 'Cajero')
def caja_dashboard(request):
    # Buscar si hay un turno abierto para el usuario actual o en general
    # Si queremos que la caja sea por sucursal (general), buscamos la última abierta
    turno_abierto = TurnoCaja.objects.filter(estado='Abierta').first()
    
    movimientos = []
    pagos = []
    
    if turno_abierto:
        movimientos = MovimientoCaja.objects.filter(turno=turno_abierto).order_by('-fecha')
        pagos = Pago.objects.filter(turno=turno_abierto).order_by('-fecha_pago')
        
        ingresos_ordenes = pagos.aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        ingresos_extra = movimientos.filter(tipo='Ingreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        egresos = movimientos.filter(tipo='Egreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        saldo_calculado = turno_abierto.saldo_inicial + ingresos_ordenes + ingresos_extra - egresos
    else:
        saldo_calculado = Decimal('0.00')
        ingresos_ordenes = Decimal('0.00')
        ingresos_extra = Decimal('0.00')
        egresos = Decimal('0.00')

    context = {
        'turno_abierto': turno_abierto,
        'movimientos': movimientos,
        'pagos': pagos,
        'ingresos_ordenes': ingresos_ordenes,
        'ingresos_extra': ingresos_extra,
        'egresos': egresos,
        'saldo_calculado': saldo_calculado,
        'active_tab': 'caja'
    }
    return render(request, 'caja.html', context)

@login_required
@group_required('Administrador', 'Cajero')
def caja_abrir(request):
    if request.method == 'POST':
        if TurnoCaja.objects.filter(estado='Abierta').exists():
            messages.error(request, 'Ya existe un turno de caja abierto.')
            return redirect('caja_dashboard')
            
        try:
            saldo_inicial = Decimal(request.POST.get('saldo_inicial', '0.00'))
        except InvalidOperation:
            saldo_inicial = Decimal('0.00')
            
        TurnoCaja.objects.create(
            usuario=request.user,
            saldo_inicial=saldo_inicial,
            estado='Abierta'
        )
        messages.success(request, f'Turno de caja abierto exitosamente con ${saldo_inicial}.')
        
    return redirect('caja_dashboard')

@login_required
@group_required('Administrador', 'Cajero')
def caja_cerrar(request):
    turno = TurnoCaja.objects.filter(estado='Abierta').first()
    if not turno:
        messages.error(request, 'No hay turno abierto para cerrar.')
        return redirect('caja_dashboard')
        
    if request.method == 'POST':
        try:
            saldo_real = Decimal(request.POST.get('saldo_final_real', '0.00'))
        except InvalidOperation:
            saldo_real = Decimal('0.00')
            
        observaciones = request.POST.get('observaciones', '')
        
        # Calcular saldo esperado
        pagos = Pago.objects.filter(turno=turno)
        ingresos_ordenes = pagos.aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        movimientos = MovimientoCaja.objects.filter(turno=turno)
        ingresos_extra = movimientos.filter(tipo='Ingreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        egresos = movimientos.filter(tipo='Egreso').aggregate(Sum('monto'))['monto__sum'] or Decimal('0.00')
        
        saldo_esperado = turno.saldo_inicial + ingresos_ordenes + ingresos_extra - egresos
        
        turno.saldo_final_esperado = saldo_esperado
        turno.saldo_final_real = saldo_real
        turno.fecha_cierre = timezone.now()
        turno.estado = 'Cerrada'
        turno.observaciones = observaciones
        turno.save()
        
        messages.success(request, 'Turno de caja cerrado exitosamente.')
        
    return redirect('caja_dashboard')

@login_required
@group_required('Administrador', 'Cajero')
def caja_movimiento_crear(request):
    turno = TurnoCaja.objects.filter(estado='Abierta').first()
    if not turno:
        messages.error(request, 'Debe abrir un turno de caja antes de registrar movimientos.')
        return redirect('caja_dashboard')
        
    if request.method == 'POST':
        tipo = request.POST.get('tipo', 'Egreso')
        concepto = request.POST.get('concepto', '')
        try:
            monto = Decimal(request.POST.get('monto', '0.00'))
        except InvalidOperation:
            monto = Decimal('0.00')
            
        if monto > 0 and concepto:
            MovimientoCaja.objects.create(
                turno=turno,
                tipo=tipo,
                concepto=concepto,
                monto=monto
            )
            messages.success(request, f'{tipo} registrado correctamente.')
        else:
            messages.error(request, 'Por favor, ingrese un monto válido y un concepto.')
            
    return redirect('caja_dashboard')
