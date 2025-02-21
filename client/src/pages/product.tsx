import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Product, ProductVariant } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function ProductPage() {
  const { id } = useParams();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  useEffect(() => {
    if (product) {
      // Parse variants from the JSON string
      const variants = product.variants?.[0] ? JSON.parse(product.variants[0]) : [];
      product.parsedVariants = variants;

      // Set initial variant and image
      if (variants.length > 0) {
        setSelectedVariant(variants[0]);
        setCurrentImage(variants[0].image);
      } else {
        setCurrentImage(product.image);
      }
    }
  }, [product]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="space-y-8">
      <Link href="/">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full rounded-lg object-cover aspect-square"
          />
          {product.parsedVariants && product.parsedVariants.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.parsedVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setCurrentImage(variant.image);
                  }}
                  className={`p-2 border rounded-lg transition-all ${
                    selectedVariant?.id === variant.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={variant.image}
                    alt={variant.name}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <p className="text-xs text-center mt-1 text-gray-600">
                    {variant.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-[#333333]">{product.name}</h1>
                <Badge variant={product.inStock ? "default" : "destructive"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              <p className="text-2xl font-semibold text-[#496A81]">
                ${(product.price / 100).toFixed(2)}
              </p>
              {selectedVariant && (
                <p className="text-sm text-gray-600">
                  Selected Variant: {selectedVariant.name}
                </p>
              )}
            </div>

            <p className="text-[#333333]">{product.description}</p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#333333]">Specifications</h2>
              <ul className="space-y-2">
                {product.specifications?.map((spec, index) => (
                  <li key={index} className="flex items-center gap-2 text-[#333333]">
                    <Package className="h-4 w-4 text-[#66999B]" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <p className="text-sm text-[#496A81]">SKU: {product.sku}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}