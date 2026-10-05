import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { useAuth } from "./context/AuthContext";
import { DBRoles, HOME_BY_ROLE } from "./utils/constants";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import StoresList from "./pages/admin/StoresList";
import UsersList from "./pages/admin/UsersList";

import StoreDetail from "./pages/user/StoreDetail";
import UserStoresList from "./pages/user/StoresList";

import { useEffect } from "react";
import { setupAxiosInterceptors } from "./api/axiosClient";
import { SnackbarProvider, useSnackbar } from "./context/SnackbarContext";
import OwnerDashboard from "./pages/owner/OwnerDashboard";


// Helper component to bind Axios interceptor to React Context
function AxiosInterceptorInitializer({ children }) {
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setupAxiosInterceptors(showSnackbar);
  }, [showSnackbar]);

  return children;
}

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={HOME_BY_ROLE[role] || "/login"} replace />;
}

export default function App() {
  return (
    <SnackbarProvider>
      <AxiosInterceptorInitializer>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allow={[DBRoles.SYSTEM_ADMIN]}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allow={[DBRoles.SYSTEM_ADMIN]}>
                  <Layout>
                    <UsersList />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute>
                <RoleRoute allow={[DBRoles.SYSTEM_ADMIN]}>
                  <Layout>
                    <StoresList />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <RoleRoute allow={[DBRoles.NORMAL_USER]}>
                  <Layout>
                    <UserStoresList />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/stores/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allow={[DBRoles.NORMAL_USER]}>
                  <Layout>
                    <StoreDetail />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner"
            element={
              <ProtectedRoute>
                <RoleRoute allow={[DBRoles.STORE_OWNER]}>
                  <Layout>
                    <OwnerDashboard />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AxiosInterceptorInitializer>
    </SnackbarProvider>
  );
}
