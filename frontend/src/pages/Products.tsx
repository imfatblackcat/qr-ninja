import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingCart, ShoppingBag, Filter, Search, ExternalLink, Tag } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { getProducts, getCategories, createCart } from "utils/brainProxy";

// Define types based on API models
interface Product {
  id: number;
  name: string;
  type: string;
  sku?: string;
  description?: string;
  price: number;
  sale_price?: number;
  calculated_price?: number;
  categories?: number[];
  brand_id?: number;
  inventory_level?: number;
  inventory_tracking?: string;
  page_title?: string;
  meta_description?: string;
  images?: {
    id: number;
    product_id: number;
    url_thumbnail: string;
    url_standard: string;
    url_zoom: string;
    is_thumbnail: boolean;
    sort_order: number;
    description?: string;
  }[];
  custom_url?: {
    url: string;
    is_customized: boolean;
  };
  variants?: any[];
  image_url?: string;
  is_visible?: boolean;
  url?: string;
}

interface Category {
  id: number;
  parent_id: number;
  name: string;
  description?: string;
  sort_order?: number;
  page_title?: string;
  meta_description?: string;
  image_url?: string;
  is_visible?: boolean;
  url?: string;
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const storeHash = searchParams.get("store_hash") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("products");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [creatingCart, setCreatingCart] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  
  const productsPerPage = 12;
  const categoriesPerPage = 20;
  
  // Fetch products on mount and when category changes, but not when page changes
  useEffect(() => {
    if (storeHash) {
      // Reset products and page when category changes
      setProducts([]);
      setProductPage(1);
      setHasMoreProducts(true);
      fetchProducts(storeHash, 1, selectedCategory, true);
    }
  }, [storeHash, selectedCategory]);
  
  // Fetch categories on mount and when page changes
  useEffect(() => {
    if (storeHash) {
      fetchCategories(storeHash, categoryPage);
    }
  }, [storeHash, categoryPage]);
  
