import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dumbbell, Footprints, Droplet, BookOpen, Briefcase, Phone, Moon, GraduationCap,
  Flame, Trophy, Target, Calendar, Plus, Minus, Check, ChevronLeft, ChevronRight,
  Award, TrendingUp, Sparkles, Lock, BookMarked, Compass, Anchor, Star, Zap
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

// ============ THEME ============
const THEME = {
  bg: '#1a1612',
  bgElevated: '#241f1a',
  bgCard: '#2b251f',
  border: '#3a3229',
  borderBright: '#544739',
  fg: '#f0e6d2',
  fgDim: '#a8a092',
  fgFaint: '#6b6357',
  brass: '#c8975a',
  brassBright: '#e3b378',
  sage: '#8aab85',
  terra: '#c87a5a',
  ink: '#7a93a8',
};

const FONT_DISPLAY = '"Fraunces", "Iowan Old Style", Georgia, serif';
const FONT_BODY = '"Manrope", -apple-system, system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';

// ============ HABIT DEFINITIONS ============
const DEFAULT_HABITS = [
  { id: 'gym',       name: 'Gym',           icon: Dumbbell,       type: 'binary',  color: '#c87a5a', sortOrder: 1 },
  { id: 'walking',   name: 'Walking',       icon: Footprints,     type: 'numeric', target: 8000,  unit: 'steps',   step: 500,  color: '#8aab85', sortOrder: 2 },
  { id: 'water',     name: 'Water',         icon: Droplet,        type: 'numeric', target: 8,     unit: 'glasses', step: 1,    color: '#7a93a8', sortOrder: 3 },
  { id: 'bible',     name: 'Bible Study',   icon: BookOpen,       type: 'binary',  color: '#c8975a', sortOrder: 4 },
  { id: 'work',      name: 'Day Job Focus', icon: Briefcase,      type: 'binary',  color: '#9a8fb5', sortOrder: 5 },
  { id: 'ringbase',  name: 'RingBase',      icon: Phone,          type: 'numeric', target: 30,    unit: 'mins',    step: 5,    color: '#e3b378', sortOrder: 6 },
  { id: 'fyp',       name: 'FYP Work',      icon: GraduationCap,  type: 'numeric', target: 60,    unit: 'mins',    step: 15,   color: '#6b9a9c', sortOrder: 7 },
  { id: 'sleep',     name: 'Sleep',         icon: Moon,           type: 'numeric', target: 7,     unit: 'hrs',     step: 0.5,  color: '#8a7eb5', sortOrder: 8 },
];

// ============ ACHIEVEMENTS ============
const ACHIEVEMENTS = [
  { id: 'first_log',    name: 'Cast Off',         desc: 'Log your first habit',                  icon: Anchor },
  { id: 'streak_3',     name: 'Building Steam',    desc: '3-day streak on any habit',             icon: Flame },
  { id: 'streak_7',     name: 'Week One Down',     desc: '7-day streak on any habit',             icon: Flame },
  { id: 'streak_14',    name: 'Two Weeks Strong',  desc: '14-day streak on any habit',            icon: Flame },
  { id: 'streak_30',    name: 'Habit Forged',      desc: '30-day streak on any habit',            icon: Award },
  { id: 'streak_100',   name: 'Centurion',         desc: '100-day streak on any habit',           icon: Trophy },
  { id: 'perfect_day',  name: 'Perfect Day',       desc: 'Complete every habit in one day',       icon: Star },
  { id: 'perfect_3',    name: 'Trifecta',          desc: '3 perfect days in a row',               icon: Star },
  { id: 'perfect_7',    name: 'Iron Will',         desc: '7 perfect days in a row',               icon: Trophy },
  { id: 'water_week',   name: 'Hydrated',          desc: 'Hit water goal 7 days running',         icon: Droplet },
  { id: 'gym_4_week',   name: 'In the Iron',       desc: 'Gym 4 times in one week',               icon: Dumbbell },
  { id: 'scripture_7',  name: 'Daily Bread',       desc: 'Bible study 7 days running',            icon: BookMarked },
  { id: 'rest_5',       name: 'Rest Discipline',   desc: 'Hit sleep target 5 days running',       icon: Moon },
  { id: 'walker_50k',   name: 'Long Hauler',       desc: '50,000 steps in a week',                icon: Footprints },
  { id: 'fyp_5h',       name: 'Final Year Grind',  desc: '5 hours of FYP work in a week',         icon: GraduationCap },
  { id: 'side_hustle',  name: 'Side Hustle',       desc: '3 hours of RingBase in a week',         icon: Phone },
  { id: 'logger_30',    name: 'Faithful Logger',   desc: 'Log on 30 different days',              icon: Calendar },
];

