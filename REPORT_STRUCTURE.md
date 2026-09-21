# DentFlow Project Report

## 1. Project Proposal Structure

### 1. Introduction
DentFlow is a dental clinic management and appointment booking system built as a full-stack web application. It combines a patient-facing portal with a clinic dashboard to streamline scheduling, patient management, and appointment tracking.

The system is designed for dental clinics that want to reduce manual appointment handling, eliminate spreadsheet-based scheduling, and improve communication between patients, receptionists, and doctors. The target users are:
- Patients who need to book appointments and view visit history.
- Receptionists who manage bookings, confirm appointments, and access patient records.
- Doctors who manage availability, review practice growth, and monitor clinic activity.

DentFlow is implemented with modern web technologies:
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod.
- Backend: Node.js, Express 5, TypeScript, Prisma, PostgreSQL.
- Real-time: Socket.IO for in-app notifications.

### 2. Problem Statement
Dental clinics commonly use manual worksheets, phone calls, or simple calendar tools for appointment management. This workflow causes several problems:
- Double booking and scheduling conflicts.
- Poor patient visibility into available slots.
- Separate patient and clinic staff experiences.
- Delayed updates and lack of real-time notifications.
- No structured management of doctor availability, unavailability, and clinic team roles.

Existing generic booking systems are not tailored to dental clinic workflows, which require doctor-specific schedules, patient portal access, receptionist booking capabilities, and treatment status tracking.

### 3. Objectives
DentFlow aims to deliver a complete dental appointment system with these objectives:
- Provide secure authentication for patients, doctors, and receptionists.
- Enable patient self-registration and login.
- Support Google sign-in for patients and clinical staff where configured.
- Allow patients to book appointments based on doctor availability and valid slot times.
- Enable clinic staff to book on behalf of patients and confirm or cancel appointments.
- Support doctor schedule templates, availability management, and blocked dates.
- Provide dashboard summaries for patient and clinic users.
- Deliver real-time notifications for bookings and appointment status updates.
- Maintain appointment history, patient profiles, and administrative patient management.

### 4. Methodology

#### a. Requirement Identification

##### i. Study of Existing System
The current system is largely manual or distributed across phone calls and spreadsheets. Receptionists often need to check doctor availability by asking team members and then update records manually.

Problems identified:
- No centralized booking portal.
- No unified patient account or appointment history.
- Doctors cannot publish weekly schedules and block days from a single interface.
- Status changes require manual notifications.

##### ii. Literature Review
Similar systems exist as general healthcare appointment platforms, clinic management tools, and custom dentist booking software. Most of these tools focus on either patient booking or practice management, but not both in one integrated system.

Relevant technologies and patterns include:
- Role-based access control in web applications.
- JWT authentication for SPA and API communication.
- CRUD-based schedule and appointment management using relational databases.
- Real-time notifications with WebSockets.
- Client-side form handling with React Hook Form and validation using Zod.

##### iii. Requirement Analysis
Functional requirements:
- Patient registration with email/password.
- Patient login and dashboard access.
- Clinic team login via email/password or Google sign-in.
- Doctor role-specific pages for availability and growth.
- Receptionist role pages for booking and patient management.
- Appointment booking flow with doctor selection, date selection, and time slot selection.
- Appointment status updates: pending, confirmed, completed, cancelled.
- Notifications for appointment creation and status changes.
- Profile management for patients and doctors.
- Doctor schedule creation, weekly templates, and date-specific unavailability.

Non-functional requirements:
- Security: JWT access tokens, role checking, encrypted passwords.
- Performance: efficient API queries, responsive UI.
- Usability: clear booking flow and intuitive dashboards.
- Scalability: separation of frontend and backend, database-backed storage.
- Maintainability: modular code organization, typed TypeScript, Prisma schema.

#### b. Feasibility Study

##### i. Technical Feasibility
The project is technically feasible using the chosen stack.
- Frontend: React 19 and Vite support fast development and modern SPA patterns.
- Backend: Express and Prisma provide stable API routing and database ORM.
- Database: PostgreSQL is already supported and can be hosted on Supabase or any Postgres provider.
- Real-time notifications: Socket.IO is configured in `server/src/index.ts`.

Existing implementation uses:
- `server/src/lib/prisma.ts` for Prisma database access.
- `server/prisma/schema.prisma` for the complete data model.
- `client/src/lib/api.ts` for authenticated API calls.

