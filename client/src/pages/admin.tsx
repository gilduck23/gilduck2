import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, type Product, type ProductVariant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus } from "lucide-react";

// Basic auth credentials
const credentials = btoa("gilduck:gilduck");

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      price: 0,
      categoryId: 1,
      sku: "",
      inStock: true,
      specifications: [],
      variants: []
    }
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `v${variants.length + 1}`,
      name: "",
      image: ""
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    const updatedVariants = variants.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value };
      }
      return v;
    });
    setVariants(updatedVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addProduct = useMutation({
    mutationFn: async (data: InsertProduct) => {
      // Add variants to the product data
      const productWithVariants = {
        ...data,
        variants: variants.length > 0 ? [JSON.stringify(variants)] : []
      };

      const res = await apiRequest("POST", "/api/admin/products", productWithVariants, {
        headers: {
          Authorization: `Basic ${credentials}`
        }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      setVariants([]);
      toast({
        title: "Success",
        description: "Product added successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`, undefined, {
        headers: {
          Authorization: `Basic ${credentials}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  async function onSubmit(data: InsertProduct) {
    addProduct.mutate(data);
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (in cents)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Product Variants</h3>
                  <Button type="button" onClick={addVariant} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {variants.map((variant, index) => (
                  <div key={variant.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">Variant {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <FormLabel>Variant Name</FormLabel>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          placeholder="e.g., Standard Model"
                        />
                      </div>

                      <div>
                        <FormLabel>Variant Image URL</FormLabel>
                        <Input
                          value={variant.image}
                          onChange={(e) => updateVariant(index, 'image', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full">Add Product</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products?.map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteProduct.mutate(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}