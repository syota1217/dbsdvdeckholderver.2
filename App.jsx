const { useState, useEffect } = React;

/* ─── CONSTANTS ─────────────────────────────────────── */
const BATTLE_TYPES = ["ラッシュ", "ブースト", "インパクト"];
const BATTLE_TYPE_META = {
  ラッシュ:   { color: "#ef4444", glow: "#ef444440", icon: "⚡", desc: "RUSH" },
  ブースト:   { color: "#3b82f6", glow: "#3b82f640", icon: "🔥", desc: "BOOST" },
  インパクト: { color: "#f59e0b", glow: "#f59e0b40", icon: "💥", desc: "IMPACT" },
};
const SKILL_RACES = ["サイヤ人", "ナメック星人", "魔人", "フリーザ一族", "人造人間"];
const SKILL_LEVELS = [1, 2, 3, 4, 5];
const SKILL_RACE_META = {
  サイヤ人:    { icon: "🌙", color: "#f97316" },
  ナメック星人: { icon: "💚", color: "#22c55e" },
  魔人:        { icon: "🔮", color: "#a855f7" },
  フリーザ一族:{ icon: "❄️", color: "#67e8f9" },
  人造人間:    { icon: "🤖", color: "#94a3b8" },
};
const CARD_TYPES = ["ラッシュ", "ブースト", "インパクト", "リミテッド"];
const CARD_TYPE_META = {
  ラッシュ:   { color: "#ef4444" },
  ブースト:   { color: "#3b82f6" },
  インパクト: { color: "#f59e0b" },
  リミテッド: { color: "#ec4899" },
};
const PLAYER_LABELS = "ABCDEFGHIJKLMNOP".split("");

/* ─── HELPERS ───────────────────────────────────────── */
function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }


