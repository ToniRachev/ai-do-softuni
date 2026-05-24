# Tasks — Personal Task Manager

A simple, distraction-free task manager built with Next.js 16, SQLite, Drizzle ORM, and Tailwind CSS. Runs locally with no authentication.

## Prerequisites

- Node.js 20.9 or later
- npm

## Setup

```bash
npm install
npm run db:migrate
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

- SQLite file: `dev.db` in the project root (created on first run)
- Migrations live in `drizzle/`
- To reset all data, stop the dev server and delete `dev.db` and `dev.db-*`, then run `npm run db:migrate`

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |

## Features

- Create, read, update, and delete tasks
- Toggle task completion
- Priority levels (low, medium, high)
- Optional description
- Tasks grouped into To do and Completed sections
- **Projects**: full CRUD on `/projects`, detail page at `/projects/[id]` with filtered tasks
- **Categories**: list on `/categories`, detail at `/categories/[id]`; create when adding/editing a task; delete unassigns tasks (does not delete them)
- Assign optional project and category to each task; pill links navigate to project or category detail
