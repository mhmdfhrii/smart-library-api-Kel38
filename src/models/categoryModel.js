import { pool } from '../config/db.js';

export const CategoryModel = {
  async getAll(name){
    let query = 'SELECT * FROM categories';

    if(name){
      query += ` WHERE name ILIKE '%${name}%'`;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query);
    return result.rows;
  },

  async getById(id){
    const result = await pool.query(
      'SELECT * FROM categories WHERE id=$1',
      [id]
    );
    return result.rows[0];
  },

  async create(name){
    const result = await pool.query(
      'INSERT INTO categories(name) VALUES($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  },

  async update(id,name){
    const result = await pool.query(
      `UPDATE categories 
       SET name=$1 
       WHERE id=$2 RETURNING *`,
      [name,id]
    );
    return result.rows[0];
  },

  async delete(id){
    const result = await pool.query(
      'DELETE FROM categories WHERE id=$1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};