##### ii. Operational Feasibility
The system supports multiple users and roles:
- Patients use `/app` pages to book, view appointments, notifications, and profile data.
- Clinic staff use `/clinic` pages for login, booking, patient list, appointment review, and doctor features.
- Doctors can manage schedules and view growth stats.

The UI is designed for staff and patients:
- Separate layouts for public site, patient portal, and clinic dashboard.
- Protected routes enforce portal access based on user role.
- Notifications and dashboard cards give quick operational insight.

##### iii. Economic Feasibility
The solution uses open-source technologies and free-tier cloud infrastructure.
- Node.js, React, Prisma, and PostgreSQL are inexpensive to host.
- The codebase is lightweight and reusable, minimizing development cost.
- Hosting can be provided on any Node.js-friendly platform and a managed Postgres instance.
- Expected ROI: reduced scheduling errors, lower administrative overhead, better patient experience.

#### c. High Level Design of System
The system uses a three-tier architecture:
1. Frontend SPA (`client/`) built with React.
2. Backend API (`server/`) built with Express and Prisma.
3. PostgreSQL database hosted on Supabase or equivalent.

Key components:
- `AuthContext` manages client-side authentication and token storage.
- `api.ts` sends requests to `/api/*` with JWT bearer tokens.
- Express routes handle authentication, doctors, patients, schedules, appointments, notifications, dashboards, and employees.
- Prisma models map to `users`, `doctors`, `patients`, `appointments`, `schedules`, `doctor_unavailability`, `notifications`, and password reset OTPs.

Working mechanism:
- Users authenticate via `/api/auth/login` or `/api/auth/google`.
- Patients can book appointments through `client/src/pages/app/BookAppointmentPage.tsx`.
- Backend validates slot availability in `server/src/utils/bookAppointment.ts`, ensuring the selected doctor is available that day and the slot is not blocked.
- Clinic staff confirm, cancel, or complete appointments via appointment routes.
- Real-time notifications are sent using Socket.IO and persisted in the notifications table.

Algorithms and processes:
- Slot generation: `server/src/utils/slots.ts` creates slot times from schedule start/end and duration.
- Availability checking: `server/src/utils/availability.ts` checks full-day or partial blocks.
- Booking validation: `server/src/utils/bookAppointment.ts` verifies schedule existence, slot validity, unavailability blocks, and conflict-free bookings.
- Appointment lifecycle: `PENDING -> CONFIRMED -> COMPLETED` and `CANCELLED`.

### 5. Gantt Chart
A typical timeline for DentFlow development:

| Phase | Task | Duration | Week |
|---|---|---|---|
| Requirements | Requirement gathering, analysis, proposal | 1 week | Week 1 |
| Design | Architecture, data model, UI flow, diagrams | 1 week | Week 2 |
| Implementation | Frontend pages, backend routes, authentication | 2 weeks | Weeks 3-4 |
| Integration | API integration, booking flow, notifications | 1 week | Week 5 |
| Testing | Unit testing, system testing, bug fixes | 1 week | Week 6 |
| Deployment | Setup hosting, database, production build | 1 week | Week 7 |

### 6. Expected Outcome
The completed system will deliver:
- A patient-facing portal with appointment booking, appointment history, notifications, and profile management.
- A clinic dashboard for receptionists and doctors with scheduling, booking, patient management, and practice analytics.
- Doctor availability control with weekly schedule templates and blocked dates.
- Real-time notifications and appointment status updates.
- Secure authentication for multiple roles.

### 7. References
- Prisma documentation: https://www.prisma.io/docs
- React documentation: https://react.dev
- Express documentation: https://expressjs.com
- Socket.IO documentation: https://socket.io/docs
- Tailwind CSS documentation: https://tailwindcss.com
- Zod validation library: https://zod.dev

## 2. Project Report Structure

### 11. Cover & Title Page
Include:
- Title: DentFlow — Dental Clinic Appointment & Patient Management System
- Student name, ID, department, and institution.
- Supervisor name.
- Project submission date.

### 12. Certificate Page
Include:
- A certificate page signed by the student.
- Supervisor recommendation or approval line.
- Internal and external examiner approval lines.

### 13. Acknowledgement
Acknowledge:
- Project supervisor.
- Faculty members.
- Classmates or friends who helped.
- Family support.

### 14. Abstract Page
Provide a short abstract summarizing:
- The problem statement.
- Objectives.
- Technologies used.
- Key functionality delivered.
- Expected benefits.

