import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth'
import { Login } from './components/auth'
import { Dashboard, Customers, Products, Sales, Inventory } from './pages'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              {/* Ruta por defecto redirige al dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Clientes */}
              <Route path="/customers" element={<Customers />} />
              
              {/* Productos */}
              <Route path="/products" element={<Products />} />
              
              {/* Ventas */}
              <Route path="/sales" element={<Sales />} />
              
              {/* Inventario */}
              <Route path="/inventory" element={<Inventory />} />
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App