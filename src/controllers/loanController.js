import { LoanModel } from '../models/loanModel.js';

export const LoanController = {
  async createLoan(req, res) {
    const { book_id, member_id, due_date } = req.body;

    try {
      const loan = await LoanModel.createLoan(
        book_id,
        member_id,
        due_date
      );

      res.status(201).json({
        message: "Peminjaman berhasil dicatat!",
        data: loan
      });

    } catch (err) {
      res.status(400).json({
        error: err.message
      });
    }
  },

  async getLoans(req, res) {
    try {
      const loans = await LoanModel.getAllLoans();
      res.json(loans);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  },

  // TAMBAHAN UNTUK RETURN BOOK
  async returnBook(req, res) {
    try {
      const result = await LoanModel.returnBook(
        req.params.id
      );

      res.json(result);

    } catch (err) {
      res.status(400).json({
        error: err.message
      });
    }
  }
};