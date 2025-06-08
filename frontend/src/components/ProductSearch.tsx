import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, Loader2 } from "lucide-react";
import brain from "brain";
import { getProducts } from "utils/brainProxy";

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  images: any[];
  custom_url: any | null;
}

export interface ProductSearchProps {
  storeHash: string;
  onSelectProduct: (product: Product) => void;
}

export function ProductSearch({ storeHash, onSelectProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from BigCommerce
  useEffect(() => {
    if (!storeHash) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProducts({ store_hash: storeHash });
        const data = await response.json();
        if (data.status === "success") {
          setProducts(data.products);
          setFilteredProducts(data.products);
        } else {
          setError("Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error loading products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeHash]);

  // Filter products when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.sku && product.sku.toLowerCase().includes(term)) ||
        product.id.toString().includes(term)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Get product image URL
  const getProductImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      // Find thumbnail or standard image
      const thumbnail = product.images.find((img) => img.is_thumbnail);
      return thumbnail?.url_thumbnail || product.images[0]?.url_thumbnail || "";
    }
    return "";
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search by name, ID or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-muted-foreground text-center py-4">
          No products found
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center space-x-3 p-2 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                {getProductImageUrl(product) ? (
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground">
                  ID: {product.id} {product.sku ? `| SKU: ${product.sku}` : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectProduct(product)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
