from django.db import models

class Cliente(models.Model):
    nombre = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20)
    correo = models.EmailField(max_length=100, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clientes'
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self):
        return self.nombre


class Servicio(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    tarifa = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_cobro = models.CharField(max_length=50, help_text='Por Kg, Por Prenda')

    class Meta:
        db_table = 'servicios'
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'

    def __str__(self):
        return f"{self.nombre} (${self.tarifa} {self.tipo_cobro})"


class Promocion(models.Model):
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, help_text='Porcentaje, Fijo')
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    esta_activa = models.BooleanField(default=True)

    class Meta:
        db_table = 'promociones'
        verbose_name = 'Promoción'
        verbose_name_plural = 'Promociones'

    def __str__(self):
        return f"{self.nombre} ({self.valor} {self.tipo})"


class Orden(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='ordenes')
    fecha_recepcion = models.DateTimeField(auto_now_add=True)
    fecha_entrega_estimada = models.DateTimeField(blank=True, null=True)
    fecha_entrega_real = models.DateTimeField(blank=True, null=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_a_pagar = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    anticipo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    saldo_pendiente = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estado_pago = models.CharField(max_length=50, default='Pendiente', help_text='Pendiente, Parcial, Liquidado')
    estado_actual = models.CharField(max_length=50, default='Recibida', help_text='Recibida, Clasificada, En lavado, En secado, En planchado, Empaquetada, Lista para entrega, Entregada')
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'ordenes'
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'

    def __str__(self):
        return f"Orden #{self.id:06d} - {self.cliente.nombre}"


class PrendaOrden(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='prendas')
    tipo_prenda = models.CharField(max_length=100, help_text='Camisa, Pantalón, Toalla, Sábana, etc.')
    cantidad = models.IntegerField(default=1)
    peso = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text='Peso en Kg')
    servicio = models.ForeignKey(Servicio, on_delete=models.PROTECT)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Precio unitario o tarifa por kg aplicada')
    es_delicada = models.BooleanField(default=False)
    observaciones = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'prendas_orden'
        verbose_name = 'Prenda de Orden'
        verbose_name_plural = 'Prendas de Orden'

    def __str__(self):
        return f"{self.cantidad}x {self.tipo_prenda} (Orden #{self.orden_id:06d})"


class SeguimientoLavado(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='seguimientos')
    estado = models.CharField(max_length=50, help_text='Recibida, Clasificada, En lavado, En secado, En planchado, Empaquetada, Lista para entrega, Entregada')
    fecha_cambio = models.DateTimeField(auto_now_add=True)
    observaciones = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'seguimiento_lavado'
        verbose_name = 'Seguimiento de Lavado'
        verbose_name_plural = 'Seguimientos de Lavado'

    def __str__(self):
        return f"Orden #{self.orden_id:06d} -> {self.estado} ({self.fecha_cambio})"


class Pago(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='pagos')
    turno = models.ForeignKey('TurnoCaja', on_delete=models.SET_NULL, null=True, blank=True, related_name='pagos')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    metodo_pago = models.CharField(max_length=50, help_text='Efectivo, Transferencia, Tarjeta')
    tipo_pago = models.CharField(max_length=50, help_text='Anticipo, Saldo Final')
    observaciones = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'pagos'
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'

    def __str__(self):
        return f"Pago de ${self.monto} ({self.tipo_pago}) - Orden #{self.orden_id:06d}"


class Configuracion(models.Model):
    nombre_negocio = models.CharField(max_length=150, default="LavaFácil")
    telefono_contacto = models.CharField(max_length=50, blank=True, null=True, default="+1 234 567 8900")
    direccion = models.TextField(blank=True, null=True, default="Av. Principal 123, Ciudad")
    correo = models.EmailField(max_length=100, blank=True, null=True, default="contacto@lavafacil.com")
    
    simbolo_moneda = models.CharField(max_length=10, default="$", help_text="Símbolo a mostrar en la interfaz (ej. $, S/, €)")
    impuesto_porcentaje = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Porcentaje de IVA/IGV (ej. 16.00)")
    
    mensaje_ticket_cabecera = models.TextField(blank=True, null=True, default="RFC: XXXXXX000000\n¡Bienvenido!")
    mensaje_ticket_pie = models.TextField(blank=True, null=True, default="¡Gracias por su preferencia!\nLas prendas no reclamadas después de 30 días causarán recargo de almacenaje o serán donadas.")
    
    class Meta:
        db_table = 'configuracion'
        verbose_name = 'Configuración'
        verbose_name_plural = 'Configuraciones'

    def save(self, *args, **kwargs):
        # Asegura que siempre se guarde en la misma fila (Singleton)
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        # Método auxiliar para obtener o crear la configuración única
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Configuración Global"


from django.contrib.auth.models import User

class TurnoCaja(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, related_name='turnos')
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    saldo_inicial = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    saldo_final_esperado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    saldo_final_real = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, default='Abierta', help_text='Abierta, Cerrada')
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'turnos_caja'
        verbose_name = 'Turno de Caja'
        verbose_name_plural = 'Turnos de Caja'

    def __str__(self):
        return f"Turno #{self.id} - {self.usuario.username} ({self.estado})"


class MovimientoCaja(models.Model):
    turno = models.ForeignKey(TurnoCaja, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=20, help_text='Ingreso, Egreso')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    concepto = models.CharField(max_length=255)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'movimientos_caja'
        verbose_name = 'Movimiento de Caja'
        verbose_name_plural = 'Movimientos de Caja'

    def __str__(self):
        return f"{self.tipo}: ${self.monto} ({self.concepto})"
