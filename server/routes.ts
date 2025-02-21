import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkAdminAuth } from "./middleware";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Existing routes
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/products", async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const search = req.query.search as string | undefined;

    if (search) {
      const products = await storage.searchProducts(search);
      res.json(products);
    } else {
      const products = await storage.getProducts(categoryId);
      res.json(products);
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

  // Admin routes with authentication
  app.post("/api/admin/products", checkAdminAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.addProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.delete("/api/admin/products/:id", checkAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const success = await storage.deleteProduct(id);

    if (success) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  // New category management routes
  app.post("/api/admin/categories", checkAdminAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.addCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data", error });
    }
  });

  app.put("/api/admin/categories/:id", checkAdminAuth, async (req, res) => {
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

  app.delete("/api/admin/categories/:id", checkAdminAuth, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}