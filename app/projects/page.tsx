export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Projects
        </h1>
        <p className="mt-2 max-w-xl text-zinc-500">
          Group tasks into projects. This section is ready for you to add
          project boards and filters.
        </p>
      </header>

      <div className="glass-card rounded-2xl border border-dashed border-zinc-200 px-8 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 ring-1 ring-violet-200/60">
          <svg
            className="h-7 w-7 text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-zinc-900">No projects yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
          Create your first project to organize related tasks. Coming soon.
        </p>
      </div>
    </div>
  );
}
