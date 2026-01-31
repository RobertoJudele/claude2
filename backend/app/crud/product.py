from sqlalchemy.orm import Session
from app.models.product import Product

def get_active_products_by_skus(db: Session, skus: list[str]) -> list[Product]:
    if not skus:
        return []
    return (
        db.query(Product)
        .filter(Product.sku.in_(skus), Product.is_active == True)  # noqa: E712
        .all()
    )
