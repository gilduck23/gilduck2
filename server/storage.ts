import { Category, InsertCategory, InsertProduct, Product } from "@shared/schema";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getProducts(categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;

  constructor() {
    this.categories = new Map();
    this.products = new Map();

    // Seed data
    this.seedData();
  }

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

  private seedData() {
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
      },
      {
        name: "Fasteners",
        image: "https://images.unsplash.com/photo-1563681352142-9a8dcf92a2f1",
        description: "Industrial fasteners and hardware"
      }
    ];

    categories.forEach((cat, index) => {
      this.categories.set(index + 1, { ...cat, id: index + 1 });
    });

    // Seed products
    const products: InsertProduct[] = [
      {
        name: "Industrial Drill Press",
        description: "Heavy-duty drill press with variable speed control",
        image: "https://images.unsplash.com/photo-1505468726633-0069fc52f4b9",
        price: 129999,
        categoryId: 1,
        sku: "DP-1001",
        inStock: true,
        specifications: ["1.5 HP Motor", "12-Speed", "4-Inch Quill Stroke"]
      },
      {
        name: "Safety Goggles",
        description: "Impact-resistant safety goggles with anti-fog coating",
        image: "https://images.unsplash.com/photo-1673201159882-725f2b63dc39",
        price: 2999,
        categoryId: 2,
        sku: "SG-2001",
        inStock: true,
        specifications: ["ANSI Z87.1 Certified", "UV Protection", "Adjustable Strap"]
      },
      {
        name: "Digital Caliper",
        description: "Professional digital caliper with LCD display",
        image: "https://images.unsplash.com/photo-1693155257465-f29b58ecadaa",
        price: 4999,
        categoryId: 3,
        sku: "DC-3001",
        inStock: true,
        specifications: ["0-6 Inch Range", "0.001\" Resolution", "IP54 Rated"]
      }
    ];

    products.forEach((prod, index) => {
      this.products.set(index + 1, { ...prod, id: index + 1 });
    });
  }
}

export const storage = new MemStorage();
