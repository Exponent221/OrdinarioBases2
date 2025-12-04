import Home from './pages/Home';
import Inscribir from './pages/Inscribir';
import Calificaciones from './pages/Calificaciones';
import Notas from './pages/Notas';
import MisInscripciones from './pages/MisInscripciones';
import AdminDatos from './pages/AdminDatos';
import Documentacion from './pages/Documentacion';


export const PAGES = {
    "Home": Home,
    "Inscribir": Inscribir,
    "Calificaciones": Calificaciones,
    "Notas": Notas,
    "MisInscripciones": MisInscripciones,
    "AdminDatos": AdminDatos,
    "Documentacion": Documentacion,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};