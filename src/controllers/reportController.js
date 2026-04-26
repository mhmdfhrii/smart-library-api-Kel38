import { pool } from "../config/db.js";

export const ReportController = {
  async getStats(req, res) {
    try {
      const totalBooks = await pool.query("SELECT COUNT(*) FROM books");

      const totalAuthors = await pool.query("SELECT COUNT(*) FROM authors");

      const totalCategories = await pool.query(
        "SELECT COUNT(*) FROM categories",
      );

      const borrowed = await pool.query(
        "SELECT COUNT(*) FROM loans WHERE status='BORROWED'",
      );

      res.json({
        total_books: totalBooks.rows[0].count,
        total_authors: totalAuthors.rows[0].count,
        total_categories: totalCategories.rows[0].count,
        borrowed_books: borrowed.rows[0].count,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