### 15. Table of Contents
List all chapters, sections, figures, tables, and appendices with page numbers.

### 16. List of Abbreviations, Figures, Tables
Include:
- Acronyms such as JWT, API, SPA, UI, UX.
- Figures referenced in the report.
- Tables and charts.

### 17. Main Report
This is the body of the report, consisting of Chapters 1 through 5.

### 18. References
Provide the full citation list of technology docs and any academic sources used.

### 19. Bibliography
Optionally list additional books, articles, or resources consulted.

### 20. Appendices
Include:
- Screenshots of the application screens.
- Source code snippets or file lists.
- Additional architecture diagrams.

## 3. Main Report Chapters

### Chapter 1: Introduction
#### 1.1 Introduction
DentFlow is a modern dental clinic management system that integrates patient appointment booking with clinic staff and doctor workflows. Patients can self-book visits, view upcoming and past appointments, and maintain personal profiles. Clinic staff can manage bookings, confirm appointments, and track practice activity.

The project is built as a responsive web application with a clear separation between the public patient portal and the clinic dashboard. The system uses a PostgreSQL database and supports a role-based access model for patients, doctors, and receptionists.

#### 1.2 Problem Statement
Dental clinics often face problems with manual scheduling, missed updates, and fragmented communication.
- Patients cannot easily see available time slots.
- Receptionists manually manage bookings and must confirm availability across doctors.
- Doctors need a way to publish weekly availability and block unavailable dates.
- Without a centralized system, appointments can be double-booked or incorrectly tracked.

DentFlow solves these problems by providing:
- Doctor-specific schedules.
- A patient booking flow with date and time selection.
- A clinic dashboard for staff operations.
- Notifications for every relevant appointment state change.

#### 1.3 Objectives
The project objectives are:
- Build a secure web application for dental appointment management.
- Provide an intuitive patient booking experience.
- Implement role-based access control for patient, doctor, and receptionist portals.
- Enable doctor schedule management and unavailability blocking.
- Ensure appointments are validated and prevented from double booking.
- Support notification delivery for appointment updates.
- Create dashboards with meaningful operational metrics.

#### 1.4 Scope and Limitation
Scope:
- Patient registration and login.
- Appointment booking and viewing.
- Doctor and receptionist dashboards.
- Schedule management and slot generation.
- Real-time notifications via Socket.IO.
- Patient profile editing.

Limitations:
- No billing or invoicing module.
- No medical record management beyond appointment history.
- No external calendar integration.
- No SMS reminders implemented in the existing version.

#### 1.5 Development Methodology
The project uses an iterative development methodology with incremental delivery.
- Requirements were gathered from clinic workflows and appointment use cases.
- The system was designed using a modular architecture.
- Frontend and backend were developed in parallel, with API-first integration.
- Testing and validation were performed after each major feature.

This methodology suits the project because it allows quick feedback on booking flow and dashboard usability.

#### 1.6 Report Organization
The report is organized as follows:
- Chapter 1 introduces the project, objectives, and scope.
- Chapter 2 covers background study and related systems.
- Chapter 3 describes analysis, design, requirements, and algorithms.
- Chapter 4 explains implementation details and testing.
- Chapter 5 concludes the project and suggests future improvements.

### Chapter 2: Background Study and Literature Review
#### 2.1 Background Study
Dental clinic management systems require coordinated scheduling, patient communication, and resource availability.

Key concepts:
- Role-based access control: separate interfaces for patients and clinic staff.
- Appointment lifecycle management: pending, confirmed, completed, cancelled.
- Doctor availability modeling: weekly schedules and date-specific blocks.
- Notification systems: user alerts for booking and status changes.

Relevant technologies:
- React for user interface and component-based design.
- Express for RESTful API development.
- Prisma ORM for type-safe database access.
- PostgreSQL for relational data storage.
- Socket.IO for real-time bidirectional updates.

#### 2.2 Literature Review
Existing medical scheduling tools focus on either patient-facing bookings or practice management. Some popular examples include clinic-specific software and general health appointment systems.

Compared to these systems, DentFlow emphasizes:
- A compact combination of patient portal and clinic dashboard.
- Doctor schedule templates and unavailability blocking.
- Appointment validation logic to avoid conflicts.
- Simple integration with PostgreSQL and modern frontend tooling.

