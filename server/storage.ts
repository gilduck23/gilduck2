import { Category, InsertCategory, InsertProduct, Product, ProductVariant, User, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

async function createInitialAdminPassword() {
  const password = "adminpassword";
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  // User management
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Session store
  sessionStore: session.Store;

  // Product and category management
  getCategories(): Promise<Category[]>;
  getProducts(categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  addProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  addCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  updateCategory(id: number, category: InsertCategory): Promise<Category | undefined>;
  getProductsPage(page: number, limit: number, categoryId?: number): Promise<{ products: Product[], total: number }>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private users: Map<number, User>;
  private nextProductId: number;
  private nextCategoryId: number;
  private nextUserId: number;
  public sessionStore: session.Store;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.users = new Map();
    this.nextProductId = 1;
    this.nextCategoryId = 1;
    this.nextUserId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize data
    this.seedData().catch(console.error);
  }

  // User management methods
  async getUser(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      ...userData, 
      id,
      role: userData.role || "user"  
    };
    this.users.set(id, user);
    return user;
  }

  // Product and category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getProducts(categoryId?: number): Promise<Product[]> {
    const products = Array.from(this.products.values());
    if (categoryId) {
      return products.filter(p => p.categoryId === categoryId);
    }
    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    const lowercaseQuery = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async addProduct(product: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const newProduct: Product = {
      ...product,
      id,
      specifications: product.specifications || [],
      variants: product.variants || []
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async addCategory(category: InsertCategory): Promise<Category> {
    const id = this.nextCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const hasProducts = Array.from(this.products.values()).some(
      product => product.categoryId === id
    );
    if (hasProducts) {
      throw new Error("Cannot delete category with existing products");
    }
    return this.categories.delete(id);
  }

  async updateCategory(id: number, category: InsertCategory): Promise<Category | undefined> {
    if (!this.categories.has(id)) {
      return undefined;
    }
    const updatedCategory: Category = { ...category, id };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async getProductsPage(page: number, limit: number, categoryId?: number): Promise<{ products: Product[], total: number }> {
    const allProducts = Array.from(this.products.values());
    const filteredProducts = categoryId
      ? allProducts.filter(p => p.categoryId === categoryId)
      : allProducts;

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      products: filteredProducts.slice(start, end),
      total: filteredProducts.length
    };
  }

  private async seedData() {
    // Seed categories
    const categories: InsertCategory[] = [
      {
        name: "Power Tools",
        image: "https://images.unsplash.com/photo-1549210338-a03623c2bde3",
        description: "Professional-grade power tools for industrial use"
      },
      {
        name: "Safety Equipment",
        image: "https://images.unsplash.com/photo-1550199453-ebdcdb13216b",
        description: "Personal protective equipment and safety gear"
      },
      {
        name: "Measurement Tools",
        image: "https://images.unsplash.com/photo-1521291410923-42c74153b0f9",
        description: "Precision measurement and testing equipment"
      }
    ];

    for (const cat of categories) {
      await this.addCategory(cat);
    }

    // Create initial admin user with proper password hashing
    const adminPassword = await createInitialAdminPassword();
    const adminUser: InsertUser = {
      username: "admin",
      password: adminPassword,
      role: "admin"
    };
    await this.createUser(adminUser);
  }
}

export const storage = new MemStorage();