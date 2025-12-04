import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ClipboardList, Save, CheckCircle } from 'lucide-react';

export default function Calificaciones() {
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [g, m] = await Promise.all([
        base44.entities.Grupo.list(),
        base44.entities.Materia.list()
      ]);
      setGrupos(g);
      setMaterias(m);
    };
    loadData();
  }, []);

  const getMateriaName = (materiaId) => {
    const m = materias.find(x => x.id === materiaId);
    return m ? m.nombre : 'Sin materia';
  };

  const loadEstudiantes = async () => {
    if (!selectedGrupo) return;

    const inscripciones = await base44.entities.Inscripcion.filter({ grupo_id: selectedGrupo });
    const alumnos = await base44.entities.Alumno.list();
    const calificaciones = await base44.entities.Calificacion.list();

    const list = inscripciones.map(insc => {
      const alumno = alumnos.find(a => a.id === insc.alumno_id);
      const calif = calificaciones.find(c => c.inscripcion_id === insc.id);
      return {
        inscripcionId: insc.id,
        alumnoNombre: alumno ? alumno.nombre : 'N/A',
        matricula: alumno ? alumno.matricula : 'N/A',
        calificacionId: calif ? calif.id : null,
        parcial1: calif ? calif.parcial1 : 0,
        parcial2: calif ? calif.parcial2 : 0,
        final: calif ? calif.final : 0
      };
    });

    setEstudiantes(list);
  };

  const updateGrade = (index, field, value) => {
    const updated = [...estudiantes];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setEstudiantes(updated);
  };

  const saveGrades = async (index) => {
    const est = estudiantes[index];
    
    if (est.calificacionId) {
      await base44.entities.Calificacion.update(est.calificacionId, {
        parcial1: est.parcial1,
        parcial2: est.parcial2,
        final: est.final
      });
    } else {
      await base44.entities.Calificacion.create({
        inscripcion_id: est.inscripcionId,
        parcial1: est.parcial1,
        parcial2: est.parcial2,
        final: est.final
      });
    }
    
    setMessage('Guardado: ' + est.alumnoNombre);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Calificaciones</h2>
              <p className="text-sm text-gray-400">Rol: Profesor</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <select 
              value={selectedGrupo} 
              onChange={e => setSelectedGrupo(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
            >
              <option value="">Seleccionar grupo...</option>
              {grupos.map(g => (
                <option key={g.id} value={g.id}>
                  {getMateriaName(g.materia_id)} - {g.periodo}
                </option>
              ))}
            </select>
            <button 
              onClick={loadEstudiantes} 
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
            >
              Cargar
            </button>
          </div>

          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg mb-4">
              <CheckCircle className="w-4 h-4" /> {message}
            </div>
          )}

          {estudiantes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Matrícula</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Nombre</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">P1</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">P2</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Final</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((est, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-600">{est.matricula}</td>
                      <td className="py-3 px-2 text-sm font-medium text-gray-800">{est.alumnoNombre}</td>
                      <td className="py-3 px-2">
                        <input 
                          type="number" 
                          value={est.parcial1} 
                          onChange={e => updateGrade(idx, 'parcial1', e.target.value)}
                          className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-orange-500 outline-none"
                          min="0" max="100"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input 
                          type="number" 
                          value={est.parcial2} 
                          onChange={e => updateGrade(idx, 'parcial2', e.target.value)}
                          className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-orange-500 outline-none"
                          min="0" max="100"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input 
                          type="number" 
                          value={est.final} 
                          onChange={e => updateGrade(idx, 'final', e.target.value)}
                          className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:border-orange-500 outline-none"
                          min="0" max="100"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <button 
                          onClick={() => saveGrades(idx)} 
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {estudiantes.length === 0 && selectedGrupo && (
            <p className="text-center text-gray-400 py-8">No hay estudiantes en este grupo</p>
          )}
        </div>
      </div>
    </div>
  );
}