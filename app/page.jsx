'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, ValidationError } from '@formspree/react';
import Announcement from "./components/Announcement";

function PlusIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6l1-2h6l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.5-2-3.5-2.3.5a8.02 8.02 0 0 0-1.7-1l-.4-2.3h-4l-.4 2.3a8.02 8.02 0 0 0-1.7 1l-2.3-.5-2 3.5 2 1.5a7.97 7.97 0 0 0 .1 2l-2 1.5 2 3.5 2.3-.5a8.02 8.02 0 0 0 1.7 1l.4 2.3h4l.4-2.3a8.02 8.02 0 0 0 1.7-1l2.3.5 2-3.5-2-1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0 1 12.5-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 5h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-12.5 6.9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 19H5v-3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TrophyIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M8 21h8M12 17v4M7 4h10c0 5-1 9-5 9s-5-4-5-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 4v5c0 3 2 4 4 4s3-2 3-5V4M7 4V9c0 3-2 4-4 4S0 11 0 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h18M6 12h12M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ListIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled, ...props }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "var(--accent)" : "none"}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ label, value, delta }) {
  const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className={`value ${dir}`}>{value}</span>
    </div>
  );
}

function FeedbackModal({ onClose }) {
  const [state, handleSubmit] = useForm("xdadgvjd");

  const onSubmit = (e) => {
    const form = e?.target;
    const nicknameInput = form?.elements?.namedItem?.('nickname');
    if (nicknameInput && typeof nicknameInput.value === 'string') {
      const v = nicknameInput.value.trim();
      if (!v) nicknameInput.value = '匿名';
    }
    return handleSubmit(e);
  };

  return (
    <motion.div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="意见反馈"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass card modal feedback-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsIcon width="20" height="20" />
            <span>意见反馈</span>
          </div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
            <CloseIcon width="20" height="20" />
          </button>
        </div>

        {state.succeeded ? (
          <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: 16 }}>🎉</div>
            <h3 style={{ marginBottom: 8 }}>感谢您的反馈！</h3>
            <p className="muted">我们已收到您的建议，会尽快查看。</p>
            <button className="button" onClick={onClose} style={{ marginTop: 24, width: '100%' }}>
              关闭
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="feedback-form">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label htmlFor="nickname" className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>
                您的昵称（可选）
              </label>
              <input
                id="nickname"
                type="text"
                name="nickname"
                className="input"
                placeholder="匿名"
                style={{ width: '100%' }}
              />
              <ValidationError prefix="Nickname" field="nickname" errors={state.errors} className="error-text" />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="message" className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>
                反馈内容
              </label>
              <textarea
                id="message"
                name="message"
                className="input"
                required
                placeholder="请描述您遇到的问题或建议..."
                style={{ width: '100%', minHeight: '120px', padding: '12px', resize: 'vertical' }}
              />
              <ValidationError prefix="Message" field="message" errors={state.errors} className="error-text" />
            </div>

            <button className="button" type="submit" disabled={state.submitting} style={{ width: '100%' }}>
              {state.submitting ? '发送中...' : '提交反馈'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

function LeaderboardModal({ onClose, onAdd }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 修复点1：将 pn=20 改为 pn=100，获取更多数据以确保覆盖真正的头部基金
    // 修复点2：v参数使用时间戳确保不缓存
    const url = `https://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=all&rs=&gs=0&sc=zzf&st=desc&pi=1&pn=100&dx=1&v=${Date.now()}`;

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    
    // 定义回调处理
    script.onload = () => {
      if (window.rankData && window.rankData.datas) {
        try {
          const rawData = window.rankData.datas;
          
          // 修复点3：数据解析与清洗
          const parsed = rawData.map(str => {
            const parts = str.split(',');
            // parts[6] 是日增长率
            const yieldVal = parseFloat(parts[6]);
            return {
              code: parts[0],
              name: parts[1],
              date: parts[3],
              yield: parts[6], // 保留原始字符串用于显示
              yieldNum: isNaN(yieldVal) ? -9999 : yieldVal // 用于排序的数字
            };
          });

          // 修复点4：前端强制按涨幅降序排序 (解决乱序问题)
          parsed.sort((a, b) => b.yieldNum - a.yieldNum);

          // 修复点5：只取前20名展示
          setList(parsed.slice(0, 20));
          setLoading(false);
        } catch (e) {
          console.error(e);
          setError('数据解析异常');
          setLoading(false);
        }
      } else {
        setError('未获取到排名数据');
        setLoading(false);
      }
      // 清理全局变量
      window.rankData = undefined;
      if (document.body.contains(script)) document.body.removeChild(script);
    };

    script.onerror = () => {
      setError('加载排名数据失败');
      setLoading(false);
      if (document.body.contains(script)) document.body.removeChild(script);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass card modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="title" style={{ marginBottom: 16, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrophyIcon width="20" height="20" style={{ color: '#f59e0b' }} />
            <span>基金排行榜</span>
            <span className="badge">日涨幅 Top 20</span>
          </div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
            <CloseIcon width="20" height="20" />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
            <div className="search-spinner" style={{ position: 'relative', width: 24, height: 24, borderColor: 'var(--muted)', borderTopColor: 'var(--primary)' }} />
          </div>
        ) : error ? (
          <div className="error-text" style={{ textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div className="list" style={{ gridTemplateColumns: '1fr', maxHeight: '60vh', overflowY: 'auto', gap: 0 }}>
            {list.map((item, idx) => (
              <div 
                key={item.code} 
                className="item" 
                style={{ 
                  borderRadius: 0, 
                  border: 'none', 
                  borderBottom: '1px solid var(--border)', 
                  padding: '12px 4px',
                  background: 'transparent',
                  boxShadow: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: idx < 3 ? 'var(--primary)' : 'var(--border)', 
                    color: idx < 3 ? '#fff' : 'var(--muted)', 
                    borderRadius: '6px', 
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="name" style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{item.code} | {item.date}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* 使用 yieldNum 判断颜色，但在界面上显示原始 yield 字符串 */}
                  <span className={`weight ${item.yieldNum > 0 ? 'up' : item.yieldNum < 0 ? 'down' : ''}`} style={{ fontSize: 14, fontWeight: 700 }}>
                     {item.yieldNum > 0 ? '+' : ''}{item.yield}%
                  </span>
                  <button 
                    className="icon-button" 
                    style={{ width: 32, height: 32 }} 
                    onClick={() => onAdd(item.code)}
                    title="添加"
                  >
                    <PlusIcon width="16" height="16" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function EditAmountModal({ fund, onClose, onSave }) {
  const [amount, setAmount] = useState(fund.amount || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fund.code, amount);
  };

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass card modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="title" style={{ marginBottom: 16 }}>
          <EditIcon width="20" height="20" />
          <span>设置持有金额</span>
        </div>
        
        <div className="muted" style={{ marginBottom: 16, fontSize: '14px' }}>
          {fund.name} (<span style={{ fontFamily: 'monospace' }}>{fund.code}</span>)
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>
              持有金额 (元)
            </label>
            <input
              autoFocus
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%' }}
            />
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="button" style={{ background: 'transparent', color: 'var(--muted)', boxShadow: 'none' }} onClick={onClose}>取消</button>
            <button type="submit" className="button">保存</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function AddResultModal({ failures, onClose }) {
  return (
    <motion.div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="添加结果"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass card modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsIcon width="20" height="20" />
            <span>部分基金添加失败</span>
          </div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
            <CloseIcon width="20" height="20" />
          </button>
        </div>
        <div className="muted" style={{ marginBottom: 12, fontSize: '14px' }}>
          未获取到估值数据的基金如下：
        </div>
        <div className="list">
          {failures.map((it, idx) => (
            <div className="item" key={idx}>
              <span className="name">{it.name || '未知名称'}</span>
              <div className="values">
                <span className="badge">#{it.code}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="button" onClick={onClose}>知道了</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const refreshingRef = useRef(false);

  // 刷新频率状态
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);

  // 全局刷新状态
  const [refreshing, setRefreshing] = useState(false);

  // 展开的代码 (默认折叠)
  const [expandedCodes, setExpandedCodes] = useState(new Set());

  // 编辑金额状态
  const [editingFund, setEditingFund] = useState(null);

  // 排行榜弹窗状态
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  // 自选状态
  const [favorites, setFavorites] = useState(new Set());
  const [currentTab, setCurrentTab] = useState('all');

  // 排序状态 (默认涨跌幅)
  const [sortBy, setSortBy] = useState('yield'); 

  // 视图模式 (默认列表)
  const [viewMode, setViewMode] = useState('list');

  // 反馈弹窗状态
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackNonce, setFeedbackNonce] = useState(0);

  // 搜索相关状态
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addResultOpen, setAddResultOpen] = useState(false);
  const [addFailures, setAddFailures] = useState([]);

  // 计算总资产和总收益
  const summary = useMemo(() => {
    let totalAmount = 0;
    let totalProfit = 0;
    funds.forEach(f => {
      const amt = parseFloat(f.amount) || 0;
      if (amt > 0) {
        totalAmount += amt;
        const rate = f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0);
        totalProfit += amt * rate / 100;
      }
    });
    return { totalAmount, totalProfit };
  }, [funds]);

// --- 新增代码开始：多标签页自动同步 ---
useEffect(() => {
  const handleStorageChange = (e) => {
    // 监听 funds 的变化
    if (e.key === 'funds') {
      try {
        const newFunds = e.newValue ? JSON.parse(e.newValue) : [];
        setFunds(newFunds);
      } catch (err) {
        console.error('同步多标签页数据失败', err);
      }
    }
    // 监听 favorites 的变化（如果需要同步自选状态）
    if (e.key === 'favorites') {
      try {
        const newFavs = e.newValue ? new Set(JSON.parse(e.newValue)) : new Set();
        setFavorites(newFavs);
      } catch (err) {
        console.error('同步多标签页自选失败', err);
      }
    }
    // 监听 expandedCodes 的变化（同步展开状态）
    if (e.key === 'expandedCodes') {
      try {
        const newExpanded = e.newValue ? new Set(JSON.parse(e.newValue)) : new Set();
        setExpandedCodes(newExpanded);
      } catch (err) {
        console.error('同步展开状态失败', err);
      }
    }
  };

  // 监听页面可见性变化（当你切回这个标签页时，强制重新读取一次最新数据）
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const saved = JSON.parse(localStorage.getItem('funds') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
         // 这里做一个简单的去重对比，避免不必要的重渲染
         setFunds(prev => {
           const prevJson = JSON.stringify(prev);
           const newJson = JSON.stringify(saved);
           return prevJson === newJson ? prev : saved;
         });
      }
      
      // 同步自选
      const savedFav = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(new Set(savedFav));
    }
  };

  window.addEventListener('storage', handleStorageChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []); // 空依赖数组，只在组件挂载时执行一次

  const toggleFavorite = (code) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      localStorage.setItem('favorites', JSON.stringify(Array.from(next)));
      if (next.size === 0) setCurrentTab('all');
      return next;
    });
  };

  const toggleExpand = (code) => {
    setExpandedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      localStorage.setItem('expandedCodes', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const dedupeByCode = (list) => {
    const seen = new Set();
    return list.filter((f) => {
      const c = f?.code;
      if (!c || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('funds') || '[]');
      if (Array.isArray(saved) && saved.length) {
        const deduped = dedupeByCode(saved);
        setFunds(deduped);
        localStorage.setItem('funds', JSON.stringify(deduped));
        const codes = Array.from(new Set(deduped.map((f) => f.code)));
        if (codes.length) refreshAll(codes);
      }
      const savedMs = parseInt(localStorage.getItem('refreshMs') || '30000', 10);
      if (Number.isFinite(savedMs) && savedMs >= 5000) {
        setRefreshMs(savedMs);
        setTempSeconds(Math.round(savedMs / 1000));
      }
      const savedExpanded = JSON.parse(localStorage.getItem('expandedCodes') || '[]');
      if (Array.isArray(savedExpanded)) {
        setExpandedCodes(new Set(savedExpanded));
      }
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (Array.isArray(savedFavorites)) {
        setFavorites(new Set(savedFavorites));
      }
      const savedViewMode = localStorage.getItem('viewMode');
      if (savedViewMode === 'card' || savedViewMode === 'list') {
        setViewMode(savedViewMode);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const codes = Array.from(new Set(funds.map((f) => f.code)));
      if (codes.length) refreshAll(codes);
    }, refreshMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [funds, refreshMs]);

  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        document.body.removeChild(script);
        resolve();
      };
      script.onerror = () => {
        document.body.removeChild(script);
        reject(new Error('数据加载失败'));
      };
      document.body.appendChild(script);
    });
  };

  const fetchFundData = async (c) => {
    return new Promise(async (resolve, reject) => {
      const getTencentPrefix = (code) => {
        if (code.startsWith('6') || code.startsWith('9')) return 'sh';
        if (code.startsWith('0') || code.startsWith('3')) return 'sz';
        if (code.startsWith('4') || code.startsWith('8')) return 'bj';
        return 'sz';
      };

      const gzUrl = `https://fundgz.1234567.com.cn/js/${c}.js?rt=${Date.now()}`;
      const scriptGz = document.createElement('script');
      scriptGz.src = gzUrl;

      const originalJsonpgz = window.jsonpgz;
      window.jsonpgz = (json) => {
        window.jsonpgz = originalJsonpgz;
        if (!json || typeof json !== 'object') {
          reject(new Error('未获取到基金估值数据'));
          return;
        }
        const gszzlNum = Number(json.gszzl);
        const gzData = {
          code: json.fundcode,
          name: json.name,
          dwjz: json.dwjz,
          gsz: json.gsz,
          gztime: json.gztime,
          gszzl: Number.isFinite(gszzlNum) ? gszzlNum : json.gszzl
        };

        const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${c}&topline=10&year=&month=&rt=${Date.now()}`;
        loadScript(holdingsUrl).then(async () => {
          let holdings = [];
          const html = window.apidata?.content || '';
          const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
          for (const r of rows) {
            const cells = (r.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi) || []).map(td => td.replace(/<[^>]*>/g, '').trim());
            const codeIdx = cells.findIndex(txt => /^\d{6}$/.test(txt));
            const weightIdx = cells.findIndex(txt => /\d+(?:\.\d+)?\s*%/.test(txt));
            if (codeIdx >= 0 && weightIdx >= 0) {
              holdings.push({
                code: cells[codeIdx],
                name: cells[codeIdx + 1] || '',
                weight: cells[weightIdx],
                change: null
              });
            }
          }

          holdings = holdings.slice(0, 10);

          if (holdings.length) {
            try {
              const tencentCodes = holdings.map(h => `s_${getTencentPrefix(h.code)}${h.code}`).join(',');
              const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;

              await new Promise((resQuote) => {
                const scriptQuote = document.createElement('script');
                scriptQuote.src = quoteUrl;
                scriptQuote.onload = () => {
                  holdings.forEach(h => {
                    const varName = `v_s_${getTencentPrefix(h.code)}${h.code}`;
                    const dataStr = window[varName];
                    if (dataStr) {
                      const parts = dataStr.split('~');
                      if (parts.length > 5) {
                        h.change = parseFloat(parts[5]);
                      }
                    }
                  });
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                scriptQuote.onerror = () => {
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                document.body.appendChild(scriptQuote);
              });
            } catch (e) {
              console.error('获取股票涨跌幅失败', e);
            }
          }

          resolve({ ...gzData, holdings });
        }).catch(() => resolve({ ...gzData, holdings: [] }));
      };

      scriptGz.onerror = () => {
        window.jsonpgz = originalJsonpgz;
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
        reject(new Error('基金数据加载失败'));
      };

      document.body.appendChild(scriptGz);
      setTimeout(() => {
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
      }, 5000);
    });
  };

  const performSearch = async (val) => {
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const callbackName = `SuggestData_${Date.now()}`;
    const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(val)}&callback=${callbackName}&_=${Date.now()}`;
    
    try {
      await new Promise((resolve, reject) => {
        window[callbackName] = (data) => {
          if (data && data.Datas) {
            const fundsOnly = data.Datas.filter(d => 
              d.CATEGORY === 700 || 
              d.CATEGORY === "700" || 
              d.CATEGORYDESC === "基金"
            );
            setSearchResults(fundsOnly);
          }
          delete window[callbackName];
          resolve();
        };

        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
          if (document.body.contains(script)) document.body.removeChild(script);
        };
        script.onerror = () => {
          if (document.body.contains(script)) document.body.removeChild(script);
          delete window[callbackName];
          reject(new Error('搜索请求失败'));
        };
        document.body.appendChild(script);
      });
    } catch (e) {
      console.error('搜索失败', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(val), 300);
  };

  const toggleSelectFund = (fund) => {
    setSelectedFunds(prev => {
      const exists = prev.find(f => f.CODE === fund.CODE);
      if (exists) {
        return prev.filter(f => f.CODE !== fund.CODE);
      }
      return [...prev, fund];
    });
  };

  const executeAddFunds = async (codes) => {
    if (!codes.length) return;
    setLoading(true);
    setError('');
    
    try {
      const newFunds = [];
      const failures = [];
      
      for (const c of codes) {
        // 如果已存在则保留金额并更新
        const existing = funds.find(f => f.code === c);
        
        try {
          const data = await fetchFundData(c);
          if (existing?.amount) {
            data.amount = existing.amount;
          }
          newFunds.push(data);
        } catch (e) {
          console.error(`添加基金 ${c} 失败`, e);
          failures.push({ code: c });
        }
      }
      
      if (newFunds.length > 0) {
        // 使用新获取的数据覆盖或添加到列表中
        const updated = [...newFunds];
        // 保留原列表中没被更新的
        funds.forEach(f => {
          if (!updated.some(u => u.code === f.code)) {
            updated.push(f);
          }
        });
        const deduped = dedupeByCode(updated);
        setFunds(deduped);
        localStorage.setItem('funds', JSON.stringify(deduped));
      }
      
      if (failures.length > 0) {
        setAddFailures(failures);
        setAddResultOpen(true);
      }
    } catch (e) {
      setError('批量添加失败');
    } finally {
      setLoading(false);
    }
  };

  const addFund = async (e) => {
    e?.preventDefault?.();
    setError('');
    const manualTokens = String(searchTerm || '')
      .split(/[^0-9A-Za-z]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const selectedCodes = Array.from(new Set([
      ...selectedFunds.map(f => f.CODE),
      ...manualTokens.filter(t => /^\d{6}$/.test(t))
    ]));
    
    if (selectedCodes.length === 0) {
      setError('请输入或选择基金代码');
      return;
    }
    
    await executeAddFunds(selectedCodes);
    setSearchTerm('');
    setSelectedFunds([]);
    setShowDropdown(false);
  };

  const handleAddFromLeaderboard = (code) => {
    executeAddFunds([code]);
  };

  const handleSaveAmount = (code, amount) => {
    const next = funds.map(f => {
      if (f.code === code) {
        return { ...f, amount: amount };
      }
      return f;
    });
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));
    setEditingFund(null);
  };

  const removeFund = (removeCode) => {
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));

    setExpandedCodes(prev => {
      if (!prev.has(removeCode)) return prev;
      const nextSet = new Set(prev);
      nextSet.delete(removeCode);
      localStorage.setItem('expandedCodes', JSON.stringify(Array.from(nextSet)));
      return nextSet;
    });

    setFavorites(prev => {
      if (!prev.has(removeCode)) return prev;
      const nextSet = new Set(prev);
      nextSet.delete(removeCode);
      localStorage.setItem('favorites', JSON.stringify(Array.from(nextSet)));
      if (nextSet.size === 0) setCurrentTab('all');
      return nextSet;
    });
  };

  const refreshAll = async (codes) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    const uniqueCodes = Array.from(new Set(codes));
    try {
      const updated = [];
      for (const c of uniqueCodes) {
        try {
          const data = await fetchFundData(c);
          // 关键：保留原有的持有金额
          const old = funds.find((f) => f.code === c);
          if (old?.amount) {
            data.amount = old.amount;
          }
          updated.push(data);
        } catch (e) {
          console.error(`刷新基金 ${c} 失败`, e);
          const old = funds.find((f) => f.code === c);
          if (old) updated.push(old);
        }
      }
      const deduped = dedupeByCode(updated);
      if (deduped.length) {
        setFunds(deduped);
        localStorage.setItem('funds', JSON.stringify(deduped));
      }
    } catch (e) {
      console.error(e);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  const manualRefresh = async () => {
    if (refreshingRef.current) return;
    const codes = Array.from(new Set(funds.map((f) => f.code)));
    if (!codes.length) return;
    await refreshAll(codes);
  };

  const saveSettings = (e) => {
    e?.preventDefault?.();
    const ms = Math.max(5, Number(tempSeconds)) * 1000;
    setRefreshMs(ms);
    localStorage.setItem('refreshMs', String(ms));
    setSettingsOpen(false);
  };

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === 'Escape' && settingsOpen) setSettingsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen]);

  return (
    <div className="container content">
      <Announcement />
      <div className="navbar glass">
        {refreshing && <div className="loading-bar"></div>}
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
            <path d="M5 14c2-4 7-6 14-5" stroke="var(--primary)" strokeWidth="2" />
          </svg>
          <span>实时基金估值</span>
        </div>
        <div className="actions">
          <div className="badge" title="当前刷新频率">
            <span>刷新</span>
            <strong>{Math.round(refreshMs / 1000)}秒</strong>
          </div>
          <button
            className="icon-button"
            aria-label="排行榜"
            onClick={() => setLeaderboardOpen(true)}
            title="基金排行榜"
          >
            <TrophyIcon width="18" height="18" />
          </button>
          <button
            className="icon-button"
            aria-label="立即刷新"
            onClick={manualRefresh}
            disabled={refreshing || funds.length === 0}
            aria-busy={refreshing}
            title="立即刷新"
          >
            <RefreshIcon className={refreshing ? 'spin' : ''} width="18" height="18" />
          </button>
          <button
            className="icon-button"
            aria-label="打开设置"
            onClick={() => setSettingsOpen(true)}
            title="设置"
          >
            <SettingsIcon width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 glass card add-fund-section" role="region" aria-label="添加基金">
          <div className="title" style={{ marginBottom: 12 }}>
            <PlusIcon width="20" height="20" />
            <span>添加基金</span>
            <span className="muted">搜索并选择基金（支持名称或代码）</span>
          </div>
          
          <div className="search-container" ref={dropdownRef}>
            <form className="form" onSubmit={addFund}>
              <div className="search-input-wrapper" style={{ flex: 1, gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedFunds.length > 0 && (
                  <div className="selected-inline-chips">
                    {selectedFunds.map(fund => (
                      <div key={fund.CODE} className="fund-chip">
                        <span>{fund.NAME}</span>
                        <button onClick={() => toggleSelectFund(fund)} className="remove-chip">
                          <CloseIcon width="14" height="14" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  className="input"
                  placeholder="搜索基金名称或代码..."
                  value={searchTerm}
                  onChange={handleSearchInput}
                  onFocus={() => setShowDropdown(true)}
                />
                {isSearching && <div className="search-spinner" />}
              </div>
              <button className="button" type="submit" disabled={loading}>
                {loading ? '添加中…' : '添加'}
              </button>
            </form>

            <AnimatePresence>
              {showDropdown && (searchTerm.trim() || searchResults.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="search-dropdown glass"
                >
                  {searchResults.length > 0 ? (
                    <div className="search-results">
                      {searchResults.map((fund) => {
                        const isSelected = selectedFunds.some(f => f.CODE === fund.CODE);
                        const isAlreadyAdded = funds.some(f => f.code === fund.CODE);
                        return (
                          <div
                            key={fund.CODE}
                            className={`search-item ${isSelected ? 'selected' : ''} ${isAlreadyAdded ? 'added' : ''}`}
                            onClick={() => {
                              if (isAlreadyAdded) return;
                              toggleSelectFund(fund);
                            }}
                          >
                            <div className="fund-info">
                              <span className="fund-name">{fund.NAME}</span>
                              <span className="fund-code muted">#{fund.CODE} | {fund.TYPE}</span>
                            </div>
                            {isAlreadyAdded ? (
                              <span className="added-label">已添加</span>
                            ) : (
                              <div className="checkbox">
                                {isSelected && <div className="checked-mark" />}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : searchTerm.trim() && !isSearching ? (
                    <div className="no-results muted">未找到相关基金</div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {error && <div className="muted" style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</div>}
        </div>

        {funds.length > 0 && (
          <div className="col-12 glass card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="muted" style={{ fontSize: '12px' }}>总持有金额</span>
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>{summary.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ width: 1, height: 32, background: 'var(--border)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="muted" style={{ fontSize: '12px' }}>今日预估收益</span>
                  <span className={summary.totalProfit > 0 ? 'up' : summary.totalProfit < 0 ? 'down' : ''} style={{ fontSize: '20px', fontWeight: 700 }}>
                    {summary.totalProfit > 0 ? '+' : ''}{summary.totalProfit.toFixed(2)}
                  </span>
                </div>
             </div>
          </div>
        )}

        <div className="col-12">
          {funds.length > 0 && (
            <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              {favorites.size > 0 ? (
                <div className="tabs">
                  <button
                    className={`tab ${currentTab === 'all' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('all')}
                  >
                    全部 ({funds.length})
                  </button>
                  <button
                    className={`tab ${currentTab === 'fav' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('fav')}
                  >
                    自选 ({favorites.size})
                  </button>
                </div>
              ) : <div />}

              <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="view-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' }}>
                  <button
                    className={`icon-button ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => { setViewMode('card'); localStorage.setItem('viewMode', 'card'); }}
                    style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'card' ? 'var(--primary)' : 'transparent', color: viewMode === 'card' ? '#05263b' : 'var(--muted)' }}
                    title="卡片视图"
                  >
                    <GridIcon width="16" height="16" />
                  </button>
                  <button
                      className={`icon-button ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => { setViewMode('list'); localStorage.setItem('viewMode', 'list'); }}
                      style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? '#05263b' : 'var(--muted)' }}
                      title="表格视图"
                    >
                      <ListIcon width="16" height="16" />
                    </button>
                </div>

                <div className="divider" style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

                <div className="sort-items" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SortIcon width="14" height="14" />
                    排序
                  </span>
                  <div className="chips">
                    {[
                      { id: 'default', label: '默认' },
                      { id: 'yield', label: '涨跌幅' },
                      { id: 'name', label: '名称' },
                      { id: 'code', label: '代码' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        className={`chip ${sortBy === s.id ? 'active' : ''}`}
                        onClick={() => setSortBy(s.id)}
                        style={{ height: '28px', fontSize: '12px', padding: '0 10px' }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {funds.length === 0 ? (
            <div className="glass card empty">尚未添加基金</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={viewMode === 'card' ? 'grid' : 'table-container glass'}
              >
                <div className={viewMode === 'card' ? 'grid col-12' : ''} style={viewMode === 'card' ? { gridColumn: 'span 12', gap: 16 } : {}}>
                  <AnimatePresence mode="popLayout">
                    {funds
                      .filter(f => currentTab === 'all' || favorites.has(f.code))
                      .sort((a, b) => {
                        if (sortBy === 'yield') {
                          const valA = typeof a.estGszzl === 'number' ? a.estGszzl : (Number(a.gszzl) || 0);
                          const valB = typeof b.estGszzl === 'number' ? b.estGszzl : (Number(b.gszzl) || 0);
                          return valB - valA;
                        }
                        if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN');
                        if (sortBy === 'code') return a.code.localeCompare(b.code);
                        return 0; // default order
                      })
                      .map((f) => {
                        // 计算单只基金的预估收益
                        const amount = parseFloat(f.amount) || 0;
                        const rate = f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0);
                        const profit = amount * rate / 100;

                        return (
                          <motion.div
                            layout="position"
                            key={f.code}
                            className={viewMode === 'card' ? 'col-6' : 'table-row-wrapper'}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                          <div className={viewMode === 'card' ? 'glass card' : 'table-row'} style={viewMode === 'list' ? { gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 1.5fr 60px' } : {}}>
                            {viewMode === 'list' ? (
                              <>
                                <div className="table-cell name-cell" style={{ minWidth: 0 }}> {/* minWidth:0 确保在flex/grid中能正确压缩 */}
  <button
    className={`icon-button fav-button ${favorites.has(f.code) ? 'active' : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      toggleFavorite(f.code);
    }}
    title={favorites.has(f.code) ? "取消自选" : "添加自选"}
  >
    <StarIcon width="18" height="18" filled={favorites.has(f.code)} />
  </button>
  
  <div className="title-text" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
    <span 
      className="name-text" 
      title={f.name} // 鼠标悬停显示全名
      style={{
        fontWeight: 600,
        whiteSpace: 'nowrap',      // 1. 禁止换行
        overflow: 'hidden',        // 2. 超出隐藏
        textOverflow: 'ellipsis',  // 3. 超出显示省略号
        // 4. 动态字号逻辑：字数>18用12px，>12用13px，否则默认
        fontSize: f.name.length > 18 ? '12px' : f.name.length > 12 ? '13px' : '15px',
        lineHeight: '1.5'
      }}
    >
      {f.name}
    </span>
    <span className="muted code-text" style={{ fontSize: '12px' }}>#{f.code}</span>
  </div>
</div>
                                <div className="table-cell text-right value-cell">
                                  <span style={{ fontWeight: 700 }}>{f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—')}</span>
                                </div>
                                <div className="table-cell text-right change-cell">
                                  <span className={f.estPricedCoverage > 0.05 ? (f.estGszzl > 0 ? 'up' : f.estGszzl < 0 ? 'down' : '') : (Number(f.gszzl) > 0 ? 'up' : Number(f.gszzl) < 0 ? 'down' : '')} style={{ fontWeight: 700 }}>
                                    {f.estPricedCoverage > 0.05 ? `${f.estGszzl > 0 ? '+' : ''}${f.estGszzl.toFixed(2)}%` : (typeof f.gszzl === 'number' ? `${f.gszzl > 0 ? '+' : ''}${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—')}
                                  </span>
                                </div>
                                {/* 新增：持有/收益列 */}
                                <div className="table-cell text-right" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => setEditingFund(f)} title="点击修改持有金额">
                                    <span style={{ fontSize: 13 }}>{amount > 0 ? amount.toFixed(0) : '--'}</span>
                                    <EditIcon width="12" height="12" style={{ color: 'var(--muted)' }} />
                                  </div>
                                </div>
                                <div className="table-cell text-right">
                                  {amount > 0 ? (
                                    <span className={profit > 0 ? 'up' : profit < 0 ? 'down' : ''} style={{ fontWeight: 700 }}>
                                      {profit > 0 ? '+' : ''}{profit.toFixed(2)}
                                    </span>
                                  ) : <span className="muted">--</span>}
                                </div>
                                <div className="table-cell text-center action-cell">
                                  <button
                                    className="icon-button danger"
                                    onClick={() => removeFund(f.code)}
                                    title="删除"
                                    style={{ width: '28px', height: '28px' }}
                                  >
                                    <TrashIcon width="14" height="14" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                              <div className="row" style={{ marginBottom: 10 }}>
                                <div className="title">
                                  <button
                                    className={`icon-button fav-button ${favorites.has(f.code) ? 'active' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(f.code);
                                    }}
                                    title={favorites.has(f.code) ? "取消自选" : "添加自选"}
                                  >
                                    <StarIcon width="18" height="18" filled={favorites.has(f.code)} />
                                  </button>
                                  <div className="title-text">
                                    <span>{f.name}</span>
                                    <span className="muted">#{f.code}</span>
                                  </div>
                                </div>

                                <div className="actions">
                                  <button
                                    className="icon-button danger"
                                    onClick={() => removeFund(f.code)}
                                    title="删除"
                                  >
                                    <TrashIcon width="18" height="18" />
                                  </button>
                                </div>
                              </div>

                              <div className="row" style={{ marginBottom: 12 }}>
                                <Stat label="估值净值" value={f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—')} />
                                <Stat
                                  label="涨跌幅"
                                  value={f.estPricedCoverage > 0.05 ? `${f.estGszzl > 0 ? '+' : ''}${f.estGszzl.toFixed(2)}%` : (typeof f.gszzl === 'number' ? `${f.gszzl > 0 ? '+' : ''}${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—')}
                                  delta={f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0)}
                                />
                              </div>

                              <div className="row" style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="muted" style={{ fontSize: 11 }}>持有金额</span>
                                    <button onClick={() => setEditingFund(f)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                      <EditIcon width="12" height="12" style={{ color: 'var(--accent)' }} />
                                    </button>
                                  </div>
                                  <span style={{ fontWeight: 600 }}>{amount > 0 ? amount.toFixed(2) : '--'}</span>
                                </div>
                                <div style={{ width: 1, height: 24, background: 'var(--border)' }}></div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                                  <span className="muted" style={{ fontSize: 11 }}>预估收益</span>
                                  <span className={profit > 0 ? 'up' : profit < 0 ? 'down' : ''} style={{ fontWeight: 700 }}>
                                    {amount > 0 ? `${profit > 0 ? '+' : ''}${profit.toFixed(2)}` : '--'}
                                  </span>
                                </div>
                              </div>

                              {f.estPricedCoverage > 0.05 && (
                                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: -8, marginBottom: 10, textAlign: 'right' }}>
                                  基于 {Math.round(f.estPricedCoverage * 100)}% 持仓估算
                                </div>
                              )}
                              <div
                                style={{ marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}
                                className="title"
                                onClick={() => toggleExpand(f.code)}
                              >
                                <div className="row" style={{ width: '100%', flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>前10重仓股票</span>
                                    <ChevronIcon
                                      width="16"
                                      height="16"
                                      className="muted"
                                      style={{
                                        transform: expandedCodes.has(f.code) ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        transition: 'transform 0.2s ease'
                                      }}
                                    />
                                  </div>
                                  <span className="muted">涨跌幅 / 占比</span>
                                </div>
                              </div>
                              <AnimatePresence>
                                {expandedCodes.has(f.code) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    style={{ overflow: 'hidden' }}
                                  >
                                    {Array.isArray(f.holdings) && f.holdings.length ? (
                                      <div className="list">
                                        {f.holdings.map((h, idx) => (
                                          <div className="item" key={idx}>
                                            <span className="name">{h.name}</span>
                                            <div className="values">
                                              {typeof h.change === 'number' && (
                                                <span className={`badge ${h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}`} style={{ marginRight: 8 }}>
                                                  {h.change > 0 ? '+' : ''}{h.change.toFixed(2)}%
                                                </span>
                                              )}
                                              <span className="weight">{h.weight}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="muted" style={{ padding: '8px 0' }}>暂无重仓数据</div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="footer">
        <p>数据源：实时估值与重仓直连东方财富，仅供个人学习及参考使用。数据可能存在延迟，不作为任何投资建议
        </p>
        <p>注：估算数据与真实结算数据会有1%左右误差</p>
        <div style={{ marginTop: 12, opacity: 0.8 }}>
          <p>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {feedbackOpen && (
          <FeedbackModal
            key={feedbackNonce}
            onClose={() => setFeedbackOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {leaderboardOpen && (
          <LeaderboardModal
            onClose={() => setLeaderboardOpen(false)}
            onAdd={handleAddFromLeaderboard}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingFund && (
          <EditAmountModal
            fund={editingFund}
            onClose={() => setEditingFund(null)}
            onSave={handleSaveAmount}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {addResultOpen && (
          <AddResultModal
            failures={addFailures}
            onClose={() => setAddResultOpen(false)}
          />
        )}
      </AnimatePresence>

      {settingsOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="设置" onClick={() => setSettingsOpen(false)}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}>
              <SettingsIcon width="20" height="20" />
              <span>设置</span>
              <span className="muted">配置刷新频率</span>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>刷新频率</div>
              <div className="chips" style={{ marginBottom: 12 }}>
                {[10, 30, 60, 120, 300].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${tempSeconds === s ? 'active' : ''}`}
                    onClick={() => setTempSeconds(s)}
                    aria-pressed={tempSeconds === s}
                  >
                    {s} 秒
                  </button>
                ))}
              </div>
              <input
                className="input"
                type="number"
                min="5"
                step="5"
                value={tempSeconds}
                onChange={(e) => setTempSeconds(Number(e.target.value))}
                placeholder="自定义秒数"
              />
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="button" onClick={saveSettings}>保存并关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
