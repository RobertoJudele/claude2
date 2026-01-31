from pydantic import BaseModel, Field
from typing import List

class CheckoutItem(BaseModel):
    sku: str
    quantity: int = Field(ge=1, le=99)

class CreateCheckoutSessionRequest(BaseModel):
    items: List[CheckoutItem]
