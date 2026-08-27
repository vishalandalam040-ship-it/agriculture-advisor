import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Farms } from './pages/Farms';
import { NewFarm } from './pages/NewFarm';
import { NewAdvisory } from './pages/NewAdvisory';
import { AdvisoryDetails } from './pages/AdvisoryDetails';

const Dashboard = () => {
  const { signOut, user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-700 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">AgriAdvisor</div>
          <div className="flex items-center space-x-6">
            <Link to="/farms" className="hover:text-green-200 font-medium">My Farms</Link>
            <span className="text-sm opacity-80">{user?.email}</span>
            <button onClick={signOut} className="text-sm bg-green-800 px-3 py-1 rounded hover:bg-green-900">Sign Out</button>
          </div>
        </div>
      </nav>
      
      <div className="p-8 max-w-6xl mx-auto mt-8">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to your Dashboard</h1>
          <p className="text-gray-600 mb-8">Manage your farms and generate AI-powered crop advisories.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/farms" className="p-6 border-2 border-green-100 rounded-xl hover:border-green-500 hover:shadow-md transition bg-green-50/30 text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Manage Farms</h3>
              <p className="text-gray-600">View and update your farm profiles</p>
            </Link>
            <Link to="/advisory/new" className="p-6 border-2 border-green-100 rounded-xl hover:border-green-500 hover:shadow-md transition bg-green-50/30 text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Generate Advisory</h3>
              <p className="text-gray-600">Get AI recommendations for your crops</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/farms" element={<ProtectedRoute><Farms /></ProtectedRoute>} />
      <Route path="/farms/new" element={<ProtectedRoute><NewFarm /></ProtectedRoute>} />
      <Route path="/advisory/new" element={<ProtectedRoute><NewAdvisory /></ProtectedRoute>} />
      <Route path="/advisories/:id" element={<ProtectedRoute><AdvisoryDetails /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
