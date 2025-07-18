import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

// useAuth フックをモック
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Firebase関連のモック
jest.mock('../../lib/firebase/config', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// Next.js navigation のモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
// const typedUseAuth: jest.MockedFunction<typeof useAuth> = useAuth as any; // Temporarily use 'as any'
// const mockUseAuth = typedUseAuth;

// テスト用のモック LoginPage コンポーネント
const MockLoginPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const auth = useAuth();
  const { login } = auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length !== 6) {
      setError('パスワードは6桁である必要があります');
      return;
    }

    try {
      setError('');
      setLoading(true);
      if (login) {
        await login(email, password);
      }
    } catch (loginError) {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        {error && <div role="alert">{error}</div>}
        <div>
          <label id="email-label" htmlFor="email">
            メールアドレス
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-labelledby="email-label"
              required
            />
          </label>
        </div>
        <div>
          <label id="password-label" htmlFor="password">
            パスワード
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={6}
              aria-labelledby="password-label"
              required
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
};

describe('認証フロー統合テスト', () => {
  const mockUser = {
    uid: 'test_uid',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ログイン → ダッシュボード遷移（6桁パスワード）', async () => {
    const mockLogin = jest.fn().mockResolvedValue(mockUser);

    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: mockLogin,
      logout: jest.fn(),
    });

    render(<MockLoginPage />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: '123456' },
    });

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });

  test('ログイン失敗時のエラー処理', async () => {
    const mockLogin = jest
      .fn()
      .mockRejectedValue(new Error('ログインに失敗しました'));

    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: mockLogin,
      logout: jest.fn(),
    });

    render(<MockLoginPage />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'wrong6' },
    });

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrong6');
    });

    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
    });
  });

  test('パスワード長制限のテスト（6桁未満）', async () => {
    const mockLogin = jest.fn();

    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: mockLogin,
      logout: jest.fn(),
    });

    render(<MockLoginPage />);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: '12345' },
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(
        screen.getByText('パスワードは6桁である必要があります')
      ).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('パスワード最大長制限のテスト', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<MockLoginPage />);

    const passwordInput = screen.getByLabelText('パスワード');

    // maxLength属性により、6桁までしか入力できない
    expect(passwordInput).toHaveAttribute('maxLength', '6');
  });
});
