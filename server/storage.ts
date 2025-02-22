import { createClient } from '@supabase/supabase-js';
import { Category, InsertCategory, InsertProduct, Product, ProductVariant, User, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Add logging to debug environment variables
console.log('Checking Supabase credentials...');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables check:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey
  });
  throw new Error('Missing Supabase credentials. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are properly set in the environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select();

    if (error) throw error;
    return data;
  }

  async getProducts(categoryId?: number): Promise<Product[]> {
    let query = supabase.from('products').select();

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select()
      .ilike('name', `%${query}%`);

    if (error) throw error;
    return data;
  }

  async addProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        image: product.image,
        category_id: product.categoryId, 
        sku: product.sku,
        specifications: product.specifications,
        variants: product.variants?.map(v => JSON.stringify(v)) 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    return !error;
  }

  async addCategory(category: InsertCategory): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    return !error;
  }

  async updateCategory(id: number, category: InsertCategory): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProductsPage(page: number, limit: number, categoryId?: number): Promise<{ products: Product[], total: number }> {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      products: data || [],
      total: count || 0
    };
  }
}

export const storage = new SupabaseStorage();

export interface IStorage {
  // User management
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Session store
  sessionStore: session.Store;

  // Existing methods
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
