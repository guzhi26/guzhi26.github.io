'use client';

import { useEffect, useRef, useState } from 'react';

// --- 图标组件 ---
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
function TrophyIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 4h10c.6 0 1 .4 1 1v7c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V5c0-.6.4-1 1-1z" stroke="currentColor" strokeWidth="2"/><path d="M18 4h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M6 4H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="2"/></svg>;
}
function EditIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SearchIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function HomePage() {
  const [funds, setFunds] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  
  // 状态管理
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  // 排序
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  // 持仓编辑弹窗
  const [editingFund, setEditingFund] = useState(null);
  const [editShare, setEditShare] = useState('');
  const [editCost, setEditCost] = useState('');

  // 排行榜状态
  const [rankOpen, setRankOpen] = useState(false);
  const [rankType, setRankType] = useState('up'); // 'up' | 'down'
  const [rankCategory, setRankCategory] = useState('all'); // all, gp, hh, zs, zq
  const [rankList, setRankList] = useState([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankSearch, setRankSearch] = useState(''); // 榜单内搜索

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('funds') || '[]');
      if (Array.isArray(saved) && saved.length) {
        setFunds(saved);
        refreshAll(saved);
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
      refreshAll(funds);
    }, refreshMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [funds, refreshMs]);

  // --- JSONP ---
  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (document.body.contains(script)) document.body.removeChild(script);
          resolve();
        }, 50);
      };
      script.onerror = () => {
        if (document.body.contains(script)) document.body.removeChild(script);
        reject(new Error('Fetch failed'));
      };
      document.body.appendChild(script);
    });
  };

  // --- 获取单个基金估值 ---
  const fetchFundData = async (c) => {
    return new Promise((resolve, reject) => {
      const gzUrl = `https://fundgz.1234567.com.cn/js/${c}.js?rt=${Date.now()}`;
      const originalJsonpgz = window.jsonpgz;
      const scriptGz = document.createElement('script');
      scriptGz.src = gzUrl;
      
      window.jsonpgz = (json) => {
        window.jsonpgz = originalJsonpgz;
        const gszzlNum = Number(json.gszzl);
        resolve({
          code: json.fundcode,
          name: json.name,
          dwjz: json.dwjz,
          gsz: json.gsz,
          gztime: json.gztime,
          gszzl: Number.isFinite(gszzlNum) ? gszzlNum : json.gszzl
        });
      };

      scriptGz.onerror = () => {
        window.jsonpgz = originalJsonpgz;
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
        reject(new Error('加载失败'));
      };

      document.body.appendChild(scriptGz);
      setTimeout(() => {
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
      }, 3000);
    });
  };

  // --- 获取排行榜 ---
  // type: 'up' | 'down'
  // category: 'all'|'gp'|'hh'|'zs'|'zq'
  const fetchRankings = async (type = rankType, category = rankCategory) => {
    setRankLoading(true);
    setRankList([]);
    setRankType(type);
    setRankCategory(category);
    setRankSearch(''); // 切换时清空搜索
    
    // Top 200，保证“全”
    const order = type === 'up' ? 'desc' : 'asc';
    const baseUrl = `https://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=${category}&rs=&gs=0&sc=zzf&pi=1&pn=200&dx=1&st=${order}&v=${Math.random()}`;
    
    try {
      window.rankData = null;
      await loadScript(baseUrl);
      
      if (window.rankData && window.rankData.datas) {
        let list = window.rankData.datas.map(item => {
          const parts = item.split(',');
          return {
            code: parts[0],
            name: parts[1],
            gszzl: parseFloat(parts[6])
          };
        });

        // 强制二次排序
        if (type === 'up') {
          list.sort((a, b) => b.gszzl - a.gszzl);
        } else {
          list.sort((a, b) => a.gszzl - b.gszzl);
        }

        setRankList(list);
      }
    } catch (e) {
      console.error('Ranking fetch error', e);
    } finally {
      setRankLoading(false);
    }
  };

  const refreshAll = async (currentFunds) => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const updated = [];
      for (const f of currentFunds) {
        try {
          const data = await fetchFundData(f.code);
          updated.push({ ...data, share: f.share || 0, cost: f.cost || 0 });
        } catch (e) {
          updated.push(f);
        }
      }
      if (updated.length) {
        setFunds(updated);
        localStorage.setItem('funds', JSON.stringify(updated));
      }
    } catch (e) { console.error(e); } finally { setRefreshing(false); }
  };

  const addFund = async (e, inputCode) => {
    if (e) e.preventDefault();
    setError('');
    const clean = (inputCode || code).trim();
    if (!clean) return setError('请输入代码');
    
    if (funds.some((f) => f.code === clean)) {
      if (!inputCode) setError('已存在，请勿重复添加');
      return; 
    }

    setLoading(true);
    try {
      const data = await fetchFundData(clean);
      const newFund = { ...data, share: 0, cost: 0 };
      const next = [newFund, ...funds];
      setFunds(next);
      localStorage.setItem('funds', JSON.stringify(next));
      if (!inputCode) setCode('');
    } catch (e) { 
      if (!inputCode) setError('添加失败，请检查代码'); 
    } finally { 
      setLoading(false); 
    }
  };

  const removeFund = (removeCode) => {
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));
  };

  const manualRefresh = async () => {
    if (refreshing) return;
    await refreshAll(funds);
  };

  const saveSettings = (e) => {
    e?.preventDefault?.();
    const ms = Math.max(5, Number(tempSeconds)) * 1000;
    setRefreshMs(ms);
    localStorage.setItem('refreshMs', String(ms));
    setSettingsOpen(false);
  };

  const openEdit = (fund) => {
    setEditingFund(fund);
    setEditShare(fund.share || '');
    setEditCost(fund.cost || '');
  };

  const saveEdit = () => {
    if (!editingFund) return;
    const next = funds.map(f => {
      if (f.code === editingFund.code) {
        return { 
          ...f, 
          share: parseFloat(editShare) || 0, 
          cost: parseFloat(editCost) || 0 
        };
      }
      return f;
    });
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));
    setEditingFund(null);
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFunds = [...funds].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let valA = 0, valB = 0;
    
    if (sortConfig.key === 'holdAmount') {
      valA = (parseFloat(a.gsz) || 0) * (a.share || 0);
      valB = (parseFloat(b.gsz) || 0) * (b.share || 0);
    } else if (sortConfig.key === 'dayIncome') {
      valA = (a.share || 0) * ((parseFloat(a.gsz) || 0) - (parseFloat(a.dwjz) || 0));
      valB = (b.share || 0) * ((parseFloat(b.gsz) || 0) - (parseFloat(b.dwjz) || 0));
    } else if (sortConfig.key === 'totalIncome') {
      valA = (a.share || 0) * ((parseFloat(a.gsz) || 0) - (a.cost || 0));
      valB = (b.share || 0) * ((parseFloat(b.gsz) || 0) - (b.cost || 0));
    } else {
      valA = parseFloat(a[sortConfig.key]) || 0;
      valB = parseFloat(b[sortConfig.key]) || 0;
    }
    
    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
  });

  const fmtMoney = (val) => isFinite(val) ? val.toFixed(2) : '—';
  const getColor = (val) => val > 0 ? 'var(--danger)' : val < 0 ? 'var(--success)' : 'inherit';

  // 榜单过滤
  const filteredRankList = rankList.filter(item => {
    if (!rankSearch) return true;
    return item.name.includes(rankSearch) || item.code.includes(rankSearch);
  });

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
          <button 
            className="icon-button" 
            onClick={() => { setRankOpen(true); fetchRankings('up', 'all'); }} 
            title="热门排行"
            style={{color: 'var(--accent)', borderColor: 'var(--accent)'}}
          >
            <TrophyIcon width="16" height="16" />
          </button>
          <span style={{width:8}}></span>
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
        <form className="form" onSubmit={(e) => addFund(e, null)}>
          <input
            className="input"
            placeholder="输入代码"
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
          暂无自选，请添加或查看 <span style={{color:'var(--accent)', cursor:'pointer', fontWeight:'bold'}} onClick={() => { setRankOpen(true); fetchRankings('up', 'all'); }}>热门排行</span>
        </div>
      ) : (
        <div className="glass" style={{overflowX:'auto'}}>
          <table className="fund-table">
            <thead>
              <tr>
                <th style={{width:'20%'}}>基金名称/代码</th>
                <th style={{width:'10%'}}>实时估值</th>
                <th 
                  style={{width:'10%', cursor:'pointer', background: sortConfig.key === 'gszzl' ? '#e2e8f0' : ''}}
                  onClick={() => handleSort('gszzl')}
                >
                  涨跌 {sortConfig.key === 'gszzl' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  style={{width:'12%', cursor:'pointer', background: sortConfig.key === 'holdAmount' ? '#e2e8f0' : ''}}
                  onClick={() => handleSort('holdAmount')}
                >
                  持有金额
                </th>
                <th 
                  style={{width:'12%', cursor:'pointer', background: sortConfig.key === 'dayIncome' ? '#e2e8f0' : ''}}
                  onClick={() => handleSort('dayIncome')}
                >
                  今日收益
                </th>
                <th 
                  style={{width:'12%', cursor:'pointer', background: sortConfig.key === 'totalIncome' ? '#e2e8f0' : ''}}
                  onClick={() => handleSort('totalIncome')}
                >
                  总收益
                </th>
                <th style={{width:'10%'}}>更新时间</th>
                <th style={{width:'14%'}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedFunds.map((f) => {
                const delta = Number(f.gszzl) || 0;
                const share = f.share || 0;
                const cost = f.cost || 0;
                const curPrice = parseFloat(f.gsz) || 0;
                const yesterdayPrice = parseFloat(f.dwjz) || 0;
                
                const holdAmount = share * curPrice;
                const dayIncome = share * (curPrice - yesterdayPrice);
                const totalIncome = share * (curPrice - cost);
                
                return (
                  <tr key={f.code}>
                    <td>
                      <div style={{fontWeight:'bold'}}>{f.name}</div>
                      <div style={{color:'var(--muted)', fontSize:11}}>{f.code}</div>
                    </td>
                    <td style={{fontSize:15, fontWeight:'bold', color: getColor(delta)}}>
                      {f.gsz}
                    </td>
                    <td style={{fontWeight:'bold', color: getColor(delta)}}>
                      {delta > 0 ? '+' : ''}{f.gszzl}%
                    </td>
                    <td style={{fontWeight:'bold'}}>{share > 0 ? fmtMoney(holdAmount) : '-'}</td>
                    <td style={{fontWeight:'bold', color: getColor(dayIncome)}}>
                      {share > 0 ? (dayIncome > 0 ? '+' : '') + fmtMoney(dayIncome) : '-'}
                    </td>
                    <td style={{fontWeight:'bold', color: getColor(totalIncome)}}>
                      {share > 0 ? (totalIncome > 0 ? '+' : '') + fmtMoney(totalIncome) : '-'}
                    </td>

                    <td style={{color:'var(--muted)', fontSize:11}}>{f.gztime ? f.gztime.slice(11) : '-'}</td>
                    <td>
                      <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}>
                        <button 
                          className="button" 
                          style={{padding:'4px', height:'auto', color:'var(--accent)'}} 
                          onClick={() => openEdit(f)}
                          title="编辑持仓"
                        >
                          <EditIcon width="14" height="14" />
                        </button>
                        <button 
                          className="button" 
                          style={{padding:'4px', height:'auto', color:'#666'}} 
                          onClick={() => removeFund(f.code)}
                          title="删除"
                        >
                          <TrashIcon width="14" height="14" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 排行榜弹窗 */}
      {rankOpen && (
        <div className="modal-overlay" onClick={() => setRankOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{width: 650, maxWidth: '95vw', height:'85vh', display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <div style={{fontWeight:'bold', fontSize:16}}>🔥 基金排行榜 (Top 200)</div>
              <button className="icon-button" onClick={() => setRankOpen(false)}>×</button>
            </div>
            
            {/* 分类标签 */}
            <div style={{display:'flex', gap:8, marginBottom:12, overflowX:'auto', paddingBottom:4}}>
              {[
                {k:'all', n:'全部'}, 
                {k:'gp', n:'股票型'}, 
                {k:'hh', n:'混合型'}, 
                {k:'zs', n:'指数型'}, 
                {k:'zq', n:'债券型'}
              ].map(cat => (
                <button 
                  key={cat.k}
                  className="button" 
                  style={{
                    background: rankCategory===cat.k ? 'var(--accent)' : '#fff', 
                    color: rankCategory===cat.k ? '#fff' : '#666',
                    borderColor: rankCategory===cat.k ? 'var(--accent)' : 'var(--border)',
                    fontSize: 12, padding: '4px 12px'
                  }}
                  onClick={() => fetchRankings(rankType, cat.k)}
                >
                  {cat.n}
                </button>
              ))}
            </div>

            {/* 涨跌切换 + 搜索 */}
            <div style={{display:'flex', gap:10, marginBottom:12}}>
              <div style={{display:'flex', gap:0, borderRadius:8, border:'1px solid var(--border)', overflow:'hidden'}}>
                <button 
                  style={{
                    padding: '6px 16px', border:'none', cursor:'pointer',
                    background: rankType==='up'?'var(--danger)':'#f8f9fa', 
                    color: rankType==='up'?'#fff':'#666'
                  }}
                  onClick={() => fetchRankings('up', rankCategory)}
                >
                  涨幅榜
                </button>
                <button 
                   style={{
                    padding: '6px 16px', border:'none', cursor:'pointer',
                    background: rankType==='down'?'var(--success)':'#f8f9fa', 
                    color: rankType==='down'?'#fff':'#666'
                  }}
                  onClick={() => fetchRankings('down', rankCategory)}
                >
                  跌幅榜
                </button>
              </div>
              <div style={{flex:1, position:'relative'}}>
                <div style={{position:'absolute', left:8, top:8, color:'#999'}}><SearchIcon width="14" height="14"/></div>
                <input 
                  className="input" 
                  style={{width:'100%', height:32, paddingLeft:28, fontSize:12}} 
                  placeholder="在榜单中搜索..."
                  value={rankSearch}
                  onChange={(e) => setRankSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{fontSize:11, color:'#999', marginBottom:8, textAlign:'center'}}>
              注：排行榜展示前 200 名，基于上一交易日净值涨跌
            </div>
            
            <div style={{flex:1, overflowY:'auto', border:'1px solid var(--border)', borderRadius:8}}>
              {rankLoading ? (
                <div style={{padding:40, textAlign:'center', color:'#999'}}>数据加载中...</div>
              ) : filteredRankList.length === 0 ? (
                <div style={{padding:40, textAlign:'center', color:'#999'}}>未找到相关基金</div>
              ) : (
                <table className="fund-table" style={{fontSize:12}}>
                  <thead>
                    <tr>
                      <th style={{position:'sticky', top:0, zIndex:10, background:'#f0f3f5'}}>排名</th>
                      <th style={{position:'sticky', top:0, zIndex:10, background:'#f0f3f5'}}>基金名称</th>
                      <th style={{position:'sticky', top:0, zIndex:10, background:'#f0f3f5'}}>净值涨跌</th>
                      <th style={{position:'sticky', top:0, zIndex:10, background:'#f0f3f5'}}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRankList.map((item, idx) => {
                      const isAdded = funds.some(f => f.code === item.code);
                      return (
                        <tr key={item.code}>
                          <td style={{textAlign:'center', width:50}}>
                            <span style={{
                              color: idx < 3 ? (rankType==='up'?'red':'green') : '#666', 
                              fontWeight:'bold'
                            }}>
                              {idx + 1}
                            </span>
                          </td>
                          <td>
                            <div style={{fontWeight:'bold'}}>{item.name}</div>
                            <div style={{color:'#999', fontSize:10}}>{item.code}</div>
                          </td>
                          <td style={{color: rankType==='up'?'var(--danger)':'var(--success)', fontWeight:'bold'}}>
                            {item.gszzl > 0 ? '+' : ''}{item.gszzl}%
                          </td>
                          <td style={{textAlign:'center'}}>
                            {isAdded ? <span style={{color:'#ccc'}}>已加</span> : (
                              <button className="button" style={{padding:'2px 8px', fontSize:11}} onClick={() => addFund(null, item.code)}>+</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 持仓编辑弹窗 */}
      {editingFund && (
        <div className="modal-overlay" onClick={() => setEditingFund(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{width: 320}}>
            <div style={{fontWeight:'bold', marginBottom:16}}>
              编辑持仓 - {editingFund.name}
            </div>
            
            <div style={{marginBottom:12}}>
              <label style={{display:'block', fontSize:12, marginBottom:4, color:'#666'}}>持有份额 (份)</label>
              <input 
                className="input" 
                style={{width:'100%'}} 
                type="number" 
                value={editShare} 
                onChange={e => setEditShare(e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div style={{marginBottom:20}}>
              <label style={{display:'block', fontSize:12, marginBottom:4, color:'#666'}}>持仓成本 (单价元)</label>
              <input 
                className="input" 
                style={{width:'100%'}} 
                type="number" 
                value={editCost} 
                onChange={e => setEditCost(e.target.value)}
                placeholder="例如 1.2500"
              />
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:10}}>
              <button className="button" onClick={() => setEditingFund(null)}>取消</button>
              <button className="button" style={{background:'var(--accent)', color:'#fff', borderColor:'transparent'}} onClick={saveEdit}>保存</button>
            </div>
          </div>
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
