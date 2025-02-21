import { Category, InsertCategory, InsertProduct, Product, ProductVariant } from "@shared/schema";

export interface IStorage {
  // Existing methods
  getCategories(): Promise<Category[]>;
  getProducts(categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  addProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;

  // New category management methods
  addCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<boolean>;
  updateCategory(id: number, category: InsertCategory): Promise<Category | undefined>;
  getProductsPage(page: number, limit: number, categoryId?: number): Promise<{ products: Product[], total: number }>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private nextProductId: number;
  private nextCategoryId: number;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.nextProductId = 1;
    this.nextCategoryId = 1;

    // Seed data
    this.seedData();
    // Update IDs based on seeded data
    this.nextProductId = Math.max(...Array.from(this.products.keys())) + 1;
    this.nextCategoryId = Math.max(...Array.from(this.categories.keys())) + 1;
  }

  // Existing methods remain unchanged
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
      variants: product.variants || [],
      specifications: product.specifications || [],
      inStock: product.inStock ?? true
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // New category management methods
  async addCategory(category: InsertCategory): Promise<Category> {
    const id = this.nextCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Check if category has products
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

    // Generate 50 products
    const productTemplates = [
      {
        name: "Industrial Drill Press",
        description: "Heavy-duty drill press with variable speed control",
        basePrice: 129999,
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1505468726633-0069fc52f4b9"
      },
      {
        name: "Safety Goggles",
        description: "Impact-resistant safety goggles with anti-fog coating",
        basePrice: 2999,
        categoryId: 2,
        image: "https://images.unsplash.com/photo-1673201159882-725f2b63dc39"
      },
      {
        name: "Digital Caliper",
        description: "Professional digital caliper with LCD display",
        basePrice: 4999,
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1693155257465-f29b58ecadaa"
      }
    ];

    const products: (InsertProduct & { parsedVariants: ProductVariant[] })[] = [];

    // Generate 50 products based on templates
    for (let i = 0; i < 50; i++) {
      const template = productTemplates[i % productTemplates.length];
      const variants: ProductVariant[] = [
        {
          id: `v1-${i}`,
          name: "Standard Model",
          image: template.image
        },
        {
          id: `v2-${i}`,
          name: "Professional Model",
          image: template.image
        }
      ];

      products.push({
        name: `${template.name} - Model ${Math.floor(i / 3) + 1}`,
        description: template.description,
        image: template.image,
        price: template.basePrice + (Math.floor(Math.random() * 10000)),
        categoryId: template.categoryId,
        sku: `SKU-${template.categoryId}-${i + 1}`,
        inStock: Math.random() > 0.2,
        specifications: ["Specification 1", "Specification 2", "Specification 3"],
        variants: [],
        parsedVariants: variants
      });
    }

    products.forEach((prod, index) => {
      const variants = JSON.stringify(prod.parsedVariants);
      this.products.set(index + 1, {
        ...prod,
        id: index + 1,
        variants: [variants],
        parsedVariants: prod.parsedVariants
      });
    });
  }
}

export const storage = new MemStorage();