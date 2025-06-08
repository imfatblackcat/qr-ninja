from fastapi import APIRouter, Path, Query, HTTPException
from fastapi.responses import Response, StreamingResponse
from typing import Optional, Literal
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import (
    RoundedModuleDrawer, 
    CircleModuleDrawer, 
    SquareModuleDrawer,
    GappedSquareModuleDrawer,
    HorizontalBarsDrawer,
    VerticalBarsDrawer
)
from qrcode.image.styles.colormasks import SolidFillColorMask
import qrcode.image.svg
import io
import svgwrite
import math
from PIL import Image, ImageDraw
from app.apis.qr_code import QRCode, qr_code_repo, get_absolute_scan_url
from app.env import Mode, mode

# Set the base URL for the API based on the environment
# For QR code redirection, we need to ensure proper URL construction both in dev and prod environments
#
# Production environment:
#   Base URL: https://app.getrobo.xyz
#   Track endpoint is mounted at: /api/track/{qr_code_id}
#   Full tracking URL: https://app.getrobo.xyz/api/track/{qr_code_id}
#
# Development environment:
#   Base URL: https://api.databutton.com
#   Track endpoint is mounted at: /_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes/track/{qr_code_id}
#   Full tracking URL: https://api.databutton.com/_projects/a0367e31-5bea-41d3-86f6-9792665de5f3/dbtn/devx/app/routes/track/{qr_code_id}
#
# Debugging notes:
# - In production, the API is mounted under /api, while in development it's directly accessible
# - FastAPI router prefixes (/track) are added automatically, but the full path to the API differs between environments

# Base URL for the API - this is just the domain without paths
API_BASE_URL = "https://app.getrobo.xyz" if mode == Mode.PROD else "https://api.databutton.com"

# Set the path for tracking based on environment
# In production: /api/track (because FastAPI app is mounted under /api)
# In development: /track (the route prefix will be added by FastAPI)
TRACK_PATH = "/api/track" if mode == Mode.PROD else "/track"

# Log the configuration for debugging
print(f"[QR GENERATOR] Environment Mode: {mode}")
print(f"[QR GENERATOR] API_BASE_URL: {API_BASE_URL}")
print(f"[QR GENERATOR] TRACK_PATH: {TRACK_PATH}")
print(f"[QR GENERATOR] Full tracking path prefix: {API_BASE_URL}{TRACK_PATH}")

router = APIRouter(prefix="/qr-image", tags=["qr-image"])

