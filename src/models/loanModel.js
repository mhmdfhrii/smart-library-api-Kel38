import { pool } from "../config/db.js";

export const LoanModel = {
  async createLoan(book_id, member_id, due_date) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const bookCheck = await client.query(
        "SELECT available_copies FROM books WHERE id = $1",
        [book_id],
      );

      if (bookCheck.rows[0].available_copies <= 0) {
        throw new Error("Buku sedang tidak tersedia (stok habis).");
      }

      await client.query(
        "UPDATE books SET available_copies = available_copies - 1 WHERE id = $1",
        [book_id],
      );

      const loanQuery = `
        INSERT INTO loans (book_id, member_id, due_date) 
        VALUES ($1, $2, $3) RETURNING *
      `;

      const result = await client.query(loanQuery, [
        book_id,
        member_id,
        due_date,
      ]);

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllLoans() {
    const query = `
      SELECT l.*, b.title as book_title, m.full_name as member_name 
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id
    `;

    const result = await pool.query(query);
    return result.rows;
  },

  async returnBook(loanId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const loanCheck = await client.query(
        "SELECT * FROM loans WHERE id = $1",
        [loanId],
      );

      if (loanCheck.rows.length === 0) {
        throw new Error("Data peminjaman tidak ditemukan");
      }

      const loan = loanCheck.rows[0];

      if (loan.status === "RETURNED") {
        throw new Error("Buku sudah dikembalikan sebelumnya");
      }

      const bookId = loan.book_id;

      await client.query(
        `
        UPDATE loans
        SET status = 'RETURNED',
            return_date = CURRENT_DATE
        WHERE id = $1
        `,
        [loanId],
      );

      await client.query(
        `
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = $1
        `,
        [bookId],
      );

      await client.query("COMMIT");

      return {
        message: "Buku berhasil dikembalikan",
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteLoan(id) {
    const result = await pool.query(
      "DELETE FROM loans WHERE id=$1 RETURNING *",
      [id],
    );
    return result.rows[0];
  },

  async getTopBorrowers() {
    const query = `
    SELECT 
      m.id AS member_id,
      m.full_name,
      m.email,
      m.member_type,
      COUNT(l.id) AS total_loans,
      MAX(l.loan_date) AS last_loan_date
    FROM members m
    JOIN loans l ON m.id = l.member_id
    GROUP BY m.id, m.full_name, m.email, m.member_type
    ORDER BY total_loans DESC
    LIMIT 3
  `;

    const result = await pool.query(query);

    const finalData = [];

    for (const member of result.rows) {
      const favoriteBookQuery = `
      SELECT b.title, COUNT(*) as times_borrowed
      FROM loans l
      JOIN books b ON l.book_id = b.id
      WHERE l.member_id = $1
      GROUP BY b.title
      ORDER BY times_borrowed DESC
      LIMIT 1
    `;

      const favoriteBook = await pool.query(favoriteBookQuery, [
        member.member_id,
      ]);

      finalData.push({
        member_id: member.member_id,
        full_name: member.full_name,
        email: member.email,
        member_type: member.member_type,
        total_loans: Number(member.total_loans),
        last_loan_date: member.last_loan_date,
        favorite_book: {
          title: favoriteBook.rows[0]?.title || null,
          times_borrowed: Number(favoriteBook.rows[0]?.times_borrowed || 0),
        },
      });
    }

    return finalData;
  },
};