### Chapter 3: System Analysis and Design
#### 3.1 System Analysis
##### 3.1.1 Requirement Analysis
Functional Requirements:
- Patient registration and login with password.
- Google sign-in support for patients and clinic users.
- Patient dashboard: book appointments, view upcoming visits, notifications.
- Clinic login page and dashboard.
- Appointment listing for both patients and clinic staff.
- Doctor schedule management including weekly availability templates.
- Doctor unavailability blocks, full-day or partial-day.
- Appointment creation, confirmation, cancellation, completion.
- Notification management for appointment events.
- Profile update forms for patients and doctors.

Non-functional Requirements:
- Security: JWT tokens, password hashing, permission enforcement.
- Performance: optimized API queries and client-side caching.
- Usability: guided booking steps and clear status badges.
- Reliability: validation at backend and unique constraints in the database.
- Maintainability: TypeScript typing, Prisma schema, modular file organization.

##### 3.1.2 Feasibility Analysis
Technical Feasibility:
- The application uses stable libraries and tools that are widely supported.
- Prisma is already configured for PostgreSQL and can connect to Supabase.
- The existing code structure separates concerns clearly.

Operational Feasibility:
- Patients use a public portal with straightforward flows.
- Clinic staff use protected pages to manage bookings and patients.
- Doctors have dedicated pages for availability and growth metrics.

Economic Feasibility:
- The system relies on free and open-source frameworks.
- Hosting costs are limited to a Node server and Postgres database.
- Implementation effort is moderate given the reusable stack.

Schedule Feasibility:
- Development can be completed in a few weeks with a small team.
- Testing and deployment add one additional week.

##### 3.1.3 Object Modelling
Key entities in the system:
- `User`: base entity with email, password, role, and phone.
- `Patient`: patient profile linked to a user.
- `Doctor`: clinical profile linked to a user.
- `Appointment`: appointment details including date, time, doctor, patient, status.
- `Schedule`: doctor weekly availability by day.
- `DoctorUnavailability`: date-specific blocked times.
- `Notification`: messages for users.

##### 3.1.4 Dynamic Modelling
Important dynamic processes:
- Login flow with JWT issuance.
- Appointment booking flow:
  1. Patient selects doctor.
  2. Patient selects date.
  3. Available slot list loads.
  4. Patient confirms booking.
  5. Appointment is created with `PENDING` status.
- Notification creation on appointment events.
- Appointment status update by clinic staff.

##### 3.1.5 Process Modelling
Activity diagrams can describe:
- Patient appointment booking.
- Doctor schedule creation and unavailability blocking.
- Notification delivery and read/unread handling.

#### 3.2 System Design
##### 3.2.1 Refinement of Diagrams
The system design refines front-end and back-end interactions using the following modules:
- `client/src/App.tsx`: route definitions and protected navigation.
- `client/src/context/AuthContext.tsx`: auth token storage and user refresh.
- `server/src/app.ts`: API middleware, routing, error handling.
- `server/src/index.ts`: Socket.IO setup and token authentication.

##### 3.2.2 Component Diagrams
Major components:
- Frontend components for booking (`BookAppointmentPage.tsx`), dashboard, notifications, and profiles.
- Backend routes for auth, doctors, patients, appointments, schedules, notifications, and dashboard.
- Database layer powered by Prisma models and SQL tables.

##### 3.2.3 Deployment Diagrams
Deployment environment:
- Frontend served by Vite in development or static build in production.
- Backend Node/Express server on a hosting provider.
- PostgreSQL database hosted on Supabase or equivalent.
- Socket.IO connected to the same backend server for real-time updates.

#### 3.3 Algorithm Details
Slot generation algorithm:
- Uses `server/src/utils/slots.ts`.
- Converts start and end times into minutes.
- Generates consecutive intervals using the configured `slotDuration` of 15, 30, or 60 minutes.

Appointment validation algorithm:
- Implemented in `server/src/utils/bookAppointment.ts`.
- Steps:
  1. Normalize appointment date and ensure it is not in the past.
  2. Verify doctor schedule exists for that day of the week.
  3. Fetch doctor unavailability blocks and reject blocked days or times.
  4. Generate valid slots for the schedule and ensure the requested start time exists.
  5. Check for appointment conflicts on the same doctor/date/time with non-cancelled status.
  6. If validation passes, create the appointment in the database.

Authentication and authorization:
- JWT tokens are signed using `server/src/lib/jwt.ts`.
- Backend route middleware in `server/src/middleware/auth.ts` verifies tokens and assigns user info.
- Role checks ensure only authorized users can access sensitive routes.

