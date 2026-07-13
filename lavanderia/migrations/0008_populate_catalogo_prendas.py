from django.db import migrations

def populate_prendas(apps, schema_editor):
    CatalogoPrenda = apps.get_model('lavanderia', 'CatalogoPrenda')
    default_prendas = [
        'Pantalón',
        'Camisa',
        'Chaqueta / Saco',
        'Vestido',
        'Falda',
        'Edredón / Cobija',
        'Abrigo',
        'Terno / Traje',
        'Jeans',
        'Sábanas',
        'Toallas',
        'Zapatos',
        'Gorra'
    ]
    for nombre in default_prendas:
        CatalogoPrenda.objects.get_or_create(nombre=nombre)

def reverse_populate(apps, schema_editor):
    CatalogoPrenda = apps.get_model('lavanderia', 'CatalogoPrenda')
    CatalogoPrenda.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('lavanderia', '0007_catalogoprenda'),
    ]

    operations = [
        migrations.RunPython(populate_prendas, reverse_populate),
    ]
