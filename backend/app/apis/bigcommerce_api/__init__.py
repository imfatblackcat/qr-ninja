from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import databutton as db
import json
import traceback
import requests
from bigcommerce.api import BigcommerceApi

# Import store manager functions
from app.apis.store_manager import get_store_data

# Import logger for centralized logging
from app.apis.logger import error, info, log_exception, warning

router = APIRouter(prefix="/bigcommerce")

# Response Models
class Product(BaseModel):
    id: int
    name: str
    type: str
    sku: Optional[str] = None
    description: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    calculated_price: Optional[float] = None
    categories: List[int] = Field(default_factory=list)
    brand_id: Optional[int] = None
    inventory_level: Optional[int] = None
    inventory_tracking: Optional[str] = None
    page_title: Optional[str] = None
    meta_description: Optional[str] = None
    images: List[Dict[str, Any]] = Field(default_factory=list)
    custom_url: Optional[Dict[str, Any]] = None
    is_visible: Optional[bool] = True
    variants: List[Dict[str, Any]] = Field(default_factory=list)

class ProductsResponse(BaseModel):
    products: List[Product] = Field(default_factory=list)
    status: str = "success"
    total: int = 0

class Category(BaseModel):
    id: int
    parent_id: int
    name: str
    description: Optional[str] = None
    sort_order: Optional[int] = None
    page_title: Optional[str] = None
    meta_description: Optional[str] = None
    image_url: Optional[str] = None
    is_visible: Optional[bool] = True
    url: Optional[str] = None

class CategoriesResponse(BaseModel):
    categories: List[Category] = Field(default_factory=list)
    status: str = "success"
    total: int = 0

class Coupon(BaseModel):
    id: int
    name: str
    code: str
    type: str
    amount: float
    min_purchase: Optional[float] = None
    applies_to: Optional[Dict[str, Any]] = None
    enabled: bool
    date_created: Optional[str] = None
    expires: Optional[str] = None
    num_uses: Optional[int] = None
    max_uses: Optional[int] = None

class CouponsResponse(BaseModel):
    coupons: List[Coupon] = Field(default_factory=list)
    status: str = "success"
    total: int = 0

class Cart(BaseModel):
    id: str
    redirect_url: Optional[str] = None
    checkout_url: Optional[str] = None

class CartResponse(BaseModel):
    cart: Cart
    status: str = "success"

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str

# Helper Functions
def get_bigcommerce_api(store_hash: str):
    """
    Create a BigCommerce API instance for a given store hash
    """
    try:
        # Get store data to access authentication information
        store = get_store_data(store_hash)
        
        # Get BigCommerce client credentials
        client_id = db.secrets.get("BIGCOMMERCE_CLIENT_ID")
        client_secret = db.secrets.get("BIGCOMMERCE_CLIENT_SECRET")
        access_token = store.auth.access_token
        
        # Create BigCommerce API instance
        api = BigcommerceApi(
            client_id=client_id,
            store_hash=store_hash,
            access_token=access_token
        )
        
        return api
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store not found: {store_hash}"
        )
    except Exception as e:
        log_exception("Error creating BigCommerce API", e, 
                  context={"store_hash": store_hash},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing BigCommerce API: {str(e)}"
        )

