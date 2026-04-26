import { CategoryModel } from "../models/categoryModel.js";

export const CategoryController = {
  async getCategories(req, res) {
    try {
      const { name } = req.query;
      const categories = await CategoryModel.getAll(name);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCategoryById(req, res) {
    try {
      const category = await CategoryModel.getById(req.params.id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addCategory(req, res) {
    try {
      const category = await CategoryModel.create(req.body.name);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCategory(req, res) {
    try {
      const category = await CategoryModel.update(req.params.id, req.body.name);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      const category = await CategoryModel.delete(req.params.id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({
        message: "Category deleted successfully",
        category,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
