import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BookOpen, Database, Shield, Globe, HardDrive, ChevronDown, ChevronRight } from 'lucide-react';

export default function Documentacion() {
  const [openSections, setOpenSections] = useState(['postgresql']);

  const toggleSection = (id) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const Section = ({ id, title, icon: Icon, color, children }) => {
    const isOpen = openSections.includes(id);
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
        <button 
          onClick={() => toggleSection(id)}
          className={`w-full flex items-center gap-3 p-4 text-left ${isOpen ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 transition`}
        >
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="flex-1 font-semibold text-gray-800">{title}</span>
          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </button>
        {isOpen && <div className="p-4 border-t border-gray-100 bg-white">{children}</div>}
      </div>
    );
  };

  const CodeBlock = ({ children, title }) => (
    <div className="mb-4">
      {title && <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>}
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Documentación Técnica</h1>
              <p className="text-gray-400">EduTrack - Proyecto Final BD Avanzadas</p>
            </div>
          </div>
        </div>

        {/* A) PostgreSQL */}
        <Section id="postgresql" title="A) PostgreSQL - Esquema Relacional" icon={Database} color="bg-orange-500">
          <CodeBlock title="DDL - Creación de Tablas">
{`-- Tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'teacher', 'coordinator', 'admin')) DEFAULT 'student',
    active BOOLEAN DEFAULT TRUE
);

-- Tabla alumnos
CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100)
);

-- Tabla profesores
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100)
);

-- Tabla materias
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla grupos
CREATE TABLE grupos (
    id SERIAL PRIMARY KEY,
    materia_id INTEGER REFERENCES materias(id),
    profesor_id INTEGER REFERENCES profesores(id),
    periodo VARCHAR(20),
    cupo_maximo INTEGER DEFAULT 30
);

-- Tabla inscripciones
CREATE TABLE inscripciones (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER REFERENCES alumnos(id),
    grupo_id INTEGER REFERENCES grupos(id),
    fecha_inscripcion DATE DEFAULT CURRENT_DATE,
    UNIQUE(alumno_id, grupo_id)
);

-- Tabla calificaciones
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    inscripcion_id INTEGER REFERENCES inscripciones(id) UNIQUE,
    parcial1 NUMERIC(5,2) DEFAULT 0,
    parcial2 NUMERIC(5,2) DEFAULT 0,
    final NUMERIC(5,2) DEFAULT 0
);`}
          </CodeBlock>

          <CodeBlock title="Índices">
{`-- Índice para buscar inscripciones de un alumno
CREATE INDEX idx_inscripciones_alumno ON inscripciones(alumno_id);

-- Índice para buscar inscripciones de un grupo
CREATE INDEX idx_inscripciones_grupo ON inscripciones(grupo_id);

-- Índice para buscar calificaciones por inscripción
CREATE INDEX idx_calificaciones_inscripcion ON calificaciones(inscripcion_id);`}
          </CodeBlock>

          <CodeBlock title="Transacción: enroll_student (Control de Concurrencia)">
{`CREATE OR REPLACE FUNCTION enroll_student(p_grupo_id INT, p_alumno_id INT)
RETURNS TEXT AS $$
DECLARE
    v_cupo_actual INT;
    v_cupo_maximo INT;
    v_existe INT;
BEGIN
    -- 1. Verificar si ya está inscrito
    SELECT COUNT(*) INTO v_existe 
    FROM inscripciones 
    WHERE alumno_id = p_alumno_id AND grupo_id = p_grupo_id;
    
    IF v_existe > 0 THEN
        RETURN 'ERROR: El alumno ya está inscrito en este grupo';
    END IF;
    
    -- 2. SELECT FOR UPDATE para bloquear el grupo
    SELECT cupo_maximo INTO v_cupo_maximo
    FROM grupos
    WHERE id = p_grupo_id
    FOR UPDATE;
    
    -- 3. Contar inscripciones actuales
    SELECT COUNT(*) INTO v_cupo_actual
    FROM inscripciones
    WHERE grupo_id = p_grupo_id;
    
    -- 4. Verificar cupo disponible
    IF v_cupo_actual >= v_cupo_maximo THEN
        RETURN 'ERROR: El grupo está lleno';
    END IF;
    
    -- 5. Insertar inscripción
    INSERT INTO inscripciones (alumno_id, grupo_id, fecha_inscripcion)
    VALUES (p_alumno_id, p_grupo_id, CURRENT_DATE);
    
    -- 6. Crear registro de calificaciones
    INSERT INTO calificaciones (inscripcion_id)
    SELECT id FROM inscripciones 
    WHERE alumno_id = p_alumno_id AND grupo_id = p_grupo_id;
    
    RETURN 'OK: Inscripción exitosa';
END;
$$ LANGUAGE plpgsql;

-- Uso: SELECT enroll_student(1, 5);`}
          </CodeBlock>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm mb-4">
            <strong className="text-yellow-800">Control de Concurrencia:</strong>
            <p className="text-yellow-700 mt-1">
              SELECT ... FOR UPDATE bloquea la fila del grupo hasta que termine la transacción.
              Si dos usuarios intentan inscribirse al mismo tiempo, uno espera al otro.
            </p>
          </div>

          <CodeBlock title="Consultas SQL Avanzadas">
{`-- 1. Alumnos con promedio de calificaciones por materia
SELECT a.matricula, a.nombre, m.nombre AS materia,
       ROUND(AVG((c.parcial1 + c.parcial2 + c.final) / 3), 2) AS promedio
FROM alumnos a
JOIN inscripciones i ON a.id = i.alumno_id
JOIN calificaciones c ON i.id = c.inscripcion_id
JOIN grupos g ON i.grupo_id = g.id
JOIN materias m ON g.materia_id = m.id
GROUP BY a.id, m.id
ORDER BY promedio DESC;

-- 2. Grupos con cupo disponible
SELECT g.id, m.nombre AS materia, g.periodo, g.cupo_maximo,
       COUNT(i.id) AS inscritos,
       (g.cupo_maximo - COUNT(i.id)) AS disponibles
FROM grupos g
JOIN materias m ON g.materia_id = m.id
LEFT JOIN inscripciones i ON g.id = i.grupo_id
GROUP BY g.id, m.nombre
HAVING COUNT(i.id) < g.cupo_maximo;

-- 3. Reporte de calificaciones con estado (Aprobado/Reprobado)
SELECT a.matricula, a.nombre, m.nombre AS materia,
       c.parcial1, c.parcial2, c.final,
       CASE 
           WHEN c.final >= 70 THEN 'Aprobado'
           ELSE 'Reprobado'
       END AS estado
FROM alumnos a
JOIN inscripciones i ON a.id = i.alumno_id
JOIN calificaciones c ON i.id = c.inscripcion_id
JOIN grupos g ON i.grupo_id = g.id
JOIN materias m ON g.materia_id = m.id;

-- 4. Top 5 alumnos con mejor promedio general
SELECT a.matricula, a.nombre,
       ROUND(AVG((c.parcial1 + c.parcial2 + c.final) / 3), 2) AS promedio_general
FROM alumnos a
JOIN inscripciones i ON a.id = i.alumno_id
JOIN calificaciones c ON i.id = c.inscripcion_id
GROUP BY a.id
ORDER BY promedio_general DESC
LIMIT 5;

-- 5. Materias con mayor índice de reprobación
SELECT m.nombre AS materia,
       COUNT(CASE WHEN c.final < 70 THEN 1 END) AS reprobados,
       COUNT(*) AS total,
       ROUND(100.0 * COUNT(CASE WHEN c.final < 70 THEN 1 END) / COUNT(*), 1) AS porcentaje_reprobacion
FROM materias m
JOIN grupos g ON m.id = g.materia_id
JOIN inscripciones i ON g.id = i.grupo_id
JOIN calificaciones c ON i.id = c.inscripcion_id
GROUP BY m.id
ORDER BY porcentaje_reprobacion DESC;`}
          </CodeBlock>

          <CodeBlock title="Vistas SQL">
{`-- Vista: Resumen de inscripciones por alumno
CREATE VIEW v_resumen_alumno AS
SELECT a.id, a.matricula, a.nombre, a.email,
       COUNT(i.id) AS total_materias,
       ROUND(AVG((c.parcial1 + c.parcial2 + c.final) / 3), 2) AS promedio_general
FROM alumnos a
LEFT JOIN inscripciones i ON a.id = i.alumno_id
LEFT JOIN calificaciones c ON i.id = c.inscripcion_id
GROUP BY a.id;

-- Vista: Grupos con información completa
CREATE VIEW v_grupos_completo AS
SELECT g.id, m.nombre AS materia, p.nombre AS profesor,
       g.periodo, g.cupo_maximo, COUNT(i.id) AS inscritos
FROM grupos g
JOIN materias m ON g.materia_id = m.id
LEFT JOIN profesores p ON g.profesor_id = p.id
LEFT JOIN inscripciones i ON g.id = i.grupo_id
GROUP BY g.id, m.nombre, p.nombre;

-- Uso de vistas
SELECT * FROM v_resumen_alumno WHERE promedio_general >= 80;
SELECT * FROM v_grupos_completo WHERE inscritos < cupo_maximo;`}
          </CodeBlock>

          <CodeBlock title="Triggers SQL">
{`-- Trigger: Actualizar cupo_actual automáticamente al inscribir
CREATE OR REPLACE FUNCTION actualizar_cupo_inscripcion()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE grupos SET cupo_actual = cupo_actual + 1 WHERE id = NEW.grupo_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE grupos SET cupo_actual = cupo_actual - 1 WHERE id = OLD.grupo_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cupo_inscripcion
AFTER INSERT OR DELETE ON inscripciones
FOR EACH ROW EXECUTE FUNCTION actualizar_cupo_inscripcion();

-- Trigger: Validar que calificaciones estén entre 0 y 100
CREATE OR REPLACE FUNCTION validar_calificacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parcial1 < 0 OR NEW.parcial1 > 100 OR
       NEW.parcial2 < 0 OR NEW.parcial2 > 100 OR
       NEW.final < 0 OR NEW.final > 100 THEN
        RAISE EXCEPTION 'Las calificaciones deben estar entre 0 y 100';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_calificacion
BEFORE INSERT OR UPDATE ON calificaciones
FOR EACH ROW EXECUTE FUNCTION validar_calificacion();

-- Trigger: Registrar historial de cambios en calificaciones
CREATE TABLE historial_calificaciones (
    id SERIAL PRIMARY KEY,
    calificacion_id INTEGER,
    campo_modificado VARCHAR(20),
    valor_anterior NUMERIC(5,2),
    valor_nuevo NUMERIC(5,2),
    fecha_cambio TIMESTAMP DEFAULT NOW(),
    usuario VARCHAR(50)
);

CREATE OR REPLACE FUNCTION registrar_cambio_calificacion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.parcial1 != NEW.parcial1 THEN
        INSERT INTO historial_calificaciones(calificacion_id, campo_modificado, valor_anterior, valor_nuevo, usuario)
        VALUES (NEW.id, 'parcial1', OLD.parcial1, NEW.parcial1, current_user);
    END IF;
    IF OLD.parcial2 != NEW.parcial2 THEN
        INSERT INTO historial_calificaciones(calificacion_id, campo_modificado, valor_anterior, valor_nuevo, usuario)
        VALUES (NEW.id, 'parcial2', OLD.parcial2, NEW.parcial2, current_user);
    END IF;
    IF OLD.final != NEW.final THEN
        INSERT INTO historial_calificaciones(calificacion_id, campo_modificado, valor_anterior, valor_nuevo, usuario)
        VALUES (NEW.id, 'final', OLD.final, NEW.final, current_user);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_calificacion
AFTER UPDATE ON calificaciones
FOR EACH ROW EXECUTE FUNCTION registrar_cambio_calificacion();`}
          </CodeBlock>

          <CodeBlock title="Procedimientos Almacenados Adicionales">
{`-- Procedimiento: Generar reporte de calificaciones por periodo
CREATE OR REPLACE FUNCTION reporte_periodo(p_periodo VARCHAR)
RETURNS TABLE (
    matricula VARCHAR,
    alumno VARCHAR,
    materia VARCHAR,
    parcial1 NUMERIC,
    parcial2 NUMERIC,
    final NUMERIC,
    promedio NUMERIC,
    estado VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.matricula, a.nombre, m.nombre,
           c.parcial1, c.parcial2, c.final,
           ROUND((c.parcial1 + c.parcial2 + c.final) / 3, 2),
           CASE WHEN c.final >= 70 THEN 'Aprobado' ELSE 'Reprobado' END
    FROM alumnos a
    JOIN inscripciones i ON a.id = i.alumno_id
    JOIN calificaciones c ON i.id = c.inscripcion_id
    JOIN grupos g ON i.grupo_id = g.id
    JOIN materias m ON g.materia_id = m.id
    WHERE g.periodo = p_periodo;
END;
$$ LANGUAGE plpgsql;

-- Uso: SELECT * FROM reporte_periodo('2025-1');

-- Procedimiento: Dar de baja a un alumno de un grupo
CREATE OR REPLACE FUNCTION dar_baja_alumno(p_alumno_id INT, p_grupo_id INT)
RETURNS TEXT AS $$
DECLARE
    v_inscripcion_id INT;
BEGIN
    -- Buscar inscripción
    SELECT id INTO v_inscripcion_id
    FROM inscripciones
    WHERE alumno_id = p_alumno_id AND grupo_id = p_grupo_id;
    
    IF v_inscripcion_id IS NULL THEN
        RETURN 'ERROR: El alumno no está inscrito en este grupo';
    END IF;
    
    -- Eliminar calificaciones asociadas
    DELETE FROM calificaciones WHERE inscripcion_id = v_inscripcion_id;
    
    -- Eliminar inscripción
    DELETE FROM inscripciones WHERE id = v_inscripcion_id;
    
    RETURN 'OK: Baja procesada correctamente';
END;
$$ LANGUAGE plpgsql;

-- Uso: SELECT dar_baja_alumno(5, 1);`}
          </CodeBlock>
        </Section>

        {/* B) MongoDB */}
        <Section id="mongodb" title="B) MongoDB - Colección student_notes" icon={Database} color="bg-orange-500">
          <CodeBlock title="Estructura del Documento">
{`// Documento de ejemplo
{
    "_id": ObjectId("..."),
    "student_id": 1,          // Corresponde a alumno.id en PostgreSQL
    "teacher_id": 2,          // Corresponde a profesor.id en PostgreSQL
    "group_id": 3,            // Corresponde a grupo.id en PostgreSQL
    "date": ISODate("2025-05-20T10:30:00Z"),
    "type": "performance",    // performance, attendance, behavior
    "comment": "El alumno participa activamente en clase."
}`}
          </CodeBlock>

          <CodeBlock title="Índice y Consultas">
{`// Crear índice
db.student_notes.createIndex({ student_id: 1 })

// Consulta 1: Notas de un alumno
db.student_notes.find({ student_id: 1 })

// Consulta 2: Notas de un grupo
db.student_notes.find({ group_id: 3 })`}
          </CodeBlock>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <strong className="text-blue-800">Atomicidad:</strong>
            <p className="text-blue-700 mt-1">
              Las operaciones de escritura en un solo documento son atómicas por defecto en MongoDB.
            </p>
          </div>
        </Section>

        {/* C) Seguridad */}
        <Section id="security" title="C) Modelo de Seguridad" icon={Shield} color="bg-orange-500">
          <div className="mb-4">
            <p className="font-medium text-gray-700 mb-2">Roles de Aplicación:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">student:</span>
                <p className="text-sm text-gray-500">Ver propias inscripciones, calificaciones y notas</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">teacher:</span>
                <p className="text-sm text-gray-500">Ver grupos, actualizar calificaciones, agregar notas</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">coordinator:</span>
                <p className="text-sm text-gray-500">Inscribir alumnos en grupos</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">admin:</span>
                <p className="text-sm text-gray-500">CRUD en todas las tablas maestras</p>
              </div>
            </div>
          </div>

          <CodeBlock title="PostgreSQL - Roles">
{`-- Crear rol de aplicación
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password123';

-- Otorgar permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;`}
          </CodeBlock>

          <CodeBlock title="MongoDB - Usuario">
{`db.createUser({
    user: "mongo_app_user",
    pwd: "mongo_password123",
    roles: [{ role: "readWrite", db: "edutrack_mongo" }]
})`}
          </CodeBlock>
        </Section>

        {/* D) Conexiones Remotas */}
        <Section id="remote" title="D) Conexiones Remotas" icon={Globe} color="bg-orange-500">
          <CodeBlock title="Strings de Conexión">
{`# PostgreSQL
postgresql://app_user:app_password123@db-university.example.com:5432/edutrack

# MongoDB
mongodb://mongo_app_user:mongo_password123@mongo-university.example.com:27017/edutrack_mongo`}
          </CodeBlock>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
            <strong className="text-orange-800">Para conexiones remotas:</strong>
            <ul className="text-orange-700 mt-1 list-disc list-inside">
              <li>Cambiar localhost por IP o dominio del servidor</li>
              <li>Abrir puertos en firewall (5432 PostgreSQL, 27017 MongoDB)</li>
              <li>Configurar pg_hba.conf para conexiones remotas</li>
              <li>Opcional: agregar ?sslmode=require para SSL</li>
            </ul>
          </div>
        </Section>

        {/* E) Backups */}
        <Section id="backups" title="E) Respaldos" icon={HardDrive} color="bg-orange-500">
          <CodeBlock title="PostgreSQL - pg_dump">
{`# Respaldo completo
pg_dump -U app_user -h localhost -d edutrack -F c -f backup_edutrack_$(date +%Y%m%d_%H%M%S).dump

# Restaurar
pg_restore -U app_user -h localhost -d edutrack backup_edutrack_20250520_103000.dump`}
          </CodeBlock>

          <CodeBlock title="MongoDB - mongodump">
{`# Respaldo
mongodump --db edutrack_mongo --out backup_mongo_$(date +%Y%m%d_%H%M%S)

# Restaurar
mongorestore --db edutrack_mongo backup_mongo_20250520_103000/edutrack_mongo`}
          </CodeBlock>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
            <strong className="text-red-800">Estrategia básica:</strong>
            <ul className="text-red-700 mt-1 list-disc list-inside">
              <li>Ejecutar respaldos diarios (cron en Linux)</li>
              <li>Guardar en ubicación diferente al servidor</li>
              <li>Probar restauración periódicamente</li>
            </ul>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm">EduTrack - Proyecto Final BD Avanzadas 2025</p>
        </div>
      </div>
    </div>
  );
}