import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-t-lg"
          />
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg text-[#333333] line-clamp-2">
                {product.name}
              </h3>
              <Badge variant={product.inStock ? "default" : "destructive"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            <p className="text-sm text-[#496A81] line-clamp-2">{product.description}</p>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t">
          <p className="font-semibold text-[#2B3A67]">
            ${(product.price / 100).toFixed(2)}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
