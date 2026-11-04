import React, { useEffect, useState } from 'react';

export default function App() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('tactics');
  const [selectedClubId, setSelectedClubId] = useState('club_0');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState('ALL');
  const [draggingPlayerId, setDraggingPlayerId] = useState(null);
  const [season, setSeason] = useState(1);

  useEffect(() => {
    fetch('/DATA-AUDIT-2026-11-04.json')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div style={{ padding: 40, fontSize: 18 }}>⚽ 실제 선수 명단 및 시스템 로딩 중...</div>;

  const currentClub = data.clubs.find(c => c.id === selectedClubId) || data.clubs[0];
  const allPlayers = data.clubs.flatMap(c => c.squad.map(p => ({ ...p, clubName: c.name, clubId: c.id })));
  const starters = currentClub.squad.filter(p => p.isStarter);
  const subs = currentClub.squad.filter(p => !p.isStarter);

  const handlePitchClick = (e) => {
    if (!draggingPlayerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(10, Math.min(90, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    currentClub.squad = currentClub.squad.map(p => p.id === draggingPlayerId ? { ...p, x, y, isStarter: true } : p);
    setData({ ...data });
    setDraggingPlayerId(null);
  };

  const toggleStarter = (playerId) => {
    currentClub.squad = currentClub.squad.map(p => p.id === playerId ? { ...p, isStarter: !p.isStarter } : p);
    setData({ ...data });
  };

  const advanceSeason = () => {
    setSeason(s => s + 1);
    alert(`시즌 ${season + 1}로 진행합니다! AI 이적 협상 및 유스 아카데미 콜업이 완료되었습니다.`);
  };

  const filteredPlayers = allPlayers.filter(p => {
    const matchesName = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.clubName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = selectedPos === 'ALL' || p.pos === selectedPos;
    return matchesName && matchesPos;
  });

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 20px', borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>⚽ Football Manager 2026 (시즌 {season})</h1>
          <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: 14 }}>
            부임 구단: 
            <select value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)} style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 6 }}>
              {data.clubs.map(c => <option key={c.id} value={c.id}>{c.name} ({c.squad.length}명)</option>)}
            </select>
            <span style={{ marginLeft: 15 }}>예산: ₩{(currentClub.budget).toLocaleString()}</span>
          </p>
        </div>
        <button onClick={advanceSeason} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
          ⏩ 다음 시즌 진행 (유스 콜업 & 이적)
        </button>
      </header>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={() => setActiveTab('tactics')} style={{ padding: '10px 20px', background: activeTab === 'tactics' ? '#0f172a' : '#fff', color: activeTab === 'tactics' ? '#fff' : '#0f172a', borderRadius: 8, fontWeight: 'bold', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
          📋 전술 및 포메이션
        </button>
        <button onClick={() => setActiveTab('search')} style={{ padding: '10px 20px', background: activeTab === 'search' ? '#0f172a' : '#fff', color: activeTab === 'search' ? '#fff' : '#0f172a', borderRadius: 8, fontWeight: 'bold', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
          🔍 전체 선수 검색 및 이적
        </button>
      </div>

      {activeTab === 'tactics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>포메이션 이동 (선수 클릭 후 배치)</h3>
            <div className="pitch" onClick={handlePitchClick} style={{ width: '100%', height: 520 }}>
              {starters.map(p => (
                <div key={p.id} className="player-card" style={{ left: `${p.x}%`, top: `${p.y}%`, border: draggingPlayerId === p.id ? '3px solid #2563eb' : '2px solid #0f172a' }} onClick={(e) => { e.stopPropagation(); setDraggingPlayerId(p.id); }}>
                  <div style={{ fontSize: 11, color: '#2563eb' }}>{p.pos}</div>
                  <div style={{ fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>CA:{p.ca} PA:{p.pa}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', padding: 20, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>스쿼드 명단</h3>
            <div style={{ maxHeight: 460, overflowY: 'auto' }}>
              <h4>선발 명단 ({starters.length}명)</h4>
              {starters.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div><strong>[{p.pos}] {p.name}</strong> <span style={{ fontSize: 12, color: '#64748b' }}>CA:{p.ca} PA:{p.pa}</span></div>
                  <button onClick={() => toggleStarter(p.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>후보로</button>
                </div>
              ))}
              <h4 style={{ marginTop: 20 }}>후보 명단 ({subs.length}명)</h4>
              {subs.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div><strong>[{p.pos}] {p.name}</strong> <span style={{ fontSize: 12, color: '#64748b' }}>CA:{p.ca} PA:{p.pa}</span></div>
                  <button onClick={() => toggleStarter(p.id)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>선발로</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>선수 검색 및 이적</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input type="text" placeholder="선수명 또는 구단 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }} />
            <select value={selectedPos} onChange={e => setSelectedPos(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}>
              <option value="ALL">전체 포지션</option>
              <option value="FW">공격수</option>
              <option value="MF">미드필더</option>
              <option value="DF">수비수</option>
              <option value="GK">골키퍼</option>
            </select>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: 10 }}>이름</th>
                <th style={{ padding: 10 }}>포지션</th>
                <th style={{ padding: 10 }}>소속 구단</th>
                <th style={{ padding: 10 }}>CA</th>
                <th style={{ padding: 10 }}>PA</th>
                <th style={{ padding: 10 }}>가치</th>
                <th style={{ padding: 10 }}>협상</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.slice(0, 50).map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 10, fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ padding: 10 }}>{p.pos}</td>
                  <td style={{ padding: 10 }}>{p.clubName}</td>
                  <td style={{ padding: 10 }}>{p.ca}</td>
                  <td style={{ padding: 10, color: '#2563eb', fontWeight: 'bold' }}>{p.pa}</td>
                  <td style={{ padding: 10 }}>₩{(p.value || 0).toLocaleString()}</td>
                  <td style={{ padding: 10 }}>
                    {p.clubId === selectedClubId ? (
                      <span style={{ color: '#64748b' }}>소속 선수</span>
                    ) : (
                      <button onClick={() => alert(`${p.name} 영입 제안 전송`)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>영입 제안</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}