// ============ STORAGE ============
const STORAGE_KEY = 'logbook-state-v1';

const loadState = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Load failed', e);
  }
  return null;
};

const saveState = async (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save failed', e);
  }
};

// ============ DATE HELPERS ============
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a, b) => Math.round((b - a) / 86400000);

// ============ STREAK & STATS ============
const isHabitComplete = (habit, log) => {
  if (!log) return false;
  const v = log[habit.id];
  if (v == null) return false;
  if (habit.type === 'binary') return !!v;
  return v >= habit.target;
};

const computeStreak = (habit, logs) => {
  let streak = 0;
  let cursor = new Date();
  // If today not complete, start checking from yesterday — today doesn't break streak yet
  if (!isHabitComplete(habit, logs[dateKey(cursor)])) {
    cursor = addDays(cursor, -1);
  }
  while (isHabitComplete(habit, logs[dateKey(cursor)])) {
    streak++;
    cursor = addDays(cursor, -1);
    if (streak > 1000) break;
  }
  return streak;
};

const longestStreak = (habit, logs) => {
  const dates = Object.keys(logs).sort();
  if (!dates.length) return 0;
  let best = 0, cur = 0, prev = null;
  for (const d of dates) {
    if (!isHabitComplete(habit, logs[d])) { cur = 0; prev = null; continue; }
    if (prev && daysBetween(new Date(prev), new Date(d)) === 1) cur++;
    else cur = 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
};

const isPerfectDay = (log, habits) => habits.every(h => isHabitComplete(h, log));

const computeAchievements = (logs, habits) => {
  const unlocked = new Set();
  if (Object.keys(logs).length > 0) unlocked.add('first_log');

  // Streak-based
  const streaks = habits.map(h => longestStreak(h, logs));
  const maxStreak = Math.max(0, ...streaks);
  if (maxStreak >= 3)   unlocked.add('streak_3');
  if (maxStreak >= 7)   unlocked.add('streak_7');
  if (maxStreak >= 14)  unlocked.add('streak_14');
  if (maxStreak >= 30)  unlocked.add('streak_30');
  if (maxStreak >= 100) unlocked.add('streak_100');

  // Habit-specific streaks
  const water = habits.find(h => h.id === 'water');
  const bible = habits.find(h => h.id === 'bible');
  const sleep = habits.find(h => h.id === 'sleep');
  if (water && longestStreak(water, logs) >= 7) unlocked.add('water_week');
  if (bible && longestStreak(bible, logs) >= 7) unlocked.add('scripture_7');
  if (sleep && longestStreak(sleep, logs) >= 5) unlocked.add('rest_5');

  // Perfect day chains
  const dates = Object.keys(logs).sort();
  let perfectChain = 0, bestPerfect = 0, anyPerfect = false;
  let lastDate = null;
  for (const d of dates) {
    if (isPerfectDay(logs[d], habits)) {
      anyPerfect = true;
      if (lastDate && daysBetween(new Date(lastDate), new Date(d)) === 1) perfectChain++;
      else perfectChain = 1;
      bestPerfect = Math.max(bestPerfect, perfectChain);
      lastDate = d;
    } else {
      perfectChain = 0;
      lastDate = null;
    }
  }
  if (anyPerfect) unlocked.add('perfect_day');
  if (bestPerfect >= 3) unlocked.add('perfect_3');
  if (bestPerfect >= 7) unlocked.add('perfect_7');

  // Weekly aggregations — check any rolling 7-day window
  const last7 = (predicate) => {
    const today = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const log = logs[dateKey(addDays(today, -i))];
      if (log) total += predicate(log);
    }
    return total;
  };
  const gymCount = last7(l => l.gym ? 1 : 0);
  const stepsTotal = last7(l => l.walking || 0);
  const fypMins = last7(l => l.fyp || 0);
  const ringMins = last7(l => l.ringbase || 0);
  if (gymCount >= 4) unlocked.add('gym_4_week');
  if (stepsTotal >= 50000) unlocked.add('walker_50k');
  if (fypMins >= 300) unlocked.add('fyp_5h');
  if (ringMins >= 180) unlocked.add('side_hustle');

  if (Object.keys(logs).length >= 30) unlocked.add('logger_30');

  return unlocked;
};

