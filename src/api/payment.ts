import api from './axios'

export interface PurchaseContentRequest {
  contentId: string;
}

export interface PurchaseEpisodeRequest {
  contentId: string;
  seasonNumber: number;
  episodeId: string;
}

export interface PurchaseSeasonRequest {
  contentId: string;
  seasonNumber: number;
}

export interface PurchaseResponse {
  message: string;
  data: {
    remainingBalance: number;
    purchase?: {
      contentId: string;
      paidAmount: number;
      paymentMethod: 'rwf' | 'coins';
      purchaseDate: string;
    };
  };
}

/**
 * Purchase movie or full series with wallet balance
 */
export const purchaseContentWithWallet = async (
  contentId: string
): Promise<PurchaseResponse> => {
  const response = await api.post('/payments/content/purchase/wallet', { contentId });
  return response.data;
};

/**
 * Purchase single episode with wallet balance
 */
export const purchaseEpisodeWithWallet = async (
  data: PurchaseEpisodeRequest
): Promise<PurchaseResponse> => {
  const response = await api.post('/payments/episode/purchase/wallet', data);
  return response.data;
};

/**
 * Purchase entire season with wallet balance
 */
export const purchaseSeasonWithWallet = async (
  data: PurchaseSeasonRequest
): Promise<PurchaseResponse> => {
  const response = await api.post('/payments/season/purchase/wallet', data);
  return response.data;
};

export const paymentAPI = {
  purchaseContent: purchaseContentWithWallet,
  purchaseEpisode: purchaseEpisodeWithWallet,
  purchaseSeason: purchaseSeasonWithWallet,
}