  // Filter products when search term changes
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);
  
  const fetchProducts = async (storeHash: string, page: number, categoryId: number | null = null, resetData: boolean = false) => {
    if (resetData) {
      setIsLoadingProducts(true);
    } else {
      setIsLoadingMoreProducts(true);
    }
    
    try {
      let queryParams: { limit: number; page: number; category_id?: number } = {
        limit: productsPerPage,
        page
      };
      
      if (categoryId) {
        queryParams.category_id = categoryId;
      }
      
      const response = await getProducts({
        ...{ store_hash: storeHash },
        ...queryParams
      });
      
      const data = await response.json();
      
      // Check if we've reached the end of the products
      const totalProducts = data.total;
      const hasMore = page * productsPerPage < totalProducts;
      setHasMoreProducts(hasMore);
      
      // Update products - either replace or append
      if (resetData) {
        setProducts(data.products);
      } else {
        setProducts(prevProducts => [...prevProducts, ...data.products]);
      }
      
      setProductTotal(data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
      setIsLoadingMoreProducts(false);
    }
  };
  
  const fetchCategories = async (storeHash: string, page: number) => {
    setIsLoadingCategories(true);
    try {
      const response = await getCategories({
        store_hash: storeHash,
        limit: categoriesPerPage,
        page
      });
      
      const data = await response.json();
      setCategories(data.categories);
      setCategoryTotal(data.total);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  const loadMoreProducts = () => {
    const nextPage = productPage + 1;
    setProductPage(nextPage);
    fetchProducts(storeHash, nextPage, selectedCategory, false);
  };
  
  const createNewCart = async (productId: number) => {
    setCreatingCart(true);
    try {
      const response = await createCart({
        store_hash: storeHash,
        product_id: productId,
        quantity: 1
      });
      
      const data = await response.json();
      
      if (data.cart && data.cart.checkout_url) {
        window.open(data.cart.checkout_url, "_blank");
        toast.success("Cart created successfully!");
      } else {
        toast.error("Cart created but checkout URL is missing");
      }
    } catch (error) {
      console.error("Error creating cart:", error);
      toast.error("Failed to create cart");
    } finally {
      setCreatingCart(false);
    }
  };
  
  const getThumbnailUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const thumbnail = product.images.find(img => img.is_thumbnail) || product.images[0];
      return thumbnail.url_thumbnail || thumbnail.url_standard;
    }
    return "https://via.placeholder.com/150x150?text=No+Image";
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const categoryPageCount = Math.ceil(categoryTotal / categoriesPerPage);
  
  if (!storeHash) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No Store Selected</h1>
          <p className="text-gray-600 mb-6">Please navigate to this page from the Hello World dashboard.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Products & Categories</h1>
          <p className="text-muted-foreground">View and manage your BigCommerce store data.</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="products" className="text-base">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-base">
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 md:flex-none">
              <Select value={selectedCategory ? String(selectedCategory) : ""} onValueChange={(value) => setSelectedCategory(value ? Number(value) : null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
              <p className="text-muted-foreground">
                {searchTerm ? "Try a different search term or clear the filters." : "There are no products in this category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="flex flex-col overflow-hidden">
                  <div className="w-full h-48 overflow-hidden bg-muted">
                    <img 
                      src={getThumbnailUrl(product)} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2" title={product.name}>
                      {product.name}
                    </CardTitle>
                    <CardDescription>
                      SKU: {product.sku || "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xl font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      {product.sale_price && product.sale_price < product.price && (
                        <span className="text-sm line-through text-muted-foreground">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    {product.inventory_level !== undefined && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Stock: {product.inventory_level} units
                      </div>
                    )}
                    <p className="text-sm line-clamp-3">
                      {product.description ? product.description.replace(/<[^>]*>/g, '') : "No description available."}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => handleCreateCart(product.id)}
                      disabled={creatingCart}
                    >
                      {creatingCart ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Cart...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoadingProducts && pageCount > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (productPage > 1) setProductPage(productPage - 1);
                    }} 
                    aria-disabled={productPage === 1}
                    className={productPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                  let pageNum = i + 1;
                  
                  // Adjust page numbers for pagination with many pages
                  if (pageCount > 5) {
                    if (productPage > 3 && productPage < pageCount - 1) {
                      pageNum = productPage - 2 + i;
                    } else if (productPage >= pageCount - 1) {
                      pageNum = pageCount - 4 + i;
                    }
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setProductPage(pageNum);
                        }}
                        isActive={productPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (productPage < pageCount) setProductPage(productPage + 1);
                    }}
                    aria-disabled={productPage === pageCount}
                    className={productPage === pageCount ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h2 className="text-xl font-semibold mb-2">No Categories Found</h2>
              <p className="text-muted-foreground">There are no categories in your store.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      ID: {category.id} {category.parent_id !== 0 && `| Parent ID: ${category.parent_id}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">
                      {category.description ? category.description.replace(/<[^>]*>/g, '') : "No description available."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setActiveTab("products");
                        setSelectedCategory(category.id);
                        setProductPage(1);
                      }}
                    >
                      View Products
                    </Button>
                    
                    {category.url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={category.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoadingCategories && categoryPageCount > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (categoryPage > 1) setCategoryPage(categoryPage - 1);
                    }} 
                    aria-disabled={categoryPage === 1}
                    className={categoryPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, categoryPageCount) }, (_, i) => {
                  let pageNum = i + 1;
                  
                  // Adjust page numbers for pagination with many pages
                  if (categoryPageCount > 5) {
                    if (categoryPage > 3 && categoryPage < categoryPageCount - 1) {
                      pageNum = categoryPage - 2 + i;
                    } else if (categoryPage >= categoryPageCount - 1) {
                      pageNum = categoryPageCount - 4 + i;
                    }
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCategoryPage(pageNum);
                        }}
                        isActive={categoryPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (categoryPage < categoryPageCount) setCategoryPage(categoryPage + 1);
                    }}
                    aria-disabled={categoryPage === categoryPageCount}
                    className={categoryPage === categoryPageCount ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
