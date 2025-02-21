import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);
  return httpServer;
}
