import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Package2 } from "lucide-react";
import { getProducts } from "../utils/brainProxy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Layout } from "components/Layout";

interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  images: any[];
  categories: number[];
  custom_url: any | null;
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const storeHash = searchParams.get("store_hash") || localStorage.getItem("storeHash") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("ProductsPage loaded with store hash:", storeHash);
  }, []);

  // Pobierz produkty
  useEffect(() => {
    if (!storeHash) {
      setError("No store hash provided. Please go back to the main page and reconnect your store.");
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching products for store hash:", storeHash);
        const response = await getProducts({ store_hash: storeHash });
        const data = await response.json();
        
        if (data.status === "success" && Array.isArray(data.products)) {
          console.log("Products loaded successfully. Count:", data.products.length);
          setProducts(data.products);
          setFilteredProducts(data.products);
        } else {
          console.error("Unexpected API response:", data);
          setError("Failed to load products. Invalid API response.");
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

  // Filtruj produkty
  useEffect(() => {
    if (products.length === 0) return;

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

  // Pobierz URL obrazu produktu
  const getProductImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const thumbnail = product.images.find((img) => img.is_thumbnail);
      return thumbnail?.url_thumbnail || product.images[0]?.url_thumbnail || "";
    }
    return "";
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Browse products from your BigCommerce store</p>
        </div>
      </div>

      {!storeHash ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-amber-600 bg-amber-50 p-4 rounded-md">
              No store hash provided. Please go back to the main page and reconnect your store.
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Search bar */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID or SKU..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>

          {/* Products grid */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No products found
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {getProductImageUrl(product) ? (
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package2 className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-md line-clamp-2 h-12">{product.name}</h3>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.sku ? `SKU: ${product.sku}` : `ID: ${product.id}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}