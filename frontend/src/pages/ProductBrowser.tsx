import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Filter, X } from "lucide-react";
import { getProducts, getCategories } from "../utils/brainProxy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  images: any[];
  categories: number[];
  custom_url: any | null;
}

export default function ProductBrowser() {
  const [searchParams] = useSearchParams();
  const storeHash = searchParams.get("store") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{min: number, max: number | null}>({min: 0, max: null});

  // Pobierz produkty
  useEffect(() => {
    if (!storeHash) {
      setError("Nie podano store_hash. Dodaj ?store=HASH_SKLEPU do URL.");
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
          console.log("Products loaded:", data.products.length);
          setProducts(data.products);
          setFilteredProducts(data.products);
          
          // Ustal maksymalną cenę dla filtra
          const maxPrice = Math.max(...data.products.map((p: Product) => p.price)) || 100;
          setPriceRange(prev => ({ ...prev, max: maxPrice }));
        } else {
          console.error("Unexpected API response:", data);
          setError("Nie udało się pobrać produktów. Niepoprawna odpowiedź API.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Błąd podczas pobierania produktów. Spróbuj ponownie.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getCategories({ store_hash: storeHash });
        const data = await response.json();
        
        if (data.status === "success" && Array.isArray(data.categories)) {
          console.log("Categories loaded:", data.categories.length);
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Nie ustawiamy błędu kategorii jako błędu głównego - użytkownik może przeglądać produkty bez kategorii
      }
    };

    fetchProducts();
    fetchCategories();
  }, [storeHash]);

  // Filtruj produkty
  useEffect(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    // Filtruj po frazie
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.sku && product.sku.toLowerCase().includes(term))
      );
    }

    // Filtruj po kategorii
    if (selectedCategory) {
      const categoryId = parseInt(selectedCategory);
      filtered = filtered.filter(product => 
        product.categories && product.categories.includes(categoryId)
      );
    }

    // Filtruj po cenie
    if (priceRange.min > 0 || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.price;
        const aboveMin = priceRange.min <= price;
        const belowMax = priceRange.max ? price <= priceRange.max : true;
        return aboveMin && belowMax;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange]);

  // Zresetuj filtry
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({min: 0, max: Math.max(...products.map(p => p.price)) || 100});
  };

  // Pobierz URL obrazu produktu
  const getProductImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const thumbnail = product.images.find((img) => img.is_thumbnail);
      return thumbnail?.url_thumbnail || product.images[0]?.url_thumbnail || "";
    }
    return "";
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Przeglądaj produkty</h1>
      
      {!storeHash ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-amber-600 bg-amber-50 p-4 rounded-md">
              Nie podano identyfikatora sklepu. Dodaj <code>?store=HASH_SKLEPU</code> do URL.
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtrowanie */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Filtrowanie</span>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Wyczyść
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Wyszukiwanie */}
                <div className="space-y-2">
                  <Label>Nazwa lub SKU</Label>
                  <div className="relative">
                    <Input
                      placeholder="Szukaj produktu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                
                {/* Kategorie */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Kategoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Wszystkie kategorie</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Cena */}
                <div className="space-y-2">
                  <Label>Cena</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Od"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                    />
                    <Input
                      type="number"
                      placeholder="Do"
                      value={priceRange.max || ""}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseFloat(e.target.value) || null }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lista produktów */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-muted-foreground">
                Znaleziono {filteredProducts.length} produktów
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Nie znaleziono produktów spełniających kryteria
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
                          Brak zdjęcia
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 h-12">{product.name}</h3>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-primary">
                          {product.price.toFixed(2)} zł
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {product.id}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
