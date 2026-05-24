/**
 * Lightweight E2E verification (DB + HTTP). Cleans up all e2e-temp-* rows.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "dev.db");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const PREFIX = "e2e-temp-";

const db = new Database(dbPath);

function cleanup() {
  db.prepare(
    `DELETE FROM tasks WHERE title LIKE ? OR title IN (
      SELECT t.title FROM tasks t
      JOIN projects p ON t.project_id = p.id WHERE p.name LIKE ?
    )`,
  ).run(`${PREFIX}%`, `${PREFIX}%`);
  db.prepare(`DELETE FROM tasks WHERE project_id IN (SELECT id FROM projects WHERE name LIKE ?)`).run(`${PREFIX}%`);
  db.prepare(`DELETE FROM tasks WHERE category_id IN (SELECT id FROM categories WHERE name LIKE ?)`).run(`${PREFIX}%`);
  db.prepare(`DELETE FROM projects WHERE name LIKE ?`).run(`${PREFIX}%`);
  db.prepare(`DELETE FROM categories WHERE name LIKE ?`).run(`${PREFIX}%`);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function fetchOk(url) {
  const res = await fetch(url);
  assert(res.ok, `GET ${url} failed: ${res.status}`);
  return res.text();
}

try {
  cleanup();

  const now = Date.now();
  const projectName = `${PREFIX}project`;
  const categoryName = `${PREFIX}category`;
  const taskTitle = `${PREFIX}task`;

  const project = db
    .prepare(
      `INSERT INTO projects (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)`,
    )
    .run(projectName, "test desc", now, now);
  const projectId = project.lastInsertRowid;

  const category = db
    .prepare(`INSERT INTO categories (name, created_at) VALUES (?, ?)`)
    .run(categoryName, now);
  const categoryId = category.lastInsertRowid;

  db.prepare(
    `INSERT INTO tasks (title, status, priority, project_id, category_id, created_at, updated_at)
     VALUES (?, 'todo', 'medium', ?, ?, ?, ?)`,
  ).run(taskTitle, projectId, categoryId, now, now);

  const row = db
    .prepare(
      `SELECT t.title, p.name as project_name, c.name as category_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.title = ?`,
    )
    .get(taskTitle);

  assert(row?.project_name === projectName, "task should link to project");
  assert(row?.category_name === categoryName, "task should link to category");

  const home = await fetchOk(baseUrl);
  assert(home.includes(taskTitle), "home should list test task");
  assert(!home.includes("New category"), "home should not have category creation form");

  const categoriesPage = await fetchOk(`${baseUrl}/categories`);
  assert(categoriesPage.includes(categoryName), "categories page should list test category");

  const categoryDetail = await fetchOk(`${baseUrl}/categories/${categoryId}`);
  assert(categoryDetail.includes(categoryName), "category detail should show name");
  assert(categoryDetail.includes(taskTitle), "category detail should list task");

  const projects = await fetchOk(`${baseUrl}/projects`);
  assert(projects.includes(projectName), "projects page should list test project");

  const detail = await fetchOk(`${baseUrl}/projects/${projectId}`);
  assert(detail.includes(projectName), "project detail should show name");
  assert(detail.includes(taskTitle), "project detail should list task");

  cleanup();

  const after = db
    .prepare(`SELECT COUNT(*) as n FROM projects WHERE name LIKE ?`)
    .get(`${PREFIX}%`);
  assert(after.n === 0, "cleanup should remove test projects");

  console.log("All e2e-verify checks passed.");
} catch (err) {
  cleanup();
  console.error("e2e-verify failed:", err.message);
  process.exit(1);
} finally {
  db.close();
}