// ============ MAIN APP ============
export default function App() {
  const [view, setView] = useState('today');
  const [loaded, setLoaded] = useState(false);
  const [habits] = useState(DEFAULT_HABITS);
  const [logs, setLogs] = useState({});
  const [journal, setJournal] = useState({});
  const [unlockedAch, setUnlockedAch] = useState(new Set());
  const [newAchievement, setNewAchievement] = useState(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Manrope:wght@300..800&family=JetBrains+Mono:wght@400..700&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        setLogs(saved.logs || {});
        setJournal(saved.journal || {});
        setUnlockedAch(new Set(saved.unlockedAch || []));
      }
      setLoaded(true);
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    saveState({ logs, journal, unlockedAch: Array.from(unlockedAch) });
  }, [logs, journal, unlockedAch, loaded]);

  // Recompute achievements after each log change
  useEffect(() => {
    if (!loaded) return;
    const fresh = computeAchievements(logs, habits);
    const newly = [...fresh].filter(id => !unlockedAch.has(id));
    if (newly.length) {
      setUnlockedAch(fresh);
      const newest = ACHIEVEMENTS.find(a => a.id === newly[0]);
      if (newest) {
        setNewAchievement(newest);
        setTimeout(() => setNewAchievement(null), 4000);
      }
    }
  }, [logs, loaded]);

  const today = todayKey();
  const todayLog = logs[today] || {};

  const updateHabit = useCallback((habitId, value) => {
    setLogs(prev => ({
      ...prev,
      [today]: { ...(prev[today] || {}), [habitId]: value }
    }));
  }, [today]);

  const incrementHabit = useCallback((habit, delta) => {
    setLogs(prev => {
      const t = prev[today] || {};
      const cur = t[habit.id] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [today]: { ...t, [habit.id]: next } };
    });
  }, [today]);

  const toggleBinary = useCallback((habit) => {
    setLogs(prev => {
      const t = prev[today] || {};
      return { ...prev, [today]: { ...t, [habit.id]: !t[habit.id] } };
    });
  }, [today]);

  const completedToday = habits.filter(h => isHabitComplete(h, todayLog)).length;
  const isPerfect = completedToday === habits.length;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return 'Late one';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }, []);

  if (!loaded) {
    return (
      <div style={{
        minHeight: '100vh', background: THEME.bg, color: THEME.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_DISPLAY, fontSize: '1.5rem', fontStyle: 'italic'
      }}>
        opening the logbook…
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.bg,
      backgroundImage: `radial-gradient(ellipse at top, ${THEME.bgElevated} 0%, ${THEME.bg} 60%)`,
      color: THEME.fg,
      fontFamily: FONT_BODY,
      paddingBottom: '88px',
    }}>
      {/* Achievement toast */}
      {newAchievement && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: THEME.bgCard, border: `1px solid ${THEME.brass}`,
          padding: '12px 20px', borderRadius: 14, zIndex: 50,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${THEME.brass}33`,
          display: 'flex', alignItems: 'center', gap: 12, maxWidth: 'calc(100vw - 32px)',
          animation: 'slideDown 0.4s ease-out'
        }}>
          <div style={{
            background: `${THEME.brass}22`, borderRadius: 10, padding: 8,
            border: `1px solid ${THEME.brass}55`
          }}>
            <newAchievement.icon size={22} color={THEME.brassBright} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: THEME.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Achievement unlocked
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600 }}>
              {newAchievement.name}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        button { -webkit-tap-highlight-color: transparent; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <header style={{ padding: '32px 20px 8px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
          color: THEME.fgFaint, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase'
        }}>
          <Compass size={14} />
          <span>The Logbook</span>
        </div>
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400, margin: 0,
          letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          {greeting}, <span style={{ fontStyle: 'italic', color: THEME.brass }}>Ola</span>
        </h1>
        <div style={{
          color: THEME.fgDim, fontSize: 13, marginTop: 8, fontFamily: FONT_MONO,
          letterSpacing: 0.5,
        }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>
        {view === 'today' && (
          <TodayView
            habits={habits}
            todayLog={todayLog}
            logs={logs}
            completedToday={completedToday}
            isPerfect={isPerfect}
            toggleBinary={toggleBinary}
            incrementHabit={incrementHabit}
            updateHabit={updateHabit}
            journal={journal}
            setJournal={setJournal}
            today={today}
          />
        )}
        {view === 'progress' && <ProgressView habits={habits} logs={logs} />}
        {view === 'goals' && <GoalsView habits={habits} logs={logs} />}
        {view === 'achievements' && <AchievementsView unlocked={unlockedAch} />}
      </main>

      <BottomNav view={view} setView={setView} />
    </div>
  );
}

// ============ TODAY VIEW ============
function TodayView({ habits, todayLog, logs, completedToday, isPerfect, toggleBinary, incrementHabit, journal, setJournal, today }) {
  const pct = Math.round((completedToday / habits.length) * 100);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Day summary */}
      <div style={{
        background: THEME.bgElevated,
        border: `1px solid ${THEME.border}`,
        borderRadius: 16, padding: '20px',
        marginTop: 20, marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        {isPerfect && (
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.08,
            background: `radial-gradient(circle at 80% 20%, ${THEME.brass}, transparent 60%)`,
            pointerEvents: 'none'
          }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ fontSize: 11, color: THEME.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Today's progress
            </div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 300, lineHeight: 1, marginTop: 4,
              color: isPerfect ? THEME.brassBright : THEME.fg,
            }}>
              {completedToday}<span style={{ color: THEME.fgFaint, fontSize: 28 }}>/{habits.length}</span>
            </div>
            <div style={{ fontSize: 13, color: THEME.fgDim, marginTop: 4, fontStyle: isPerfect ? 'italic' : 'normal' }}>
              {isPerfect ? '✦ a perfect day' : `${pct}% complete`}
            </div>
          </div>
          <CircleProgress pct={pct} perfect={isPerfect} />
        </div>
      </div>

      {/* Habits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {habits.map(h => (
          <HabitCard
            key={h.id}
            habit={h}
            value={todayLog[h.id]}
            streak={computeStreak(h, logs)}
            onToggle={() => toggleBinary(h)}
            onIncrement={(d) => incrementHabit(h, d)}
          />
        ))}
      </div>

      {/* Journal */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 18, fontStyle: 'italic',
          color: THEME.fgDim, marginBottom: 10
        }}>
          A line for today
        </div>
        <textarea
          value={journal[today] || ''}
          onChange={e => setJournal(prev => ({ ...prev, [today]: e.target.value }))}
          placeholder="What's on your mind…"
          style={{
            width: '100%', minHeight: 80, padding: 14, borderRadius: 12,
            background: THEME.bgElevated, border: `1px solid ${THEME.border}`,
            color: THEME.fg, fontFamily: FONT_BODY, fontSize: 14, resize: 'vertical',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = THEME.brass}
          onBlur={e => e.target.style.borderColor = THEME.border}
        />
      </div>
    </div>
  );
}

// ============ HABIT CARD ============
function HabitCard({ habit, value, streak, onToggle, onIncrement }) {
  const Icon = habit.icon;
  const isComplete = isHabitComplete(habit, { [habit.id]: value });
  const v = value ?? 0;

  return (
    <div style={{
      background: isComplete ? `${habit.color}15` : THEME.bgElevated,
      border: `1px solid ${isComplete ? habit.color + '66' : THEME.border}`,
      borderRadius: 14, padding: 14,
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${habit.color}22`, border: `1px solid ${habit.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={habit.color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500 }}>
            {habit.name}
          </div>
          {streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 11, color: THEME.brass, fontFamily: FONT_MONO,
            }}>
              <Flame size={11} fill={THEME.brass} />
              <span>{streak}</span>
            </div>
          )}
        </div>
        {habit.type === 'numeric' && (
          <div style={{
            fontFamily: FONT_MONO, fontSize: 12, color: THEME.fgDim, marginTop: 2,
          }}>
            <span style={{ color: isComplete ? habit.color : THEME.fg }}>{v}</span>
            <span style={{ color: THEME.fgFaint }}> / {habit.target} {habit.unit}</span>
          </div>
        )}
      </div>

      {habit.type === 'binary' ? (
        <button
          onClick={onToggle}
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: isComplete ? habit.color : 'transparent',
            border: `1.5px solid ${isComplete ? habit.color : THEME.borderBright}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          {isComplete && <Check size={20} color={THEME.bg} strokeWidth={3} />}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onIncrement(-habit.step)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'transparent', border: `1px solid ${THEME.borderBright}`,
              color: THEME.fgDim, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => onIncrement(habit.step)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: isComplete ? habit.color : `${habit.color}22`,
              border: `1px solid ${isComplete ? habit.color : habit.color + '55'}`,
              color: isComplete ? THEME.bg : habit.color, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============ CIRCLE PROGRESS ============
function CircleProgress({ pct, perfect }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke={THEME.border} strokeWidth="4" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={perfect ? THEME.brassBright : THEME.brass}
        strokeWidth="4" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

// ============ PROGRESS VIEW ============
function ProgressView({ habits, logs }) {
  // 7-day chart data
  const chartData = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const log = logs[dateKey(d)] || {};
      const completed = habits.filter(h => isHabitComplete(h, log)).length;
      out.push({
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        completed,
      });
    }
    return out;
  }, [logs, habits]);

  const totalDays = Object.keys(logs).length;
  const totalPerfect = Object.values(logs).filter(l => isPerfectDay(l, habits)).length;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingTop: 20 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatTile label="Days logged" value={totalDays} icon={Calendar} />
        <StatTile label="Perfect days" value={totalPerfect} icon={Star} accent />
      </div>

      {/* 7-day chart */}
      <div style={{
        background: THEME.bgElevated, border: `1px solid ${THEME.border}`,
        borderRadius: 16, padding: '20px 16px 12px', marginBottom: 16,
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 18, marginBottom: 4,
        }}>
          The last seven days
        </div>
        <div style={{ fontSize: 12, color: THEME.fgDim, marginBottom: 16, fontFamily: FONT_MONO }}>
          habits completed per day
        </div>
        <div style={{ height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 6, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid stroke={THEME.border} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="day" stroke={THEME.fgFaint} tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} />
              <YAxis stroke={THEME.fgFaint} tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} domain={[0, habits.length]} />
              <Tooltip
                contentStyle={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 12 }}
                cursor={{ fill: `${THEME.brass}11` }}
              />
              <Bar dataKey="completed" fill={THEME.brass} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-habit streaks */}
      <div style={{
        background: THEME.bgElevated, border: `1px solid ${THEME.border}`,
        borderRadius: 16, padding: '16px', marginBottom: 16,
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, marginBottom: 12 }}>
          Streaks
        </div>
        {habits.map(h => {
          const cur = computeStreak(h, logs);
          const best = longestStreak(h, logs);
          const Icon = h.icon;
          return (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: `1px solid ${THEME.border}`,
            }}>
              <Icon size={16} color={h.color} />
              <div style={{ flex: 1, fontSize: 14 }}>{h.name}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: THEME.fg }}>
                <span style={{ color: cur > 0 ? THEME.brass : THEME.fgFaint }}>{cur}</span>
                <span style={{ color: THEME.fgFaint }}> / best {best}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <Heatmap logs={logs} habits={habits} />
    </div>
  );
}

