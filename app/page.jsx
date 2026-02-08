'use client';

import { useEffect, useRef, useState, useMemo, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Announcement from "./components/Announcement";
import { DatePicker, DonateTabs, NumericInput, Stat } from "./components/Common";
import { ChevronIcon, CloseIcon, CloudIcon, DragIcon, ExitIcon, GridIcon, ListIcon, LoginIcon, LogoutIcon, MailIcon, PlusIcon, RefreshIcon, SettingsIcon, SortIcon, StarIcon, TrashIcon, UpdateIcon, UserIcon } from "./components/Icons";
import githubImg from "./assets/github.svg";
import { fetchFundData, fetchShanghaiIndexDate, fetchSmartFundNetValue, searchFunds, submitFeedback } from './api/fund';
import packageJson from '../package.json';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

const TZ = 'Asia/Shanghai';
const nowInTz = () => dayjs().tz(TZ);
const toTz = (input) => (input ? dayjs.tz(input, TZ) : nowInTz());
const formatDate = (input) => toTz(input).format('YYYY-MM-DD');

// --- 新增：字体自适应辅助函数 ---
// 根据文本长度动态返回 fontSize (px)
const getAutoFontSize = (text, baseSize = 14, minSize = 10) => {
  const str = String(text || '');
  const len = str.length;
  // 超过8个字符开始缩小
  if (len <= 8) return baseSize;
  if (len <= 12) return Math.max(minSize, baseSize - 1);
  if (len <= 16) return Math.max(minSize, baseSize - 2); 
  if (len <= 22) return Math.max(minSize, baseSize - 3);
  return minSize;
};

// --- 简易图标组件 ---
function MoonIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}
function SunIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}

