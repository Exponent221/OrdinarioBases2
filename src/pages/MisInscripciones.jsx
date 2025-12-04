import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, GraduationCap, BookOpen, FileText } from 'lucide-react';

export default function MisInscripciones() {
  const [alumnos, setAlumnos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [inscripciones, setInscripciones] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [a, g, m, c, n] = await Promise.all([
        base44.entities.Alumno.list(),
        base44.entities.Grupo.list(),
        base44.entities.Materia.list(),
        base44.entities.Calificacion.list(),
        base44.entities.StudentNote.list()
      ]);
      setAlumnos(a);
      setGrupos(g);
      setMaterias(m);
      setCalificaciones(c);
      setNotas(n);
    };
    loadData();
  }, []);

  const loadInscripciones = async () => {
    if (!selectedAlumno) return;
    const insc = await base44.entities.Inscripcion.filter({ alumno_id: selectedAlumno });
    setInscripciones(insc);
  };

  const getMateriaName = (grupoId) => {
    const g = grupos.find(x => x.id === grupoId);
    if (!g) return 'N/A';
    const m = materias.find(x => x.id === g.materia_id);
    return m ? m.nombre : 'N/A';
  };

  const getPeriodo = (grupoId) => {
    const g = grupos.find(x => x.id === grupoId);
    return g ? g.periodo : 'N/A';
  };

  const getCalificacion = (inscripcionId) => {
    const c = calificaciones.find(x => x.inscripcion_id === inscripcionId);
    if (!c) return { parcial1: '-', parcial2: '-', final: '-' };
    return c;
  };

  const getAlumnoName = (id) => {
    const a = alumnos.find(x => x.id === id);
    return a ? a.nombre : '';
  };

  const misNotas = notas.filter(n => n.student_id === selectedAlumno);

  const typeLabels = {
    performance: 'Desempeño',
    attendance: 'Asistencia',
    behavior: 'Comportamiento'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Mis Inscripciones</h2>
              <p className="text-sm text-gray-400">Rol: Alumno</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <select 
              value={selectedAlumno} 
              onChange={e => setSelectedAlumno(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
            >
              <option value="">Seleccionar alumno...</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id}>{a.matricula} - {a.nombre}</option>
              ))}
            </select>
            <button 
              onClick={loadInscripciones} 
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
            >
              Ver
            </button>
          </div>

          {selectedAlumno && (
            <div className="text-center py-2 mb-4 bg-orange-50 rounded-lg">
              <span className="font-medium text-orange-700">{getAlumnoName(selectedAlumno)}</span>
            </div>
          )}

          {inscripciones.length > 0 && (
            <>
              <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                <BookOpen className="w-4 h-4" /> Materias Inscritas
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Materia</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Periodo</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">P1</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">P2</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscripciones.map((insc, idx) => {
                      const calif = getCalificacion(insc.id);
                      return (
                        <tr key={idx} className="border-b border-gray-50">
                          <td className="py-3 px-2 font-medium text-gray-800">{getMateriaName(insc.grupo_id)}</td>
                          <td className="py-3 px-2 text-center text-gray-600">{getPeriodo(insc.grupo_id)}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-block w-10 py-1 bg-gray-100 rounded text-gray-700">{calif.parcial1}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-block w-10 py-1 bg-gray-100 rounded text-gray-700">{calif.parcial2}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="inline-block w-10 py-1 bg-blue-100 rounded text-blue-700 font-medium">{calif.final}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {selectedAlumno && inscripciones.length === 0 && (
            <p className="text-center text-gray-400 py-8">No hay inscripciones registradas</p>
          )}
        </div>

        {selectedAlumno && misNotas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
              <FileText className="w-4 h-4" /> Mis Notas (MongoDB)
            </h3>
            <div className="space-y-3">
              {misNotas.map((n, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {typeLabels[n.note_type] || n.note_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(n.note_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{n.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}