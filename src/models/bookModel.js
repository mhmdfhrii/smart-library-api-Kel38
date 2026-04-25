import { pool } from '../config/db.js';

export const BookModel = {
  async getAll(title){
    let query = `
      SELECT b.*, a.name as author_name, c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id=a.id
      LEFT JOIN categories c ON b.category_id=c.id
    `;

    if(title){
      query += ` WHERE b.title ILIKE '%${title}%'`;
    }

    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id){
    const result = await pool.query(
      'SELECT * FROM books WHERE id=$1',
      [id]
    );
    return result.rows[0];
  },

  async create(data){
    const {isbn,title,author_id,category_id,total_copies} = data;

    const result = await pool.query(
      `INSERT INTO books
      (isbn,title,author_id,category_id,total_copies,available_copies)
      VALUES($1,$2,$3,$4,$5,$5)
      RETURNING *`,
      [isbn,title,author_id,category_id,total_copies]
    );

    return result.rows[0];
  },

  async update(id,data){
    const {title,total_copies} = data;

    const result = await pool.query(
      `UPDATE books
       SET title=$1,total_copies=$2
       WHERE id=$3 RETURNING *`,
      [title,total_copies,id]
    );

    return result.rows[0];
  },

  async delete(id){
    const result = await pool.query(
      'DELETE FROM books WHERE id=$1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};