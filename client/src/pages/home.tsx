import { useQuery } from "@tanstack/react-query";
import { Category, Product } from "@shared/schema";
import ProductGrid from "@/components/products/product-grid";
import SearchBar from "@/components/search/search-bar";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: categories } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"]
  });

  const { data: products, isLoading } = useQuery<Product[]>({ 
    queryKey: ["/api/products", selectedCategory, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.set("categoryId", selectedCategory);
      }
      if (search) {
        params.set("search", search);
      }
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#333333]">Product Catalog</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="bg-white border">
          <TabsTrigger value="all">All Products</TabsTrigger>
          {categories?.map(category => (
            <TabsTrigger key={category.id} value={String(category.id)}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <ProductGrid products={products || []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
