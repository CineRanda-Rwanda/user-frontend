import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Wallet from '../Wallet';

const walletApi = vi.hoisted(() => ({
  getWalletBalance: vi.fn(),
  getWalletTransactions: vi.fn(),
  topUpWallet: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock('../../components/layout/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('../../components/common/Loader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock('../../api/wallet', () => walletApi);
vi.mock('react-toastify', () => ({ toast: toastMocks }));

const sampleBalance = {
  balance: 7500,
  bonusBalance: 500,
  totalBalance: 8000,
};

const sampleTransactions = [
  {
    _id: 'txn-1',
    amount: 1500,
    type: 'credit',
    description: 'Top up',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

const renderWallet = async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>,
    );
  });

  await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
};

describe('Wallet page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    walletApi.getWalletBalance.mockResolvedValue(sampleBalance);
    walletApi.getWalletTransactions.mockResolvedValue(sampleTransactions);
    walletApi.topUpWallet.mockResolvedValue({ paymentLink: 'https://example.com' });
  });

  it('renders wallet stats after data is fetched', async () => {
    await renderWallet();

    expect(walletApi.getWalletBalance).toHaveBeenCalled();
    expect(walletApi.getWalletTransactions).toHaveBeenCalled();
    expect(screen.getByText(/Available Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Bonus Vault/i)).toBeInTheDocument();
  });

  it('fills the amount input when a quick amount is clicked', async () => {
    const user = userEvent.setup();
    await renderWallet();

    const quickButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('2,000'));

    expect(quickButton).toBeDefined();
    if (quickButton) {
      await act(async () => {
        await user.click(quickButton);
      });
    }

    const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement;
    await waitFor(() => expect(input.value).toBe('2000'));
  });

  it('blocks top ups below the minimum threshold', async () => {
    const user = userEvent.setup();
    await renderWallet();

    const input = screen.getByPlaceholderText('Enter amount');
    await act(async () => {
      await user.clear(input);
      await user.type(input, '500');
    });

    const submit = screen.getByRole('button', { name: /Top Up Wallet/i });
    await act(async () => {
      await user.click(submit);
    });

    await waitFor(() =>
      expect(toastMocks.error).toHaveBeenCalledWith('Enter at least FRW 1,000 to top up.'),
    );
    expect(walletApi.topUpWallet).not.toHaveBeenCalled();
  });

  it('initiates the top up flow when the amount is valid', async () => {
    const user = userEvent.setup();
    const originalLocation = window.location;
    const replaceMock = vi.fn();

    // jsdom makes window.location methods non-configurable, so we replace the whole location object.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = { ...originalLocation, replace: replaceMock };

    await renderWallet();

    const input = screen.getByPlaceholderText('Enter amount');
    await act(async () => {
      await user.clear(input);
      await user.type(input, '5000');
    });

    const submit = screen.getByRole('button', { name: /Top Up Wallet/i });
    await act(async () => {
      await user.click(submit);
    });

    await waitFor(() => expect(walletApi.topUpWallet).toHaveBeenCalledWith(5000));
    await waitFor(() => expect(submit).toHaveTextContent('Top Up Wallet'));
    expect(toastMocks.success).toHaveBeenCalledWith('Redirecting you to Flutterwave...');

    expect(replaceMock).toHaveBeenCalledWith('https://example.com');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = originalLocation;
  });
});
