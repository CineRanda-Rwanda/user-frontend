// Shared payment types pulled from the backend collection

export type PaymentMethod = 'flutterwave' | 'card' | 'wallet'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Transaction {
  _id: string
  userId: string
  contentId?: string
  transactionType: 'content' | 'season' | 'episode' | 'wallet'
  paymentMethod: PaymentMethod
  amount: number
  currency: string
  status: TransactionStatus
  transactionRef?: string
  paymentProvider?: string
  providerReference?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type PurchaseScope = 'content' | 'season' | 'episode'

export interface InitiateContentPurchaseRequest {
  contentId: string
  paymentMethod?: PaymentMethod
  scope?: PurchaseScope
  seasonId?: string
  episodeId?: string
  seasonNumber?: number
  episodeNumber?: number
}

export interface InitiateContentPurchaseResponse {
  paymentLink: string
  transactionRef: string
  amount: number
  currency: string
  discount?: number
  status?: string
}

export interface PaymentStatusResponse {
  transactionRef: string
  status: TransactionStatus
  message?: string
}

export interface CoinPurchaseRequest {
  amount: number
  email: string
  phoneNumber: string
}