def make_bigcommerce_request(store_hash: str, endpoint: str, method="GET", data=None, params=None):
    """
    Make a direct request to the BigCommerce V3 API for endpoints not fully supported by the SDK
    """
    try:
        # Get store data to access authentication information
        store = get_store_data(store_hash)
        access_token = store.auth.access_token
        
        # Define the base URL for BigCommerce V3 API
        base_url = f"https://api.bigcommerce.com/stores/{store_hash}/v3"
        url = f"{base_url}/{endpoint}"
        
        # Set up headers with authentication
        headers = {
            "X-Auth-Token": access_token,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        # Make the request using the requests library
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data, params=params)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=headers, json=data, params=params)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, params=params)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        # Check for successful response
        response.raise_for_status()
        
        # Return the JSON response if the request was successful
        return response.json()
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store not found: {store_hash}"
        )
    except requests.exceptions.HTTPError as http_err:
        error_message = f"HTTP error occurred: {http_err}"
        try:
            error_data = http_err.response.json()
            if "errors" in error_data:
                error_message = f"BigCommerce API error: {error_data['errors'][0]['message']}"
        except:
            pass
        
        log_exception("BigCommerce API HTTP error", http_err, 
                  context={"store_hash": store_hash, "endpoint": endpoint, "status_code": http_err.response.status_code},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_message
        )
    except Exception as e:
        log_exception("Error making BigCommerce request", e, 
                  context={"store_hash": store_hash, "endpoint": endpoint},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing BigCommerce API: {str(e)}"
        )

