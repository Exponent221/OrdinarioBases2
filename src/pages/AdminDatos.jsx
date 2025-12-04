import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Settings, Users, UserCheck, BookOpen, Layers, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function AdminDatos() {
  const [tab, setTab] = useState('alumnos');
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  
  const [newAlumno, setNewAlumno] = useState({ matricula: '', nombre: '', email: '' });
  const [newProfesor, setNewProfesor] = useState({ nombre: '', email: '' });
  const [newMateria, setNewMateria] = useState({ nombre: '' });
  const [newGrupo, setNewGrupo] = useState({ materia_id: '', profesor_id: '', periodo: '', cupo_maximo: 30 });
  
  const [message, setMessage] = useState('');

  const loadAll = async () => {
    const [a, p, m, g] = await Promise.all([
      base44.entities.Alumno.list(),
      base44.entities.Profesor.list(),
      base44.entities.Materia.list(),
      base44.entities.Grupo.list()
    ]);
    setAlumnos(a);
    setProfesores(p);
    setMaterias(m);
    setGrupos(g);
  };

  useEffect(() => { loadAll(); }, []);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const addAlumno = async () => {
    if (!newAlumno.matricula || !newAlumno.nombre) return;
    await base44.entities.Alumno.create(newAlumno);
    setNewAlumno({ matricula: '', nombre: '', email: '' });
    showMsg('Alumno agregado');
    loadAll();
  };

  const addProfesor = async () => {
    if (!newProfesor.nombre) return;
    await base44.entities.Profesor.create(newProfesor);
    setNewProfesor({ nombre: '', email: '' });
    showMsg('Profesor agregado');
    loadAll();
  };

  const addMateria = async () => {
    if (!newMateria.nombre) return;
    await base44.entities.Materia.create(newMateria);
    setNewMateria({ nombre: '' });
    showMsg('Materia agregada');
    loadAll();
  };

  const addGrupo = async () => {
    if (!newGrupo.materia_id || !newGrupo.periodo) return;
    await base44.entities.Grupo.create({ ...newGrupo, cupo_actual: 0 });
    setNewGrupo({ materia_id: '', profesor_id: '', periodo: '', cupo_maximo: 30 });
    showMsg('Grupo agregado');
    loadAll();
  };

  const deleteItem = async (entity, id) => {
    if (!window.confirm('¿Eliminar?')) return;
    await base44.entities[entity].delete(id);
    showMsg('Eliminado');
    loadAll();
  };

  const tabs = [
    { id: 'alumnos', label: 'Alumnos', icon: Users, color: 'orange' },
    { id: 'profesores', label: 'Profesores', icon: UserCheck, color: 'orange' },
    { id: 'materias', label: 'Materias', icon: BookOpen, color: 'orange' },
    { id: 'grupos', label: 'Grupos', icon: Layers, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Administrar Datos</h2>
              <p className="text-sm text-gray-400">Rol: Admin</p>
            </div>
          </div>

          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg mb-4">
              <CheckCircle className="w-4 h-4" /> {message}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  tab === t.id 
                    ? `bg-${t.color}-500 text-white` 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Alumnos */}
          {tab === 'alumnos' && (
            <div>
              <div className="flex gap-2 mb-4 flex-wrap">
                <input 
                  placeholder="Matrícula" 
                  value={newAlumno.matricula} 
                  onChange={e => setNewAlumno({...newAlumno, matricula: e.target.value})} 
                  className="flex-1 min-w-[100px] px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <input 
                  placeholder="Nombre" 
                  value={newAlumno.nombre} 
                  onChange={e => setNewAlumno({...newAlumno, nombre: e.target.value})} 
                  className="flex-1 min-w-[150px] px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <input 
                  placeholder="Email" 
                  value={newAlumno.email} 
                  onChange={e => setNewAlumno({...newAlumno, email: e.target.value})} 
                  className="flex-1 min-w-[150px] px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <button onClick={addAlumno} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alumnos.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800">{a.nombre}</span>
                      <span className="text-gray-400 text-sm ml-2">{a.matricula}</span>
                    </div>
                    <button onClick={() => deleteItem('Alumno', a.id)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profesores */}
          {tab === 'profesores' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input 
                  placeholder="Nombre" 
                  value={newProfesor.nombre} 
                  onChange={e => setNewProfesor({...newProfesor, nombre: e.target.value})} 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <input 
                  placeholder="Email" 
                  value={newProfesor.email} 
                  onChange={e => setNewProfesor({...newProfesor, email: e.target.value})} 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <button onClick={addProfesor} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {profesores.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-800">{p.nombre}</span>
                    <button onClick={() => deleteItem('Profesor', p.id)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materias */}
          {tab === 'materias' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input 
                  placeholder="Nombre de la materia" 
                  value={newMateria.nombre} 
                  onChange={e => setNewMateria({...newMateria, nombre: e.target.value})} 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <button onClick={addMateria} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {materias.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-800">{m.nombre}</span>
                    <button onClick={() => deleteItem('Materia', m.id)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grupos */}
          {tab === 'grupos' && (
            <div>
              <div className="flex gap-2 mb-4 flex-wrap">
                <select 
                  value={newGrupo.materia_id} 
                  onChange={e => setNewGrupo({...newGrupo, materia_id: e.target.value})} 
                  className="flex-1 min-w-[120px] px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                >
                  <option value="">Materia...</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                <select 
                  value={newGrupo.profesor_id} 
                  onChange={e => setNewGrupo({...newGrupo, profesor_id: e.target.value})} 
                  className="flex-1 min-w-[120px] px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                >
                  <option value="">Profesor...</option>
                  {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <input 
                  placeholder="Periodo" 
                  value={newGrupo.periodo} 
                  onChange={e => setNewGrupo({...newGrupo, periodo: e.target.value})} 
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Cupo" 
                  value={newGrupo.cupo_maximo} 
                  onChange={e => setNewGrupo({...newGrupo, cupo_maximo: parseInt(e.target.value)})} 
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
                <button onClick={addGrupo} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {grupos.map(g => {
                  const mat = materias.find(m => m.id === g.materia_id);
                  return (
                    <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{mat ? mat.nombre : 'N/A'}</span>
                        <span className="text-gray-400 text-sm ml-2">{g.periodo}</span>
                        <span className="text-xs ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                          {g.cupo_actual || 0}/{g.cupo_maximo}
                        </span>
                      </div>
                      <button onClick={() => deleteItem('Grupo', g.id)} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}