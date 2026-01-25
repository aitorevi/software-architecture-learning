export interface CreateOrderItemDTO {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderDTO {
  customerId: string;
  items: CreateOrderItemDTO[];
}

export interface OrderResponseDTO {
  id: string;
  customerId: string;
  items: CreateOrderItemDTO[];
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}
