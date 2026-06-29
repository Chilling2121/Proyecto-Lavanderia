import re

def update_views_for_caja():
    filepath = 'lavanderia/views.py'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Import
    if 'TurnoCaja' not in content[:1000]: # Ensure it's imported at the top
        content = content.replace(
            'from .models import Orden, Pago, PrendaOrden, Cliente, Servicio, SeguimientoLavado',
            'from .models import Orden, Pago, PrendaOrden, Cliente, Servicio, SeguimientoLavado, TurnoCaja, MovimientoCaja'
        )

    # orden_create
    old_orden_create_pago = """                if anticipo > 0:
                    Pago.objects.create(
                        orden=orden,
                        monto=anticipo,
                        metodo_pago=metodo_pago,
                        tipo_pago='Anticipo',
                        observaciones='Abono inicial al registrar la orden'
                    )"""
    new_orden_create_pago = """                if anticipo > 0:
                    turno_activo = TurnoCaja.objects.filter(estado='Abierta').first()
                    Pago.objects.create(
                        orden=orden,
                        monto=anticipo,
                        metodo_pago=metodo_pago,
                        tipo_pago='Anticipo',
                        observaciones='Abono inicial al registrar la orden',
                        turno=turno_activo
                    )"""
    content = content.replace(old_orden_create_pago, new_orden_create_pago)

    # orden_register_payment
    old_register_payment = """            tipo_pago = 'Saldo Final' if monto_registrado >= saldo_actual else 'Abono'

            Pago.objects.create(
                orden=orden,
                monto=monto_registrado,
                metodo_pago=metodo_pago,
                tipo_pago=tipo_pago,
                observaciones=observaciones_db
            )"""
    new_register_payment = """            tipo_pago = 'Saldo Final' if monto_registrado >= saldo_actual else 'Abono'
            turno_activo = TurnoCaja.objects.filter(estado='Abierta').first()

            Pago.objects.create(
                orden=orden,
                monto=monto_registrado,
                metodo_pago=metodo_pago,
                tipo_pago=tipo_pago,
                observaciones=observaciones_db,
                turno=turno_activo
            )"""
    content = content.replace(old_register_payment, new_register_payment)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Views updated for TurnoCaja")

if __name__ == '__main__':
    update_views_for_caja()
