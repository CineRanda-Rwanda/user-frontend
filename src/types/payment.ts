// Payment types
export interface Transaction {
  _id: string
  userId: string
  contentId?: string
  transactionType: 'PURCHASE' | 'COIN_PURCHASE' | 'REFUND'
  paymentMethod: 'FLUTTERWAVE' | 'COINS'
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentProvider?: string
  providerReference?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface InitiatePaymentRequest {
  contentId: string
  paymentMethod: 'FLUTTERWAVE' | 'COINS'
  email?: string
  phoneNumber?: string
}

export interface InitiatePaymentResponse {
  transactionId: string
  paymentUrl?: string
  reference: string
  status: string
}

export interface PaymentStatusResponse {
  transactionId: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  message?: string
}

export interface CoinPurchaseRequest {
  amount: number
  email: string
  phoneNumber: string
}
