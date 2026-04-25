import { AuthorModel } from '../models/authorModel.js';

export const AuthorController = {
  async getAuthors(req,res){
    const authors = await AuthorModel.getAll(req.query.name);
    res.json(authors);
  },

  async getAuthorById(req,res){
    const author = await AuthorModel.getById(req.params.id);
    res.json(author);
  },

  async addAuthor(req,res){
    const {name,nationality} = req.body;
    const author = await AuthorModel.create(name,nationality);
    res.status(201).json(author);
  },

  async updateAuthor(req,res){
    const {name,nationality} = req.body;
    const author = await AuthorModel.update(
      req.params.id,
      name,
      nationality
    );
    res.json(author);
  },

  async deleteAuthor(req,res){
    const author = await AuthorModel.delete(req.params.id);
    res.json(author);
  }
};