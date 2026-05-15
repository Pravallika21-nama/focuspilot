import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PlannerPage from "./pages/PlannerPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