Password reset OTP flow:
- `server/src/routes/auth.routes.ts` sends a six-digit code by email.
- OTPs are hashed and stored with expiry and attempt counters.
- Reset requests are validated before password update.

### Chapter 4: Implementation and Testing
#### 4.1 Implementation
##### 4.1.1 Tools Used
- Languages: TypeScript, JavaScript.
- Frontend: React 19, Vite, Tailwind CSS.
- Backend: Node.js, Express 5.
- Database: PostgreSQL with Prisma ORM.
- Validation: Zod.
- Data fetching: Axios, TanStack Query.
- Realtime: Socket.IO.
- Authentication: JSON Web Tokens (JWT).
- Email: Nodemailer (SMTP) for password reset.

##### 4.1.2 Implementation Details of Modules
Authentication module:
- `server/src/routes/auth.routes.ts` handles registration, login, Google auth, password reset, and user info.
- `client/src/context/AuthContext.tsx` keeps the token in local storage and refreshes user info.

Patient portal:
- `client/src/pages/app/PatientDashboardPage.tsx` shows upcoming appointments and notifications.
- `client/src/pages/app/BookAppointmentPage.tsx` implements a multi-step booking flow.
- `client/src/pages/app/NotificationsPage.tsx` shows notification history.
- `client/src/pages/app/ProfilePage.tsx` allows profile editing.

Clinic dashboard:
- `client/src/pages/app/ClinicDashboardPage.tsx` displays clinic analytics and today’s schedule.
- `client/src/components/layout/ClinicLayout.tsx` and related pages manage clinic navigation.

Appointment and schedule modules:
- `server/src/routes/appointments.routes.ts` handles booking, listing, status updates, and cancellations.
- `server/src/routes/schedules.routes.ts` handles doctor schedules and unavailability.
- `server/src/utils/bookAppointment.ts` contains core booking validations.
- `server/src/utils/slots.ts` and `server/src/utils/availability.ts` generate and verify available slots.

Notification module:
- `server/src/services/notification.service.js` creates notifications and interacts with Socket.IO.
- `client/src/pages/app/NotificationsPage.tsx` fetches, marks read, and deletes notifications.

#### 4.2 Testing
##### 4.2.1 Test Cases for Unit Testing
Example test cases:
- Validate signup and login input.
- Ensure password hashing and JWT issuance.
- Confirm schedule slot generation returns correct intervals.
- Verify blocked slots and full-day unavailability logic.
- Ensure appointment route rejects double-booked slots.

##### 4.2.2 Test Cases for System Testing
System tests should cover:
- Patient registration and login flow.
- Booking appointment flow through all booking steps.
- Receptionist booking on behalf of a patient.
- Doctor schedule creation and blocked date handling.
- Appointment status changes and notifications.
- Role-based page access restrictions.

#### 4.3 Result Analysis
The actual system behavior should be analyzed against expected outcomes:
- Appointment booking should only succeed when slots are available.
- Clinic dashboard should reflect appointment counts and upcoming events.
- Notifications should appear in real time and persist in the database.
- Users should only access authorized pages based on role.
- Profile updates and patient data edits should be stored and retrieved correctly.

### Chapter 5: Conclusion and Future Recommendations
#### 5.1 Conclusion
DentFlow provides a functioning dental clinic appointment portal with patient booking, staff management, doctor availability, and notifications. The system solves manual scheduling problems by enforcing availability rules, offering a guided booking flow, and centralizing patient and clinic interactions.

#### 5.2 Future Recommendations
Future enhancements may include:
- Medical records and treatment history.
- Email and SMS appointment reminders.
- Calendar integrations with Google Calendar or Outlook.
- Billing, invoicing, and payment processing.
- Multi-clinic or multi-location support.
- Document uploads for prescriptions, reports, and invoices.

## 4. Notes for Completion
Use this document as the full report content for DentFlow. Claude can expand and polish each section, add diagrams, and produce a formatted project report based on this content.

### Additional guidance for Claude
- Maintain the required report structure with headings and sub-headings.
- Expand each section into proper report paragraphs.
- Use the DentFlow project details, routes, and models provided here.
- Insert diagrams or charts in appropriate places (Gantt chart, system architecture, sequence diagrams).
- Add screenshot placeholders in appendices where actual UI images can be inserted.

---

_End of DentFlow project report document._
