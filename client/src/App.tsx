import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PatientLayout } from "@/components/layout/PatientLayout";
import { ClinicLayout } from "@/components/layout/ClinicLayout";
import { ClinicAuthLayout } from "@/components/layout/ClinicAuthLayout";
import { HomePage } from "@/pages/public/HomePage";
import { PatientLoginPage } from "@/pages/auth/PatientLoginPage";
import { ClinicLoginPage } from "@/pages/auth/ClinicLoginPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { PatientDashboardPage } from "@/pages/app/PatientDashboardPage";
import { ClinicDashboardPage } from "@/pages/app/ClinicDashboardPage";
import { BookAppointmentPage } from "@/pages/app/BookAppointmentPage";
import { StaffBookPage } from "@/pages/app/StaffBookPage";
import { AppointmentsPage } from "@/pages/app/AppointmentsPage";
import { NotificationsPage } from "@/pages/app/NotificationsPage";
import { ProfilePage } from "@/pages/app/ProfilePage";
import { AdminPatientsPage } from "@/pages/app/admin/AdminPatientsPage";
import { AvailabilityPage } from "@/pages/app/dentist/AvailabilityPage";
import { TeamPage } from "@/pages/app/doctor/TeamPage";
import { GrowthPage } from "@/pages/app/doctor/GrowthPage";
import { DoctorProfilePage } from "@/pages/app/doctor/DoctorProfilePage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Patient-facing website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<PatientLoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage portal="patient" />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute portal="patient" />}>
              <Route path="/app" element={<PatientLayout />}>
                <Route index element={<PatientDashboardPage />} />
                <Route path="book" element={<BookAppointmentPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Clinic staff dashboard */}
            <Route path="/clinic">
              <Route element={<ClinicAuthLayout />}>
                <Route path="login" element={<ClinicLoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage portal="clinic" />} />
              </Route>
              <Route element={<ProtectedRoute portal="clinic" />}>
                <Route element={<ClinicLayout />}>
                  <Route index element={<ClinicDashboardPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="book" element={<StaffBookPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="patients" element={<AdminPatientsPage />} />
                  <Route element={<ProtectedRoute portal="clinic" roles={["DOCTOR"]} />}>
                    <Route path="growth" element={<GrowthPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="availability" element={<AvailabilityPage />} />
                    <Route path="profile" element={<DoctorProfilePage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
