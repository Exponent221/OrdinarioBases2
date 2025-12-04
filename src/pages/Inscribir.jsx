import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function Inscribir() {
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [a, g, m] = await Promise.all([
        base44.entities.Alumno.list(),
        base44.entities.Grupo.list(),
        base44.entities.Materia.list()
      ]);
      setAlumnos(a);
      setGrupos(g);
      setMaterias(m);
    };
    loadData();
  }, []);

  const getMateriaName = (materiaId) => {
    const m = materias.find(x => x.id === materiaId);
    return m ? m.nombre : 'Sin materia';
  };

  const handleInscribir = async () => {
    if (!selectedAlumno || !selectedGrupo) {
      setMessage({ text: 'Selecciona alumno y grupo', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const inscripciones = await base44.entities.Inscripcion.filter({
      alumno_id: selectedAlumno,
      grupo_id: selectedGrupo
    });

    if (inscripciones.length > 0) {
      setMessage({ text: 'El alumno ya está inscrito en este grupo', type: 'error' });
      setLoading(false);
      return;
    }

    const grupo = grupos.find(g => g.id === selectedGrupo);
    const inscripcionesGrupo = await base44.entities.Inscripcion.filter({
      grupo_id: selectedGrupo
    });

    if (inscripcionesGrupo.length >= grupo.cupo_maximo) {
      setMessage({ text: `Grupo lleno (cupo: ${grupo.cupo_maximo})`, type: 'error' });
      setLoading(false);
      return;
    }

    await base44.entities.Inscripcion.create({
      alumno_id: selectedAlumno,
      grupo_id: selectedGrupo,
      fecha_inscripcion: new Date().toISOString().split('T')[0]
    });

    await base44.entities.Grupo.update(selectedGrupo, {
      cupo_actual: inscripcionesGrupo.length + 1
    });

    const newInsc = await base44.entities.Inscripcion.filter({
      alumno_id: selectedAlumno,
      grupo_id: selectedGrupo
    });
    
    if (newInsc.length > 0) {
      await base44.entities.Calificacion.create({
        inscripcion_id: newInsc[0].id,
        parcial1: 0,
        parcial2: 0,
        final: 0
      });
    }

    // Reload grupos
    const g = await base44.entities.Grupo.list();
    setGrupos(g);

    setMessage({ text: 'Inscripción exitosa', type: 'success' });
    setSelectedAlumno('');
    setSelectedGrupo('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-lg mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Inscribir Alumno</h2>
              <p className="text-sm text-gray-400">Rol: Coordinador</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Alumno</label>
              <select 
                value={selectedAlumno} 
                onChange={e => setSelectedAlumno(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
              >
                <option value="">Seleccionar alumno...</option>
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
              >
                <option value="">Seleccionar grupo...</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>
                    {getMateriaName(g.materia_id)} - {g.periodo} ({g.cupo_actual || 0}/{g.cupo_maximo})
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleInscribir}
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Inscribir'}
            </button>

            {message.text && (
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}