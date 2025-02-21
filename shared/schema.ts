import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
});

// Define a type for product variants
export type ProductVariant = {
  id: string;
  name: string;
  image: string;
};

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  price: integer("price").notNull(),
  categoryId: integer("category_id").notNull(),
  sku: text("sku").notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  specifications: text("specifications").array(),
  variants: text("variants").array(), // Store variants as JSON strings
});

export const insertCategorySchema = createInsertSchema(categories);
export const insertProductSchema = createInsertSchema(products);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect & { 
  parsedVariants?: ProductVariant[] 
};
export type InsertProduct = z.infer<typeof insertProductSchema>;