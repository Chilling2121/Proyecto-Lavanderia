-- Creación de la Base de Datos para LavaFácil
CREATE DATABASE IF NOT EXISTS `lavafacil_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lavafacil_db`;

-- 1. Tabla de Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `correo` VARCHAR(100),
    `direccion` TEXT,
    `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Servicios y Tarifas
CREATE TABLE IF NOT EXISTS `servicios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT,
    `tarifa` DECIMAL(10, 2) NOT NULL,
    `tipo_cobro` VARCHAR(50) NOT NULL COMMENT 'Por Kg, Por Prenda'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Promociones y Descuentos
CREATE TABLE IF NOT EXISTS `promociones` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL COMMENT 'Porcentaje, Fijo',
    `valor` DECIMAL(10, 2) NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `esta_activa` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Órdenes de Servicio
CREATE TABLE IF NOT EXISTS `ordenes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cliente_id` INT NOT NULL,
    `fecha_recepcion` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `fecha_entrega_estimada` DATETIME,
    `fecha_entrega_real` DATETIME,
    `total` DECIMAL(10, 2) DEFAULT 0.00,
    `descuento` DECIMAL(10, 2) DEFAULT 0.00,
    `total_a_pagar` DECIMAL(10, 2) DEFAULT 0.00,
    `anticipo` DECIMAL(10, 2) DEFAULT 0.00,
    `saldo_pendiente` DECIMAL(10, 2) DEFAULT 0.00,
    `estado_pago` VARCHAR(50) DEFAULT 'Pendiente' COMMENT 'Pendiente, Parcial, Liquidado',
    `estado_actual` VARCHAR(50) DEFAULT 'Recibida' COMMENT 'Recibida, Clasificada, En lavado, En secado, En planchado, Empaquetada, Lista para entrega, Entregada',
    `observaciones` TEXT,
    CONSTRAINT `fk_ordenes_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Recepción y Clasificación de Prendas (Detalles de la Orden)
CREATE TABLE IF NOT EXISTS `prendas_orden` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `orden_id` INT NOT NULL,
    `tipo_prenda` VARCHAR(100) NOT NULL COMMENT 'Camisa, Pantalón, Toalla, Sábana, etc.',
    `cantidad` INT NOT NULL DEFAULT 1,
    `peso` DECIMAL(5, 2) COMMENT 'Peso en Kg',
    `servicio_id` INT NOT NULL,
    `es_delicada` BOOLEAN DEFAULT FALSE,
    `observaciones` VARCHAR(255),
    CONSTRAINT `fk_prendas_ordenes` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_prendas_servicios` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla de Seguimiento del Proceso de Lavado (Historial de Cambios de Estado)
CREATE TABLE IF NOT EXISTS `seguimiento_lavado` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `orden_id` INT NOT NULL,
    `estado` VARCHAR(50) NOT NULL COMMENT 'Recibida, Clasificada, En lavado, En secado, En planchado, Empaquetada, Lista para entrega, Entregada',
    `fecha_cambio` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `observaciones` VARCHAR(255),
    CONSTRAINT `fk_seguimiento_ordenes` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla de Gestión de Pagos (Historial de Pagos)
CREATE TABLE IF NOT EXISTS `pagos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `orden_id` INT NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha_pago` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `metodo_pago` VARCHAR(50) NOT NULL COMMENT 'Efectivo, Transferencia, Tarjeta',
    `tipo_pago` VARCHAR(50) NOT NULL COMMENT 'Anticipo, Saldo Final',
    `observaciones` VARCHAR(255),
    CONSTRAINT `fk_pagos_ordenes` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INSERCIÓN DE DATOS DE SEMILLA INICIALES
-- ==========================================

-- Servicios del Prototipo (Módulo 6 del PDF)
INSERT INTO `servicios` (`nombre`, `descripcion`, `tarifa`, `tipo_cobro`) VALUES
('Lavado Normal', 'Lavado regular de prendas', 15.00, 'Por Kg'),
('Lavado Delicado', 'Prendas delicadas o especiales', 20.00, 'Por Kg'),
('Lavado en Seco', 'Limpieza en seco profesional', 25.00, 'Por Prenda'),
('Planchado', 'Servicio de planchado', 10.00, 'Por Prenda'),
('Edredones', 'Lavado de edredones y cobijas', 30.00, 'Por Prenda');

-- Promociones del Prototipo (Módulo 9 del PDF)
INSERT INTO `promociones` (`nombre`, `tipo`, `valor`, `fecha_inicio`, `fecha_fin`, `esta_activa`) VALUES
('Descuento Verano', 'Porcentaje', 20.00, '2026-06-01', '2026-08-31', 1),
('Cliente Frecuente', 'Porcentaje', 10.00, '2026-01-01', '2026-12-31', 1),
('Miércoles Feliz', 'Fijo', 5.00, '2026-01-01', '2026-12-31', 1);

