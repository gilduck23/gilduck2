import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { requireAdmin } = setupAuth(app);

  // Use requireAdmin middleware for admin routes
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.addProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const success = await storage.deleteProduct(id);

    if (success) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  // Category management routes
  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.addCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data", error });
    }
  });

  app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data", error });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteCategory(id);

      if (success) {
        res.status(200).json({ message: "Category deleted successfully" });
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Public routes
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/products", async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 24;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const search = req.query.search as string | undefined;

    if (search) {
      const products = await storage.searchProducts(search);
      res.json({
        products,
        total: products.length,
        page,
        limit
      });
    } else {
      const { products, total } = await storage.getProductsPage(page, limit, categoryId);
      res.json({
        products,
        total,
        page,
        limit
      });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    const product = await storage.getProduct(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  });

  // Add this endpoint to test Supabase connection
  // Remove test endpoint since it's causing errors and supabase is not properly initialized

  const httpServer = createServer(app);
  return httpServer;
}
