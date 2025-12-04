import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Users, GraduationCap, FileText, Settings, ClipboardList } from 'lucide-react';

export default function Home() {
  const menuItems = [
    { name: 'Inscribir', label: 'Inscribir Alumno', desc: 'Coordinador', icon: Users, color: 'bg-orange-500' },
    { name: 'Calificaciones', label: 'Calificaciones', desc: 'Profesor', icon: ClipboardList, color: 'bg-orange-500' },
    { name: 'Notas', label: 'Notas de Alumnos', desc: 'Profesor', icon: FileText, color: 'bg-orange-500' },
    { name: 'MisInscripciones', label: 'Mis Inscripciones', desc: 'Alumno', icon: GraduationCap, color: 'bg-orange-500' },
    { name: 'AdminDatos', label: 'Administrar Datos', desc: 'Admin', icon: Settings, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">EduTrack</h1>
          <p className="text-gray-500 mt-2">Sistema de Inscripciones Académicas</p>
          <p className="text-sm text-gray-400 mt-1">Proyecto Final - Base de Datos Avanzadas</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.name)}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 group"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 ${item.color} rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">{item.label}</h3>
              <p className="text-sm text-gray-400 mt-1">Rol: {item.desc}</p>
            </Link>
          ))}
        </div>


      </div>
    </div>
  );
}