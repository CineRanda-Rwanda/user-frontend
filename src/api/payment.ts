import api from './axios'

export interface PurchaseContentRequest {
  contentId: string;
}

export interface PurchaseEpisodeRequest {
  contentId: string;
  episodeId: string;
  seasonNumber: number;
}

export interface PurchaseSeasonRequest {
  contentId: string;
  seasonId: string;
  seasonNumber?: number;
}

export interface PurchaseResponse {
  status?: string;
  message: string;
  data?: {
    purchase?: {
      _id?: string;
      contentId?: string;
      episodeId?: string;
      contentType?: string;
      amountPaid?: number;
      currency?: string;
      purchasedAt?: string;
      seasonNumber?: number;
      episodeNumber?: number;
    };
    remainingBalance?: {
      balance: number;
      bonusBalance: number;
      totalBalance: number;
    };
    unlockedEpisodes?: string[];
  };
}

/**
 * Purchase movie or full series with wallet balance
 */
export const purchaseContentWithWallet = async (
  contentId: string
): Promise<PurchaseResponse> => {
  const response = await api.post('/payments/content/purchase/wallet', {
    contentId,
  });
  return response.data;
}

/**
 * Purchase single episode with wallet balance
 */
export const purchaseEpisodeWithWallet = async (
  data: PurchaseEpisodeRequest
): Promise<PurchaseResponse> => {
  const response = await api.post('/payments/episode/purchase/wallet', data);
  return response.data;
}

/**
 * Purchase entire season with wallet balance
 */
export const purchaseSeasonWithWallet = async (
  data: PurchaseSeasonRequest
): Promise<PurchaseResponse> => {
  const response = await api.post('/payments/season/purchase/wallet', data);
  return response.data;
}

export const paymentAPI = {
  purchaseContent: purchaseContentWithWallet,
  purchaseEpisode: purchaseEpisodeWithWallet,
  purchaseSeason: purchaseSeasonWithWallet,
}
