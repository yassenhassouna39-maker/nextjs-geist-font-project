'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { login, signup } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      onAuthSuccess();
    } else {
      setError(result.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signup(signupName, signupEmail, signupPassword);
    
    if (result.success) {
      onAuthSuccess();
    } else {
      setError(result.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
  };

  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <section className="fullcenter">
      <div className="auth-card panel pad">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
            disabled={isLoading}
          >
            تسجيل الدخول
          </button>
          <button 
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
            disabled={isLoading}
          >
            حساب جديد
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ 
            color: 'var(--bad)', 
            padding: '8px', 
            marginBottom: '16px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="example@email.com"
              required
              disabled={isLoading}
            />
            <label>
              كلمة المرور <span className="muted">(اختياري الآن)</span>
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn primary full"
              disabled={isLoading || !loginEmail.trim()}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'دخول'}
            </button>
          </form>
        )}

        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="auth-form">
            <label>الاسم</label>
            <input
              type="text"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              placeholder="اسمك"
              required
              disabled={isLoading}
            />
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="example@email.com"
              required
              disabled={isLoading}
            />
            <label>
              كلمة المرور <span className="muted">(اختياري الآن)</span>
            </label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn primary full"
              disabled={isLoading || !signupName.trim() || !signupEmail.trim()}
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
