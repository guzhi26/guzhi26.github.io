'use client';

import { useEffect, useRef, useState } from 'react';
import { createWorker } from 'tesseract.js';

// --- 图标组件 ---
function CameraIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function PlusIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
function TrashIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M8 6l1-2h6l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
function SettingsIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.5-2-3.5-2.3.5a8.02 8.02 0 0 0-1.7-1l-.4-2.3h-4l-.4 2.3a8.02 8.02 0 0 0-1.7 1l-2.3-.5-2 3.5 2 1.5a7.97 7.97 0 0 0 .1 2l-2 1.5 2 3.5 2.3-.5a8.02 8.02 0 0 0 1.7 1l.4 2.3h4l.4-2.3a8.02 8.02 0 0 0 1.7-1l2.3.5 2-3.5-2-1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function RefreshIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 12.5-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 5h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 12a8 8 0 0 1-12.5 6.9" stroke="currentColor" strokeWidth="2" /><path d="M8 19H5v-3" stroke="currentColor" strokeWidth="2" /></svg>; }
function ChevronIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
// 新增编辑图标
function EditIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

export default function HomePage() {
  const [funds, setFunds] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  
  // OCR 相关
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const fileInputRef = useRef(null);
  
  // 刷新设置
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  
  // 展开状态
  const [expandedCodes, setExpandedCodes] = useState(new Set());

  // --- 新增：持仓编辑状态 ---
  const [editingFund, setEditingFund] = useState(null); // 当前正在编辑的基金对象
  const [editForm, setEditForm] = useState({ shares: '', cost: '' });

  const toggleExpand = (code) => { setExpandedCodes(prev => { const next = new Set(prev); if (next.has(code)) next.delete(code); else next.add(code); return next; }); };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('funds') || '[]');
      if (Array.isArray(saved) && saved.length) {
        setFunds(saved);
        refreshAll(saved.map((f) => f.code));
      }
      const savedMs = parseInt(localStorage.getItem('refreshMs') || '30000', 10);
      if (Number.isFinite(savedMs) && savedMs >= 5000) {
        setRefreshMs(savedMs);
        setTempSeconds(Math.round(savedMs / 1000));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const codes = funds.map((f) => f.code);
      if (codes.length) refreshAll(codes);
    }, refreshMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [funds, refreshMs]);

  const loadScript = (url) => { return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = url; script.async = true; script.onload = () => { document.body.removeChild(script); resolve(); }; script.onerror = () => { document.body.removeChild(script); reject(new Error('Fail')); }; document.body.appendChild(script); }); };

  const fetchFundData = async (c) => {
    return new Promise(async (resolve, reject) => {
      const getTencentPrefix = (code) => {
        if (code.startsWith('6') || code.startsWith('9')) return 'sh';
        if (code.startsWith('0') || code.startsWith('3')) return 'sz';
        if (code.startsWith('4') || code.startsWith('8')) return 'bj';
        return 'sz';
      };
      const gzUrl = `https://fundgz.1234567.com.cn/js/${c}.js?rt=${Date.now()}`;
      const originalJsonpgz = window.jsonpgz;
      const scriptGz = document.createElement('script');
      scriptGz.src = gzUrl;
      
      window.jsonpgz = (json) => {
        window.jsonpgz = originalJsonpgz;
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
            if (codeIdx >= 0 && weightIdx >= 0) { holdings.push({ code: cells[codeIdx], name: cells[codeIdx + 1] || '', weight: cells[weightIdx], change: null }); }
          }
          holdings = holdings.slice(0, 10);
          if (holdings.length) {
            try {
              const tencentCodes = holdings.map(h => `s_${getTencentPrefix(h.code)}${h.code}`).join(',');
              const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;
              await new Promise((resQuote) => {
                const scriptQuote = document.createElement('script'); scriptQuote.src = quoteUrl;
                scriptQuote.onload = () => {
                  holdings.forEach(h => { const varName = `v_s_${getTencentPrefix(h.code)}${h.code}`; const dataStr = window[varName]; if (dataStr) { const parts = dataStr.split('~'); if (parts.length > 5) h.change = parseFloat(parts[5]); } });
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote); resQuote();
                };
                scriptQuote.onerror = () => { if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote); resQuote(); };
                document.body.appendChild(scriptQuote);
              });
            } catch (e) { console.error(e); }
          }
          resolve({ ...gzData, holdings });
        }).catch(() => resolve({ ...gzData, holdings: [] }));
      };
      scriptGz.onerror = () => { window.jsonpgz = originalJsonpgz; if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz); reject(new Error('加载失败')); };
      document.body.appendChild(scriptGz); setTimeout(() => { if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz); }, 5000);
    });
  };

  const refreshAll = async (codes) => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      // 获取当前最新的 funds 状态，防止闭包过时
      // 这里直接使用 setFunds 的回调形式能保证数据一致性，
      // 但由于 refreshAll 是异步的，我们手动合并数据
      const currentFundsMap = new Map(funds.map(f => [f.code, f]));
      
      const updated = [];
      for (const c of codes) {
        // 保留旧数据中的持仓信息 (shares, cost)
        const oldFund = currentFundsMap.get(c) || {};
        try {
          const data = await fetchFundData(c);
          updated.push({ 
            ...data, 
            shares: oldFund.shares || 0, 
            cost: oldFund.cost || 0 
          });
        } catch (e) {
          if (oldFund.code) updated.push(oldFund);
        }
      }
      if (updated.length) {
        setFunds(updated);
        localStorage.setItem('funds', JSON.stringify(updated));
      }
    } catch (e) { console.error(e); } finally { setRefreshing(false); }
  };

  const addFund = async (e) => {
    e?.preventDefault();
    setError('');
    const clean = code.trim();
    if (!clean) return setError('请输入代码');
    if (funds.some((f) => f.code === clean)) return setError('已存在');
    setLoading(true);
    try {
      const data = await fetchFundData(clean);
      // 新添加的基金，默认份额0，成本0
      const next = [{ ...data, shares: 0, cost: 0 }, ...funds];
      setFunds(next);
      localStorage.setItem('funds', JSON.stringify(next));
      setCode('');
    } catch (e) { setError('添加失败'); } finally { setLoading(false); }
  };

  const batchAddFunds = async (codesArray) => {
    if (!codesArray.length) return;
    setLoading(true);
    setError('');
    const newCodes = codesArray.filter(c => !funds.some(f => f.code === c));
    if (newCodes.length === 0) { setError('识别到的基金均已存在'); setLoading(false); return; }

    try {
      const newFundsData = [];
      for (const c of newCodes) {
        try {
          const data = await fetchFundData(c);
          newFundsData.push({ ...data, shares: 0, cost: 0 });
        } catch (e) {}
      }
      if (newFundsData.length) {
        const next = [...newFundsData, ...funds];
        setFunds(next);
        localStorage.setItem('funds', JSON.stringify(next));
        setError(`成功导入 ${newFundsData.length} 个基金`);
      }
    } catch (e) {} finally { setLoading(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrProcessing(true);
    setError('');
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      const matches = text.match(/\b\d{6}\b/g);
      if (matches && matches.length > 0) {
        const uniqueCodes = [...new Set(matches)];
        if (confirm(`识别到以下代码，是否导入？\n${uniqueCodes.join(', ')}`)) {
           await batchAddFunds(uniqueCodes);
        }
      } else { setError('未识别到 6 位数字代码'); }
    } catch (err) { setError('图片识别失败'); } finally { setOcrProcessing(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const removeFund = (removeCode, e) => {
    e.stopPropagation();
    if(!confirm('确定删除该基金吗？')) return;
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));
  };

  // --- 编辑持仓逻辑 ---
  const openEditModal = (fund, e) => {
    e.stopPropagation();
    setEditingFund(fund);
    setEditForm({ shares: fund.shares || '', cost: fund.cost || '' });
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!editingFund) return;
    
    const nextFunds = funds.map(f => {
      if (f.code === editingFund.code) {
        return {
          ...f,
          shares: parseFloat(editForm.shares) || 0,
          cost: parseFloat(editForm.cost) || 0
        };
      }
      return f;
    });
    
    setFunds(nextFunds);
    localStorage.setItem('funds', JSON.stringify(nextFunds));
    setEditingFund(null);
  };

  const manualRefresh = async () => { if (refreshing) return; const codes = funds.map((f) => f.code); if (codes.length) await refreshAll(codes); };
  const saveSettings = (e) => { e?.preventDefault?.(); const ms = Math.max(5, Number(tempSeconds)) * 1000; setRefreshMs(ms); localStorage.setItem('refreshMs', String(ms)); setSettingsOpen(false); };

  // --- 辅助计算函数 ---
  const calcVals = (f) => {
    const shares = Number(f.shares) || 0;
    const cost = Number(f.cost) || 0;
    const gsz = parseFloat(f.gsz) || parseFloat(f.dwjz) || 0; // 优先用估值，没有则用净值
    const gszzl = Number(f.gszzl) || 0;
    
    const marketValue = shares * gsz; // 持仓金额
    const dayIncome = marketValue * (gszzl / 100); // 当日收益
    const totalIncome = (gsz - cost) * shares; // 持有收益 (仅当有成本时有效)
    const totalRate = cost > 0 ? ((gsz - cost) / cost) * 100 : 0; // 持有收益率

    return { shares, cost, marketValue, dayIncome, totalIncome, totalRate };
  };

  // 统计总资产
  const totalStats = funds.reduce((acc, f) => {
    const { marketValue, dayIncome, totalIncome } = calcVals(f);
    acc.marketValue += marketValue;
    acc.dayIncome += dayIncome;
    acc.totalIncome += totalIncome;
    return acc;
  }, { marketValue: 0, dayIncome: 0, totalIncome: 0 });

  return (
    <div className="container content">
      <div className="navbar">
        {(refreshing || ocrProcessing) && <div className="loading-bar"></div>}
        <div className="brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight:8}}>
             <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M18.5 7.5l-6 6-4-4-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>自选基金助手</span>
        </div>
        <div className="actions">
          <span style={{fontSize:12, opacity:0.8}}>刷新: {Math.round(refreshMs / 1000)}s</span>
          <button className="icon-button" onClick={manualRefresh} title="刷新"><RefreshIcon className={refreshing ? 'spin' : ''} width="16" height="16" /></button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} title="设置"><SettingsIcon width="16" height="16" /></button>
        </div>
      </div>

      <div className="glass add-fund-section" style={{flexWrap: 'wrap'}}>
        <div style={{display:'flex', alignItems:'center', gap:16, flex:1, minWidth: 300}}>
            <div style={{fontSize:12, fontWeight:'bold', color:'var(--accent)'}}>快速添加</div>
            <form className="form" onSubmit={addFund} style={{display: 'flex', alignItems: 'center'}}>
            <input className="input" placeholder="输入代码(如018957)" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" />
            <button className="button" type="submit" disabled={loading}>{loading ? '...' : '+ 添加'}</button>
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
            <button type="button" className="button" style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4, background: '#fff' }} onClick={() => fileInputRef.current?.click()} disabled={ocrProcessing || loading} title="上传截图自动识别">
                {ocrProcessing ? '...' : <><CameraIcon width="16" height="16" /><span>识图</span></>}
            </button>
            </form>
            {error && <span style={{color:'var(--danger)', fontSize:12}}>{error}</span>}
        </div>
        
        {/* 总资产看板 */}
        {funds.length > 0 && (
            <div style={{display:'flex', gap:20, fontSize:13, background:'var(--bg)', padding:'6px 12px', borderRadius:4, border:'1px solid var(--border)'}}>
                <div>
                    <span style={{color:'var(--muted)'}}>总持仓: </span>
                    <span style={{fontWeight:'bold'}}>{totalStats.marketValue.toFixed(2)}</span>
                </div>
                <div>
                    <span style={{color:'var(--muted)'}}>当日: </span>
                    <span className={totalStats.dayIncome > 0 ? 'up' : totalStats.dayIncome < 0 ? 'down' : ''} style={{fontWeight:'bold'}}>
                        {totalStats.dayIncome > 0 ? '+' : ''}{totalStats.dayIncome.toFixed(2)}
                    </span>
                </div>
                <div>
                    <span style={{color:'var(--muted)'}}>总盈亏: </span>
                    <span className={totalStats.totalIncome > 0 ? 'up' : totalStats.totalIncome < 0 ? 'down' : ''} style={{fontWeight:'bold'}}>
                        {totalStats.totalIncome > 0 ? '+' : ''}{totalStats.totalIncome.toFixed(2)}
                    </span>
                </div>
            </div>
        )}
      </div>

      {funds.length === 0 ? (
        <div style={{padding:40, textAlign:'center', color:'#999'}}>暂无自选基金，请在上方添加。</div>
      ) : (
        <div className="glass" style={{overflowX:'auto'}}>
          <table className="fund-table">
            <thead>
              <tr>
                <th style={{width:'20%'}}>基金名称/代码</th>
                <th style={{width:'12%'}}>估值/净值</th>
                <th style={{width:'12%'}}>持有份额/成本</th>
                <th style={{width:'15%'}}>持仓金额</th>
                <th style={{width:'12%'}}>当日收益</th>
                <th style={{width:'12%'}}>持有收益</th>
                <th style={{width:'10%'}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((f) => {
                const { shares, cost, marketValue, dayIncome, totalIncome, totalRate } = calcVals(f);
                const delta = Number(f.gszzl) || 0;
                const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
                const isExpanded = expandedCodes.has(f.code);
                
                return (
                  <>
                    <tr key={f.code} onClick={() => toggleExpand(f.code)} style={{cursor:'pointer'}}>
                      <td>
                        <div style={{fontWeight:'bold'}}>{f.name}</div>
                        <div style={{color:'var(--muted)', fontSize:11}}>{f.code}</div>
                      </td>
                      <td>
                        <div style={{fontWeight:'bold', color: dir === 'up' ? 'var(--danger)' : dir === 'down' ? 'var(--success)' : 'inherit'}}>{f.gsz}</div>
                        <div className={dir} style={{fontSize:11}}>{delta > 0 ? '+' : ''}{f.gszzl}%</div>
                        <div style={{fontSize:10, color:'#999'}}>{f.gztime?.slice(10)}</div>
                      </td>
                      {/* 持仓份额/成本 */}
                      <td style={{fontSize:12}}>
                         <div>{shares > 0 ? shares : '-'}</div>
                         <div style={{color:'var(--muted)', fontSize:11}}>本: {cost > 0 ? cost : '-'}</div>
                      </td>
                      {/* 持仓金额 */}
                      <td style={{fontWeight:'bold'}}>{shares > 0 ? marketValue.toFixed(2) : '-'}</td>
                      {/* 当日收益 */}
                      <td className={dayIncome > 0 ? 'up' : dayIncome < 0 ? 'down' : ''} style={{fontWeight:'bold'}}>
                        {shares > 0 ? (dayIncome > 0 ? '+' : '') + dayIncome.toFixed(2) : '-'}
                      </td>
                      {/* 持有收益 */}
                      <td>
                         <div className={totalIncome > 0 ? 'up' : totalIncome < 0 ? 'down' : ''} style={{fontWeight:'bold'}}>
                            {shares > 0 && cost > 0 ? (totalIncome > 0 ? '+' : '') + totalIncome.toFixed(2) : '-'}
                         </div>
                         {shares > 0 && cost > 0 && (
                            <div className={totalRate > 0 ? 'up' : totalRate < 0 ? 'down' : ''} style={{fontSize:11}}>
                                {totalRate > 0 ? '+' : ''}{totalRate.toFixed(2)}%
                            </div>
                         )}
                      </td>
                      <td>
                        <div style={{display:'flex', gap:4, justifyContent:'flex-end'}}>
                            <button className="button" style={{padding:'4px 8px'}} onClick={(e) => openEditModal(f, e)} title="编辑持仓">
                                <EditIcon width="14" height="14" />
                            </button>
                            <button className="button" style={{padding:'4px 8px'}} onClick={(e) => removeFund(f.code, e)} title="删除">
                                <TrashIcon width="14" height="14" />
                            </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="holdings-row">
                        <td colSpan="7">
                          <div style={{padding:'4px 12px'}}>
                            <div style={{fontSize:11, color:'#999', marginBottom:4}}>前十大重仓股</div>
                            <div className="holdings-grid">
                              {f.holdings && f.holdings.length ? f.holdings.map((h, i) => (
                                <div key={i} className="holding-item">
                                  <span>{h.name}</span>
                                  {h.change !== null && <span className={h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}>{h.change > 0 ? '+' : ''}{h.change}%</span>}
                                </div>
                              )) : <span style={{fontSize:11}}>暂无重仓数据</span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 设置弹窗 */}
      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{fontWeight:'bold', marginBottom:16}}>系统设置</div>
            <div style={{marginBottom:12, fontSize:12}}>刷新频率 (秒)</div>
            <div style={{display:'flex', gap:8, marginBottom:16}}>
              {[10, 30, 60].map((s) => (
                <button key={s} className="button" style={{borderColor: tempSeconds===s?'var(--accent)':'var(--border)', color: tempSeconds===s?'var(--accent)':'var(--text)'}} onClick={() => setTempSeconds(s)}>{s}s</button>
              ))}
              <input className="input" type="number" value={tempSeconds} onChange={(e) => setTempSeconds(Number(e.target.value))} style={{width:60}} />
            </div>
            <div style={{textAlign:'right'}}><button className="button" style={{background:'var(--accent)', color:'#fff', borderColor:'transparent'}} onClick={saveSettings}>保存设置</button></div>
          </div>
        </div>
      )}

      {/* 编辑持仓弹窗 */}
      {editingFund && (
        <div className="modal-overlay" onClick={() => setEditingFund(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{fontWeight:'bold', marginBottom:4}}>编辑持仓信息</div>
            <div style={{fontSize:12, color:'var(--muted)', marginBottom:16}}>{editingFund.name} ({editingFund.code})</div>
            
            <form onSubmit={saveEdit}>
                <div style={{marginBottom:12}}>
                    <div style={{fontSize:12, marginBottom:4}}>持有份额 (份)</div>
                    <input className="input" style={{width:'100%'}} type="number" step="0.01" value={editForm.shares} onChange={(e) => setEditForm({...editForm, shares: e.target.value})} placeholder="例如: 1000.55" autoFocus />
                </div>
                <div style={{marginBottom:16}}>
                    <div style={{fontSize:12, marginBottom:4}}>持仓成本 (元/份) <span style={{color:'#999'}}>(可选)</span></div>
                    <input className="input" style={{width:'100%'}} type="number" step="0.0001" value={editForm.cost} onChange={(e) => setEditForm({...editForm, cost: e.target.value})} placeholder="例如: 1.2345" />
                    <div style={{fontSize:11, color:'#999', marginTop:4}}>如果不输入成本，将无法计算总持有收益。</div>
                </div>
                <div style={{textAlign:'right', display:'flex', gap:10, justifyContent:'flex-end'}}>
                    <button type="button" className="button" onClick={() => setEditingFund(null)}>取消</button>
                    <button type="submit" className="button" style={{background:'var(--accent)', color:'#fff', borderColor:'transparent'}}>保存</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