function StatTile({ label, value, icon: Icon, accent }) {
  return (
    <div style={{
      background: THEME.bgElevated, border: `1px solid ${THEME.border}`,
      borderRadius: 14, padding: 14,
    }}>
      <Icon size={16} color={accent ? THEME.brass : THEME.fgDim} />
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 400, marginTop: 8,
        color: accent ? THEME.brassBright : THEME.fg,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: THEME.fgDim, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

// ============ HEATMAP ============
function Heatmap({ logs, habits }) {
  const cells = useMemo(() => {
    const out = [];
    for (let i = 41; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const log = logs[dateKey(d)] || {};
      const c = habits.filter(h => isHabitComplete(h, log)).length;
      out.push({ d, c, total: habits.length });
    }
    return out;
  }, [logs, habits]);

  return (
    <div style={{
      background: THEME.bgElevated, border: `1px solid ${THEME.border}`,
      borderRadius: 16, padding: 16,
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, marginBottom: 12 }}>
        Six weeks at a glance
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => {
          const ratio = cell.c / cell.total;
          const opacity = ratio === 0 ? 0.08 : 0.2 + ratio * 0.8;
          return (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 4,
              background: ratio > 0 ? `rgba(200, 151, 90, ${opacity})` : THEME.border,
              border: `1px solid ${ratio > 0.99 ? THEME.brassBright : 'transparent'}`,
            }} title={`${cell.d.toLocaleDateString('en-GB')}: ${cell.c}/${cell.total}`} />
          );
        })}
      </div>
    </div>
  );
}

