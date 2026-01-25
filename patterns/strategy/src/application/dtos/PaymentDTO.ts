export interface ProcessPaymentDTO {
  orderId: string;
  paymentMethod: 'creditcard' | 'paypal' | 'crypto' | 'banktransfer';
  customerEmail: string;
}

export interface PaymentResponseDTO {
  success: boolean;
  transactionId: string;
  message: string;
  processedAt: string;
  fee?: {
    amount: number;
    currency: string;
  };
  orderId: string;
  paymentMethod: string;
}
