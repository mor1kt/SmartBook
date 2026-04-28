import { Router } from 'express';

import * as BookingController from '../controllers/booking.controller.js';
import * as CourseController from '../controllers/course.controller.js';
import * as CategoryController from '../controllers/category.controller.js';
import * as WaitlistController from '../controllers/waitlist.controller.js';
import * as ProfileController from '../controllers/profile.controller.js';
import * as PublicCourseController from '../controllers/publicCourse.controller.js';
import * as DashboardController from '../controllers/dashboard.controller.js';
import * as SlotsController from '../controllers/slots.controller.js';
import * as ConsultationController from '../controllers/consultation.controller.js';
import { centerResolver } from '../middlewares/centerResolver.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = Router({ mergeParams: true });

// Public
router.get('/profile', centerResolver, ProfileController.getProfile);
router.get('/course/:courseId', centerResolver, PublicCourseController.getCourseDetails);
router.get('/course/:courseId/slots', centerResolver, SlotsController.getCourseSlots);
router.get('/courses', centerResolver, CourseController.getCourses);
router.get('/categories', centerResolver, CategoryController.getCategories);
router.get('/consultation/config', centerResolver, ConsultationController.getConfig);
router.get('/consultation/slots', centerResolver, ConsultationController.getSlots);
router.post('/consultation/waitlist', centerResolver, ConsultationController.createWaitlist);
router.post('/future/waitlist', centerResolver, ConsultationController.createFutureWaitlist);
router.post('/waitlist', centerResolver, WaitlistController.addToWaitlist);
router.post('/book-group', centerResolver, BookingController.createGroup);
router.post('/book-individual', centerResolver, BookingController.bookIndividual);

// Attendance / admin utilities
router.patch(
  '/bookings/:bookingId/attendance',
  centerResolver,
  requireAdmin,
  BookingController.updateAttendance
);

// Admin panel
router.get('/admin/summary', centerResolver, requireAdmin, DashboardController.summary);
router.patch('/admin/schedule', centerResolver, requireAdmin, DashboardController.updateScheduleSettings);
router.get('/admin/bookings', centerResolver, requireAdmin, BookingController.getAll);
router.get('/admin/waitlist', centerResolver, requireAdmin, WaitlistController.getWaitlist);
router.patch('/admin/waitlist/:id', centerResolver, requireAdmin, WaitlistController.updateStatus);
router.post('/admin/courses', centerResolver, requireAdmin, CourseController.create);
router.post('/admin/categories', centerResolver, requireAdmin, CategoryController.create);

export default router;
