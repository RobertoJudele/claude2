from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class Product(Base):
    __tablename__ = "Products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(64), unique=True, index=True, nullable=False)

    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)

    # cents
    unit_amount_cents = Column(Integer, nullable=False, default=0)
    currency = Column(String(3), nullable=False, default="eur")

    # Stripe (recommended)
    stripe_price_id = Column(String(255), nullable=True)
    stripe_product_id = Column(String(255), nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
