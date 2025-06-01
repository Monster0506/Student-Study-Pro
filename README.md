# StudentStudyPro

StudentStudyPro is a comprehensive productivity and study management app for students. It helps you organize your academic life with a modern, mobile-friendly interface and powerful features for time management, analytics, and planning.

---

## Features

### Calendar & Scheduling
- Full-featured calendar with day, week, and month views
- Drag-and-drop and resize for events (except tasks)
- Advanced recurrence rules (daily, weekly, monthly, nth/last weekday, end after N or by date)
- Visual event indicators for both course and category colors
- Tasks appear as events on the calendar, with status and priority indicators

### Task Management
- Create, edit, and delete tasks with rich details
- Multiple statuses: not done, pending, done, on hold, cancelled, urgent, ambiguous
- Status badge and icon for each task, with quick status cycling
- Filter and search tasks by status, priority, course, and text
- Progress bars and summary counts for each status
- Visual distinction for overdue and urgent tasks

### Course & Category Management
- Organize courses with custom colors, codes, and instructors
- Assign tasks and events to courses and categories
- Category and course color indicators on calendar events

### Pomodoro Timer
- Customizable Pomodoro timer with decimal durations
- Track Pomodoro sessions and link them to tasks or courses

### Analytics & Study Goals
- Time usage analytics: Pie and bar charts of study time by category
- Study goals: Set weekly hour targets per course and track progress
- Analytics reflect the selected time filter (week, month, all time, etc.)
- Quick stats in the sidebar for study hours, classes, and events

### Theming & UX
- Dark mode and light mode, auto-detected or user-selected
- Responsive, mobile-friendly design for all features
- Accessible UI with keyboard navigation and screen reader support
- Tooltips and popovers for clarity, rendered in a portal for perfect stacking

### (Optional/Future) Email Notifications
- (Planned) Email reminders for upcoming tasks and events

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Setup

```sh
# 1. Clone the repository
git clone https://github.com/Monster0506/Student-Study-Pro
cd student-study-pro

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at http://localhost:5173 (or as shown in your terminal).

---

## Project Structure

- `src/pages/` — Main app pages (Calendar, Tasks, Analytics, Courses, Settings, Timer)
- `src/components/` — UI components (Calendar, TaskList, Modals, Navigation, PomodoroTimer, etc.)
- `src/hooks/` — Custom React hooks (data fetching, analytics, etc.)
- `src/integrations/` — Supabase and other backend integrations
- `src/types/` — TypeScript types and interfaces
- `supabase/` — Database schema and SQL migrations

---

## Technologies

- React + TypeScript
- Vite (build tool)
- Tailwind CSS (utility-first styling)
- shadcn/ui (accessible, beautiful UI components)
- Supabase (Postgres DB, Auth, Realtime)
- Radix UI (for popovers, tooltips, dialogs)
- Recharts (analytics charts)

---

## Deployment

You can deploy StudentStudyPro to:
- Vercel
- Netlify
- GitHub Pages
- Or any platform that supports Node.js and static hosting

---

## Development & Contribution

- Use your favorite IDE or GitHub Codespaces.
- All code is TypeScript and follows modern best practices.
- PRs and issues are welcome!

---

## Further Reading

- Supabase Docs: https://supabase.com/docs
- shadcn/ui Docs: https://ui.shadcn.com/
- Tailwind CSS Docs: https://tailwindcss.com/
- Radix UI Docs: https://www.radix-ui.com/docs/primitives/overview/introduction

---

## Tips

- Quick Add: Use the "+" button on the calendar or task list to quickly add new items.
- Drag & Drop: Move and resize events directly on the calendar (except tasks).
- Status Cycling: Click the status icon on a task to quickly cycle through common statuses.
- Analytics: Use the date filter at the top of the Analytics page to see your progress for any period.

---

## Support

For questions, feature requests, or bug reports, please open an issue or contact the maintainer.