const emptySkill  = ()       => ({ race: "", level: 1 });
const emptyAvatar = ()       => ({ battleType: "ラッシュ", skills: [emptySkill(), emptySkill(), emptySkill()] });
const emptyCard   = ()       => ({ id: gid(), cardNumber: "", characterName: "", type: "ラッシュ" });
const emptyDeck   = ()       => ({ id: gid(), name: "", avatar: emptyAvatar(), cards: [], createdAt: new Date().toISOString() });
const emptyPlayer = (seed)   => ({ id: gid(), seed, name: "", avatar: emptyAvatar(), cards: Array.from({ length: 7 }, emptyCard) });
const emptyTourn  = (size)   => ({ id: gid(), name: "", size, date: "", venue: "", createdAt: new Date().toISOString(), players: Array.from({ length: size }, (_, i) => emptyPlayer(i + 1)) });
const playerLabel = (p)      => p.name.trim() || PLAYER_LABELS[(p.seed - 1) % 26];

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
function App() {
  const [decks,       setDecks]       = useState(() => load("dbsdv_decks", []));
  const [tournaments, setTournaments] = useState(() => load("dbsdv_tourns", []));
  const [tab,  setTab]  = useState("decks");
  const [page, setPage] = useState("list");
  const [target, setTarget] = useState(null);
  const [toast,  setToast]  = useState(null);

  useEffect(() => { save("dbsdv_decks",  decks);       }, [decks]);
  useEffect(() => { save("dbsdv_tourns", tournaments); }, [tournaments]);

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  /* deck */
  const saveDeck = d => { setDecks(ds => ds.some(x => x.id === d.id) ? ds.map(x => x.id === d.id ? d : x) : [...ds, d]); showToast("デッキを保存しました ✓"); setPage("list"); };
  const delDeck  = id => { setDecks(ds => ds.filter(d => d.id !== id)); showToast("削除しました", "err"); };
  /* tournament */
  const saveTourn = t => { setTournaments(ts => ts.some(x => x.id === t.id) ? ts.map(x => x.id === t.id ? t : x) : [...ts, t]); showToast("大会を保存しました ✓"); setPage("tList"); };
  const delTourn  = id => { setTournaments(ts => ts.filter(t => t.id !== id)); showToast("削除しました", "err"); };

  const go = (pg, data = null) => { setTarget(data); setPage(pg); };

  return (
    <div style={S.root}>
      <BG />
      {toast && <Toast {...toast} />}

      <div style={S.wrap}>
        {/* HEADER */}
        <header style={S.header}>
          <div style={S.hInner}>
            <span style={{ fontSize: 26 }}>🐉</span>
            <div style={{ textAlign: "center" }}>
              <div style={S.title}>DBSDV DECK BUILDER</div>
              <div style={S.sub}>DRAGON BALL SUPER DIVERS</div>
            </div>
            <span style={{ fontSize: 26 }}>🐉</span>
          </div>
          <div style={S.tabBar}>
            {[["decks", "🃏 デッキ管理"], ["tournaments", "🏆 大会モード"]].map(([k, lbl]) => (
              <button key={k} onClick={() => { setTab(k); setPage(k === "decks" ? "list" : "tList"); }}
                style={{ ...S.tab, ...(tab === k ? S.tabOn : {}) }}>{lbl}</button>
            ))}
          </div>
        </header>

        {/* ── DECK PAGES ── */}
        {tab === "decks" && <>
          {page === "list"   && <DeckList   decks={decks} onNew={() => go("edit", emptyDeck())} onEdit={d => go("edit", JSON.parse(JSON.stringify(d)))} onDetail={d => go("detail", d)} onDel={delDeck} />}
          {page === "edit"   && target && <DeckEditor   deck={target}   onSave={saveDeck} onBack={() => setPage("list")} />}
          {page === "detail" && target && <DeckDetail   deck={target}   onEdit={() => go("edit", JSON.parse(JSON.stringify(target)))} onBack={() => setPage("list")} />}
        </>}

        {/* ── TOURNAMENT PAGES ── */}
        {tab === "tournaments" && <>
          {page === "tList"   && <TournList   tourns={tournaments} onNew={sz => go("tEdit", emptyTourn(sz))} onEdit={t => go("tEdit", JSON.parse(JSON.stringify(t)))} onDetail={t => go("tDetail", t)} onDel={delTourn} />}
          {page === "tEdit"   && target && <TournEditor  tourn={target}  onSave={saveTourn} onBack={() => setPage("tList")} />}
          {page === "tDetail" && target && <TournDetail  tourn={target}  onEdit={() => go("tEdit", JSON.parse(JSON.stringify(target)))} onBack={() => setPage("tList")} />}
        </>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DECK LIST
═══════════════════════════════════════════════════════ */
function DeckList({ decks, onNew, onEdit, onDetail, onDel }) {
  const [q, setQ] = useState("");
  const filtered = decks.filter(d => d.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div style={S.toolbar}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 デッキ名で検索..." style={S.searchInput} />
        <Btn accent onClick={onNew}>＋ 新規デッキ</Btn>
      </div>
      {filtered.length === 0
        ? <Empty icon="🃏" text="デッキがありません。新規デッキを作成しましょう！" />
        : filtered.map(d => (
          <DeckCard key={d.id} deck={d} onClick={() => onDetail(d)}
            onEdit={() => onEdit(d)} onDel={() => { if (confirm("削除しますか？")) onDel(d.id); }} />
        ))
      }
    </div>
  );
}

function DeckCard({ deck, onClick, onEdit, onDel }) {
  return (
    <div style={S.card} onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(217,119,6,.7)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,160,0,.18)"}>
      <BTypePill type={deck.avatar?.battleType} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.cardName}>{deck.name || "（無名）"}</div>
        <div style={S.chipRow}>
          <Chip>{deck.cards?.length ?? 0}枚</Chip>
          {deck.avatar?.skills?.filter(s => s.race).map((s, i) => {
            const m = SKILL_RACE_META[s.race];
            return <Chip key={i} color={m.color}>{m.icon} {s.race} Lv{s.level}</Chip>;
          })}
        </div>
      </div>
      <div style={S.btnRow} onClick={e => e.stopPropagation()}>
        <SmBtn blue onClick={onEdit}>編集</SmBtn>
        <SmBtn red  onClick={onDel}>削除</SmBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DECK EDITOR
═══════════════════════════════════════════════════════ */
function DeckEditor({ deck, onSave, onBack }) {
  const [form, setForm] = useState(deck);
  const [cardModal, setCardModal] = useState(null);
  const [err, setErr] = useState("");

  const setAv = patch => setForm(f => ({ ...f, avatar: { ...f.avatar, ...patch } }));
  const setSkillRace  = (i, race)  => { const s = [...form.avatar.skills]; s[i] = { ...s[i], race };          setAv({ skills: s }); };
  const setSkillLevel = (i, level) => { const s = [...form.avatar.skills]; s[i] = { ...s[i], level: +level }; setAv({ skills: s }); };

  const openAdd  = ()    => setCardModal({ idx: null, data: emptyCard() });
  const openEdit = (idx) => setCardModal({ idx, data: { ...form.cards[idx] } });
  const saveCard = data  => {
    if (!data.cardNumber.trim() && !data.characterName.trim()) return;
    setForm(f => {
      const cards = [...f.cards];
      cardModal.idx !== null ? (cards[cardModal.idx] = data) : cards.push(data);
      return { ...f, cards };
    });
    setCardModal(null);
  };
  const removeCard = idx => setForm(f => ({ ...f, cards: f.cards.filter((_, i) => i !== idx) }));
  const handleSave = () => { if (!form.name.trim()) { setErr("デッキ名を入力してください"); return; } setErr(""); onSave(form); };

  return (
    <div>
      <PageHeader title="デッキ編集" onBack={onBack} />
      {err && <ErrBox>{err}</ErrBox>}

      <Sec title="📝 デッキ名">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="デッキ名を入力..." style={S.input} />
      </Sec>

      <AvatarEditor avatar={form.avatar} onBattleType={t => setAv({ battleType: t })} onSkillRace={setSkillRace} onSkillLevel={setSkillLevel} />

      <Sec title={`🃏 デッキカード（${form.cards.length}枚）`}>
        <button onClick={openAdd} style={S.addBtn}>＋ カードを追加</button>
        <CardList cards={form.cards} onEdit={openEdit} onRemove={removeCard} />
      </Sec>

      {cardModal && <CardModal data={cardModal.data} onSave={saveCard} onClose={() => setCardModal(null)} />}
      <StickyFooter><button onClick={handleSave} style={S.saveBtn}>💾 デッキを保存</button></StickyFooter>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DECK DETAIL
═══════════════════════════════════════════════════════ */
function DeckDetail({ deck, onEdit, onBack }) {
  return (
    <div>
      <PageHeader title={deck.name} onBack={onBack} right={<Btn onClick={onEdit}>✏️ 編集</Btn>} />
      <AvatarView avatar={deck.avatar} />
      <Sec title={`🃏 デッキカード（${deck.cards?.length ?? 0}枚）`}>
        {(deck.cards ?? []).length === 0
          ? <p style={S.empty}>カードなし</p>
          : <CardList cards={deck.cards} readOnly />
        }
      </Sec>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED AVATAR EDITOR / VIEW
═══════════════════════════════════════════════════════ */
function AvatarEditor({ avatar, onBattleType, onSkillRace, onSkillLevel }) {
  const usedRaces = avatar.skills.filter(s => s.race).map(s => s.race);
  return (
    <Sec title="🎮 アバター設定">
      <Label>バトルタイプ</Label>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {BATTLE_TYPES.map(t => {
          const m = BATTLE_TYPE_META[t]; const active = avatar.battleType === t;
          return (
            <button key={t} onClick={() => onBattleType(t)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "11px 4px", borderRadius: 10, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif",
              background: active ? `${m.color}28` : "rgba(255,255,255,0.04)",
              border: `2px solid ${active ? m.color : "rgba(255,255,255,0.1)"}`,
              color: active ? m.color : "rgba(255,255,255,0.4)",
              boxShadow: active ? `0 0 14px ${m.glow}` : "none",
            }}>
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{t}</span>
              <span style={{ fontSize: 9, fontFamily: "Rajdhani", opacity: 0.7 }}>{m.desc}</span>
            </button>
          );
        })}
      </div>

      <Label>スキル（3スロット・同種族不可）</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {avatar.skills.map((skill, i) => {
          const m = skill.race ? SKILL_RACE_META[skill.race] : null;
          const available = SKILL_RACES.filter(r => !usedRaces.includes(r) || r === skill.race);
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, background: m ? `${m.color}22` : "rgba(255,255,255,0.05)", border: `1px solid ${m ? m.color + "55" : "rgba(255,255,255,0.1)"}` }}>
                {m ? m.icon : <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{i + 1}</span>}
              </div>
              <select value={skill.race} onChange={e => onSkillRace(i, e.target.value)} style={{ ...S.input, flex: 1 }}>
                <option value="">── 種族を選択 ──</option>
                {available.map(r => <option key={r} value={r}>{SKILL_RACE_META[r].icon} {r}</option>)}
              </select>
              <select value={skill.level} onChange={e => onSkillLevel(i, e.target.value)} disabled={!skill.race}
                style={{ ...S.input, width: 78, flexShrink: 0, opacity: skill.race ? 1 : 0.3 }}>
                {SKILL_LEVELS.map(l => <option key={l} value={l}>Lv {l}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </Sec>
  );
}

function AvatarView({ avatar }) {
  const m = avatar?.battleType ? BATTLE_TYPE_META[avatar.battleType] : null;
  return (
    <Sec title="🎮 アバター">
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <Label>バトルタイプ</Label>
          <BTypePill type={avatar?.battleType} large />
        </div>
        <div>
          <Label>スキル</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {avatar?.skills?.filter(s => s.race).map((s, i) => {
              const m2 = SKILL_RACE_META[s.race];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: `${m2.color}10`, border: `1px solid ${m2.color}40`, borderRadius: 8, padding: "6px 12px" }}>
                  <span>{m2.icon}</span>
                  <span style={{ color: m2.color, fontWeight: 700, fontSize: 13 }}>{s.race}</span>
                  <span style={{ background: `${m2.color}28`, borderRadius: 4, padding: "1px 8px", fontSize: 12, color: m2.color, fontWeight: 700 }}>Lv {s.level}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Sec>
  );
}

/* ─── CARD LIST ─────────────────────────────────────── */
function CardList({ cards, onEdit, onRemove, readOnly, compact }) {
  if (!cards || cards.length === 0) return <p style={S.empty}>カードなし</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 6, marginTop: readOnly ? 0 : 10 }}>
      {cards.map((c, idx) => (
        <div key={c.id ?? idx} style={{ ...S.cardRow, padding: compact ? "5px 8px" : "8px 10px" }}>
          <CTypePill type={c.type} />
          <span style={{ ...S.cardNum, fontSize: compact ? 10 : 11 }}>{c.cardNumber}</span>
          <span style={{ ...S.cardChar, fontSize: compact ? 12 : 14 }}>{c.characterName || "（名前未入力）"}</span>
          {!readOnly && <>
            <SmBtn blue onClick={() => onEdit(idx)}>編集</SmBtn>
            <button onClick={() => onRemove(idx)} style={S.removeBtn}>×</button>
          </>}
        </div>
      ))}
    </div>
  );
}

/* ─── CARD MODAL ────────────────────────────────────── */
function CardModal({ data, onSave, onClose }) {
  const [form, setForm] = useState(data);
  const [err, setErr] = useState("");
  const handle = () => {
    if (!form.cardNumber.trim() && !form.characterName.trim()) { setErr("カード番号またはキャラ名を入力してください"); return; }
    onSave(form);
  };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <h3 style={S.mTitle}>🃏 カード登録</h3>
        {err && <ErrBox style={{ marginBottom: 12 }}>{err}</ErrBox>}
        <Label>カードタイプ</Label>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {CARD_TYPES.map(t => {
            const m = CARD_TYPE_META[t]; const active = form.type === t;
            return (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                flex: 1, minWidth: 60, padding: "9px 4px", borderRadius: 8, cursor: "pointer",
                background: active ? `${m.color}22` : "rgba(255,255,255,0.04)",
                border: `2px solid ${active ? m.color : "rgba(255,255,255,0.1)"}`,
                color: active ? m.color : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 12,
                fontFamily: "'Noto Sans JP',sans-serif",
              }}>{t}</button>
            );
          })}
        </div>
        <Label>カードナンバー</Label>
        <input value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="例: DB2-001" style={{ ...S.input, marginBottom: 14 }} />
        <Label>キャラクター名</Label>
        <input value={form.characterName} onChange={e => setForm(f => ({ ...f, characterName: e.target.value }))} placeholder="例: 孫悟空" style={{ ...S.input, marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={S.cancelBtn}>キャンセル</button>
          <button onClick={handle} style={{ ...S.saveBtn, margin: 0, flex: 2, padding: "12px", fontSize: 14 }}>確定</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOURNAMENT LIST
═══════════════════════════════════════════════════════ */
function TournList({ tourns, onNew, onEdit, onDetail, onDel }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, letterSpacing: 0.5 }}>参加人数を選んで大会を作成</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[8, 16].map(n => (
            <button key={n} onClick={() => onNew(n)} style={S.sizeBtn}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(217,119,6,.7)"; e.currentTarget.style.background = "rgba(251,191,36,.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,160,0,.2)"; e.currentTarget.style.background = "#fff"; }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{n === 8 ? "🥊" : "🏟️"}</div>
              <div style={{ fontFamily: "Rajdhani", fontSize: 24, fontWeight: 700, color: "#fbbf24", lineHeight: 1 }}>{n}人</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 3 }}>トーナメント</div>
            </button>
          ))}
        </div>
      </div>
      {tourns.length === 0
        ? <Empty icon="🏆" text="大会がまだありません。上のボタンから作成してください！" />
        : tourns.map(t => (
          <div key={t.id} style={S.card} onClick={() => onDetail(t)}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(217,119,6,.7)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,160,0,.18)"}>
            <div style={{ fontSize: 30 }}>{t.size === 8 ? "🥊" : "🏟️"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.cardName}>{t.name || "（無名の大会）"}</div>
              <div style={S.chipRow}>
                <Chip>{t.size}人</Chip>
                {t.date  && <Chip>📅 {t.date}</Chip>}
                {t.venue && <Chip>📍 {t.venue}</Chip>}
              </div>
            </div>
            <div style={S.btnRow} onClick={e => e.stopPropagation()}>
              <SmBtn blue onClick={() => onEdit(t)}>編集</SmBtn>
              <SmBtn red  onClick={() => { if (confirm("削除しますか？")) onDel(t.id); }}>削除</SmBtn>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOURNAMENT EDITOR
═══════════════════════════════════════════════════════ */
function TournEditor({ tourn, onSave, onBack }) {
  const [form, setForm] = useState(tourn);
  const [openIdx, setOpenIdx] = useState(null); // which player panel is expanded
  const [cardModal, setCardModal] = useState(null); // { playerIdx, cardIdx|null, data }

  const setPlayer = (i, patch) => setForm(f => {
    const players = [...f.players];
    players[i] = { ...players[i], ...patch };
    return { ...f, players };
  });
  const setPlayerAv = (i, patch) => setPlayer(i, { avatar: { ...form.players[i].avatar, ...patch } });
  const setSkillRace  = (pi, si, race)  => { const skills = [...form.players[pi].avatar.skills]; skills[si] = { ...skills[si], race };         setPlayerAv(pi, { skills }); };
  const setSkillLevel = (pi, si, level) => { const skills = [...form.players[pi].avatar.skills]; skills[si] = { ...skills[si], level: +level }; setPlayerAv(pi, { skills }); };

  const openCardAdd  = (pi)        => setCardModal({ playerIdx: pi, cardIdx: null, data: emptyCard() });
  const openCardEdit = (pi, ci)    => setCardModal({ playerIdx: pi, cardIdx: ci, data: { ...form.players[pi].cards[ci] } });
  const saveCard = data => {
    const { playerIdx: pi, cardIdx: ci } = cardModal;
    const cards = [...form.players[pi].cards];
    ci !== null ? (cards[ci] = data) : cards.push(data);
    setPlayer(pi, { cards });
    setCardModal(null);
  };
  const removeCard = (pi, ci) => { const cards = form.players[pi].cards.filter((_, i) => i !== ci); setPlayer(pi, { cards }); };

  const canAddCard = (pi) => form.players[pi].cards.length < 7;

  return (
    <div>
      <PageHeader title={`${form.size}人大会を設定`} onBack={onBack} />

      {/* 大会情報 */}
      <Sec title="🏆 大会情報">
        <Label>大会名</Label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="大会名を入力..." style={{ ...S.input, marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>開催日</Label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={S.input} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>開催地</Label>
            <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="例: 東京会場" style={S.input} />
          </div>
        </div>
      </Sec>

      {/* 参加者 */}
      <Sec title="👥 参加者登録">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {form.players.map((p, pi) => {
            const label = playerLabel(p);
            const isOpen = openIdx === pi;
            const m = BATTLE_TYPE_META[p.avatar?.battleType];
            return (
              <div key={p.id} style={{ border: `1px solid ${isOpen ? "rgba(255,140,0,.45)" : "rgba(255,255,255,.07)"}`, borderRadius: 12, overflow: "hidden", transition: "border-color .15s" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: isOpen ? "rgba(251,191,36,.1)" : "#fafafa", cursor: "pointer" }}
                  onClick={() => setOpenIdx(isOpen ? null : pi)}>
                  <div style={S.seedBadge}>{label}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input value={p.name} onChange={e => { e.stopPropagation(); setPlayer(pi, { name: e.target.value }); }}
                      onClick={e => e.stopPropagation()}
                      placeholder={`プレイヤー ${label}`}
                      style={{ ...S.input, background: "transparent", border: "none", padding: "0", fontSize: 14, fontWeight: 700, color: "#f1f5f9", width: "100%" }} />
                  </div>
                  <BTypePill type={p.avatar?.battleType} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", flexShrink: 0 }}>{p.cards.length}/7枚</span>
                  <span style={{ color: "rgba(255,140,0,.6)", fontSize: 14, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* Expanded panel */}
                {isOpen && (
                  <div style={{ padding: "14px", borderTop: "1px solid rgba(255,255,255,.05)", background: "rgba(255,250,235,.8)" }}>
                    {/* Battle type */}
                    <Label>バトルタイプ</Label>
                    <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                      {BATTLE_TYPES.map(t => {
                        const mt = BATTLE_TYPE_META[t]; const active = p.avatar.battleType === t;
                        return (
                          <button key={t} onClick={() => setPlayerAv(pi, { battleType: t })} style={{
                            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                            padding: "9px 4px", borderRadius: 9, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif",
                            background: active ? `${mt.color}25` : "rgba(255,255,255,.04)",
                            border: `2px solid ${active ? mt.color : "rgba(255,255,255,.1)"}`,
                            color: active ? mt.color : "rgba(255,255,255,.4)",
                            boxShadow: active ? `0 0 12px ${mt.glow}` : "none",
                          }}>
                            <span style={{ fontSize: 16 }}>{mt.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{t}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Skills */}
                    <Label>スキル（3スロット）</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                      {p.avatar.skills.map((skill, si) => {
                        const usedR = p.avatar.skills.filter(s => s.race).map(s => s.race);
                        const avail = SKILL_RACES.filter(r => !usedR.includes(r) || r === skill.race);
                        const ms = skill.race ? SKILL_RACE_META[skill.race] : null;
                        return (
                          <div key={si} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, background: ms ? `${ms.color}22` : "rgba(255,255,255,.05)", border: `1px solid ${ms ? ms.color + "55" : "rgba(255,255,255,.1)"}` }}>
                              {ms ? ms.icon : <span style={{ fontSize: 9, color: "rgba(255,255,255,.25)" }}>{si + 1}</span>}
                            </div>
                            <select value={skill.race} onChange={e => setSkillRace(pi, si, e.target.value)} style={{ ...S.input, flex: 1, fontSize: 12 }}>
                              <option value="">── 種族 ──</option>
                              {avail.map(r => <option key={r} value={r}>{SKILL_RACE_META[r].icon} {r}</option>)}
                            </select>
                            <select value={skill.level} onChange={e => setSkillLevel(pi, si, e.target.value)} disabled={!skill.race}
                              style={{ ...S.input, width: 72, flexShrink: 0, fontSize: 12, opacity: skill.race ? 1 : 0.3 }}>
                              {SKILL_LEVELS.map(l => <option key={l} value={l}>Lv {l}</option>)}
                            </select>
                          </div>
                        );
                      })}
                    </div>

                    {/* Cards */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <Label>カード（{p.cards.length}/7枚）</Label>
                      {canAddCard(pi) && <button onClick={() => openCardAdd(pi)} style={S.smAddBtn}>＋ カード追加</button>}
                    </div>
                    <CardList cards={p.cards} onEdit={ci => openCardEdit(pi, ci)} onRemove={ci => removeCard(pi, ci)} compact />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Sec>

      {cardModal && <CardModal data={cardModal.data} onSave={saveCard} onClose={() => setCardModal(null)} />}
      <StickyFooter><button onClick={() => onSave(form)} style={S.saveBtn}>💾 大会を保存</button></StickyFooter>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOURNAMENT DETAIL
═══════════════════════════════════════════════════════ */
function TournDetail({ tourn, decks, onEdit, onBack }) {
  const { size, players, name, date, venue } = tourn;
  const rounds = Math.log2(size);
  const roundLabels = buildRoundLabels(rounds);
  const bracketPairs = buildBracket(size);
  const [detailPlayer, setDetailPlayer] = useState(null);
  const [imgModal, setImgModal] = useState(false);

  /* ── Canvas image generator ── */
  const generateImage = () => {
    // Layout constants
    const COLS = 2;
    const CARD_W = 480;
    const PAD = 24;
    const HEADER_H = 100;
    const PLAYER_H = 280; // per player card
    const GAP = 16;
    const ROWS = Math.ceil(players.length / COLS);
    const W = COLS * CARD_W + (COLS + 1) * GAP;
    const H = HEADER_H + ROWS * (PLAYER_H + GAP) + GAP + 20;

    const canvas = document.createElement("canvas");
    const DPR = 2; // retina
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR);

    // BG gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fffbf0");
    bg.addColorStop(0.5, "#fff8e1");
    bg.addColorStop(1, "#f0f6ff");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid pattern
    ctx.strokeStyle = "rgba(180,130,0,0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Header band
    const hg = ctx.createLinearGradient(0,0,W,0);
    hg.addColorStop(0, "#d97706");
    hg.addColorStop(0.5, "#f59e0b");
    hg.addColorStop(1, "#dc2626");
    ctx.fillStyle = hg;
    roundRect(ctx, 0, 0, W, HEADER_H, 0);
    ctx.fill();

    // Header text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px 'Noto Sans JP', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name || "大会デッキ一覧", W/2, 40);
    ctx.font = "16px 'Noto Sans JP', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    const meta = [size+"人トーナメント", date, venue].filter(Boolean).join("  |  ");
    ctx.fillText(meta, W/2, 68);
    ctx.font = "13px 'Noto Sans JP', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText("DRAGON BALL SUPER DIVERS — DBSDV Deck Builder", W/2, 90);

    // Player cards
    players.forEach((p, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const cx = GAP + col * (CARD_W + GAP);
      const cy = HEADER_H + GAP + row * (PLAYER_H + GAP);

      // Card shadow
      ctx.shadowColor = "rgba(180,130,0,0.15)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      // Card bg
      ctx.fillStyle = "#fff";
      roundRect(ctx, cx, cy, CARD_W, PLAYER_H, 14);
      ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      // Card border
      ctx.strokeStyle = "rgba(200,160,0,0.35)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, cx, cy, CARD_W, PLAYER_H, 14);
      ctx.stroke();

      // Battle type accent bar (top edge)
      const bm = BATTLE_TYPE_META[p.avatar?.battleType] ?? { color: "#ccc" };
      ctx.fillStyle = bm.color;
      roundRect(ctx, cx, cy, CARD_W, 6, [14,14,0,0]);
      ctx.fill();

      // Seed badge
      const lbl = playerLabel(p);
      ctx.fillStyle = "rgba(251,191,36,0.25)";
      circle(ctx, cx+PAD+14, cy+30, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(217,119,6,0.6)";
      ctx.lineWidth = 2;
      circle(ctx, cx+PAD+14, cy+30, 18);
      ctx.stroke();
      ctx.fillStyle = "#92400e";
      ctx.font = "bold 15px Rajdhani, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lbl, cx+PAD+14, cy+35);

      // Player name
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 18px 'Noto Sans JP', sans-serif";
      ctx.textAlign = "left";
      const pname = p.name || "（未登録）";
      ctx.fillText(pname.length > 16 ? pname.slice(0,16)+"…" : pname, cx+PAD+40, cy+35);

      // Battle type pill
      ctx.fillStyle = bm.color+"22";
      roundRect(ctx, cx+PAD+40, cy+45, 90, 22, 6);
      ctx.fill();
      ctx.strokeStyle = bm.color+"88";
      ctx.lineWidth = 1;
      roundRect(ctx, cx+PAD+40, cy+45, 90, 22, 6);
      ctx.stroke();
      ctx.fillStyle = bm.color;
      ctx.font = "bold 12px 'Noto Sans JP', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((bm.icon||"")+" "+p.avatar?.battleType, cx+PAD+85, cy+60);

      // Skills
      const skills = (p.avatar?.skills||[]).filter(s=>s.race);
      skills.forEach((s, si) => {
        const sm = SKILL_RACE_META[s.race];
        if (!sm) return;
        const sx = cx+PAD+40 + si*110;
        const sy = cy+75;
        ctx.fillStyle = sm.color+"18";
        roundRect(ctx, sx, sy, 100, 20, 5);
        ctx.fill();
        ctx.strokeStyle = sm.color+"55";
        ctx.lineWidth = 1;
        roundRect(ctx, sx, sy, 100, 20, 5);
        ctx.stroke();
        ctx.fillStyle = sm.color;
        ctx.font = "bold 11px 'Noto Sans JP', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sm.icon+" "+s.race+" Lv"+s.level, sx+50, sy+14);
      });

      // Divider
      ctx.strokeStyle = "rgba(200,160,0,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx+PAD, cy+104); ctx.lineTo(cx+CARD_W-PAD, cy+104); ctx.stroke();

      // Cards label
      ctx.fillStyle = "#b45309";
      ctx.font = "bold 10px Rajdhani, sans-serif";
      ctx.textAlign = "left";
      ctx.letterSpacing = "1px";
      ctx.fillText("🃏 DECK CARDS", cx+PAD, cy+120);
      ctx.letterSpacing = "0px";

      // Card list
      const cards = p.cards || [];
      cards.slice(0, 7).forEach((c, ci) => {
        const cm = CARD_TYPE_META[c.type] ?? { color: "#999" };
        const ly = cy + 130 + ci * 20;
        const lx = cx + PAD;

        // type pill
        ctx.fillStyle = cm.color+"22";
        roundRect(ctx, lx, ly, 60, 16, 4);
        ctx.fill();
        ctx.strokeStyle = cm.color+"88";
        ctx.lineWidth = 1;
        roundRect(ctx, lx, ly, 60, 16, 4);
        ctx.stroke();
        ctx.fillStyle = cm.color;
        ctx.font = "bold 9px 'Noto Sans JP', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(c.type, lx+30, ly+11);

        // card number
        ctx.fillStyle = "#92400e";
        ctx.font = "10px Rajdhani, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(c.cardNumber || "", lx+68, ly+11);

        // character name
        ctx.fillStyle = "#1a1a2e";
        ctx.font = "12px 'Noto Sans JP', sans-serif";
        const charName = c.characterName || "（未入力）";
        ctx.fillText(charName.length > 14 ? charName.slice(0,14)+"…" : charName, lx+130, ly+11);
      });

      if (cards.length === 0) {
        ctx.fillStyle = "rgba(180,130,0,0.3)";
        ctx.font = "12px 'Noto Sans JP', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("カードなし", cx+CARD_W/2, cy+160);
      }
    });

    // Footer
    ctx.fillStyle = "rgba(180,130,0,0.4)";
    ctx.font = "11px 'Noto Sans JP', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Generated by DBSDV Deck Builder", W/2, H-8);

    return canvas.toDataURL("image/png");
  };

  const handleSaveImage = () => {
    const dataUrl = generateImage();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${name || "tournament"}_decks.png`;
    a.click();
  };

  const handlePreviewImage = () => {
    setImgModal(generateImage());
  };

  return (
    <div>
      <PageHeader
        title={name || "（無名の大会）"}
        onBack={onBack}
        right={<Btn onClick={onEdit}>✏️ 編集</Btn>}
        sub={
          <div style={S.chipRow}>
            <Chip color="#fbbf24">{size}人トーナメント</Chip>
            {date  && <Chip>📅 {date}</Chip>}
            {venue && <Chip>📍 {venue}</Chip>}
          </div>
        }
      />

      {/* 画像出力ボタン */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={handlePreviewImage} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#fffbf0,#fff8e1)", border: "2px solid rgba(217,119,6,.45)", borderRadius: 12, padding: "14px 10px", cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700, fontSize: 14, color: "#92400e", boxShadow: "0 2px 8px rgba(180,130,0,.1)" }}>
          <span style={{ fontSize: 20 }}>🖼️</span> デッキ一覧を画像で見る
        </button>
        <button onClick={handleSaveImage} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "linear-gradient(135deg,#f59e0b,#dc2626)", border: "none", borderRadius: 12, padding: "14px 16px", cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", boxShadow: "0 4px 14px rgba(220,38,38,.25)" }}>
          <span style={{ fontSize: 18 }}>💾</span> 保存
        </button>
      </div>

      {/* BRACKET */}
      <Sec title="🏆 トーナメント表">
        <div style={{ overflowX: "auto", paddingBottom: 6 }}>
          <div style={{ display: "flex", minWidth: size === 16 ? 680 : 500, alignItems: "stretch" }}>
            <BracketCol label={roundLabels[0]}>
              {bracketPairs.map((pair, pi) => (
                <BracketGroup key={pi} count={bracketPairs.length}>
                  {pair.map(seed => {
                    const p = players.find(x => x.seed === seed);
                    return <BracketSlot key={seed} player={p} onClick={() => setDetailPlayer(p)} />;
                  })}
                </BracketGroup>
              ))}
            </BracketCol>
            {Array.from({ length: rounds - 1 }, (_, ri) => {
              const count = Math.pow(2, rounds - 2 - ri);
              return (
                <div key={ri} style={{ display: "flex", flex: 1 }}>
                  <BracketLines count={count} />
                  <BracketCol label={roundLabels[ri + 1]}>
                    {Array.from({ length: count }, (_, mi) => (
                      <BracketGroup key={mi} count={count}>
                        <EmptySlot /><EmptySlot />
                      </BracketGroup>
                    ))}
                  </BracketCol>
                </div>
              );
            })}
          </div>
        </div>
      </Sec>

      {/* Player list */}
      <Sec title="👥 参加者一覧">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {players.map(p => (
            <div key={p.id} style={{ ...S.card, cursor: "pointer", padding: "12px 14px" }}
              onClick={() => setDetailPlayer(detailPlayer?.id === p.id ? null : p)}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(217,119,6,.65)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,160,0,.18)"}>
              <div style={S.seedBadge}>{playerLabel(p)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
                  {p.name || <span style={{ color: "rgba(180,130,0,.4)", fontWeight: 400 }}>未登録</span>}
                </div>
                <div style={{ ...S.chipRow, marginTop: 4 }}>
                  <BTypePill type={p.avatar?.battleType} />
                  {p.avatar?.skills?.filter(s => s.race).map((s, i) => {
                    const ms = SKILL_RACE_META[s.race];
                    return <Chip key={i} color={ms.color}>{ms.icon} {s.race} Lv{s.level}</Chip>;
                  })}
                  <Chip>{p.cards?.length ?? 0}/7枚</Chip>
                </div>
                {detailPlayer?.id === p.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(200,160,0,.15)" }}>
                    <CardList cards={p.cards} readOnly compact />
                  </div>
                )}
              </div>
              <span style={{ fontSize: 12, color: "rgba(217,119,6,.5)", flexShrink: 0 }}>{detailPlayer?.id === p.id ? "▲" : "▼"}</span>
            </div>
          ))}
        </div>
      </Sec>

      {/* Player deck modal */}
      {detailPlayer && (
        <div style={S.overlay} onClick={() => setDetailPlayer(null)}>
          <div style={{ ...S.modal, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ ...S.seedBadge, width: 32, height: 32, fontSize: 16 }}>{playerLabel(detailPlayer)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>{detailPlayer.name || `プレイヤー ${playerLabel(detailPlayer)}`}</div>
                <BTypePill type={detailPlayer.avatar?.battleType} />
              </div>
              <button onClick={() => setDetailPlayer(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#92400e", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <AvatarView avatar={detailPlayer.avatar} />
            <div style={{ marginTop: 12 }}>
              <div style={S.secTitle}>🃏 カード（{detailPlayer.cards?.length ?? 0}枚）</div>
              <CardList cards={detailPlayer.cards} readOnly />
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {imgModal && (
        <div style={{ ...S.overlay, flexDirection: "column", gap: 0, padding: 0, background: "rgba(0,0,0,.85)" }} onClick={() => setImgModal(null)}>
          <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", height: "100dvh" }} onClick={e => e.stopPropagation()}>
            {/* toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(0,0,0,.4)", flexShrink: 0 }}>
              <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 15, fontFamily: "Rajdhani" }}>🖼️ デッキ一覧画像</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleSaveImage} style={{ background: "linear-gradient(135deg,#f59e0b,#dc2626)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif" }}>💾 画像を保存</button>
                <button onClick={() => setImgModal(null)} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>
            </div>
            {/* scrollable image */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: 16, display: "flex", justifyContent: "center" }}>
              <img src={imgModal} alt="デッキ一覧" style={{ maxWidth: "100%", height: "auto", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,.5)", display: "block" }} />
            </div>
            <div style={{ padding: "10px 16px", textAlign: "center", color: "rgba(255,255,255,.4)", fontSize: 11, flexShrink: 0 }}>
              長押し（iPhone）またはPCで右クリック → 画像を保存
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Canvas utilities ─────────────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === "number") r = [r,r,r,r];
  const [tl,tr,br,bl] = r;
  ctx.beginPath();
  ctx.moveTo(x+tl, y);
  ctx.lineTo(x+w-tr, y); ctx.arcTo(x+w,y, x+w,y+tr, tr);
  ctx.lineTo(x+w, y+h-br); ctx.arcTo(x+w,y+h, x+w-br,y+h, br);
  ctx.lineTo(x+bl, y+h); ctx.arcTo(x,y+h, x,y+h-bl, bl);
  ctx.lineTo(x, y+tl); ctx.arcTo(x,y, x+tl,y, tl);
  ctx.closePath();
}
function circle(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.closePath();
}

/* ─── BRACKET HELPERS ───────────────────────────────── */
function buildBracket(n) {
  const order = buildSeeds(n); const pairs = [];
  for (let i = 0; i < order.length; i += 2) pairs.push([order[i], order[i + 1]]);
  return pairs;
}
function buildSeeds(n) {
  if (n === 1) return [1];
  const h = buildSeeds(n / 2); const r = [];
  for (const s of h) { r.push(s); r.push(n + 1 - s); }
  return r;
}
function buildRoundLabels(rounds) {
  return Array.from({ length: rounds }, (_, i) => {
    if (i === rounds - 1) return "決勝";
    if (i === rounds - 2) return "準決勝";
    return `${i + 1}回戦`;
  });
}

function BracketCol({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 158, flex: "1 1 auto" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#b45309", fontFamily: "Rajdhani", letterSpacing: 1, textAlign: "center", paddingBottom: 6 }}>{label}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>{children}</div>
    </div>
  );
}
function BracketGroup({ children }) {
  return <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, padding: "4px 4px" }}>{children}</div>;
}
function BracketLines({ count }) {
  return (
    <div style={{ width: 16, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, borderTop: "2px solid rgba(217,119,6,.35)", borderRight: "2px solid rgba(217,119,6,.35)", borderTopRightRadius: 3 }} />
          <div style={{ flex: 1, borderBottom: "2px solid rgba(217,119,6,.35)", borderRight: "2px solid rgba(217,119,6,.35)", borderBottomRightRadius: 3 }} />
        </div>
      ))}
    </div>
  );
}
function BracketSlot({ player, onClick }) {
  const m = player?.avatar?.battleType ? BATTLE_TYPE_META[player.avatar.battleType] : null;
  const label = player ? playerLabel(player) : "?";
  return (
    <div onClick={onClick} style={{ background: "rgba(255,255,255,.8)", border: `1.5px solid ${m ? m.color + "88" : "rgba(200,160,0,.2)"}`, borderRadius: 7, padding: "6px 9px", minHeight: 46, cursor: "pointer", transition: "background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(251,191,36,.12)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.6)"}>
      <div style={{ fontWeight: 700, fontSize: 12, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{ color: "rgba(255,140,0,.7)", marginRight: 5, fontFamily: "Rajdhani", fontSize: 11 }}>{label}</span>
        {player?.name || <span style={{ color: "rgba(180,130,0,.4)", fontWeight: 400 }}>未登録</span>}
      </div>
      {m && <div style={{ fontSize: 10, color: m.color, marginTop: 2 }}>{m.icon} {player.avatar.battleType}</div>}
    </div>
  );
}
function EmptySlot() {
  return (
    <div style={{ background: "rgba(250,245,230,.6)", border: "1.5px dashed rgba(200,160,0,.2)", borderRadius: 7, padding: "6px 9px", minHeight: 46, display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: "rgba(180,130,0,.35)" }}>勝者</span>
    </div>
  );
}

/* ─── SHARED SMALL COMPONENTS ───────────────────────── */
function BTypePill({ type, large }) {
  const m = BATTLE_TYPE_META[type] ?? { color: "#9ca3af", icon: "？" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${m.color}20`, border: `1px solid ${m.color}55`, borderRadius: 6, padding: large ? "6px 12px" : "3px 8px", flexShrink: 0 }}>
      <span style={{ fontSize: large ? 15 : 11 }}>{m.icon}</span>
      <span style={{ fontSize: large ? 13 : 11, fontWeight: 700, color: m.color }}>{type ?? "未設定"}</span>
    </div>
  );
}
function CTypePill({ type }) {
  const m = CARD_TYPE_META[type] ?? { color: "#9ca3af" };
  return <span style={{ background: `${m.color}20`, border: `1px solid ${m.color}55`, borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 700, color: m.color, flexShrink: 0 }}>{type}</span>;
}
function Chip({ children, color }) {
  return <span style={{ fontSize: 11, color: color || "rgba(255,255,255,.35)", background: color ? `${color}15` : "rgba(255,255,255,.05)", borderRadius: 4, padding: "2px 7px" }}>{children}</span>;
}
function Sec({ title, children }) {
  return (
    <div style={S.sec}>
      <div style={S.secTitle}>{title}</div>
      {children}
    </div>
  );
}
function Label({ children }) { return <div style={S.label}>{children}</div>; }
function ErrBox({ children }) { return <div style={S.errBox}>{children}</div>; }
function Empty({ icon, text }) {
  return <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255,255,255,.25)" }}><div style={{ fontSize: 44, marginBottom: 10 }}>{icon}</div><p style={{ fontSize: 14, margin: 0 }}>{text}</p></div>;
}
function PageHeader({ title, onBack, right, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
      <button onClick={onBack} style={S.backBtn}>← 戻る</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h2>
        {sub && <div style={{ marginTop: 4 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
function Btn({ children, onClick, accent }) {
  return <button onClick={onClick} style={{ ...S.btn, ...(accent ? S.btnA : {}) }}>{children}</button>;
}
function SmBtn({ children, onClick, blue, red }) {
  return <button onClick={onClick} style={{ ...S.smBtn, ...(blue ? S.smBtnB : red ? S.smBtnR : {}) }}>{children}</button>;
}
function StickyFooter({ children }) {
  return (
    <div style={{
      position: "sticky",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: "12px 0 calc(12px + env(safe-area-inset-bottom))",
      background: "linear-gradient(to top, rgba(255,251,240,1) 60%, rgba(255,251,240,0))",
      marginTop: 12,
    }}>
      {children}
    </div>
  );
}

function Toast({ msg, type }) {
  return <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: type === "err" ? "rgba(220,38,38,.95)" : "rgba(5,150,105,.95)", color: "#fff", padding: "10px 22px", borderRadius: 8, fontWeight: 700, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,.4)", backdropFilter: "blur(8px)", whiteSpace: "nowrap" }}>{msg}</div>;
}
function BG() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-15%", left: "-10%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,180,30,.22) 0%,transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(30,130,255,.14) 0%,transparent 70%)" }} />
      <div style={{ position: "absolute", top: "40%", left: "50%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,220,60,.12) 0%,transparent 70%)", transform: "translateX(-50%)" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(180,130,0,.1)" strokeWidth="1"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>
    </div>
  );
}

/* ─── STYLES ────────────────────────────────────────── */
const S = {
  root:      { minHeight: "100vh", background: "linear-gradient(160deg,#fffbf0 0%,#fff8e1 40%,#f0f6ff 100%)", color: "#1a1a2e", fontFamily: "'Noto Sans JP',sans-serif", position: "relative", overflowX: "hidden" },
  wrap:      { position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "0 14px calc(120px + env(safe-area-inset-bottom))" },
  header:    { padding: "20px 0 0", marginBottom: 22, borderBottom: "2px solid rgba(230,160,0,.25)" },
  hInner:    { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 },
  title:     { fontFamily: "Rajdhani,sans-serif", fontSize: 22, fontWeight: 700, background: "linear-gradient(90deg,#d97706,#f59e0b,#dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2, lineHeight: 1.1 },
  sub:       { fontSize: 10, color: "rgba(180,100,0,.7)", letterSpacing: 3, fontFamily: "Rajdhani", textAlign: "center" },
  tabBar:    { display: "flex" },
  tab:       { flex: 1, padding: "12px 0", minHeight: 44, background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "rgba(30,30,60,.35)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif" },
  tabOn:     { color: "#d97706", borderBottom: "2px solid #d97706" },
  toolbar:   { display: "flex", gap: 10, marginBottom: 16 },
  searchInput:{ flex: 1, background: "#fff", border: "1.5px solid rgba(180,130,0,.25)", borderRadius: 8, padding: "10px 14px", color: "#1a1a2e", fontSize: 14, outline: "none", fontFamily: "'Noto Sans JP',sans-serif", boxShadow: "0 1px 4px rgba(180,130,0,.08)" },
  sec:       { marginBottom: 16, background: "#fff", border: "1.5px solid rgba(200,160,0,.18)", borderRadius: 16, padding: "18px", boxShadow: "0 2px 12px rgba(180,130,0,.07)" },
  secTitle:  { fontSize: 11, fontWeight: 700, color: "#b45309", letterSpacing: 1, marginBottom: 14, fontFamily: "Rajdhani" },
  card:      { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1.5px solid rgba(200,160,0,.18)", borderRadius: 14, padding: "16px", marginBottom: 10, cursor: "pointer", transition: "border-color .15s", boxShadow: "0 2px 8px rgba(180,130,0,.06)" },
  cardName:  { fontWeight: 700, fontSize: 15, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  chipRow:   { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
  btnRow:    { display: "flex", gap: 6 },
  cardRow:   { display: "flex", alignItems: "center", gap: 7, background: "#fafafa", borderRadius: 7, padding: "8px 10px", border: "1.5px solid rgba(200,160,0,.15)" },
  cardNum:   { fontSize: 11, color: "#92400e", flexShrink: 0, minWidth: 56, fontFamily: "Rajdhani" },
  cardChar:  { fontSize: 14, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1a1a2e" },
  input:     { width: "100%", boxSizing: "border-box", background: "#fff", border: "1.5px solid rgba(180,130,0,.25)", borderRadius: 10, padding: "13px 14px", color: "#1a1a2e", fontSize: 14, outline: "none", fontFamily: "'Noto Sans JP',sans-serif", marginBottom: 0, boxShadow: "inset 0 1px 3px rgba(180,130,0,.06)" },
  label:     { fontSize: 11, color: "#92400e", marginBottom: 6, letterSpacing: .3, fontWeight: 600 },
  addBtn:    { width: "100%", background: "rgba(251,191,36,.12)", border: "1.5px dashed rgba(217,119,6,.4)", borderRadius: 10, padding: "14px", color: "#b45309", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700 },
  smAddBtn:  { background: "rgba(251,191,36,.2)", border: "1.5px solid rgba(217,119,6,.4)", borderRadius: 6, padding: "4px 11px", color: "#b45309", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700, flexShrink: 0 },
  saveBtn:   { width: "100%", background: "linear-gradient(135deg,#f59e0b,#dc2626)", border: "none", borderRadius: 12, padding: "17px", color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "Rajdhani,sans-serif", letterSpacing: 1, marginTop: 0, boxShadow: "0 4px 16px rgba(220,38,38,.25)" },
  backBtn:   { background: "rgba(180,130,0,.08)", border: "1.5px solid rgba(180,130,0,.2)", borderRadius: 8, padding: "10px 16px", minHeight: 44, color: "#78350f", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", flexShrink: 0 },
  btn:       { background: "rgba(245,158,11,.15)", border: "1.5px solid rgba(217,119,6,.4)", borderRadius: 8, padding: "10px 16px", minHeight: 44, color: "#b45309", fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700, flexShrink: 0 },
  btnA:      { background: "linear-gradient(135deg,#f59e0b,#dc2626)", border: "none", color: "#fff", boxShadow: "0 2px 10px rgba(220,38,38,.2)" },
  smBtn:     { background: "rgba(180,130,0,.07)", border: "1.5px solid rgba(180,130,0,.18)", borderRadius: 6, padding: "8px 13px", minHeight: 40, color: "#78350f", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif", flexShrink: 0 },
  smBtnB:    { background: "rgba(59,130,246,.1)", border: "1.5px solid rgba(59,130,246,.35)", color: "#1d4ed8" },
  smBtnR:    { background: "rgba(239,68,68,.08)", border: "1.5px solid rgba(239,68,68,.3)", color: "#dc2626" },
  removeBtn: { background: "none", border: "none", color: "rgba(220,38,38,.55)", fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1, flexShrink: 0 },
  overlay:   { position: "fixed", inset: 0, zIndex: 200, background: "rgba(30,20,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" },
  modal:     { background: "#fffdf5", border: "2px solid rgba(217,119,6,.35)", borderRadius: 20, padding: "24px 20px", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(180,100,0,.18)", maxHeight: "88dvh", overflowY: "auto" },
  mTitle:    { margin: "0 0 18px", fontFamily: "Rajdhani", fontSize: 17, color: "#b45309", fontWeight: 700 },
  cancelBtn: { flex: 1, background: "rgba(180,130,0,.07)", border: "1.5px solid rgba(180,130,0,.2)", borderRadius: 8, padding: "12px", color: "#78350f", fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans JP',sans-serif" },
  errBox:    { background: "rgba(239,68,68,.08)", border: "1.5px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "9px 14px", color: "#dc2626", fontSize: 13, marginBottom: 14 },
  seedBadge: { width: 28, height: 28, borderRadius: "50%", background: "rgba(251,191,36,.25)", border: "2px solid rgba(217,119,6,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#92400e", flexShrink: 0, fontFamily: "Rajdhani" },
  sizeBtn:   { flex: 1, background: "#fff", border: "1.5px solid rgba(200,160,0,.2)", borderRadius: 14, padding: "18px 10px", cursor: "pointer", textAlign: "center", fontFamily: "'Noto Sans JP',sans-serif", transition: "all .15s", boxShadow: "0 2px 8px rgba(180,130,0,.07)" },
  empty:     { color: "rgba(30,20,0,.3)", fontSize: 13, margin: "6px 0 0" },
};

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
