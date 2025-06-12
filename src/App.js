import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CrearProjectePage from './pages/CrearProjectePage';
import ProjectePage from './pages/ProjectePage'; // aquest el generarem després
import MeusProjectesPage from './pages/MeusProjectesPage';
import UsuarisPage from './pages/UsuarisPage';
import EditarProjectePage from './pages/EditarProjectePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/crear-projecte" element={<ProtectedRoute><CrearProjectePage /></ProtectedRoute>} />
          <Route path="/meus-projectes" element={<ProtectedRoute><MeusProjectesPage /></ProtectedRoute>} />
          <Route path="/projecte/:projectId" element={<ProtectedRoute><ProjectePage /></ProtectedRoute>} />
          <Route path="/editar-projecte/:projectId" element={<ProtectedRoute><EditarProjectePage /></ProtectedRoute>} />
          <Route path="/usuaris" element={<ProtectedRoute><UsuarisPage /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;