@router.get("/{qr_code_id}.{format}")
async def get_qr_code_image(
    qr_code_id: str = Path(..., description="The ID of the QR code or 'temp-preview' for preview"),
    format: Literal["png", "jpeg", "pdf"] = Path(..., description="The format of the QR code image (png, jpeg, pdf supported)"),
    url: Optional[str] = Query(None, description="URL to encode (for temp-preview)"),
    dots_style: Optional[str] = Query(None, description="Style of the QR code's data modules (dots)."),
    corner_style: Optional[str] = Query(None, description="Style of the QR code's corner finder patterns."),
    actual_corner_color: Optional[str] = Query(None, description="Hex color for the custom corners, if different from foreground."),
    foreground_color_override: Optional[str] = Query(None, description="Hex color for the QR code foreground (dots)."),
    background_color_override: Optional[str] = Query(None, description="Hex color for the QR code background."),
    size: int = Query(300, description="Size of the QR code in pixels"),
    error_correction: Literal["L", "M", "Q", "H"] = Query("M", description="Error correction level"),
    border: int = Query(4, description="Border size in modules")
):
    """
    Generate a QR code image in PNG or SVG format for a given QR code ID or temporary preview
    """
    
    if qr_code_id == "temp-preview":
        # Handle temporary preview without saving QR code
        if not url:
            raise HTTPException(status_code=400, detail="URL parameter required for temp-preview")
        
        # Use the provided URL directly for preview (no tracking)
        target_url = url
       
        # Use default styles with overrides from query params
        foreground_color = foreground_color_override or "#000000"
        background_color = background_color_override or "#FFFFFF"
        dots_style_value = dots_style or "square"
        corner_style_value = corner_style or "square"
        corner_color_value = actual_corner_color or foreground_color
        
        print(f"[QR GENERATOR] Generating temp preview for URL: {target_url}")
        print(f"[QR GENERATOR] Preview styles: dots={dots_style_value}, corners={corner_style_value}")
        print(f"[QR GENERATOR] Colors: fg={foreground_color}, bg={background_color}, corner={corner_color_value}")
    else:
        # Handle saved QR code
        qr_codes = qr_code_repo.query_by_field("id", qr_code_id)
        if not qr_codes:
            raise HTTPException(status_code=404, detail="QR code not found")
            
        qr_code = qr_codes[0]
        
        # Use the QR code style settings, allowing overrides from query params
        foreground_color = foreground_color_override or qr_code.style.foreground_color
        background_color = background_color_override or qr_code.style.background_color
        
        # Get the dots and corner styles, allowing overrides
        dots_style_value = dots_style or qr_code.style.dots_style
        corner_style_value = corner_style or qr_code.style.corner_style
        corner_color_value = actual_corner_color or qr_code.style.corner_color or foreground_color
        
        print(f"[QR GENERATOR] Generating saved QR for ID: {qr_code_id}")
        print(f"[QR GENERATOR] Saved QR styles: dots={dots_style_value}, corners={corner_style_value}")
        print(f"[QR GENERATOR] Colors: fg={foreground_color}, bg={background_color}, corner={corner_color_value}")
        target_url = get_absolute_scan_url(qr_code_id)
        
        # Log the tracking URL for debugging
        print(f"[QR GENERATOR] Generated tracking URL: {target_url} for QR code ID: {qr_code_id}")
        print(f"[QR GENERATOR] URL components: BASE={API_BASE_URL}, PATH={TRACK_PATH}, ID={qr_code_id}")
        
    # Convert error correction level
    error_levels = {
        "L": qrcode.constants.ERROR_CORRECT_L,  # 7% of data can be restored
        "M": qrcode.constants.ERROR_CORRECT_M,  # 15% of data can be restored
        "Q": qrcode.constants.ERROR_CORRECT_Q,  # 25% of data can be restored
        "H": qrcode.constants.ERROR_CORRECT_H,  # 30% of data can be restored
    }

    # Use M as the default error correction level unless otherwise specified
    correction_level = error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_M)

    # Generate the QR code
    if format == "svg":
        # SVG generation
        factory = qrcode.image.svg.SvgPathImage
        qr = qrcode.QRCode(
            version=5,  # Limit to version 5 (capacity ~108 alphanumeric chars with M correction)
            error_correction=correction_level,
            box_size=10,
            border=border
        )
        qr.add_data(target_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color=foreground_color, back_color=background_color, image_factory=factory)
        stream = io.BytesIO()
        img.save(stream)
        stream.seek(0)

        return Response(
            content=stream.read(),
            media_type="image/svg+xml"
        )

    else:  # PNG
        qr = qrcode.QRCode(
            version=5,  # Limit to version 5 (capacity ~108 alphanumeric chars with M correction)
            error_correction=correction_level,
            box_size=10,
            border=border
        )
        qr.add_data(target_url)
        qr.make(fit=True)

        # Choose module drawer based on dots style
        module_drawer = None
        if dots_style_value == "dots":
            module_drawer = CircleModuleDrawer()
            print(f"[QR GENERATOR] Using CircleModuleDrawer for dots style")
        elif dots_style_value == "rounded":
            module_drawer = RoundedModuleDrawer()
            print(f"[QR GENERATOR] Using RoundedModuleDrawer for rounded style")
        elif dots_style_value == "diamond":
            module_drawer = GappedSquareModuleDrawer()
            print(f"[QR GENERATOR] Using GappedSquareModuleDrawer for diamond style")
        elif dots_style_value == "honeycomb":
            module_drawer = HorizontalBarsDrawer()
            print(f"[QR GENERATOR] Using HorizontalBarsDrawer for honeycomb style")
        elif dots_style_value == "classy":
            module_drawer = VerticalBarsDrawer()
            print(f"[QR GENERATOR] Using VerticalBarsDrawer for classy style")
        else:  # square or other
            module_drawer = SquareModuleDrawer()
            print(f"[QR GENERATOR] Using SquareModuleDrawer for {dots_style_value} style")
            
        # Choose eye drawer based on corner style (separate from dots style)
        eye_drawer = None
        if corner_style_value == "dots":
            eye_drawer = CircleModuleDrawer()
            print(f"[QR GENERATOR] Using CircleModuleDrawer for dots corner style")
        elif corner_style_value == "rounded":
            eye_drawer = RoundedModuleDrawer()
            print(f"[QR GENERATOR] Using RoundedModuleDrawer for rounded corner style")
        elif corner_style_value == "diamond":
            eye_drawer = GappedSquareModuleDrawer()
            print(f"[QR GENERATOR] Using GappedSquareModuleDrawer for diamond corner style")
        elif corner_style_value == "honeycomb":
            eye_drawer = HorizontalBarsDrawer()
            print(f"[QR GENERATOR] Using HorizontalBarsDrawer for honeycomb corner style")
        elif corner_style_value == "classy":
            eye_drawer = VerticalBarsDrawer()
            print(f"[QR GENERATOR] Using VerticalBarsDrawer for classy corner style")
        else:  # square or other
            eye_drawer = SquareModuleDrawer()
            print(f"[QR GENERATOR] Using SquareModuleDrawer for {corner_style_value} corner style")
            
        print(f"[QR GENERATOR] Styles: dots={dots_style_value}, corners={corner_style_value}")
        print(f"[QR GENERATOR] Colors: fg={foreground_color}, bg={background_color}, corner={corner_color_value}")
        
        # Convert hex colors to RGB tuples for ColorMask
        def hex_to_rgb(hex_color):
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            
        fg_rgb = hex_to_rgb(foreground_color)
        bg_rgb = hex_to_rgb(background_color)
        
        print(f"[QR GENERATOR] RGB Colors: fg={fg_rgb}, bg={bg_rgb}")
        
        # Create color mask for proper coloring with Module Drawers
        color_mask = SolidFillColorMask(back_color=bg_rgb, front_color=fg_rgb)
        
        # Generate styled QR code using StyledPilImage, Module Drawers and ColorMask
        if corner_color_value != foreground_color:
            print(f"[QR GENERATOR] Note: Corner-specific coloring not fully supported with Module Drawers")
            print(f"[QR GENERATOR] Using foreground color for all modules")
            
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=module_drawer,
            eye_drawer=eye_drawer,
            color_mask=color_mask
        )
        
        print(f"[QR GENERATOR] QR code generated using Module Drawers")

        # Resize to requested size
        if img.size[0] != size:
            img = img.resize((size, size), Image.LANCZOS)

        # Serve the image
        stream = io.BytesIO()
        img.save(stream, format="PNG")
        stream.seek(0)

        return Response(
            content=stream.read(),
            media_type="image/png"
        )
