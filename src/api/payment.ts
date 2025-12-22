import api from './axios'
import {
  InitiateContentPurchaseRequest,
  InitiateContentPurchaseResponse,
} from '../types/payment'

/**
 * Initiates a direct Flutterwave checkout for a given piece of content.
 * The backend responds with a hosted `paymentLink` that we can open in a new tab.
 */
export const initiateContentPurchase = async (
  payload: InitiateContentPurchaseRequest
): Promise<InitiateContentPurchaseResponse> => {
  const response = await api.post('/payments/content/purchase', {
    paymentMethod: 'flutterwave',
    ...payload,
  });
  return response.data?.data ?? response.data;
}

export const paymentAPI = {
  initiateContentPurchase,
}
