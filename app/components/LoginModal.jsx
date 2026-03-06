'use client';

import { useState } from 'react';
import { MailIcon } from './Icons';

export default function LoginModal({
  onClose,
  loginEmail,
  setLoginEmail,
  loginPassword,       // 原来的 loginOtp 改为 loginPassword
  setLoginPassword,    // 原来的 setLoginOtp 改为 setLoginPassword
  loginLoading,
  loginError,
  handleLogin,         // 处理登录的方法
  handleSignUp         // 处理注册的方法
}) {
  // 增加一个本地状态，用于在“登录”和“注册”界面之间切换
  const [isSignUp, setIsSignUp] = useState(false);

  // 统一的表单提交处理
  const onSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      handleSignUp(e);
    } else {
      handleLogin(e);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isSignUp ? '注册' : '登录'}
      onClick={onClose}
    >
      <div className="glass card modal login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="title" style={{ marginBottom: 16 }}>
          <MailIcon width="20" height="20" />
          <span>{isSignUp ? '邮箱注册' : '邮箱登录'}</span>
          <span className="muted">
            {isSignUp ? '设置您的邮箱和密码' : '使用邮箱和密码登录'}
          </span>
        </div>

        <form onSubmit={onSubmit}>
          {/* 邮箱输入框 */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>
              邮箱
            </div>
            <input
              style={{ width: '100%' }}
              className="input"
              type="email"
              placeholder="your@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={loginLoading}
              required
            />
          </div>

          {/* 密码输入框：现在总是显示 */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>
              密码
            </div>
            <input
              style={{ width: '100%' }}
              className="input"
              type="password" // 改为密码类型，输入时会变成黑点
              placeholder={isSignUp ? '请设置至少6位密码' : '请输入密码'}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={loginLoading}
              required
            />
          </div>

          {/* 错误提示 */}
          {loginError && (
            <div className="login-message error" style={{ marginBottom: 12 }}>
              <span>{loginError}</span>
            </div>
          )}

          {/* 登录/注册切换文字 */}
          <div style={{ marginBottom: 16, fontSize: '0.8rem', textAlign: 'right' }}>
            <span
              style={{ cursor: 'pointer', color: '#0070f3', textDecoration: 'underline' }}
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
            </span>
          </div>

          {/* 底部按钮 */}
          <div className="row" style={{ justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
              disabled={loginLoading}
            >
              取消
            </button>
            <button
              className="button"
              type="submit"
              disabled={loginLoading || !loginEmail || !loginPassword}
            >
              {loginLoading ? '处理中...' : isSignUp ? '注册' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
