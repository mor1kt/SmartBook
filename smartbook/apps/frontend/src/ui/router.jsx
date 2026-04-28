import { createBrowserRouter } from 'react-router-dom';

import { RootLayout } from './shell/RootLayout';
import HomePage from './views/HomePage';
import CreateCenterPage from './views/CreateCenterPage';
import CenterProfilePage from './views/CenterProfilePage';
import CourseBookingPage from './views/CourseBookingPage';
import LoginPage from './views/LoginPage';
import CenterAdminPage from './views/CenterAdminPage';
import IndividualConsultationPage from './views/IndividualConsultationPage';
import FutureBookingPage from './views/FutureBookingPage';
import AdminGroupBookingsPage from './views/admin/AdminGroupBookingsPage';
import AdminIndividualBookingsPage from './views/admin/AdminIndividualBookingsPage';
import AdminConsultationRequestsPage from './views/admin/AdminConsultationRequestsPage';
import AdminFutureRequestsPage from './views/admin/AdminFutureRequestsPage';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'create-center', element: <CreateCenterPage /> },
      { path: 'c/:slug', element: <CenterProfilePage /> },
      { path: 'c/:slug/course/:courseId', element: <CourseBookingPage /> },
      { path: 'c/:slug/consultation', element: <IndividualConsultationPage /> },
      { path: 'c/:slug/future', element: <FutureBookingPage /> },
      { path: 'c/:slug/admin', element: <CenterAdminPage /> },
      { path: 'c/:slug/admin/bookings/group', element: <AdminGroupBookingsPage /> },
      { path: 'c/:slug/admin/bookings/individual', element: <AdminIndividualBookingsPage /> },
      { path: 'c/:slug/admin/consultations', element: <AdminConsultationRequestsPage /> },
      { path: 'c/:slug/admin/future', element: <AdminFutureRequestsPage /> },
    ],
  },
]);
