import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkAdminAuth } from "./middleware";
import { insertProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}