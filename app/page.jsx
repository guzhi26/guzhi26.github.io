'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, ValidationError } from '@formspree/react';
import Announcement from "./components/Announcement";

// --- 图标组件 ---
function PlusIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>); }
function TrashIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M8 6l1-2h6l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>); }
function EditIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function SettingsIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.5-2-3.5-2.3.5a8.02 8.02 0 0 0-1.7-1l-.4-2.3h-4l-.4 2.3a8.02 8.02 0 0 0-1.7 1l-2.3-.5-2 3.5 2 1.5a7.97 7.97 0 0 0 .1 2l-2 1.5 2 3.5 2.3-.5a8.02 8.02 0 0 0 1.7 1l.4 2.3h4l.4-2.3a8.02 8.02 0 0 0 1.7-1l2.3.5 2-3.5-2-1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function RefreshIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 12.5-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 5h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 12a8 8 0 0 1-12.5 6.9" stroke="currentColor" strokeWidth="2" /><path d="M8 19H5v-3" stroke="currentColor" strokeWidth="2" /></svg>); }
function TrophyIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M8 21h8M12 17v4M7 4h10c0 5-1 9-5 9s-5-4-5-9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 4v5c0 3 2 4 4 4s3-2 3-5V4M7 4V9c0 3-2 4-4 4S0 11 0 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>); }
function ChevronIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function SortIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M6 12h12M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>); }
function GridIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /></svg>); }
function CloseIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function ListIcon(props) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>); }
function StarIcon({ filled, ...props }) { return (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "var(--accent)" : "none"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>); }