# API Endpoints
@router.get("/products/{store_hash}", response_model=ProductsResponse)
async def get_products(store_hash: str, limit: int = 50, page: int = 1, category_id: Optional[int] = None):
    """
    Get products for a specific store
    """
    try:
        # Set up query parameters
        params = {
            "limit": limit,
            "page": page
        }
        
        # Add category filter if provided
        if category_id:
            params["categories:in"] = category_id
            
        # Make request to BigCommerce API
        response = make_bigcommerce_request(store_hash, "catalog/products", params=params)
        
        # Extract products from response
        products_data = response.get("data", [])
        product_list = []
        
        # Process each product
        for product_data in products_data:
            # Get product images
            images = []
            try:
                if product_data.get("id"):
                    image_response = make_bigcommerce_request(
                        store_hash, 
                        f"catalog/products/{product_data['id']}/images"
                    )
                    images = image_response.get("data", [])
            except Exception as img_err:
                warning(f"Error fetching images for product {product_data.get('id')}", 
                      store_hash=store_hash,
                      source="bigcommerce_api")
            
            # Create product object
            product = Product(
                id=product_data.get("id"),
                name=product_data.get("name"),
                type=product_data.get("type"),
                sku=product_data.get("sku"),
                description=product_data.get("description"),
                price=product_data.get("price"),
                sale_price=product_data.get("sale_price"),
                calculated_price=product_data.get("calculated_price"),
                categories=product_data.get("categories", []),
                brand_id=product_data.get("brand_id"),
                inventory_level=product_data.get("inventory_level"),
                inventory_tracking=product_data.get("inventory_tracking"),
                page_title=product_data.get("page_title"),
                meta_description=product_data.get("meta_description"),
                images=images,
                custom_url=product_data.get("custom_url"),
                is_visible=product_data.get("is_visible"),
                variants=product_data.get("variants", [])
            )
            product_list.append(product)
        
        # Return products response
        return ProductsResponse(
            products=product_list,
            status="success",
            total=response.get("meta", {}).get("pagination", {}).get("total", 0)
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        log_exception("Error fetching products", e, 
                  context={"store_hash": store_hash},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )

@router.get("/categories/{store_hash}", response_model=CategoriesResponse)
async def get_categories(store_hash: str, limit: int = 50, page: int = 1, parent_id: Optional[int] = None):
    """
    Get categories for a specific store
    """
    try:
        # Set up query parameters
        params = {
            "limit": limit,
            "page": page
        }
        
        # Add parent_id filter if provided
        if parent_id is not None:
            params["parent_id"] = parent_id
            
        # Make request to BigCommerce API
        response = make_bigcommerce_request(store_hash, "catalog/categories", params=params)
        
        # Extract categories from response
        categories_data = response.get("data", [])
        category_list = []
        
        # Process each category
        for category_data in categories_data:
            category = Category(
                id=category_data.get("id"),
                parent_id=category_data.get("parent_id", 0),
                name=category_data.get("name"),
                description=category_data.get("description"),
                sort_order=category_data.get("sort_order"),
                page_title=category_data.get("page_title"),
                meta_description=category_data.get("meta_description"),
                image_url=category_data.get("image_url"),
                is_visible=category_data.get("is_visible"),
                url=category_data.get("custom_url", {}).get("url")
            )
            category_list.append(category)
        
        # Return categories response
        return CategoriesResponse(
            categories=category_list,
            status="success",
            total=response.get("meta", {}).get("pagination", {}).get("total", 0)
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        log_exception("Error fetching categories", e, 
                  context={"store_hash": store_hash},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        )

@router.get("/coupons/{store_hash}", response_model=CouponsResponse)
async def get_coupons(store_hash: str, limit: int = 50, page: int = 1):
    """
    Get coupons for a specific store
    """
    try:
        # Set up query parameters
        params = {
            "limit": limit,
            "page": page
        }
        
        # Make request to BigCommerce API (using V2 API for coupons)
        # Note: The make_bigcommerce_request function is designed for V3 API, 
        # so we need to modify it slightly for V2 endpoints
        
        # Get store data to access authentication information
        store = get_store_data(store_hash)
        access_token = store.auth.access_token
        
        # Define the base URL for BigCommerce V2 API
        base_url = f"https://api.bigcommerce.com/stores/{store_hash}/v2"
        url = f"{base_url}/coupons"
        
        # Set up headers with authentication
        headers = {
            "X-Auth-Token": access_token,
            "Accept": "application/json"
        }
        
        # Make the request
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        coupons_data = response.json()
        
        # Process coupons
        coupon_list = []
        for coupon_data in coupons_data:
            coupon = Coupon(
                id=coupon_data.get("id"),
                name=coupon_data.get("name"),
                code=coupon_data.get("code"),
                type=coupon_data.get("type"),
                amount=coupon_data.get("amount"),
                min_purchase=coupon_data.get("min_purchase"),
                applies_to=coupon_data.get("applies_to"),
                enabled=coupon_data.get("enabled", False),
                date_created=coupon_data.get("date_created"),
                expires=coupon_data.get("expires"),
                num_uses=coupon_data.get("num_uses"),
                max_uses=coupon_data.get("max_uses")
            )
            coupon_list.append(coupon)
        
        # Return coupons response
        return CouponsResponse(
            coupons=coupon_list,
            status="success",
            total=len(coupon_list)  # V2 API doesn't provide metadata about total
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except requests.exceptions.HTTPError as http_err:
        error_message = f"HTTP error occurred: {http_err}"
        try:
            error_data = http_err.response.json()
            error_message = f"BigCommerce API error: {error_data}"
        except:
            pass
        
        log_exception("BigCommerce API HTTP error", http_err, 
                  context={"store_hash": store_hash, "endpoint": "coupons", "status_code": http_err.response.status_code},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_message
        )
    except Exception as e:
        log_exception("Error fetching coupons", e, 
                  context={"store_hash": store_hash},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching coupons: {str(e)}"
        )

@router.post("/cart/create/{store_hash}", response_model=CartResponse)
async def create_cart(store_hash: str, product_id: int, quantity: int = 1):
    """
    Create a cart with a product in a specific store
    """
    try:
        # Prepare the cart data
        cart_data = {
            "line_items": [
                {
                    "quantity": quantity,
                    "product_id": product_id
                }
            ]
        }
        
        # Create the cart using the BigCommerce API
        response = make_bigcommerce_request(
            store_hash, 
            "carts", 
            method="POST", 
            data=cart_data
        )
        
        # Extract cart ID and redirect URL
        cart_id = response.get("data", {}).get("id")
        redirect_url = response.get("data", {}).get("redirect_urls", {}).get("cart_url")
        checkout_url = response.get("data", {}).get("redirect_urls", {}).get("checkout_url")
        
        # Return cart response
        return CartResponse(
            cart=Cart(
                id=cart_id,
                redirect_url=redirect_url,
                checkout_url=checkout_url
            ),
            status="success"
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        log_exception("Error creating cart", e, 
                  context={"store_hash": store_hash, "product_id": product_id},
                  source="bigcommerce_api")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating cart: {str(e)}"
        )
