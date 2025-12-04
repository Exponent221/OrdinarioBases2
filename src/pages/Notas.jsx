import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, Plus, CheckCircle } from 'lucide-react';

export default function Notas() {
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [notas, setNotas] = useState([]);
  
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [noteType, setNoteType] = useState('performance');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [a, g, m, p, n] = await Promise.all([
        base44.entities.Alumno.list(),
        base44.entities.Grupo.list(),
        base44.entities.Materia.list(),
        base44.entities.Profesor.list(),
        base44.entities.StudentNote.list()
      ]);
      setAlumnos(a);
      setGrupos(g);
      setMaterias(m);
      setProfesores(p);
      setNotas(n);
    };
    loadData();
  }, []);

  const getMateriaName = (materiaId) => {
    const m = materias.find(x => x.id === materiaId);
    return m ? m.nombre : 'N/A';
  };

  const getAlumnoName = (id) => {
    const a = alumnos.find(x => x.id === id);
    return a ? a.nombre : 'N/A';
  };

  const handleAddNote = async () => {
    if (!selectedAlumno || !selectedGrupo || !comment) {
      setMessage('Completa todos los campos');
      return;
    }

    await base44.entities.StudentNote.create({
      student_id: selectedAlumno,
      teacher_id: selectedProfesor || '',
      group_id: selectedGrupo,
      note_date: new Date().toISOString(),
      note_type: noteType,
      comment: comment
    });

    setMessage('Nota agregada');
    setComment('');
    setTimeout(() => setMessage(''), 2000);
    
    const n = await base44.entities.StudentNote.list();
    setNotas(n);
  };

  const notasDelAlumno = selectedAlumno 
    ? notas.filter(n => n.student_id === selectedAlumno)
    : [];

  const typeLabels = {
    performance: 'Desempeño',
    attendance: 'Asistencia',
    behavior: 'Comportamiento'
  };

  const typeColors = {
    performance: 'bg-blue-100 text-blue-700',
    attendance: 'bg-green-100 text-green-700',
    behavior: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Notas de Alumnos</h2>
              <p className="text-sm text-gray-400">Rol: Profesor | MongoDB: student_notes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Alumno</label>
              <select 
                value={selectedAlumno} 
                onChange={e => setSelectedAlumno(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
              >
                <option value="">Seleccionar...</option>
                {alumnos.map(a => (
                  <option key={a.id} value={a.id}>{a.matricula} - {a.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Grupo</label>
              <select 
                value={selectedGrupo} 
                onChange={e => setSelectedGrupo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
              >
                <option value="">Seleccionar...</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{getMateriaName(g.materia_id)} - {g.periodo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Profesor</label>
              <select 
                value={selectedProfesor} 
                onChange={e => setSelectedProfesor(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
              >
                <option value="">Seleccionar...</option>
                {profesores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Tipo</label>
              <select 
                value={noteType} 
                onChange={e => setNoteType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
              >
                <option value="performance">Desempeño</option>
                <option value="attendance">Asistencia</option>
                <option value="behavior">Comportamiento</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Comentario</label>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none resize-none"
              rows={3}
              placeholder="Escribir nota..."
            />
          </div>

          <button 
            onClick={handleAddNote}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar Nota
          </button>

          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg mt-4">
              <CheckCircle className="w-4 h-4" /> {message}
            </div>
          )}
        </div>

        {selectedAlumno && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Notas de: {getAlumnoName(selectedAlumno)}</h3>
            {notasDelAlumno.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay notas registradas</p>
            ) : (
              <div className="space-y-3">
                {notasDelAlumno.map((n, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${typeColors[n.note_type]}`}>
                        {typeLabels[n.note_type]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(n.note_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{n.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
}