function FeedbackModal({ onClose, user }) {
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.target);
    const nickname = formData.get("nickname")?.trim();
    if (!nickname) {
      formData.set("nickname", "匿名");
    }

    // Web3Forms Access Key
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '');
    formData.append("subject", "基估宝 - 用户反馈");

    try {
      const data = await submitFeedback(formData);
      if (data.success) {
        setSucceeded(true);
      } else {
        setError(data.message || "提交失败，请稍后再试");
      }
    } catch (err) {
      setError("网络错误，请检查您的连接");
    } finally {
      setSubmitting(false);
    }
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

        {succeeded ? (
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
            </div>
            {error && (
              <div className="error-text" style={{ marginBottom: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button className="button" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? '发送中...' : '提交反馈'}
            </button>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

function HoldingActionModal({ fund, onClose, onAction }) {
  return (
    <motion.div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="持仓操作"
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
        style={{ maxWidth: '320px' }}
      >
        <div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsIcon width="20" height="20" />
            <span>持仓操作</span>
          </div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}>
            <CloseIcon width="20" height="20" />
          </button>
        </div>

        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <div className="fund-name" style={{ fontWeight: 600, fontSize: '16px', marginBottom: 4 }}>{fund?.name}</div>
          <div className="muted" style={{ fontSize: '12px' }}>#{fund?.code}</div>
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <button className="button col-6" onClick={() => onAction('buy')} style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            加仓
          </button>
          <button className="button col-6" onClick={() => onAction('sell')} style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            减仓
          </button>
          <button className="button col-12" onClick={() => onAction('edit')} style={{ background: 'rgba(127,127,127,0.05)', color: 'var(--text)' }}>
            编辑持仓
          </button>
          <button
            className="button col-12"
            onClick={() => onAction('clear')}
            style={{
              marginTop: 8,
              background: 'linear-gradient(180deg, #ef4444, #f87171)',
              border: 'none',
              color: '#fff',
              fontWeight: 600
            }}
          >
            清空持仓
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TradeModal({ type, fund, holding, onClose, onConfirm, pendingTrades = [], onDeletePending }) {
   const isBuy = type === 'buy';
   const [share, setShare] = useState('');
   const [amount, setAmount] = useState('');
   const [feeRate, setFeeRate] = useState('0');
   const [date, setDate] = useState(() => formatDate());
   const [isAfter3pm, setIsAfter3pm] = useState(nowInTz().hour() >= 15);
   const [calcShare, setCalcShare] = useState(null);
   const [feeMode, setFeeMode] = useState('rate'); 
   const [feeValue, setFeeValue] = useState('0');
   const [showConfirm, setShowConfirm] = useState(false);
   const [showPendingList, setShowPendingList] = useState(false);
   const [revokeTrade, setRevokeTrade] = useState(null);

   const currentPendingTrades = useMemo(() => {
     return pendingTrades.filter(t => t.fundCode === fund?.code);
   }, [pendingTrades, fund]);
   const pendingSellShare = useMemo(() => {
       return currentPendingTrades.filter(t => t.type === 'sell').reduce((acc, curr) => acc + (Number(curr.share) || 0), 0);
   }, [currentPendingTrades]);
   const availableShare = holding ? Math.max(0, holding.share - pendingSellShare) : 0;

   const getEstimatePrice = () => fund?.estPricedCoverage > 0.05 ? fund?.estGsz : (typeof fund?.gsz === 'number' ? fund?.gsz : Number(fund?.dwjz));
   const [price, setPrice] = useState(getEstimatePrice());
   const [loadingPrice, setLoadingPrice] = useState(false);
   const [actualDate, setActualDate] = useState(null);

   useEffect(() => {
    if (date && fund?.code) {
        setLoadingPrice(true);
        setActualDate(null);
        let queryDate = date;
        if (isAfter3pm) queryDate = toTz(date).add(1, 'day').format('YYYY-MM-DD');
        fetchSmartFundNetValue(fund.code, queryDate).then(result => {
            if (result) { setPrice(result.value); setActualDate(result.date); } 
            else { setPrice(0); setActualDate(null); }
        }).finally(() => setLoadingPrice(false));
    }
   }, [date, isAfter3pm, isBuy, fund]);

   const sellShare = parseFloat(share) || 0;
   const sellPrice = parseFloat(price) || 0;
   const sellAmount = sellShare * sellPrice;
   let sellFee = 0;
   if (feeMode === 'rate') { const rate = parseFloat(feeValue) || 0; sellFee = sellAmount * (rate / 100); } 
   else { sellFee = parseFloat(feeValue) || 0; }
   const estimatedReturn = sellAmount - sellFee;

   useEffect(() => {
     if (!isBuy) return;
     const a = parseFloat(amount);
     const f = parseFloat(feeRate);
     const p = parseFloat(price);
     if (a > 0 && !isNaN(f)) {
         if (p > 0) { const netAmount = a / (1 + f / 100); const s = netAmount / p; setCalcShare(s.toFixed(2)); } 
         else { setCalcShare('待确认'); }
     } else { setCalcShare(null); }
   }, [isBuy, amount, feeRate, price]);

   const handleSubmit = (e) => {
     e.preventDefault();
     if (isBuy) { if (!amount || !feeRate || !date || calcShare === null) return; setShowConfirm(true); } 
     else { if (!share || !date) return; setShowConfirm(true); }
   };
   const handleFinalConfirm = () => {
       if (isBuy) { onConfirm({ share: calcShare === '待确认' ? null : Number(calcShare), price: Number(price), totalCost: Number(amount), date, isAfter3pm, feeRate: Number(feeRate) }); return; }
       onConfirm({ share: Number(share), price: Number(price), date: actualDate || date, isAfter3pm, feeMode, feeValue });
   };
   const isValid = isBuy ? (!!amount && !!feeRate && !!date && calcShare !== null) : (!!share && !!date);
   const handleSetShareFraction = (fraction) => { if(availableShare > 0) setShare((availableShare * fraction).toFixed(2)); };

   return (
    <motion.div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
         <div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '20px' }}>{isBuy ? '📥' : '📤'}</span>
                <span>{showPendingList ? '待交易队列' : (showConfirm ? (isBuy ? '买入确认' : '卖出确认') : (isBuy ? '加仓' : '减仓'))}</span>
            </div>
            <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button>
         </div>
         {!showPendingList && !showConfirm && currentPendingTrades.length > 0 && (
            <div style={{ marginBottom: 16, background: 'rgba(230, 162, 60, 0.1)', border: '1px solid rgba(230, 162, 60, 0.2)', borderRadius: 8, padding: '8px 12px', fontSize: '12px', color: '#e6a23c', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowPendingList(true)}>
                <span>⚠️ 当前有 {currentPendingTrades.length} 笔待处理交易</span><span style={{ textDecoration: 'underline' }}>查看详情 &gt;</span>
            </div>
         )}
         {showPendingList ? (
             <div className="pending-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                 <div className="pending-list-header" style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg)', paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
                     <button className="button secondary" onClick={() => setShowPendingList(false)} style={{ padding: '4px 8px', fontSize: '12px' }}>&lt; 返回</button>
                 </div>
                 <div className="pending-list-items">
                     {currentPendingTrades.map((trade, idx) => (
                         <div key={trade.id || idx} style={{ background: 'rgba(127,127,127,0.05)', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                             <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                                 <span style={{ fontWeight: 600, fontSize: '14px', color: trade.type === 'buy' ? 'var(--danger)' : 'var(--success)' }}>{trade.type === 'buy' ? '买入' : '卖出'}</span>
                                 <span className="muted" style={{ fontSize: '12px' }}>{trade.date}</span>
                             </div>
                             <div className="row" style={{ justifyContent: 'space-between', fontSize: '12px' }}>
                                 <span className="muted">份额/金额</span><span>{trade.share ? `${trade.share} 份` : `¥${trade.amount}`}</span>
                             </div>
                             <button className="button secondary" onClick={() => setRevokeTrade(trade)} style={{ marginTop: 8, padding: '2px 8px', fontSize: '10px', width: '100%' }}>撤销</button>
                         </div>
                     ))}
                 </div>
             </div>
         ) : showConfirm ? (
             <div style={{ fontSize: '14px' }}>
                 <div style={{ background: 'rgba(127,127,127,0.05)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                     <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}><span className="muted">基金名称</span><span style={{ fontWeight: 600 }}>{fund?.name}</span></div>
                     {isBuy ? (
                        <>
                           <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}><span className="muted">买入金额</span><span>¥{Number(amount).toFixed(2)}</span></div>
                           <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}><span className="muted">预估份额</span><span>{calcShare}</span></div>
                        </>
                     ) : (
                        <>
                           <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}><span className="muted">卖出份额</span><span>{sellShare.toFixed(2)}</span></div>
                           <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}><span className="muted">预计回款</span><span style={{ color: 'var(--danger)' }}>¥{estimatedReturn.toFixed(2)}</span></div>
                        </>
                     )}
                 </div>
                 <div className="row" style={{ gap: 12 }}>
                    <button type="button" className="button secondary" onClick={() => setShowConfirm(false)} style={{ flex: 1 }}>返回修改</button>
                    <button type="button" className="button" onClick={handleFinalConfirm} disabled={loadingPrice} style={{ flex: 1, background: isBuy ? 'var(--primary)' : 'var(--danger)' }}>{loadingPrice ? '请稍候' : '确认'}</button>
                 </div>
             </div>
         ) : (
             <form onSubmit={handleSubmit}>
                 {isBuy ? (
                     <>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>加仓金额 (¥) <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <NumericInput value={amount} onChange={setAmount} step={100} min={0} placeholder="请输入加仓金额" />
                        </div>
                        <div className="row" style={{ gap: 12, marginBottom: 16 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>买入费率 (%)</label>
                                <NumericInput value={feeRate} onChange={setFeeRate} step={0.01} placeholder="0.12" />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>日期</label>
                                <DatePicker value={date} onChange={setDate} />
                            </div>
                        </div>
                     </>
                 ) : (
                     <>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>卖出份额 <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <NumericInput value={share} onChange={setShare} step={1} placeholder={holding ? `最多 ${availableShare.toFixed(2)}` : ""} />
                            {holding && holding.share > 0 && (
                                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                                    {[0.25, 0.3333, 0.5, 1].map((v, i) => <button key={i} type="button" onClick={() => handleSetShareFraction(v)} style={{ flex: 1, padding: '4px', fontSize: '12px', background: 'rgba(127,127,127,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--text)' }}>{['1/4','1/3','1/2','全部'][i]}</button>)}
                                </div>
                            )}
                        </div>
                        <div className="row" style={{ gap: 12, marginBottom: 16 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="muted" style={{ fontSize: '14px' }}>{feeMode === 'rate' ? '费率(%)' : '费用(¥)'}</label>
                                <NumericInput value={feeValue} onChange={setFeeValue} step={feeMode === 'rate' ? 0.01 : 1} placeholder="0.00" />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>日期</label>
                                <DatePicker value={date} onChange={setDate} />
                            </div>
                        </div>
                     </>
                 )}
                 <div className="form-group" style={{ marginBottom: 12 }}>
                    <div className="row" style={{ gap: 8, background: 'rgba(127,127,127,0.1)', borderRadius: '8px', padding: '4px' }}>
                        <button type="button" onClick={() => setIsAfter3pm(false)} style={{ flex: 1, border: 'none', background: !isAfter3pm ? 'var(--primary)' : 'transparent', color: !isAfter3pm ? '#fff' : 'var(--muted)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', padding: '6px' }}>15:00前</button>
                        <button type="button" onClick={() => setIsAfter3pm(true)} style={{ flex: 1, border: 'none', background: isAfter3pm ? 'var(--primary)' : 'transparent', color: isAfter3pm ? '#fff' : 'var(--muted)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', padding: '6px' }}>15:00后</button>
                    </div>
                 </div>
                 <div className="row" style={{ gap: 12, marginTop: 12 }}>
                    <button type="button" className="button secondary" onClick={onClose} style={{ flex: 1 }}>取消</button>
                    <button type="submit" className="button" disabled={!isValid || loadingPrice} style={{ flex: 1, opacity: (!isValid || loadingPrice) ? 0.6 : 1 }}>确定</button>
                 </div>
             </form>
         )}
      </motion.div>
      <AnimatePresence>
        {revokeTrade && (
          <ConfirmModal key="revoke-confirm" title="撤销交易" message="确定要撤销这笔申请吗？" onConfirm={() => { onDeletePending?.(revokeTrade.id); setRevokeTrade(null); }} onCancel={() => setRevokeTrade(null)} confirmText="确认撤销" />
        )}
      </AnimatePresence>
    </motion.div>
   );
}

function HoldingEditModal({ fund, holding, onClose, onSave }) {
  const [mode, setMode] = useState('amount');
  const dwjz = fund?.dwjz || fund?.gsz || 0;
  const [share, setShare] = useState('');
  const [cost, setCost] = useState('');
  const [amount, setAmount] = useState('');
  const [profit, setProfit] = useState('');

  useEffect(() => {
    if (holding) {
      const s = holding.share || 0;
      const c = holding.cost || 0;
      setShare(String(s));
      setCost(String(c));
      if (dwjz > 0) {
        const a = s * dwjz;
        const p = (dwjz - c) * s;
        setAmount(a.toFixed(2));
        setProfit(p.toFixed(2));
      }
    }
  }, [holding, fund]);

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    if (newMode === 'share') {
      if (amount && dwjz > 0) {
        const a = parseFloat(amount);
        const p = parseFloat(profit || 0);
        const s = a / dwjz;
        const principal = a - p;
        const c = s > 0 ? principal / s : 0;
        setShare(s.toFixed(2));
        setCost(c.toFixed(4));
      }
    } else {
      if (share && dwjz > 0) {
        const s = parseFloat(share);
        const c = parseFloat(cost || 0);
        const a = s * dwjz;
        const p = (dwjz - c) * s;
        setAmount(a.toFixed(2));
        setProfit(p.toFixed(2));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalShare = 0;
    let finalCost = 0;
    if (mode === 'share') {
      if (!share || !cost) return;
      finalShare = Number(Number(share).toFixed(2));
      finalCost = Number(cost);
    } else {
      if (!amount || !dwjz) return;
      const a = Number(amount);
      const p = Number(profit || 0);
      const rawShare = a / dwjz;
      finalShare = Number(rawShare.toFixed(2));
      const principal = a - p;
      finalCost = finalShare > 0 ? principal / finalShare : 0;
    }
    onSave({ share: finalShare, cost: finalCost });
    onClose();
  };
  const isValid = mode === 'share' ? (share && cost && !isNaN(share) && !isNaN(cost)) : (amount && !isNaN(amount) && (!profit || !isNaN(profit)) && dwjz > 0);

  return (
    <motion.div className="modal-overlay" role="dialog" aria-modal="true" aria-label="编辑持仓" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><SettingsIcon width="20" height="20" /><span>设置持仓</span></div>
          <button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="fund-name" style={{ fontWeight: 600, fontSize: '16px', marginBottom: 4 }}>{fund?.name}</div>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}><div className="muted" style={{ fontSize: '12px' }}>#{fund?.code}</div><div className="badge" style={{ fontSize: '12px' }}>最新净值：<span style={{ fontWeight: 600, color: 'var(--primary)' }}>{dwjz}</span></div></div>
        </div>
        <div className="tabs-container" style={{ marginBottom: 20, background: 'rgba(127,127,127,0.1)', padding: 4, borderRadius: 12 }}>
          <div className="row" style={{ gap: 0 }}>
            <button type="button" className={`tab ${mode === 'amount' ? 'active' : ''}`} onClick={() => handleModeChange('amount')} style={{ flex: 1, justifyContent: 'center', height: 32, borderRadius: 8 }}>按金额</button>
            <button type="button" className={`tab ${mode === 'share' ? 'active' : ''}`} onClick={() => handleModeChange('share')} style={{ flex: 1, justifyContent: 'center', height: 32, borderRadius: 8 }}>按份额</button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === 'amount' ? (
            <>
              <div className="form-group" style={{ marginBottom: 16 }}><label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>持有金额 <span style={{ color: 'var(--danger)' }}>*</span></label><input type="number" step="any" className={`input ${!amount ? 'error' : ''}`} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="请输入持有总金额" style={{ width: '100%', border: !amount ? '1px solid var(--danger)' : undefined }} /></div>
              <div className="form-group" style={{ marginBottom: 24 }}><label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>持有收益</label><input type="number" step="any" className="input" value={profit} onChange={(e) => setProfit(e.target.value)} placeholder="请输入持有总收益 (可为负)" style={{ width: '100%' }} /></div>
            </>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 16 }}><label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>持有份额 <span style={{ color: 'var(--danger)' }}>*</span></label><input type="number" step="any" className={`input ${!share ? 'error' : ''}`} value={share} onChange={(e) => setShare(e.target.value)} placeholder="请输入持有份额" style={{ width: '100%', border: !share ? '1px solid var(--danger)' : undefined }} /></div>
              <div className="form-group" style={{ marginBottom: 24 }}><label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>持仓成本价 <span style={{ color: 'var(--danger)' }}>*</span></label><input type="number" step="any" className={`input ${!cost ? 'error' : ''}`} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="请输入持仓成本价" style={{ width: '100%', border: !cost ? '1px solid var(--danger)' : undefined }} /></div>
            </>
          )}
          <div className="row" style={{ gap: 12 }}>
            <button type="button" className="button secondary" onClick={onClose} style={{ flex: 1 }}>取消</button>
            <button type="submit" className="button" disabled={!isValid} style={{ flex: 1, opacity: isValid ? 1 : 0.6 }}>保存</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// 辅助模态框组件
function AddResultModal({ failures, onClose }) { return <motion.div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" onClick={(e) => e.stopPropagation()}><div className="title" style={{ marginBottom: 12 }}><span>部分添加失败</span></div><div className="list">{failures.map((it, idx) => <div className="item" key={idx}><span className="name">{it.name}</span><div className="values"><span className="badge">#{it.code}</span></div></div>)}</div><div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}><button className="button" onClick={onClose}>知道了</button></div></motion.div></motion.div>; }
function SuccessModal({ message, onClose }) { return <motion.div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" onClick={(e) => e.stopPropagation()}><div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}><div style={{ fontSize: '48px', marginBottom: 16 }}>🎉</div><h3 style={{ marginBottom: 8 }}>{message}</h3><button className="button" onClick={onClose} style={{ marginTop: 24, width: '100%' }}>关闭</button></div></motion.div></motion.div>; }
function CloudConfigModal({ onConfirm, onCancel, type = 'empty' }) { return null; }
function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = "确定删除" }) { return <motion.div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => { e.stopPropagation(); onCancel(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 10002 }}><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}><div className="title" style={{ marginBottom: 12 }}><TrashIcon width="20" height="20" className="danger" /><span>{title}</span></div><p className="muted" style={{ marginBottom: 24, fontSize: '14px', lineHeight: '1.6' }}>{message}</p><div className="row" style={{ gap: 12 }}><button className="button secondary" onClick={onCancel} style={{ flex: 1 }}>取消</button><button className="button danger" onClick={onConfirm} style={{ flex: 1 }}>{confirmText}</button></div></motion.div></motion.div>; }
function GroupManageModal({ groups, onClose, onSave }) { const [items, setItems] = useState(groups); const [deleteConfirm, setDeleteConfirm] = useState(null); const handleReorder = (newOrder) => setItems(newOrder); const handleRename = (id, newName) => setItems(prev => prev.map(item => item.id === id ? { ...item, name: newName.slice(0, 8) } : item)); const handleDeleteClick = (id, name) => { const itemToDelete = items.find(it => it.id === id); const isNew = !groups.find(g => g.id === id); const isEmpty = itemToDelete && (!itemToDelete.codes || itemToDelete.codes.length === 0); if (isNew || isEmpty) { setItems(prev => prev.filter(item => item.id !== id)); } else { setDeleteConfirm({ id, name }); } }; const handleConfirmDelete = () => { if (deleteConfirm) { setItems(prev => prev.filter(item => item.id !== deleteConfirm.id)); setDeleteConfirm(null); } }; const handleAddRow = () => setItems(prev => [...prev, { id: `group_${nowInTz().valueOf()}`, name: '', codes: [] }]); const handleConfirm = () => { if (items.some(it => !it.name.trim())) return; onSave(items); onClose(); }; const isAllValid = items.every(it => it.name.trim() !== ''); return <motion.div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" style={{ maxWidth: '500px', width: '90vw' }} onClick={(e) => e.stopPropagation()}><div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><SettingsIcon width="20" height="20" /><span>管理分组</span></div><button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button></div><div className="group-manage-list-container" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>{items.length === 0 ? <div className="empty-state muted" style={{ textAlign: 'center', padding: '40px 0' }}><p>暂无自定义分组</p></div> : <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="group-manage-list"><AnimatePresence mode="popLayout">{items.map((item) => (<Reorder.Item key={item.id} value={item} className="group-manage-item glass" layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}><div className="drag-handle" style={{ cursor: 'grab', display: 'flex', alignItems: 'center', padding: '0 8px' }}><DragIcon width="18" height="18" className="muted" /></div><input className={`input group-rename-input ${!item.name.trim() ? 'error' : ''}`} value={item.name} onChange={(e) => handleRename(item.id, e.target.value)} placeholder="请输入分组名称..." style={{ flex: 1, height: '36px', background: 'rgba(0,0,0,0.05)', border: !item.name.trim() ? '1px solid var(--danger)' : 'none' }} /><button className="icon-button danger" onClick={() => handleDeleteClick(item.id, item.name)} style={{ width: '36px', height: '36px', flexShrink: 0 }}><TrashIcon width="16" height="16" /></button></Reorder.Item>))}</AnimatePresence></Reorder.Group>}<button className="add-group-row-btn" onClick={handleAddRow} style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: '12px', border: '1px dashed var(--border)', background: 'rgba(127,127,127,0.05)', color: 'var(--muted)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}><PlusIcon width="16" height="16" /><span>新增分组</span></button></div><div style={{ marginTop: 24 }}><button className="button" onClick={handleConfirm} disabled={!isAllValid} style={{ width: '100%', opacity: isAllValid ? 1 : 0.6 }}>完成</button></div></motion.div><AnimatePresence>{deleteConfirm && <ConfirmModal title="删除确认" message={`确定要删除分组 "${deleteConfirm.name}" 吗？`} onConfirm={handleConfirmDelete} onCancel={() => setDeleteConfirm(null)} />}</AnimatePresence></motion.div>; }
function AddFundToGroupModal({ allFunds, currentGroupCodes, onClose, onAdd }) { const [selected, setSelected] = useState(new Set()); const availableFunds = (allFunds || []).filter(f => !(currentGroupCodes || []).includes(f.code)); const toggleSelect = (code) => setSelected(prev => { const next = new Set(prev); if (next.has(code)) next.delete(code); else next.add(code); return next; }); return <motion.div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" style={{ maxWidth: '500px', width: '90vw' }} onClick={(e) => e.stopPropagation()}><div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><PlusIcon width="20" height="20" /><span>添加基金到分组</span></div><button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button></div><div className="group-manage-list-container" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>{availableFunds.length === 0 ? <div className="empty-state muted" style={{ textAlign: 'center', padding: '40px 0' }}><p>所有基金已在该分组中</p></div> : <div className="group-manage-list">{availableFunds.map((fund) => (<div key={fund.code} className={`group-manage-item glass ${selected.has(fund.code) ? 'selected' : ''}`} onClick={() => toggleSelect(fund.code)} style={{ cursor: 'pointer' }}><div className="checkbox" style={{ marginRight: 12 }}>{selected.has(fund.code) && <div className="checked-mark" />}</div><div className="fund-info" style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{fund.name}</div><div className="muted" style={{ fontSize: '12px' }}>#{fund.code}</div></div></div>))}</div>}</div><div className="row" style={{ marginTop: 24, gap: 12 }}><button className="button secondary" onClick={onClose} style={{ flex: 1 }}>取消</button><button className="button" onClick={() => onAdd(Array.from(selected))} disabled={selected.size === 0} style={{ flex: 1 }}>确定 ({selected.size})</button></div></motion.div></motion.div>; }
function GroupModal({ onClose, onConfirm }) { const [name, setName] = useState(''); return <motion.div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}><div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><PlusIcon width="20" height="20" /><span>新增分组</span></div><button className="icon-button" onClick={onClose} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button></div><div className="form-group" style={{ marginBottom: 20 }}><label className="muted" style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>分组名称</label><input className="input" autoFocus placeholder="最多8个字" value={name} onChange={(e) => setName(e.target.value.slice(0, 8))} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim()); }} /></div><div className="row" style={{ gap: 12 }}><button className="button secondary" onClick={onClose} style={{ flex: 1 }}>取消</button><button className="button" onClick={() => name.trim() && onConfirm(name.trim())} disabled={!name.trim()} style={{ flex: 1 }}>确定</button></div></motion.div></motion.div>; }

// 数字滚动组件
function CountUp({ value, prefix = '', suffix = '', decimals = 2, className = '', style = {} }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current === value) return;
    const start = previousValue.current;
    const end = value;
    const duration = 600; 
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * ease;
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
      else previousValue.current = value;
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span className={className} style={style}>{prefix}{Math.abs(displayValue).toFixed(decimals)}{suffix}</span>;
}

function GroupSummary({ funds, holdings, groupName, getProfit, onClearFavorites, onClearAll }) {
  const [showPercent, setShowPercent] = useState(true);
  
  const summary = useMemo(() => {
    let totalAsset = 0;
    let totalProfitToday = 0;
    let totalHoldingReturn = 0;
    let totalCost = 0;
    let hasHolding = false;

    funds.forEach(fund => {
      const holding = holdings[fund.code];
      const profit = getProfit(fund, holding);
      if (profit) {
        hasHolding = true;
        totalAsset += profit.amount;
        totalProfitToday += profit.profitToday;
        if (profit.profitTotal !== null) {
          totalHoldingReturn += profit.profitTotal;
          if (holding && typeof holding.cost === 'number' && typeof holding.share === 'number') {
            totalCost += holding.cost * holding.share;
          }
        }
      }
    });
    const returnRate = totalCost > 0 ? (totalHoldingReturn / totalCost) * 100 : 0;
    return { totalAsset, totalProfitToday, totalHoldingReturn, hasHolding, returnRate };
  }, [funds, holdings, getProfit]);

  return (
    <div className="glass card" style={{ marginBottom: 16, padding: '16px 20px', background: 'var(--glass-bg)' }}>
      <div className="row" style={{ alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="muted" style={{ fontSize: '12px', marginBottom: 4 }}>{groupName}</div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            <span style={{ fontSize: '16px', marginRight: 2 }}>¥</span>
            <CountUp value={summary.totalAsset} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="muted" style={{ fontSize: '12px', marginBottom: 4 }}>当日收益</div>
            <div
              className={summary.totalProfitToday > 0 ? 'up' : summary.totalProfitToday < 0 ? 'down' : ''}
              style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            >
              <span style={{ marginRight: 1 }}>{summary.totalProfitToday > 0 ? '+' : summary.totalProfitToday < 0 ? '-' : ''}</span>
              <CountUp value={Math.abs(summary.totalProfitToday)} />
            </div>
          </div>
          
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 0 }}>
             <div className="muted" style={{ fontSize: '12px', marginBottom: 4 }}>持有收益{showPercent ? '(%)' : ''}</div>
             <div
              className={summary.totalHoldingReturn > 0 ? 'up' : summary.totalHoldingReturn < 0 ? 'down' : ''}
              style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              onClick={() => setShowPercent(!showPercent)}
            >
              <span style={{ marginRight: 1 }}>{summary.totalHoldingReturn > 0 ? '+' : summary.totalHoldingReturn < 0 ? '-' : ''}</span>
              {showPercent ? (
                <CountUp value={Math.abs(summary.returnRate)} suffix="%" />
              ) : (
                <CountUp value={Math.abs(summary.totalHoldingReturn)} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
             <button
               className="button secondary"
               onClick={onClearFavorites}
               title="清空自选基金"
               style={{ fontSize: '12px', padding: '6px 12px', height: 'auto', color: 'var(--muted)' }}
             >
               清空自选
             </button>
             <button
               className="button secondary"
               onClick={onClearAll}
               title="清空所有基金"
               style={{ fontSize: '12px', padding: '6px 12px', height: 'auto', color: 'var(--danger)', borderColor: 'rgba(248, 113, 113, 0.3)' }}
             >
               清空全部
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const refreshingRef = useRef(false);

  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);

  const [refreshing, setRefreshing] = useState(false);
  const [collapsedCodes, setCollapsedCodes] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());
  const [groups, setGroups] = useState([]); 
  const [currentTab, setCurrentTab] = useState('all');
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupManageOpen, setGroupManageOpen] = useState(false);
  const [addFundToGroupOpen, setAddFundToGroupOpen] = useState(false);

  const [sortBy, setSortBy] = useState('yield'); 
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [viewMode, setViewMode] = useState('list'); 

  const user = null; 
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackNonce, setFeedbackNonce] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addResultOpen, setAddResultOpen] = useState(false);
  const [addFailures, setAddFailures] = useState([]);
  const [holdingModal, setHoldingModal] = useState({ open: false, fund: null });
  const [actionModal, setActionModal] = useState({ open: false, fund: null });
  const [tradeModal, setTradeModal] = useState({ open: false, fund: null, type: 'buy' }); 
  const [clearConfirm, setClearConfirm] = useState(null); 
  const [donateOpen, setDonateOpen] = useState(false);
  const [holdings, setHoldings] = useState({}); 
  const [pendingTrades, setPendingTrades] = useState([]); 
  const [percentModes, setPercentModes] = useState({}); 
  
  const holdingsRef = useRef(holdings);
  const pendingTradesRef = useRef(pendingTrades);

  const [clearFavConfirmOpen, setClearFavConfirmOpen] = useState(false);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);

  useEffect(() => {
    holdingsRef.current = holdings;
    pendingTradesRef.current = pendingTrades;
  }, [holdings, pendingTrades]);

  const [isTradingDay, setIsTradingDay] = useState(true); 
  const tabsRef = useRef(null);
  const [fundDeleteConfirm, setFundDeleteConfirm] = useState(null); 

  const todayStr = formatDate();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth <= 640);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      
    };

    checkUpdate();
    const interval = setInterval(checkUpdate, 10 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  const checkTradingDay = async () => {
    const now = nowInTz();
    const isWeekend = now.day() === 0 || now.day() === 6;
    if (isWeekend) {
      setIsTradingDay(false);
      return;
    }
    try {
      const dateStr = await fetchShanghaiIndexDate();
      if (!dateStr) {
        setIsTradingDay(!isWeekend);
        return;
      }
      const currentStr = todayStr.replace(/-/g, '');
      if (dateStr === currentStr) {
        setIsTradingDay(true);
      } else {
        const minutes = now.hour() * 60 + now.minute();
        if (minutes >= 9 * 60 + 30) {
          setIsTradingDay(false);
        } else {
          setIsTradingDay(true);
        }
      }
    } catch (e) {
      setIsTradingDay(!isWeekend);
    }
  };

  useEffect(() => {
    checkTradingDay();
    const timer = setInterval(checkTradingDay, 60000);
    return () => clearInterval(timer);
  }, []);

  const getHoldingProfit = (fund, holding) => {
    if (!holding || typeof holding.share !== 'number') return null;

    const now = nowInTz();
    const isAfter9 = now.hour() >= 9;
    const hasTodayData = fund.jzrq === todayStr;
    const canCalcTodayProfit = hasTodayData || (typeof fund.gztime === 'string' && fund.gztime.startsWith(todayStr));
    const useValuation = isTradingDay && isAfter9 && !hasTodayData;

    let currentNav;
    let profitToday;

    if (!useValuation) {
      currentNav = Number(fund.dwjz);
      if (!currentNav) return null;
      if (canCalcTodayProfit) {
        const amount = holding.share * currentNav;
        const rate = fund.zzl !== undefined ? Number(fund.zzl) : (Number(fund.gszzl) || 0);
        profitToday = amount - (amount / (1 + rate / 100));
      } else {
        profitToday = null;
      }
    } else {
      currentNav = fund.estPricedCoverage > 0.05
        ? fund.estGsz
        : (typeof fund.gsz === 'number' ? fund.gsz : Number(fund.dwjz));
      if (!currentNav) return null;
      if (canCalcTodayProfit) {
        const amount = holding.share * currentNav;
        const gzChange = fund.estPricedCoverage > 0.05 ? fund.estGszzl : (Number(fund.gszzl) || 0);
        profitToday = amount - (amount / (1 + gzChange / 100));
      } else {
        profitToday = null;
      }
    }
    const amount = holding.share * currentNav;
    const profitTotal = typeof holding.cost === 'number'
      ? (currentNav - holding.cost) * holding.share
      : null;

    return { amount, profitToday, profitTotal };
  };

  const displayFunds = funds
    .filter(f => {
      if (currentTab === 'all') return true;
      if (currentTab === 'fav') return favorites.has(f.code);
      const group = groups.find(g => g.id === currentTab);
      return group ? group.codes.includes(f.code) : true;
    })
    .sort((a, b) => {
      if (sortBy === 'yield') {
        const valA = typeof a.estGszzl === 'number' ? a.estGszzl : (Number(a.gszzl) || 0);
        const valB = typeof b.estGszzl === 'number' ? b.estGszzl : (Number(b.gszzl) || 0);
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortBy === 'holding') {
        const pa = getHoldingProfit(a, holdings[a.code]);
        const pb = getHoldingProfit(b, holdings[b.code]);
        const valA = pa?.profitTotal ?? Number.NEGATIVE_INFINITY;
        const valB = pb?.profitTotal ?? Number.NEGATIVE_INFINITY;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name, 'zh-CN') : b.name.localeCompare(a.name, 'zh-CN');
      }
      return 0;
    });

  useEffect(() => {
    if (!tabsRef.current) return;
    if (currentTab === 'all') {
      tabsRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    const activeTab = tabsRef.current.querySelector('.tab.active');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentTab]);

  const [isDragging, setIsDragging] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const storageHelper = useMemo(() => {
    return {
      setItem: (key, value) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        window.localStorage.removeItem(key);
      },
      getItem: (key) => {
        return window.localStorage.getItem(key);
      },
      clear: () => {
        window.localStorage.clear();
      }
    };
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
        if (!e.key) return; 
        if (e.key === 'funds') setFunds(JSON.parse(e.newValue || '[]'));
        if (e.key === 'favorites') setFavorites(new Set(JSON.parse(e.newValue || '[]')));
        if (e.key === 'groups') setGroups(JSON.parse(e.newValue || '[]'));
        if (e.key === 'holdings') setHoldings(JSON.parse(e.newValue || '{}'));
        if (e.key === 'pendingTrades') setPendingTrades(JSON.parse(e.newValue || '[]'));
        if (e.key === 'refreshMs') setRefreshMs(parseInt(e.newValue || '30000', 10));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleSaveHolding = (code, data) => {
    const currentLS = JSON.parse(storageHelper.getItem('holdings') || '{}');
    const next = { ...currentLS };
    
    if (data.share === null && data.cost === null) {
      delete next[code];
    } else {
      next[code] = data;
    }
    
    storageHelper.setItem('holdings', JSON.stringify(next));
    setHoldings(next); 
    setHoldingModal({ open: false, fund: null });
  };

  const handleAction = (type, fund) => {
    setActionModal({ open: false, fund: null });
    if (type === 'edit') {
      setHoldingModal({ open: true, fund });
    } else if (type === 'clear') {
      setClearConfirm({ fund });
    } else if (type === 'buy' || type === 'sell') {
      setTradeModal({ open: true, fund, type });
    }
  };

  const handleClearConfirm = () => {
    if (clearConfirm?.fund) {
      handleSaveHolding(clearConfirm.fund.code, { share: null, cost: null });
    }
    setClearConfirm(null);
  };

  const processPendingQueue = async () => {
    const currentPending = pendingTradesRef.current;
    if (currentPending.length === 0) return;

    let stateChanged = false;
    let tempHoldings = JSON.parse(storageHelper.getItem('holdings') || '{}'); 
    const processedIds = new Set();

    for (const trade of currentPending) {
       let queryDate = trade.date;
       if (trade.isAfter3pm) queryDate = toTz(trade.date).add(1, 'day').format('YYYY-MM-DD');
       const result = await fetchSmartFundNetValue(trade.fundCode, queryDate);

       if (result && result.value > 0) {
           const current = tempHoldings[trade.fundCode] || { share: 0, cost: 0 };
           let newShare, newCost;
           if (trade.type === 'buy') {
             const feeRate = trade.feeRate || 0;
             const netAmount = trade.amount / (1 + feeRate / 100);
             const share = netAmount / result.value;
             newShare = current.share + share;
             const buyCost = trade.amount; 
             newCost = (current.cost * current.share + buyCost) / newShare;
           } else {
             newShare = Math.max(0, current.share - trade.share);
             newCost = current.cost;
             if (newShare === 0) newCost = 0;
           }
           tempHoldings[trade.fundCode] = { share: newShare, cost: newCost };
           stateChanged = true;
           processedIds.add(trade.id);
       }
    }

    if (stateChanged) {
      storageHelper.setItem('holdings', JSON.stringify(tempHoldings));
      setHoldings(tempHoldings);
      
      const nextPending = currentPending.filter(t => !processedIds.has(t.id));
      setPendingTrades(nextPending);
      storageHelper.setItem('pendingTrades', JSON.stringify(nextPending));
      
      showToast(`已处理 ${processedIds.size} 笔待定交易`, 'success');
    }
  };

  const handleTrade = (fund, data) => {
    if (!data.price || data.price === 0) {
        const pendingLS = JSON.parse(storageHelper.getItem('pendingTrades') || '[]');
        const pending = {
            id: crypto.randomUUID(),
            fundCode: fund.code,
            fundName: fund.name,
            type: tradeModal.type,
            share: data.share,
            amount: data.totalCost,
            feeRate: tradeModal.type === 'buy' ? data.feeRate : 0,
            feeMode: data.feeMode,
            feeValue: data.feeValue,
            date: data.date,
            isAfter3pm: data.isAfter3pm,
            timestamp: Date.now()
        };
        const next = [...pendingLS, pending];
        storageHelper.setItem('pendingTrades', JSON.stringify(next));
        setPendingTrades(next);
        setTradeModal({ open: false, fund: null, type: 'buy' });
        showToast('净值暂未更新，已加入待处理队列', 'info');
        return;
    }

    const holdingsLS = JSON.parse(storageHelper.getItem('holdings') || '{}');
    const current = holdingsLS[fund.code] || { share: 0, cost: 0 };
    const isBuy = tradeModal.type === 'buy';
    let newShare, newCost;

    if (isBuy) {
      newShare = current.share + data.share;
      const buyCost = data.totalCost !== undefined ? data.totalCost : (data.price * data.share);
      newCost = (current.cost * current.share + buyCost) / newShare;
    } else {
      newShare = Math.max(0, current.share - data.share);
      newCost = current.cost;
      if (newShare === 0) newCost = 0;
    }

    holdingsLS[fund.code] = { share: newShare, cost: newCost };
    storageHelper.setItem('holdings', JSON.stringify(holdingsLS));
    setHoldings(holdingsLS);
    setTradeModal({ open: false, fund: null, type: 'buy' });
  };

  const handleMouseDown = (e) => { if (tabsRef.current) setIsDragging(true); };
  const handleMouseLeaveOrUp = () => { setIsDragging(false); };
  const handleMouseMove = (e) => { if (!isDragging || !tabsRef.current) return; e.preventDefault(); tabsRef.current.scrollLeft -= e.movementX; };
  const handleWheel = (e) => { if (tabsRef.current) { const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; tabsRef.current.scrollLeft += delta; } };
  const updateTabOverflow = () => { if (!tabsRef.current) return; const el = tabsRef.current; setCanLeft(el.scrollLeft > 0); setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1); };
  useEffect(() => { updateTabOverflow(); window.addEventListener('resize', updateTabOverflow); return () => window.removeEventListener('resize', updateTabOverflow); }, [groups, funds.length, favorites.size]);

  const [successModal, setSuccessModal] = useState({ open: false, message: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const toastTimeoutRef = useRef(null);
  const showToast = (message, type = 'info') => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); setToast({ show: true, message, type }); toastTimeoutRef.current = setTimeout(() => { setToast((prev) => ({ ...prev, show: false })); }, 3000); };

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { setShowDropdown(false); } };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = (code) => {
    const currentFavs = new Set(JSON.parse(storageHelper.getItem('favorites') || '[]'));
    if (currentFavs.has(code)) currentFavs.delete(code);
    else currentFavs.add(code);
    
    const nextArr = Array.from(currentFavs);
    storageHelper.setItem('favorites', JSON.stringify(nextArr));
    setFavorites(currentFavs);
    if (currentFavs.size === 0 && currentTab === 'fav') setCurrentTab('all');
  };

  const toggleCollapse = (code) => {
    const currentCollapsed = new Set(JSON.parse(storageHelper.getItem('collapsedCodes') || '[]'));
    if (currentCollapsed.has(code)) currentCollapsed.delete(code);
    else currentCollapsed.add(code);
    
    storageHelper.setItem('collapsedCodes', JSON.stringify(Array.from(currentCollapsed)));
    setCollapsedCodes(currentCollapsed);
  };

  const removeFundFromCurrentGroup = (code) => {
    const group = groups.find(g => g.id === currentTab);
    if (!group) return;
    const newCodes = group.codes.filter(c => c !== code);
    const newGroups = groups.map(g => g.id === group.id ? { ...g, codes: newCodes } : g);
    setGroups(newGroups);
    storageHelper.setItem('groups', JSON.stringify(newGroups));
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
        const codes = Array.from(new Set(deduped.map((f) => f.code)));
        if (codes.length) refreshAll(codes);
      }

      const savedHoldings = JSON.parse(localStorage.getItem('holdings') || '{}');
      setHoldings(savedHoldings);
      
      const savedFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(new Set(savedFavs));

      const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
      setGroups(savedGroups);

    } catch { }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const codes = Array.from(new Set(funds.map((f) => f.code)));
      if (codes.length) refreshAll(codes);
    }, refreshMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [funds, refreshMs]);

  const performSearch = async (val) => {
    if (!val.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try { const fundsOnly = await searchFunds(val); setSearchResults(fundsOnly); } 
    catch (e) { console.error('搜索失败', e); } 
    finally { setIsSearching(false); }
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
      if (exists) return prev.filter(f => f.CODE !== fund.CODE);
      return [...prev, fund];
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
          updated.push(data);
        } catch (e) {
          const currentFunds = JSON.parse(storageHelper.getItem('funds') || '[]');
          const old = currentFunds.find((f) => f.code === c);
          if (old) updated.push(old);
        }
      }

      if (updated.length > 0) {
        const currentLS = JSON.parse(storageHelper.getItem('funds') || '[]');
        const merged = [...currentLS];
        
        updated.forEach(u => {
          const idx = merged.findIndex(f => f.code === u.code);
          if (idx > -1) {
            merged[idx] = u; 
          } 
        });
        
        const deduped = dedupeByCode(merged);
        storageHelper.setItem('funds', JSON.stringify(deduped));
        setFunds(deduped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
      processPendingQueue().catch(() => {});
    }
  };

  const requestRemoveFund = (fund) => {
    const h = holdings[fund.code];
    const hasHolding = h && typeof h.share === 'number' && h.share > 0;
    if (hasHolding) {
      setFundDeleteConfirm({ code: fund.code, name: fund.name });
    } else {
      removeFund(fund.code);
    }
  };

  const addFund = async (e) => {
    e?.preventDefault?.();
    setError('');
    const manualTokens = String(searchTerm || '').split(/[^0-9A-Za-z]+/).map(t => t.trim()).filter(t => t.length > 0);
    const selectedCodes = Array.from(new Set([...selectedFunds.map(f => f.CODE), ...manualTokens.filter(t => /^\d{6}$/.test(t))]));
    if (selectedCodes.length === 0) { setError('请输入或选择基金代码'); return; }
    
    setLoading(true);
    try {
      const newFunds = [];
      const failures = [];
      
      const currentLS = JSON.parse(storageHelper.getItem('funds') || '[]');

      for (const c of selectedCodes) {
        if (currentLS.some((f) => f.code === c)) continue; 
        try {
          const data = await fetchFundData(c);
          newFunds.push(data);
        } catch (err) {
          failures.push({ code: c, name: c }); 
        }
      }
      
      if (newFunds.length > 0) {
        const next = dedupeByCode([...currentLS, ...newFunds]); 
        storageHelper.setItem('funds', JSON.stringify(next));
        setFunds(next);
      } else if (failures.length === selectedCodes.length) {
          setError('未添加任何新基金或添加失败');
      }

      setSearchTerm('');
      setSelectedFunds([]);
      setShowDropdown(false);
      if (failures.length > 0) {
        setAddFailures(failures);
        setAddResultOpen(true);
      }
    } catch (e) {
      setError(e.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const removeFund = (removeCode) => {
    const currentFunds = JSON.parse(storageHelper.getItem('funds') || '[]');
    const nextFunds = currentFunds.filter((f) => f.code !== removeCode);
    storageHelper.setItem('funds', JSON.stringify(nextFunds));
    setFunds(nextFunds);

    const currentGroups = JSON.parse(storageHelper.getItem('groups') || '[]');
    const nextGroups = currentGroups.map(g => ({ ...g, codes: g.codes.filter(c => c !== removeCode) }));
    storageHelper.setItem('groups', JSON.stringify(nextGroups));
    setGroups(nextGroups);

    const currentFavs = new Set(JSON.parse(storageHelper.getItem('favorites') || '[]'));
    if (currentFavs.has(removeCode)) {
        currentFavs.delete(removeCode);
        storageHelper.setItem('favorites', JSON.stringify(Array.from(currentFavs)));
        setFavorites(currentFavs);
    }
    
    const currentHoldings = JSON.parse(storageHelper.getItem('holdings') || '{}');
    if (currentHoldings[removeCode]) {
        delete currentHoldings[removeCode];
        storageHelper.setItem('holdings', JSON.stringify(currentHoldings));
        setHoldings(currentHoldings);
    }
  };

  const handleClearFavorites = () => {
    setFavorites(new Set());
    storageHelper.setItem('favorites', '[]');
    setClearFavConfirmOpen(false);
    showToast('已清空自选基金', 'success');
  };

  const handleClearAll = () => {
    storageHelper.clear(); 
    setFunds([]);
    setFavorites(new Set());
    setGroups([]);
    setHoldings({});
    setPendingTrades([]);
    storageHelper.setItem('refreshMs', '30000');
    setClearAllConfirmOpen(false);
    showToast('已清空所有数据', 'success');
  };

  const manualRefresh = async () => {
    if (refreshingRef.current) return;
    const codes = Array.from(new Set(funds.map((f) => f.code)));
    if (!codes.length) return;
    await refreshAll(codes);
  };
  const saveSettings = (e) => { e?.preventDefault?.(); const ms = Math.max(10, Number(tempSeconds)) * 1000; setRefreshMs(ms); storageHelper.setItem('refreshMs', String(ms)); setSettingsOpen(false); };

  const getGroupName = () => {
    if (currentTab === 'all') return '全部资产';
    if (currentTab === 'fav') return '自选资产';
    const group = groups.find(g => g.id === currentTab);
    return group ? `${group.name}资产` : '分组资产';
  };
  
  useEffect(() => { const isAnyModalOpen = settingsOpen || feedbackOpen || addResultOpen || addFundToGroupOpen || groupManageOpen || groupModalOpen || successModal.open || holdingModal.open || actionModal.open || tradeModal.open || !!clearConfirm || donateOpen || !!fundDeleteConfirm || updateModalOpen || clearFavConfirmOpen || clearAllConfirmOpen; if (isAnyModalOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; } return () => { document.body.style.overflow = ''; }; }, [settingsOpen, feedbackOpen, addResultOpen, addFundToGroupOpen, groupManageOpen, groupModalOpen, successModal.open, holdingModal.open, actionModal.open, tradeModal.open, clearConfirm, donateOpen, updateModalOpen, clearFavConfirmOpen, clearAllConfirmOpen]);

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
          <span>基估宝</span>
        </div>
        <div className="actions">
          {hasUpdate && (
            <div className="badge" title={`发现新版本 ${latestVersion}`} style={{ cursor: 'pointer', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => setUpdateModalOpen(true)}>
              <UpdateIcon width="14" height="14" />
            </div>
          )}
          
          <button className="icon-button" onClick={toggleTheme} title={theme === 'light' ? "切换深色模式" : "切换浅色模式"}>
             {theme === 'light' ? <MoonIcon width="18" height="18" /> : <SunIcon width="18" height="18" />}
          </button>

          <button className="icon-button" onClick={manualRefresh} disabled={refreshing || funds.length === 0} aria-busy={refreshing} title="立即刷新">
            <RefreshIcon className={refreshing ? 'spin' : ''} width="18" height="18" />
          </button>
          
          <button className="icon-button" onClick={() => setSettingsOpen(true)} title="设置">
            <SettingsIcon width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 glass card add-fund-section" role="region" aria-label="添加基金">
           <div className="title" style={{ marginBottom: 12 }}><PlusIcon width="20" height="20" /><span>添加基金</span><span className="muted">搜索并选择基金（支持名称或代码）</span></div>
           <div className="search-container" ref={dropdownRef}>
            <form className="form" onSubmit={addFund}>
              <div className="search-input-wrapper" style={{ flex: 1, gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedFunds.length > 0 && (
                  <div className="selected-inline-chips">{selectedFunds.map(fund => (<div key={fund.CODE} className="fund-chip"><span>{fund.NAME}</span><button onClick={() => toggleSelectFund(fund)} className="remove-chip"><CloseIcon width="14" height="14" /></button></div>))}</div>
                )}
                <input className="input" placeholder="搜索基金名称或代码..." value={searchTerm} onChange={handleSearchInput} onFocus={() => setShowDropdown(true)} />
                {isSearching && <div className="search-spinner" />}
              </div>
              <button className="button" type="submit" disabled={loading || refreshing} style={{pointerEvents: refreshing ? 'none' : 'auto', opacity: refreshing ? 0.6 : 1}}>{loading ? '添加中…' : '添加'}</button>
            </form>
            <AnimatePresence>
              {showDropdown && (searchTerm.trim() || searchResults.length > 0) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="search-dropdown glass">
                  {searchResults.length > 0 ? (<div className="search-results">{searchResults.map((fund) => { const isSelected = selectedFunds.some(f => f.CODE === fund.CODE); const isAlreadyAdded = funds.some(f => f.code === fund.CODE); return (<div key={fund.CODE} className={`search-item ${isSelected ? 'selected' : ''} ${isAlreadyAdded ? 'added' : ''}`} onClick={() => { if (isAlreadyAdded) return; toggleSelectFund(fund); }}><div className="fund-info"><span className="fund-name">{fund.NAME}</span><span className="fund-code muted">#{fund.CODE} | {fund.TYPE}</span></div>{isAlreadyAdded ? (<span className="added-label">已添加</span>) : (<div className="checkbox">{isSelected && <div className="checked-mark" />}</div>)}</div>); })}</div>) : searchTerm.trim() && !isSearching ? (<div className="no-results muted">未找到相关基金</div>) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {error && <div className="muted" style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</div>}
        </div>

        <div className="col-12">
          <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div className="tabs-container">
              <div className="tabs-scroll-area" data-mask-left={canLeft} data-mask-right={canRight}>
                <div className="tabs" ref={tabsRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeaveOrUp} onMouseUp={handleMouseLeaveOrUp} onMouseMove={handleMouseMove} onWheel={handleWheel} onScroll={updateTabOverflow}>
                  <AnimatePresence mode="popLayout">
                    <motion.button layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key="all" className={`tab ${currentTab === 'all' ? 'active' : ''}`} onClick={() => setCurrentTab('all')} transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}>全部 ({funds.length})</motion.button>
                    <motion.button layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key="fav" className={`tab ${currentTab === 'fav' ? 'active' : ''}`} onClick={() => setCurrentTab('fav')} transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}>自选 ({favorites.size})</motion.button>
                    {groups.map(g => (
                      <motion.button layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={g.id} className={`tab ${currentTab === g.id ? 'active' : ''}`} onClick={() => setCurrentTab(g.id)} transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}>{g.name} ({g.codes.length})</motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              {groups.length > 0 && <button className="icon-button manage-groups-btn" onClick={() => setGroupManageOpen(true)} title="管理分组"><SortIcon width="16" height="16" /></button>}
              <button className="icon-button add-group-btn" onClick={() => setGroupModalOpen(true)} title="新增分组"><PlusIcon width="16" height="16" /></button>
            </div>

            <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="view-toggle" style={{ display: 'flex', background: 'rgba(127,127,127,0.05)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border)' }}>
                <button className={`icon-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => { setViewMode('list'); }} style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--muted)' }} title="表格视图"><ListIcon width="16" height="16" /></button>
                <button className={`icon-button ${viewMode === 'card' ? 'active' : ''}`} onClick={() => { setViewMode('card'); }} style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'card' ? 'var(--primary)' : 'transparent', color: viewMode === 'card' ? '#fff' : 'var(--muted)' }} title="卡片视图"><GridIcon width="16" height="16" /></button>
              </div>
              <div className="divider" style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
              <div className="sort-items" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}><SortIcon width="14" height="14" />排序</span>
                <div className="chips">
                  {[{ id: 'default', label: '默认' }, { id: 'yield', label: '涨跌幅' }, { id: 'holding', label: '持有收益' }, { id: 'name', label: '名称' }].map((s) => (
                    <button key={s.id} className={`chip ${sortBy === s.id ? 'active' : ''}`} onClick={() => { if (sortBy === s.id) { setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc')); } else { setSortBy(s.id); setSortOrder('desc'); } }} style={{ height: '28px', fontSize: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4 }}><span>{s.label}</span>{s.id !== 'default' && sortBy === s.id && (<span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1, fontSize: '8px' }}><span style={{ opacity: sortOrder === 'asc' ? 1 : 0.3 }}>▲</span><span style={{ opacity: sortOrder === 'desc' ? 1 : 0.3 }}>▼</span></span>)}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {displayFunds.length === 0 ? (
            <div className="glass card empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: 16, opacity: 0.5 }}>📂</div>
              <div className="muted" style={{ marginBottom: 20 }}>{funds.length === 0 ? '尚未添加基金' : '该分组下暂无数据'}</div>
              {currentTab !== 'all' && currentTab !== 'fav' && funds.length > 0 && <button className="button" onClick={() => setAddFundToGroupOpen(true)}>添加基金到此分组</button>}
            </div>
          ) : (
            <>
              <GroupSummary
                funds={displayFunds}
                holdings={holdings}
                groupName={getGroupName()}
                getProfit={getHoldingProfit}
                onClearFavorites={() => setClearFavConfirmOpen(true)}
                onClearAll={() => setClearAllConfirmOpen(true)}
              />

              {currentTab !== 'all' && currentTab !== 'fav' && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="button-dashed" onClick={() => setAddFundToGroupOpen(true)} style={{ width: '100%', height: '48px', border: '2px dashed rgba(127,127,127,0.1)', background: 'transparent', borderRadius: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '14px', fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'rgba(34, 211, 238, 0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(127,127,127,0.1)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; }}>
                  <PlusIcon width="18" height="18" /><span>添加基金到此分组</span>
                </motion.button>
              )}

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
                    {viewMode === 'list' && (
                      <div className="table-header-row">
                        <div className="table-header-cell">基金名称/涨跌幅</div>
                        <div className="table-header-cell text-right">净值/估值</div>
                        <div className="table-header-cell text-right">持仓金额</div>
                        <div className="table-header-cell text-right">当日盈亏</div>
                        <div className="table-header-cell text-right">持有收益</div>
                        <div className="table-header-cell text-center">操作</div>
                      </div>
                    )}
                    <AnimatePresence mode="popLayout">
                      {displayFunds.map((f) => {
                         const holding = holdings[f.code];
                         const profit = getHoldingProfit(f, holding);
                         const now = nowInTz();
                         const isAfter9 = now.hour() >= 9;
                         const hasTodayData = f.jzrq === todayStr;
                         const shouldHideChange = isTradingDay && isAfter9 && !hasTodayData;
                         
                         const timeDisplay = f.noValuation ? (f.jzrq || '-') : (f.gztime || f.time || '-');
                         
                         return (
                        <motion.div
                          layout="position"
                          key={f.code}
                          className={viewMode === 'card' ? 'col-6' : 'table-row-wrapper'}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          style={{ position: 'relative' }}
                        >
                          <motion.div
                            className={viewMode === 'card' ? 'glass card' : 'table-row'}
                            onClick={(e) => { }}
                            style={{
                              background: viewMode === 'list' ? 'transparent' : undefined,
                              position: 'relative',
                              zIndex: 1
                            }}
                          >
                            {viewMode === 'list' ? (
                              <>
                                <div className="table-cell name-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                      {currentTab !== 'all' && currentTab !== 'fav' ? (
                                        <button className="icon-button fav-button" onClick={(e) => { e.stopPropagation(); removeFundFromCurrentGroup(f.code); }} title="从当前分组移除"><ExitIcon width="18" height="18" style={{ transform: 'rotate(180deg)' }} /></button>
                                      ) : (
                                        <button className={`icon-button fav-button ${favorites.has(f.code) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(f.code); }} title={favorites.has(f.code) ? "取消自选" : "添加自选"}><StarIcon width="18" height="18" filled={favorites.has(f.code)} /></button>
                                      )}
                                      <div className="title-text" style={{ minWidth: 0, flex: 1 }}>
                                        <span className={`name-text ${f.jzrq === todayStr ? 'updated' : ''}`} title={f.jzrq === todayStr ? "今日净值已更新" : ""} style={{ fontSize: `${getAutoFontSize(f.name, 14, 11)}px` }}>{f.name}</span>
                                        <span className="muted code-text">#{f.code}</span>
                                      </div>
                                  </div>
                                  
                                  <div style={{ flexShrink: 0 }}>
                                    {(() => {
                                      const changeRate = !shouldHideChange ? (f.zzl !== undefined ? Number(f.zzl) : (Number(f.gszzl) || 0)) : (f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0));
                                      const val = changeRate;
                                      return (
                                        <span className={`badge ${val > 0 ? 'up' : val < 0 ? 'down' : ''}`} style={{ fontWeight: 700, minWidth: '60px', justifyContent: 'center' }}>
                                          {val !== undefined && val !== null ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '—'}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>

                                <div className="table-cell text-right value-cell">
                                  <span style={{ fontWeight: 700 }}>{!shouldHideChange ? (f.dwjz ?? '—') : (f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—'))}</span>
                                </div>

                                {(() => {
                                  if (profit === null || profit.amount === null) {
                                    return (
                                      <div className="table-cell text-right holding-amount-cell" title="设置持仓" onClick={(e) => { e.stopPropagation(); setHoldingModal({ open: true, fund: f }); }}>
                                        <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '12px', cursor: 'pointer' }}>未设置 <SettingsIcon width="12" height="12" /></span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="table-cell text-right holding-amount-cell" title="点击设置持仓" onClick={(e) => { e.stopPropagation(); setActionModal({ open: true, fund: f }); }}>
                                      <span style={{ fontWeight: 700, marginRight: 6, fontSize: `${getAutoFontSize('¥' + profit.amount.toFixed(2), 14, 11)}px` }}>¥{profit.amount.toFixed(2)}</span>
                                      <button className="icon-button" title="编辑持仓" style={{ border: 'none', width: '28px', height: '28px', marginLeft: -6 }}><SettingsIcon width="14" height="14" /></button>
                                    </div>
                                  );
                                })()}

                                <div className="table-cell text-right profit-cell" style={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
                                  {profit && profit.profitToday !== null ? (
                                    <span className={profit.profitToday > 0 ? 'up' : profit.profitToday < 0 ? 'down' : ''} style={{ fontWeight: 700 }}>
                                      {profit.profitToday > 0 ? '+' : profit.profitToday < 0 ? '-' : ''}¥{Math.abs(profit.profitToday).toFixed(2)}
                                    </span>
                                  ) : <span className="muted">-</span>}
                                  <span className="muted" style={{ fontSize: '10px', opacity: 0.8 }}>{timeDisplay}</span>
                                </div>

                                {(() => {
                                  const total = profit ? profit.profitTotal : null;
                                  const principal = holding && holding.cost && holding.share ? holding.cost * holding.share : 0;
                                  const asPercent = percentModes[f.code];
                                  const hasTotal = total !== null;
                                  const formatted = hasTotal ? (asPercent && principal > 0 ? `${total > 0 ? '+' : total < 0 ? '-' : ''}${Math.abs((total / principal) * 100).toFixed(2)}%` : `${total > 0 ? '+' : total < 0 ? '-' : ''}¥${Math.abs(total).toFixed(2)}`) : '';
                                  const cls = hasTotal ? (total > 0 ? 'up' : total < 0 ? 'down' : '') : 'muted';
                                  const fontSize = hasTotal ? getAutoFontSize(formatted, 14, 11) : 14;
                                  return (
                                    <div className="table-cell text-right holding-cell" title="点击切换金额/百分比" onClick={(e) => { e.stopPropagation(); if (hasTotal) { setPercentModes(prev => ({ ...prev, [f.code]: !prev[f.code] })); } }} style={{ cursor: hasTotal ? 'pointer' : 'default' }}>
                                      <span className={cls} style={{ fontWeight: 700, fontSize: `${fontSize}px` }}>{formatted}</span>
                                    </div>
                                  );
                                })()}

                                <div className="table-cell text-center action-cell" style={{ gap: 4 }}>
                                  <button className="icon-button danger" onClick={() => !refreshing && requestRemoveFund(f)} title="删除" disabled={refreshing} style={{ width: '28px', height: '28px', opacity: refreshing ? 0.6 : 1, cursor: refreshing ? 'not-allowed' : 'pointer' }}><TrashIcon width="14" height="14" /></button>
                                </div>
                              </>
                            ) : (
                                <>
                                  <div className="row" style={{ marginBottom: 10 }}>
                                     <div className="title">
                                        {currentTab !== 'all' && currentTab !== 'fav' ? (
                                           <button className="icon-button fav-button" onClick={(e) => { e.stopPropagation(); removeFundFromCurrentGroup(f.code); }} title="从当前分组移除"><ExitIcon width="18" height="18" style={{ transform: 'rotate(180deg)' }} /></button>
                                        ) : (
                                           <button className={`icon-button fav-button ${favorites.has(f.code) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(f.code); }} title={favorites.has(f.code) ? "取消自选" : "添加自选"}><StarIcon width="18" height="18" filled={favorites.has(f.code)} /></button>
                                        )}
                                        <div className="title-text">
                                           <span className={`name-text ${f.jzrq === todayStr ? 'updated' : ''}`} title={f.jzrq === todayStr ? "今日净值已更新" : ""} style={{ fontSize: `${getAutoFontSize(f.name, 16, 13)}px` }}>{f.name}</span>
                                           <span className="muted">#{f.code}</span>
                                        </div>
                                     </div>
                                     <div className="actions">
                                        <div className="badge-v"><span>{f.noValuation ? '净值日期' : '估值时间'}</span><strong>{f.noValuation ? (f.jzrq || '-') : (f.gztime || f.time || '-')}</strong></div>
                                        <div className="row" style={{ gap: 4 }}>
                                           <button className="icon-button danger" onClick={() => !refreshing && requestRemoveFund(f)} title="删除" disabled={refreshing} style={{ width: '28px', height: '28px', opacity: refreshing ? 0.6 : 1, cursor: refreshing ? 'not-allowed' : 'pointer' }}><TrashIcon width="14" height="14" /></button>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="row" style={{ marginBottom: 12 }}>
                                      <Stat label="单位净值" value={f.dwjz ?? '—'} />
                                      {(() => {
                                          const changeRate = !shouldHideChange ? (f.zzl !== undefined ? Number(f.zzl) : (Number(f.gszzl) || 0)) : (f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0));
                                          if (f.noValuation) return <Stat label="涨跌幅" value={f.zzl !== undefined && f.zzl !== null ? `${f.zzl > 0 ? '+' : ''}${Number(f.zzl).toFixed(2)}%` : '—'} delta={f.zzl} />;
                                          return (
                                            <>
                                              {!shouldHideChange && <Stat label="涨跌幅" value={f.zzl !== undefined ? `${f.zzl > 0 ? '+' : ''}${Number(f.zzl).toFixed(2)}%` : ''} delta={f.zzl} />}
                                              <Stat label="估值净值" value={f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—')} />
                                              <Stat label="估值涨跌幅" value={f.estPricedCoverage > 0.05 ? `${f.estGszzl > 0 ? '+' : ''}${f.estGszzl.toFixed(2)}%` : (typeof f.gszzl === 'number' ? `${f.gszzl > 0 ? '+' : ''}${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—')} delta={f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0)} />
                                            </>
                                          );
                                      })()}
                                  </div>
                                  <div className="row" style={{ marginBottom: 12 }}>
                                     {(() => {
                                        const holding = holdings[f.code];
                                        const profit = getHoldingProfit(f, holding);
                                        if (!profit) return (<div className="stat" style={{ flexDirection: 'column', gap: 4 }}><span className="label">持仓金额</span><div className="value muted" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => setHoldingModal({ open: true, fund: f })}>未设置 <SettingsIcon width="12" height="12" /></div></div>);
                                        return (
                                          <>
                                            <div className="stat" style={{ cursor: 'pointer', flexDirection: 'column', gap: 4 }} onClick={() => setActionModal({ open: true, fund: f })}>
                                                <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>持仓金额 <SettingsIcon width="12" height="12" style={{ opacity: 0.7 }} /></span>
                                                <span className="value" style={{ fontSize: `${getAutoFontSize('¥' + profit.amount.toFixed(2), 20, 16)}px` }}>¥{profit.amount.toFixed(2)}</span>
                                            </div>
                                            <div className="stat" style={{ flexDirection: 'column', gap: 4 }}><span className="label">当日盈亏</span><span className={`value ${profit.profitToday > 0 ? 'up' : profit.profitToday < 0 ? 'down' : ''}`}>{profit.profitToday > 0 ? '+' : profit.profitToday < 0 ? '-' : ''}¥{Math.abs(profit.profitToday).toFixed(2)}</span></div>
                                            {profit.profitTotal !== null && (
                                              <div className="stat" onClick={(e) => { e.stopPropagation(); setPercentModes(prev => ({ ...prev, [f.code]: !prev[f.code] })); }} style={{ cursor: 'pointer', flexDirection: 'column', gap: 4 }} title="点击切换金额/百分比"><span className="label">持有收益{percentModes[f.code] ? '(%)' : ''}</span><span className={`value ${profit.profitTotal > 0 ? 'up' : profit.profitTotal < 0 ? 'down' : ''}`}>{profit.profitTotal > 0 ? '+' : profit.profitTotal < 0 ? '-' : ''}{percentModes[f.code] ? `${Math.abs((holding.cost * holding.share) ? (profit.profitTotal / (holding.cost * holding.share)) * 100 : 0).toFixed(2)}%` : `¥${Math.abs(profit.profitTotal).toFixed(2)}`}</span></div>
                                            )}
                                          </>
                                        );
                                     })()}
                                  </div>
                                  <div style={{ marginBottom: 8, cursor: 'pointer', userSelect: 'none' }} className="title" onClick={() => toggleCollapse(f.code)}>
                                    <div className="row" style={{ width: '100%', flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>前10重仓股票</span><ChevronIcon width="16" height="16" className="muted" style={{ transform: collapsedCodes.has(f.code) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} /></div>
                                      <span className="muted">涨跌幅 / 占比</span>
                                    </div>
                                  </div>
                                  <AnimatePresence>
                                    {!collapsedCodes.has(f.code) && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                                        {Array.isArray(f.holdings) && f.holdings.length ? (<div className="list">{f.holdings.map((h, idx) => (<div className="item" key={idx}><span className="name">{h.name}</span><div className="values">{typeof h.change === 'number' && (<span className={`badge ${h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}`} style={{ marginRight: 8 }}>{h.change > 0 ? '+' : ''}{h.change.toFixed(2)}%</span>)}<span className="weight">{h.weight}</span></div></div>))}</div>) : (<div className="muted" style={{ padding: '8px 0' }}>暂无重仓数据</div>)}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </>
                            )}
                          </motion.div>
                        </motion.div>
                      );})}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {fundDeleteConfirm && (
          <ConfirmModal title="删除确认" message={`基金 "${fundDeleteConfirm.name}" 存在持仓记录。删除后将移除该基金及其持仓数据，是否继续？`} confirmText="确定删除" onConfirm={() => { removeFund(fundDeleteConfirm.code); setFundDeleteConfirm(null); }} onCancel={() => setFundDeleteConfirm(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {clearFavConfirmOpen && (
          <ConfirmModal title="清空自选确认" message="确定要清空所有自选基金吗？基金本身不会被删除，仅从自选列表中移除。" confirmText="确认清空" onConfirm={handleClearFavorites} onCancel={() => setClearFavConfirmOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {clearAllConfirmOpen && (
          <ConfirmModal title="清空所有数据确认" message="⚠️ 确定要清空所有基金、持仓、分组和设置吗？此操作不可恢复！" confirmText="彻底清空" onConfirm={handleClearAll} onCancel={() => setClearAllConfirmOpen(false)} />
        )}
      </AnimatePresence>

      <div className="footer">
        <p style={{ marginBottom: 8 }}>数据源：实时估值与重仓直连东方财富，仅供个人学习及参考使用。数据可能存在延迟，不作为任何投资建议</p>
        <p style={{ marginBottom: 12 }}>注：估算数据与真实结算数据会有1%左右误差，非股票型基金误差较大</p>
        <div style={{ marginTop: 12, opacity: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ margin: 0 }}>
            遇到任何问题或需求建议可
            <button className="link-button" onClick={() => { setFeedbackNonce((n) => n + 1); setFeedbackOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline', fontSize: 'inherit', fontWeight: 600 }}>点此提交反馈</button>
          </p>
          </div>
      </div>

      <AnimatePresence>{feedbackOpen && <FeedbackModal key={feedbackNonce} onClose={() => setFeedbackOpen(false)} user={user} />}</AnimatePresence>
      <AnimatePresence>{addResultOpen && <AddResultModal failures={addFailures} onClose={() => setAddResultOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{addFundToGroupOpen && <AddFundToGroupModal allFunds={funds} currentGroupCodes={groups.find(g => g.id === currentTab)?.codes || []} onClose={() => setAddFundToGroupOpen(false)} onAdd={(codes) => { /*...*/ }} />}</AnimatePresence>
      <AnimatePresence>{actionModal.open && <HoldingActionModal fund={actionModal.fund} onClose={() => setActionModal({ open: false, fund: null })} onAction={(type) => handleAction(type, actionModal.fund)} />}</AnimatePresence>
      <AnimatePresence>{tradeModal.open && <TradeModal type={tradeModal.type} fund={tradeModal.fund} holding={holdings[tradeModal.fund?.code]} onClose={() => setTradeModal({ open: false, fund: null, type: 'buy' })} onConfirm={(data) => handleTrade(tradeModal.fund, data)} pendingTrades={pendingTrades} onDeletePending={(id) => { /*...*/ }} />}</AnimatePresence>
      <AnimatePresence>{clearConfirm && <ConfirmModal title="清空持仓" message={`确定要清空“${clearConfirm.fund?.name}”的所有持仓记录吗？此操作不可恢复。`} onConfirm={handleClearConfirm} onCancel={() => setClearConfirm(null)} confirmText="确认清空" />}</AnimatePresence>
      <AnimatePresence>{holdingModal.open && <HoldingEditModal fund={holdingModal.fund} holding={holdings[holdingModal.fund?.code]} onClose={() => setHoldingModal({ open: false, fund: null })} onSave={(data) => handleSaveHolding(holdingModal.fund?.code, data)} />}</AnimatePresence>
      <AnimatePresence>
        {donateOpen && (
          <div className="modal-overlay" onClick={() => setDonateOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" style={{ maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
              <div className="title" style={{ marginBottom: 20, justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span>☕ 请作者喝杯咖啡</span></div><button className="icon-button" onClick={() => setDonateOpen(false)} style={{ border: 'none', background: 'transparent' }}><CloseIcon width="20" height="20" /></button></div>
              <div style={{ marginBottom: 20 }}><DonateTabs /></div>
              <div className="muted" style={{ fontSize: '12px', textAlign: 'center', lineHeight: 1.5 }}>感谢您的支持！您的鼓励是我持续维护和更新的动力。</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>{groupManageOpen && <GroupManageModal groups={groups} onClose={() => setGroupManageOpen(false)} onSave={(newGroups) => { setGroups(newGroups); storageHelper.setItem('groups', JSON.stringify(newGroups)); }} />}</AnimatePresence>
      <AnimatePresence>{groupModalOpen && <GroupModal onClose={() => setGroupModalOpen(false)} onConfirm={(name) => { /* ... */ }} />}</AnimatePresence>
      <AnimatePresence>{successModal.open && <SuccessModal message={successModal.message} onClose={() => setSuccessModal({ open: false, message: '' })} />}</AnimatePresence>
      
      {settingsOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="设置" onClick={() => setSettingsOpen(false)}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}><SettingsIcon width="20" height="20" /><span>设置</span></div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>刷新频率</div>
              <div className="chips" style={{ marginBottom: 12 }}>
                {[10, 30, 60, 120, 300].map((s) => (<button key={s} type="button" className={`chip ${tempSeconds === s ? 'active' : ''}`} onClick={() => setTempSeconds(s)} aria-pressed={tempSeconds === s}>{s} 秒</button>))}
              </div>
              <input className="input" type="number" min="10" step="5" value={tempSeconds} onChange={(e) => setTempSeconds(Number(e.target.value))} placeholder="自定义秒数" />
              {tempSeconds < 10 && <div className="error-text" style={{ marginTop: 8 }}>最小 10 秒</div>}
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}><button className="button" onClick={saveSettings} disabled={tempSeconds < 10}>保存并关闭</button></div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {updateModalOpen && (
          <motion.div className="modal-overlay" role="dialog" aria-modal="true" aria-label="更新提示" onClick={() => setUpdateModalOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 10002 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass card modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
              <div className="title" style={{ marginBottom: 12 }}><UpdateIcon width="20" height="20" style={{color: 'var(--success)'}} /><span>更新提示</span></div>
              <div style={{ marginBottom: 24 }}>
                <p className="muted" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: 12 }}>检测到新版本，是否刷新浏览器以更新？<br/>更新内容如下：</p>
                {updateContent && (<div style={{ background: 'rgba(127,127,127,0.1)', padding: '12px', borderRadius: '8px', fontSize: '13px', lineHeight: '1.5', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', border: '1px solid var(--border)' }}>{updateContent}</div>)}
              </div>
              <div className="row" style={{ gap: 12 }}><button className="button secondary" onClick={() => setUpdateModalOpen(false)} style={{ flex: 1 }}>取消</button><button className="button" onClick={() => window.location.reload()} style={{ flex: 1, background: 'var(--success)', color: '#fff', border: 'none' }}>刷新浏览器</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} style={{ position: 'fixed', top: 24, left: '50%', zIndex: 9999, padding: '10px 20px', background: toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? 'var(--success)' : 'var(--card)', color: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, maxWidth: '90vw', whiteSpace: 'nowrap' }}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
