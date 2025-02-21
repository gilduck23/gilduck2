import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20">
        <div className="relative aspect-square overflow-hidden bg-secondary/5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <CardContent className="p-4">
          <div className="space-y-2.5">
            <h3 className="font-medium text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t bg-secondary/5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="font-medium">SKU: {product.sku}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}