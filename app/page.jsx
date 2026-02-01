'use client';

import { useEffect, useRef, useState } from 'react';

// --- 图标组件保持不变 ---
function PlusIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function TrashIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M8 6l1-2h6l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function SettingsIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.5-2-3.5-2.3.5a8.02 8.02 0 0 0-1.7-1l-.4-2.3h-4l-.4 2.3a8.02 8.02 0 0 0-1.7 1l-2.3-.5-2 3.5 2 1.5a7.97 7.97 0 0 0 .1 2l-2 1.5 2 3.5 2.3-.5a8.02 8.02 0 0 0 1.7 1l.4 2.3h4l.4-2.3a8.02 8.02 0 0 0 1.7-1l2.3.5 2-3.5-2-1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function RefreshIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 12.5-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 5h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 12a8 8 0 0 1-12.5 6.9" stroke="currentColor" strokeWidth="2" /><path d="M8 19H5v-3" stroke="currentColor" strokeWidth="2" /></svg>;
}
function ChevronIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function HomePage() {
  const [funds, setFunds] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  // 注意：逻辑里把 setCollapsedCodes 当作 expanded 使用，为了方便阅读这里反转一下逻辑：
  // 默认不展开，点击展开
  const [expandedCodes, setExpandedCodes] = useState(new Set());

  const toggleExpand = (code) => {
    setExpandedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [funds, refreshMs]);

  // --- 逻辑：数据抓取部分保持不变 ---
  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => { document.body.removeChild(script); resolve(); };
      script.onerror = () => { document.body.removeChild(script); reject(new Error('Fail')); };
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
            if (codeIdx >= 0 && weightIdx >= 0) {
              holdings.push({ code: cells[codeIdx], name: cells[codeIdx + 1] || '', weight: cells[weightIdx], change: null });
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
                      if (parts.length > 5) h.change = parseFloat(parts[5]);
                    }
                  });
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                scriptQuote.onerror = () => { if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote); resQuote(); };
                document.body.appendChild(scriptQuote);
              });
            } catch (e) { console.error(e); }
          }
          resolve({ ...gzData, holdings });
        }).catch(() => resolve({ ...gzData, holdings: [] }));
      };

      scriptGz.onerror = () => {
        window.jsonpgz = originalJsonpgz;
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
        reject(new Error('加载失败'));
      };
      document.body.appendChild(scriptGz);
      setTimeout(() => { if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz); }, 5000);
    });
  };

  const refreshAll = async (codes) => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const updated = [];
      for (const c of codes) {
        try {
          const data = await fetchFundData(c);
          updated.push(data);
        } catch (e) {
          const old = funds.find(f => f.code === c);
          if (old) updated.push(old);
        }
      }
      if (updated.length) {
        setFunds(updated);
        localStorage.setItem('funds', JSON.stringify(updated));
      }
    } catch (e) { console.error(e); } finally { setRefreshing(false); }
  };

  const addFund = async (e) => {
    e.preventDefault();
    setError('');
    const clean = code.trim();
    if (!clean) return setError('请输入代码');
    if (funds.some((f) => f.code === clean)) return setError('已存在');
    setLoading(true);
    try {
      const data = await fetchFundData(clean);
      const next = [data, ...funds];
      setFunds(next);
      localStorage.setItem('funds', JSON.stringify(next));
      setCode('');
    } catch (e) { setError('添加失败'); } finally { setLoading(false); }
  };

  const removeFund = (removeCode, e) => {
    e.stopPropagation(); // 防止触发点击行
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));
  };

  const manualRefresh = async () => {
    if (refreshing) return;
    const codes = funds.map((f) => f.code);
    if (codes.length) await refreshAll(codes);
  };

  const saveSettings = (e) => {
    e?.preventDefault?.();
    const ms = Math.max(5, Number(tempSeconds)) * 1000;
    setRefreshMs(ms);
    localStorage.setItem('refreshMs', String(ms));
    setSettingsOpen(false);
  };

  // --- 视图渲染：改为表格布局 ---
  return (
    <div className="container content">
      <div className="navbar">
        {refreshing && <div className="loading-bar"></div>}
        <div className="brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight:8}}>
             <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M18.5 7.5l-6 6-4-4-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>自选基金助手</span>
        </div>
        <div className="actions">
          <span style={{fontSize:12, opacity:0.8}}>刷新: {Math.round(refreshMs / 1000)}s</span>
          <button className="icon-button" onClick={manualRefresh} title="刷新">
            <RefreshIcon className={refreshing ? 'spin' : ''} width="16" height="16" />
          </button>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} title="设置">
            <SettingsIcon width="16" height="16" />
          </button>
        </div>
      </div>

      <div className="glass add-fund-section">
        <div style={{fontSize:12, fontWeight:'bold', color:'var(--accent)'}}>快速添加</div>
        <form className="form" onSubmit={addFund}>
          <input
            className="input"
            placeholder="输入代码 (如 000001)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? '...' : '+ 添加'}
          </button>
        </form>
        {error && <span style={{color:'var(--danger)', fontSize:12}}>{error}</span>}
      </div>

      {funds.length === 0 ? (
        <div style={{padding:40, textAlign:'center', color:'#999'}}>
          暂无自选基金，请在上方添加。
        </div>
      ) : (
        <div className="glass" style={{overflowX:'auto'}}>
          <table className="fund-table">
            <thead>
              <tr>
                <th style={{width:'25%'}}>基金名称/代码</th>
                <th style={{width:'15%'}}>实时估值</th>
                <th style={{width:'15%'}}>估值涨跌</th>
                <th style={{width:'15%'}}>单位净值</th>
                <th style={{width:'15%'}}>更新时间</th>
                <th style={{width:'10%'}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((f) => {
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
                      <td style={{fontSize:15, fontWeight:'bold', color: delta > 0 ? 'var(--danger)' : delta < 0 ? 'var(--success)' : 'inherit'}}>
                        {f.gsz}
                      </td>
                      <td className={dir} style={{fontWeight:'bold'}}>
                        {delta > 0 ? '+' : ''}{f.gszzl}%
                      </td>
                      <td>{f.dwjz}</td>
                      <td style={{color:'var(--muted)', fontSize:11}}>{f.gztime ? f.gztime.slice(5) : '-'}</td>
                      <td>
                        <button className="button" style={{padding:'2px 8px', height:'auto'}} onClick={(e) => removeFund(f.code, e)}>
                          删除
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="holdings-row">
                        <td colSpan="6">
                          <div style={{padding:'4px 12px'}}>
                            <div style={{fontSize:11, color:'#999', marginBottom:4}}>前十大重仓股 (点击行折叠)</div>
                            <div className="holdings-grid">
                              {f.holdings && f.holdings.length ? f.holdings.map((h, i) => (
                                <div key={i} className="holding-item">
                                  <span>{h.name}</span>
                                  {h.change !== null && (
                                    <span className={h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}>
                                      {h.change > 0 ? '+' : ''}{h.change}%
                                    </span>
                                  )}
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

      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{fontWeight:'bold', marginBottom:16}}>系统设置</div>
            <div style={{marginBottom:12, fontSize:12}}>刷新频率 (秒)</div>
            <div style={{display:'flex', gap:8, marginBottom:16}}>
              {[10, 30, 60].map((s) => (
                <button
                  key={s}
                  className="button"
                  style={{borderColor: tempSeconds===s?'var(--accent)':'var(--border)', color: tempSeconds===s?'var(--accent)':'var(--text)'}}
                  onClick={() => setTempSeconds(s)}
                >
                  {s}s
                </button>
              ))}
              <input
                 className="input"
                 type="number"
                 value={tempSeconds}
                 onChange={(e) => setTempSeconds(Number(e.target.value))}
                 style={{width:60}}
              />
            </div>
            <div style={{textAlign:'right'}}>
              <button className="button" style={{background:'var(--accent)', color:'#fff', borderColor:'transparent'}} onClick={saveSettings}>
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}