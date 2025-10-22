import { Navigate, Route, Routes } from "react-router-dom";
// import Auth from "./pages/Auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import CompleteProfile from "./pages/CompleteProfile";
import RegisterInspection from "./pages/RegisterInspection";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import { DarkModeProvier } from "./context/DarkModeContext";

import Proposals from "./pages/Proposals";
import SubmittedProjects from "./pages/SubmittedProjects";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ProtectedRoute from "./ui/ProtectedRoute";
import AdminLayout from "./features/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import Auth from "./pages/Auth";
import Login from "./pages/Login";


const queryClient = new QueryClient();

function App() {
  return (
    <DarkModeProvier>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
        <Routes>
          <Route path="/auth" element={<Auth />} />
        <Route index element={<Navigate to="login" replace />} />
        <Route path="/login" element={<Login />} />



          {/* <Route path="/login" element={<Login />} /> */}
            {/* <Route path="/"   index element={<Navigate to="login" element={<Login />} replace />} /> */}


          <Route path="/complete-profile" element={<CompleteProfile />} />
    
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="registerInspection" element={<RegisterInspection />} />

            <Route path="users" element={<Users />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="projects" element={<SubmittedProjects />} />
          </Route>
          {/* <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </QueryClientProvider>
    </DarkModeProvier>
  );
}






export default App