// ============ GOALS VIEW ============
function GoalsView({ habits, logs }) {
  const weekStats = useMemo(() => {
    const today = new Date();
    const stats = {};
    habits.forEach(h => stats[h.id] = 0);
    let stepsTotal = 0, fypMins = 0, ringMins = 0, gymCount = 0, bibleCount = 0;
    for (let i = 0; i < 7; i++) {
      const log = logs[dateKey(addDays(today, -i))] || {};
      if (log.gym) gymCount++;
      if (log.bible) bibleCount++;
      stepsTotal += log.walking || 0;
      fypMins += log.fyp || 0;
      ringMins += log.ringbase || 0;
    }
    return { gymCount, bibleCount, stepsTotal, fypMins, ringMins };
  }, [logs, habits]);

  const goals = [
    { name: 'Gym sessions',         current: weekStats.gymCount,  target: 4,     unit: 'this week', color: '#c87a5a' },
    { name: 'Walking',              current: weekStats.stepsTotal, target: 56000, unit: 'steps this week', color: '#8aab85' },
    { name: 'Bible study',          current: weekStats.bibleCount, target: 7,     unit: 'days this week', color: '#c8975a' },
    { name: 'FYP work',             current: weekStats.fypMins,    target: 420,   unit: 'mins this week', color: '#6b9a9c' },
    { name: 'RingBase',             current: weekStats.ringMins,   target: 210,   unit: 'mins this week', color: '#e3b378' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingTop: 20 }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 22, fontStyle: 'italic',
        color: THEME.fgDim, marginBottom: 16
      }}>
        This week's targets
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const done = pct >= 100;
          return (
            <div key={i} style={{
              background: THEME.bgElevated,
              border: `1px solid ${done ? g.color + '66' : THEME.border}`,
              borderRadius: 14, padding: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 500 }}>
                  {g.name}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: THEME.fgDim }}>
                  <span style={{ color: done ? g.color : THEME.fg }}>{g.current.toLocaleString()}</span>
                  <span style={{ color: THEME.fgFaint }}> / {g.target.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: THEME.fgFaint, marginTop: 2, marginBottom: 10 }}>
                {g.unit}
              </div>
              <div style={{
                height: 6, background: THEME.border, borderRadius: 99, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`, background: g.color,
                  transition: 'width 0.4s ease', borderRadius: 99,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* FYP placeholder */}
      <div style={{
        marginTop: 24, padding: 18, borderRadius: 14,
        background: THEME.bgElevated, border: `1px dashed ${THEME.borderBright}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <GraduationCap size={16} color="#6b9a9c" />
          <div style={{ fontSize: 11, color: THEME.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Final year project
          </div>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontStyle: 'italic', color: THEME.fgDim, lineHeight: 1.4 }}>
          Send through your FYP brief — milestones, deadlines, deliverables — and I'll wire up a dedicated tracker here.
        </div>
      </div>
    </div>
  );
}

