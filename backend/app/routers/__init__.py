from app.routers.recipes import router as recipes_router
from app.routers.users import router as users_router
from app.routers.inventory import router as inventory_router
from app.routers.auth import router as auth_router

__all__ = ["recipes_router", "users_router", "inventory_router", "auth_router"]