// --- 子组件 ---
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
    <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="glass card modal feedback-modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
        <div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><SettingsIcon width="20" height="20" /><span>意见反馈</span></div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button>
        </div>
        {state.succeeded ? (
          <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: 16 }}>🎉</div>
            <h3 style={{ marginBottom: 8 }}>感谢您的反馈！</h3>
            <button className="button" onClick={onClose} style={{ marginTop: 24, width: '100%' }}>关闭</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="feedback-form">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label htmlFor="nickname" className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>昵称（可选）</label>
              <input id="nickname" type="text" name="nickname" className="input" placeholder="匿名" style={{ width: '100%' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="message" className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>反馈内容</label>
              <textarea id="message" name="message" className="input" required placeholder="请描述您遇到的问题或建议..." style={{ width: '100%', minHeight: '120px', padding: '12px', resize: 'vertical' }} />
            </div>
            <button className="button" type="submit" disabled={state.submitting} style={{ width: '100%' }}>{state.submitting ? '发送中...' : '提交反馈'}</button>
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
    const url = `https://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=all&rs=&gs=0&sc=zzf&st=desc&pi=1&pn=100&dx=1&v=${Date.now()}`;
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => {
      if (window.rankData && window.rankData.datas) {
        try {
          const rawData = window.rankData.datas;
          const parsed = rawData.map(str => {
            const parts = str.split(',');
            const yieldVal = parseFloat(parts[6]);
            return {
              code: parts[0],
              name: parts[1],
              date: parts[3],
              yield: parts[6],
              yieldNum: isNaN(yieldVal) ? -9999 : yieldVal
            };
          });
          parsed.sort((a, b) => b.yieldNum - a.yieldNum);
          setList(parsed.slice(0, 20));
          setLoading(false);
        } catch (e) {
          setError('数据解析异常');
          setLoading(false);
        }
      } else {
        setError('未获取到排名数据');
        setLoading(false);
      }
      window.rankData = undefined;
      if (document.body.contains(script)) document.body.removeChild(script);
    };
    script.onerror = () => {
      setError('加载排名数据失败');
      setLoading(false);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  return (
    <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="glass card modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
        <div className="title" style={{ marginBottom: 16, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><TrophyIcon width="20" height="20" style={{ color: '#f59e0b' }} /><span>基金排行榜</span><span className="badge">日涨幅 Top 20</span></div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button>
        </div>
        {loading ? (
          <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}><div className="search-spinner" /></div>
        ) : error ? (
          <div className="error-text" style={{ textAlign: 'center', padding: '20px' }}>{error}</div>
        ) : (
          <div className="list" style={{ gridTemplateColumns: '1fr', maxHeight: '60vh', overflowY: 'auto', gap: 0 }}>
            {list.map((item, idx) => (
              <div key={item.code} className="item" style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)', padding: '12px 4px', background: 'transparent', boxShadow: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: idx < 3 ? 'var(--primary)' : 'var(--border)', color: idx < 3 ? '#fff' : 'var(--muted)', borderRadius: '6px', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                  <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="name" style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{item.code} | {item.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className={`weight ${item.yieldNum > 0 ? 'up' : item.yieldNum < 0 ? 'down' : ''}`} style={{ fontSize: 14, fontWeight: 700 }}>{item.yieldNum > 0 ? '+' : ''}{item.yield}%</span>
                  <button className="icon-button" style={{ width: 32, height: 32 }} onClick={() => onAdd(item.code)} title="添加"><PlusIcon width="16" height="16" /></button>
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
  const handleSubmit = (e) => { e.preventDefault(); onSave(fund.code, amount); };
  return (
    <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="glass card modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
        <div className="title" style={{ marginBottom: 16 }}><EditIcon width="20" height="20" /><span>设置持有金额</span></div>
        <div className="muted" style={{ marginBottom: 16, fontSize: '14px' }}>{fund.name} (<span style={{ fontFamily: 'monospace' }}>{fund.code}</span>)</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>持有金额 (元)</label>
            <input autoFocus className="input" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ width: '100%' }} />
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
    <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" onClick={(e) => e.stopPropagation()}>
        <div className="title" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><SettingsIcon width="20" height="20" /><span>部分基金添加失败</span></div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button>
        </div>
        <div className="muted" style={{ marginBottom: 12, fontSize: '14px' }}>未获取到估值数据的基金如下：</div>
        <div className="list">{failures.map((it, idx) => (<div className="item" key={idx}><span className="name">{it.name || '未知名称'}</span><div className="values"><span className="badge">#{it.code}</span></div></div>))}</div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}><button className="button" onClick={onClose}>知道了</button></div>
      </motion.div>
    </motion.div>
  );
}

// --- 主组件 ---
export default function HomePage() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const refreshingRef = useRef(false);

  // 状态
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCodes, setExpandedCodes] = useState(new Set());
  const [editingFund, setEditingFund] = useState(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [currentTab, setCurrentTab] = useState('all');
  const [sortBy, setSortBy] = useState('yield'); 
  const [viewMode, setViewMode] = useState('list');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackNonce, setFeedbackNonce] = useState(0);

  // 搜索
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addResultOpen, setAddResultOpen] = useState(false);
  const [addFailures, setAddFailures] = useState([]);

  // --- 强力去重工具 ---
  const cleanAndDedupe = (list) => {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const result = [];
    for (const item of list) {
      if (!item || !item.code) continue;
      if (seen.has(item.code)) continue;
      seen.add(item.code);
      result.push(item);
    }
    return result;
  };

  // 计算收益
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

  // --- 清理函数 ---
  const clearFavorites = () => {
    if (!favorites.size) return alert('当前没有自选基金');
    if (!window.confirm('确定要清空所有自选标记吗？')) return;
    setFavorites(new Set());
    localStorage.setItem('favorites', '[]');
    setCurrentTab('all');
  };

  const clearAll = () => {
    if (!funds.length) return alert('当前没有添加任何基金');
    if (!window.confirm('⚠️ 确定要清空列表吗？\n\n此操作将删除所有基金及持仓，且无法恢复！')) return;
    setFunds([]);
    setFavorites(new Set());
    setExpandedCodes(new Set());
    localStorage.setItem('funds', '[]');
    localStorage.setItem('favorites', '[]');
    localStorage.setItem('expandedCodes', '[]');
    setCurrentTab('all');
  };

  // --- 初始化与同步 ---
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('funds') || '[]');
      const cleanFunds = cleanAndDedupe(saved);
      if (cleanFunds.length !== saved.length) localStorage.setItem('funds', JSON.stringify(cleanFunds));
      setFunds(cleanFunds);

      const savedMs = parseInt(localStorage.getItem('refreshMs') || '30000', 10);
      if (Number.isFinite(savedMs) && savedMs >= 5000) {
        setRefreshMs(savedMs);
        setTempSeconds(Math.round(savedMs / 1000));
      }
      const savedExpanded = JSON.parse(localStorage.getItem('expandedCodes') || '[]');
      if (Array.isArray(savedExpanded)) setExpandedCodes(new Set(savedExpanded));
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (Array.isArray(savedFavorites)) setFavorites(new Set(savedFavorites));
      const savedViewMode = localStorage.getItem('viewMode');
      if (savedViewMode) setViewMode(savedViewMode);
      
      const codes = cleanFunds.map(f => f.code);
      if (codes.length > 0) refreshAll(codes);

    } catch (e) {
      console.error('初始化数据失败', e);
      setFunds([]);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'funds') {
        try {
          const raw = e.newValue ? JSON.parse(e.newValue) : [];
          setFunds(cleanAndDedupe(raw)); 
        } catch (err) { }
      }
      if (e.key === 'favorites') {
        try {
          setFavorites(new Set(JSON.parse(e.newValue) || []));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const codes = funds.map((f) => f.code);
      if (codes.length) refreshAll(codes);
    }, refreshMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [funds, refreshMs]);

  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => { document.body.removeChild(script); resolve(); };
      script.onerror = () => { document.body.removeChild(script); reject(new Error('Load failed')); };
      document.body.appendChild(script);
    });
  };

  const fetchFundData = async (c) => {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
    const fetchPromise = new Promise(async (resolve, reject) => {
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
          reject(new Error('Invalid data'));
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
              holdings.push({ code: cells[codeIdx], name: cells[codeIdx + 1] || '', weight: cells[weightIdx], change: null });
            }
          }
          holdings = holdings.slice(0, 10);
          resolve({ ...gzData, holdings });
        }).catch(() => resolve({ ...gzData, holdings: [] }));
      };

      scriptGz.onerror = () => {
        window.jsonpgz = originalJsonpgz;
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
        reject(new Error('Load failed'));
      };
      document.body.appendChild(scriptGz);
    });

    return Promise.race([fetchPromise, timeoutPromise]);
  };

  const executeAddFunds = async (codes) => {
    if (!codes.length) return;
    setLoading(true);
    try {
      const newFunds = [];
      const failures = [];
      for (const c of codes) {
        const existing = funds.find(f => f.code === c);
        try {
          const data = await fetchFundData(c);
          if (existing?.amount) data.amount = existing.amount;
          newFunds.push(data);
        } catch (e) {
          console.error(`Error adding ${c}`, e);
          if (existing) newFunds.push(existing);
          else failures.push({ code: c });
        }
      }
      const currentMap = new Map();
      funds.forEach(f => currentMap.set(f.code, f));
      newFunds.forEach(f => currentMap.set(f.code, f));
      const merged = Array.from(currentMap.values());
      const deduped = cleanAndDedupe(merged);
      setFunds(deduped);
      localStorage.setItem('funds', JSON.stringify(deduped));
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

  const refreshAll = async (codes) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    const uniqueCodes = Array.from(new Set(codes));
    const resultMap = new Map();
    funds.forEach(f => resultMap.set(f.code, f));

    try {
      await Promise.allSettled(uniqueCodes.map(async (c) => {
        try {
          const data = await fetchFundData(c);
          const old = resultMap.get(c);
          if (old?.amount) data.amount = old.amount;
          resultMap.set(c, data);
        } catch (e) { }
      }));
      const finalFunds = Array.from(resultMap.values());
      const deduped = cleanAndDedupe(finalFunds);
      setFunds(deduped);
      localStorage.setItem('funds', JSON.stringify(deduped));
    } catch (e) {
      console.error('Refresh all error', e);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  const performSearch = async (val) => { 
    if (!val.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    const callbackName = `SuggestData_${Date.now()}`;
    const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(val)}&callback=${callbackName}&_=${Date.now()}`;
    try {
      await new Promise((resolve, reject) => {
        window[callbackName] = (data) => {
          if (data && data.Datas) {
            setSearchResults(data.Datas.filter(d => d.CATEGORY === 700 || d.CATEGORY === "700" || d.CATEGORYDESC === "基金"));
          }
          delete window[callbackName]; resolve();
        };
        const script = document.createElement('script');
        script.src = url; script.async = true;
        script.onload = () => { if (document.body.contains(script)) document.body.removeChild(script); };
        script.onerror = () => { if (document.body.contains(script)) document.body.removeChild(script); delete window[callbackName]; reject(); };
        document.body.appendChild(script);
      });
    } catch (e) { } finally { setIsSearching(false); }
  };
  const handleSearchInput = (e) => {
    const val = e.target.value; setSearchTerm(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(val), 300);
  };
  const toggleSelectFund = (fund) => {
    setSelectedFunds(prev => {
      const exists = prev.find(f => f.CODE === fund.CODE);
      return exists ? prev.filter(f => f.CODE !== fund.CODE) : [...prev, fund];
    });
  };
  const addFund = async (e) => {
    e?.preventDefault?.(); setError('');
    const manualTokens = String(searchTerm || '').split(/[^0-9A-Za-z]+/).map(t => t.trim()).filter(t => t.length > 0);
    const selectedCodes = Array.from(new Set([...selectedFunds.map(f => f.CODE), ...manualTokens.filter(t => /^\d{6}$/.test(t))]));
    if (selectedCodes.length === 0) { setError('请输入或选择基金代码'); return; }
    await executeAddFunds(selectedCodes);
    setSearchTerm(''); setSelectedFunds([]); setShowDropdown(false);
  };
  const handleAddFromLeaderboard = (code) => executeAddFunds([code]);
  const handleSaveAmount = (code, amount) => {
    const next = funds.map(f => f.code === code ? { ...f, amount: amount } : f);
    setFunds(next); localStorage.setItem('funds', JSON.stringify(next)); setEditingFund(null);
  };
  const removeFund = (removeCode) => {
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next); localStorage.setItem('funds', JSON.stringify(next));
    if (expandedCodes.has(removeCode)) {
      const nextEx = new Set(expandedCodes); nextEx.delete(removeCode);
      setExpandedCodes(nextEx); localStorage.setItem('expandedCodes', JSON.stringify(Array.from(nextEx)));
    }
    if (favorites.has(removeCode)) {
      const nextFav = new Set(favorites); nextFav.delete(removeCode);
      setFavorites(nextFav); localStorage.setItem('favorites', JSON.stringify(Array.from(nextFav)));
      if (nextFav.size === 0) setCurrentTab('all');
    }
  };
  const manualRefresh = async () => { if (refreshingRef.current) return; await refreshAll(funds.map(f => f.code)); };
  const toggleFavorite = (code) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      localStorage.setItem('favorites', JSON.stringify(Array.from(next)));
      if (next.size === 0) setCurrentTab('all');
      return next;
    });
  };
  const toggleExpand = (code) => {
    setExpandedCodes(prev => {
      const next = new Set(prev); if (next.has(code)) next.delete(code); else next.add(code);
      localStorage.setItem('expandedCodes', JSON.stringify(Array.from(next))); return next;
    });
  };
  const saveSettings = (e) => {
    e?.preventDefault?.(); const ms = Math.max(5, Number(tempSeconds)) * 1000;
    setRefreshMs(ms); localStorage.setItem('refreshMs', String(ms)); setSettingsOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => { const onKey = (ev) => { if (ev.key === 'Escape' && settingsOpen) setSettingsOpen(false); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [settingsOpen]);

  // --- 渲染逻辑 ---
  return (
    <div className="container content">
      <Announcement />
      <div className="navbar glass">
        {refreshing && <div className="loading-bar"></div>}
        <div className="brand"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" /><path d="M5 14c2-4 7-6 14-5" stroke="var(--primary)" strokeWidth="2" /></svg><span>实时基金估值</span></div>
        <div className="actions">
          <div className="badge"><span>刷新</span><strong>{Math.round(refreshMs / 1000)}秒</strong></div>
          <button className="icon-button" onClick={() => setLeaderboardOpen(true)}><TrophyIcon width="18" height="18" /></button>
          <button className="icon-button" onClick={manualRefresh} disabled={refreshing || funds.length === 0}><RefreshIcon className={refreshing ? 'spin' : ''} width="18" height="18" /></button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)}><SettingsIcon width="18" height="18" /></button>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 glass card add-fund-section">
          <div className="title" style={{ marginBottom: 12 }}><PlusIcon width="20" height="20" /><span>添加基金</span></div>
          <div className="search-container" ref={dropdownRef}>
            <form className="form" onSubmit={addFund}>
              <div className="search-input-wrapper" style={{ flex: 1, gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedFunds.map(fund => (<div key={fund.CODE} className="fund-chip"><span>{fund.NAME}</span><button onClick={() => toggleSelectFund(fund)} className="remove-chip"><CloseIcon width="14" height="14" /></button></div>))}
                <input className="input" placeholder="搜索基金名称或代码..." value={searchTerm} onChange={handleSearchInput} onFocus={() => setShowDropdown(true)} />
                {isSearching && <div className="search-spinner" />}
              </div>
              <button className="button" type="submit" disabled={loading}>{loading ? '添加中…' : '添加'}</button>
            </form>
            <AnimatePresence>
              {showDropdown && (searchTerm.trim() || searchResults.length > 0) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="search-dropdown glass">
                  {searchResults.length > 0 ? (
                    <div className="search-results">{searchResults.map((fund) => {
                      const isSelected = selectedFunds.some(f => f.CODE === fund.CODE);
                      const isAlreadyAdded = funds.some(f => f.code === fund.CODE);
                      return (
                        <div key={fund.CODE} className={`search-item ${isSelected ? 'selected' : ''} ${isAlreadyAdded ? 'added' : ''}`} onClick={() => { if (!isAlreadyAdded) toggleSelectFund(fund); }}>
                          <div className="fund-info"><span className="fund-name">{fund.NAME}</span><span className="fund-code muted">#{fund.CODE} | {fund.TYPE}</span></div>
                          {isAlreadyAdded ? <span className="added-label">已添加</span> : isSelected && <div className="checked-mark" />}
                        </div>
                      );
                    })}</div>
                  ) : searchTerm.trim() && !isSearching ? <div className="no-results muted">未找到相关基金</div> : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {error && <div className="muted" style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</div>}
        </div>

        {funds.length > 0 && (
          <div className="col-12 glass card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="muted" style={{ fontSize: '12px' }}>总持有金额</span><span style={{ fontSize: '20px', fontWeight: 700 }}>{summary.totalAmount.toFixed(2)}</span></div>
                <div style={{ width: 1, height: 32, background: 'var(--border)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="muted" style={{ fontSize: '12px' }}>今日预估收益</span><span className={summary.totalProfit > 0 ? 'up' : summary.totalProfit < 0 ? 'down' : ''} style={{ fontSize: '20px', fontWeight: 700 }}>{summary.totalProfit > 0 ? '+' : ''}{summary.totalProfit.toFixed(2)}</span></div>
             </div>
             {/* 快速清空按钮区域 */}
             <div style={{ display: 'flex', gap: 12 }}>
                <button className="button sm" style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', fontSize: '12px', padding: '6px 12px', height: 'auto' }} onClick={clearFavorites}>清空自选</button>
                <button className="button sm" style={{ background: 'var(--danger)', color: '#fff', fontSize: '12px', padding: '6px 12px', height: 'auto', border: 'none' }} onClick={clearAll}>清空全部</button>
             </div>
          </div>
        )}

        <div className="col-12">
          {funds.length > 0 && (
            <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              {favorites.size > 0 ? (
                <div className="tabs">
                  <button className={`tab ${currentTab === 'all' ? 'active' : ''}`} onClick={() => setCurrentTab('all')}>全部 ({funds.length})</button>
                  <button className={`tab ${currentTab === 'fav' ? 'active' : ''}`} onClick={() => setCurrentTab('fav')}>自选 ({favorites.size})</button>
                </div>
              ) : <div />}
              <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="view-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' }}>
                  <button className={`icon-button ${viewMode === 'card' ? 'active' : ''}`} onClick={() => { setViewMode('card'); localStorage.setItem('viewMode', 'card'); }} title="卡片视图"><GridIcon width="16" height="16" /></button>
                  <button className={`icon-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => { setViewMode('list'); localStorage.setItem('viewMode', 'list'); }} title="表格视图"><ListIcon width="16" height="16" /></button>
                </div>
                <div className="divider" style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
                <div className="sort-items" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}><SortIcon width="14" height="14" />排序</span>
                  <div className="chips">
                    {[{ id: 'yield', label: '涨跌幅' }, { id: 'name', label: '名称' }, { id: 'code', label: '代码' }].map((s) => (
                      <button key={s.id} className={`chip ${sortBy === s.id ? 'active' : ''}`} onClick={() => setSortBy(s.id)} style={{ height: '28px', fontSize: '12px', padding: '0 10px' }}>{s.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {funds.length === 0 ? <div className="glass card empty">尚未添加基金</div> : (
            <AnimatePresence mode="wait">
              <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={viewMode === 'card' ? 'grid' : 'table-container glass'} style={viewMode === 'list' ? { overflowX: 'auto', WebkitOverflowScrolling: 'touch' } : {}}>
                <div className={viewMode === 'card' ? 'grid col-12' : ''} style={viewMode === 'card' ? { gridColumn: 'span 12', gap: 16 } : { minWidth: '750px' }}>
                  <AnimatePresence mode="popLayout" initial={false}>
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
                        return 0;
                      })
                      .map((f) => {
                        const amount = parseFloat(f.amount) || 0;
                        const rate = f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0);
                        const profit = amount * rate / 100;
                        // --- 核心修改：合并了名字和涨跌幅，移除了独立的涨跌列 ---
                        // Template: Name+Change(flexible) | Valuation | Amount | Profit | Delete
                        const gridTemplate = 'minmax(240px, 2fr) 90px 90px 90px 50px'; 
                        
                        return (
                          <motion.div
                            key={f.code}
                            className={viewMode === 'card' ? 'col-6' : 'table-row-wrapper'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                          <div className={viewMode === 'card' ? 'glass card' : 'table-row'} style={viewMode === 'list' ? { gridTemplateColumns: gridTemplate } : {}}>
                            {viewMode === 'list' ? (
                              <>
                                {/* 核心修改：名字列，包含了涨跌幅 */}
                                <div className="table-cell name-cell" style={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                  <button className={`icon-button fav-button ${favorites.has(f.code) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(f.code); }}>
                                    <StarIcon width="18" height="18" filled={favorites.has(f.code)} />
                                  </button>
                                  <div className="title-text" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                       {/* 名字自动省略 */}
                                       <span className="name-text" title={f.name} style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '15px', lineHeight: '1.5', flex: '0 1 auto' }}>{f.name}</span>
                                       {/* 涨跌幅紧随其后，不省略 */}
                                       <span className={f.estPricedCoverage > 0.05 ? (f.estGszzl > 0 ? 'up' : f.estGszzl < 0 ? 'down' : '') : (Number(f.gszzl) > 0 ? 'up' : Number(f.gszzl) < 0 ? 'down' : '')} style={{ fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                                          {f.estPricedCoverage > 0.05 ? `${f.estGszzl > 0 ? '+' : ''}${f.estGszzl.toFixed(2)}%` : (typeof f.gszzl === 'number' ? `${f.gszzl > 0 ? '+' : ''}${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—')}
                                       </span>
                                    </div>
                                    <span className="muted code-text" style={{ fontSize: '12px' }}>#{f.code}</span>
                                  </div>
                                </div>
                                {/* 估值/净值列 */}
                                <div className="table-cell text-right value-cell">
                                  <span style={{ fontWeight: 700 }}>{f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—')}</span>
                                </div>
                                <div className="table-cell text-right" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => setEditingFund(f)}>
                                    <span style={{ fontSize: 13 }}>{amount > 0 ? amount.toFixed(0) : '--'}</span>
                                    <EditIcon width="12" height="12" style={{ color: 'var(--muted)' }} />
                                  </div>
                                </div>
                                <div className="table-cell text-right">
                                  {amount > 0 ? <span className={profit > 0 ? 'up' : profit < 0 ? 'down' : ''} style={{ fontWeight: 700 }}>{profit > 0 ? '+' : ''}{profit.toFixed(2)}</span> : <span className="muted">--</span>}
                                </div>
                                <div className="table-cell text-center action-cell">
                                  <button className="icon-button danger" onClick={() => removeFund(f.code)} style={{ width: '28px', height: '28px' }}><TrashIcon width="14" height="14" /></button>
                                </div>
                              </>
                            ) : (
                              <>
                              <div className="row" style={{ marginBottom: 10 }}>
                                <div className="title">
                                  <button className={`icon-button fav-button ${favorites.has(f.code) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(f.code); }}><StarIcon width="18" height="18" filled={favorites.has(f.code)} /></button>
                                  <div className="title-text"><span>{f.name}</span><span className="muted">#{f.code}</span></div>
                                </div>
                                <div className="actions"><button className="icon-button danger" onClick={() => removeFund(f.code)}><TrashIcon width="18" height="18" /></button></div>
                              </div>
                              <div className="row" style={{ marginBottom: 12 }}>
                                <Stat label="涨跌幅" value={f.estPricedCoverage > 0.05 ? `${f.estGszzl > 0 ? '+' : ''}${f.estGszzl.toFixed(2)}%` : (typeof f.gszzl === 'number' ? `${f.gszzl > 0 ? '+' : ''}${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—')} delta={f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0)} />
                                <Stat label="估值净值" value={f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—')} />
                              </div>
                              <div className="row" style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="muted" style={{ fontSize: 11 }}>持有金额</span><button onClick={() => setEditingFund(f)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}><EditIcon width="12" height="12" style={{ color: 'var(--accent)' }} /></button></div>
                                  <span style={{ fontWeight: 600 }}>{amount > 0 ? amount.toFixed(2) : '--'}</span>
                                </div>
                                <div style={{ width: 1, height: 24, background: 'var(--border)' }}></div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                                  <span className="muted" style={{ fontSize: 11 }}>预估收益</span><span className={profit > 0 ? 'up' : profit < 0 ? 'down' : ''} style={{ fontWeight: 700 }}>{amount > 0 ? `${profit > 0 ? '+' : ''}${profit.toFixed(2)}` : '--'}</span>
                                </div>
                              </div>
                              {f.estPricedCoverage > 0.05 && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: -8, marginBottom: 10, textAlign: 'right' }}>基于 {Math.round(f.estPricedCoverage * 100)}% 持仓估算</div>}
                              <div style={{ marginBottom: 8, cursor: 'pointer', userSelect: 'none' }} className="title" onClick={() => toggleExpand(f.code)}>
                                <div className="row" style={{ width: '100%', flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>前10重仓股票</span><ChevronIcon width="16" height="16" className="muted" style={{ transform: expandedCodes.has(f.code) ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }} /></div>
                                  <span className="muted">涨跌幅 / 占比</span>
                                </div>
                              </div>
                              <AnimatePresence>
                                {expandedCodes.has(f.code) && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                    {Array.isArray(f.holdings) && f.holdings.length ? (
                                      <div className="list">{f.holdings.map((h, idx) => (<div className="item" key={idx}><span className="name">{h.name}</span><div className="values">{typeof h.change === 'number' && <span className={`badge ${h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}`} style={{ marginRight: 8 }}>{h.change > 0 ? '+' : ''}{h.change.toFixed(2)}%</span>}<span className="weight">{h.weight}</span></div></div>))}</div>
                                    ) : <div className="muted" style={{ padding: '8px 0' }}>暂无重仓数据</div>}
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
      <div className="footer"><p>数据源：实时估值与重仓直连东方财富，仅供个人学习及参考使用</p><p>注：估算数据与真实结算数据会有1%左右误差</p><div style={{ marginTop: 12, opacity: 0.8 }}><p>遇到问题？<button className="link-button" onClick={() => { setFeedbackNonce(n => n + 1); setFeedbackOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline', fontSize: 'inherit', fontWeight: 600 }}>点此反馈</button></p></div></div>
      <AnimatePresence>{feedbackOpen && <FeedbackModal key={feedbackNonce} onClose={() => setFeedbackOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{leaderboardOpen && <LeaderboardModal onClose={() => setLeaderboardOpen(false)} onAdd={handleAddFromLeaderboard} />}</AnimatePresence>
      <AnimatePresence>{editingFund && <EditAmountModal fund={editingFund} onClose={() => setEditingFund(null)} onSave={handleSaveAmount} />}</AnimatePresence>
      <AnimatePresence>{addResultOpen && <AddResultModal failures={addFailures} onClose={() => setAddResultOpen(false)} />}</AnimatePresence>
      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}><SettingsIcon width="20" height="20" /><span>设置</span><span className="muted">配置刷新频率</span></div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>刷新频率</div>
              <div className="chips" style={{ marginBottom: 12 }}>{[10, 30, 60, 120, 300].map((s) => (<button key={s} type="button" className={`chip ${tempSeconds === s ? 'active' : ''}`} onClick={() => setTempSeconds(s)}>{s} 秒</button>))}</div>
              <input className="input" type="number" min="5" step="5" value={tempSeconds} onChange={(e) => setTempSeconds(Number(e.target.value))} placeholder="自定义秒数" />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}><button className="button" onClick={saveSettings}>保存并关闭</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
