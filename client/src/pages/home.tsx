import { useQuery } from "@tanstack/react-query";
import { Category, Product } from "@shared/schema";
import ProductGrid from "@/components/products/product-grid";
import SearchBar from "@/components/search/search-bar";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 24; // Products per page

  const { data: categories } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"]
  });

  const { data: productData, isLoading } = useQuery<ProductResponse>({ 
    queryKey: ["/api/products", selectedCategory, search, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.set("categoryId", selectedCategory);
      }
      if (search) {
        params.set("search", search);
      }
      params.set("page", currentPage.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    }
  });

  const totalPages = productData ? Math.ceil(productData.total / limit) : 0;

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

        <TabsContent value={selectedCategory} className="mt-6 space-y-6">
          <ProductGrid products={productData?.products || []} isLoading={isLoading} />

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}