// ============ ACHIEVEMENTS VIEW ============
function AchievementsView({ unlocked }) {
  const total = ACHIEVEMENTS.length;
  const got = unlocked.size;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingTop: 20 }}>
      <div style={{
        background: THEME.bgElevated, border: `1px solid ${THEME.border}`,
        borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center',
      }}>
        <Trophy size={28} color={THEME.brass} />
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 300, marginTop: 8,
        }}>
          {got}<span style={{ color: THEME.fgFaint, fontSize: 22 }}> / {total}</span>
        </div>
        <div style={{ fontSize: 12, color: THEME.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Honours earned
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {ACHIEVEMENTS.map(a => {
          const Icon = a.icon;
          const isUnlocked = unlocked.has(a.id);
          return (
            <div key={a.id} style={{
              background: isUnlocked ? `${THEME.brass}11` : THEME.bgElevated,
              border: `1px solid ${isUnlocked ? THEME.brass + '55' : THEME.border}`,
              borderRadius: 14, padding: 14,
              opacity: isUnlocked ? 1 : 0.55,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isUnlocked ? `${THEME.brass}22` : 'transparent',
                border: `1px solid ${isUnlocked ? THEME.brass + '66' : THEME.borderBright}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                {isUnlocked
                  ? <Icon size={18} color={THEME.brassBright} />
                  : <Lock size={14} color={THEME.fgFaint} />}
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600,
                color: isUnlocked ? THEME.fg : THEME.fgDim, marginBottom: 4,
              }}>
                {a.name}
              </div>
              <div style={{ fontSize: 11, color: THEME.fgDim, lineHeight: 1.4 }}>
                {a.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ BOTTOM NAV ============
function BottomNav({ view, setView }) {
  const items = [
    { id: 'today',        icon: Sparkles,    label: 'Today' },
    { id: 'progress',     icon: TrendingUp,  label: 'Progress' },
    { id: 'goals',        icon: Target,      label: 'Goals' },
    { id: 'achievements', icon: Trophy,      label: 'Honours' },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: THEME.bgElevated,
      borderTop: `1px solid ${THEME.border}`,
      padding: '8px 0 16px',
      backdropFilter: 'blur(12px)',
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 480, margin: '0 auto', padding: '0 12px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
      }}>
        {items.map(it => {
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              style={{
                background: 'transparent', border: 'none',
                padding: '10px 4px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                color: active ? THEME.brass : THEME.fgDim,
                fontFamily: FONT_BODY, fontSize: 10, letterSpacing: 0.5,
                transition: 'color 0.2s',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
