import React, { useState, useEffect, useCallback, useMemo, useContext, createContext } from 'react';
import {
  Dumbbell, Footprints, Droplet, BookOpen, Briefcase, Phone, Moon, GraduationCap,
  Flame, Trophy, Target, Calendar, Plus, Minus, Check, ChevronLeft, ChevronRight,
  Award, TrendingUp, Sparkles, Lock, BookMarked, Compass, Anchor, Star, Zap,
  Settings as SettingsIcon, X, Download, Upload, Palette, Edit2, Trash2,
  Bike, Coffee, Heart, Music, Pencil, Sunrise, Sunset, Activity, Brain, Apple,
  Pill, Wallet, ShoppingBag, Code, Camera, Languages, Hammer, Lightbulb,
  Save, RotateCcw, ArrowRight, Plus as PlusIcon, Quote, Eye, EyeOff,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

// =============================================================
// THEMES
// =============================================================
const THEMES = {
  brass: {
    name: 'Brass & Ink',
    bg: '#1a1612', bgElevated: '#241f1a', bgCard: '#2b251f',
    border: '#3a3229', borderBright: '#544739',
    fg: '#f0e6d2', fgDim: '#a8a092', fgFaint: '#6b6357',
    accent: '#c8975a', accentBright: '#e3b378',
    sage: '#8aab85', terra: '#c87a5a', ink: '#7a93a8',
  },
  ocean: {
    name: 'Ocean',
    bg: '#0d1721', bgElevated: '#142233', bgCard: '#1a2c40',
    border: '#27384d', borderBright: '#3b5170',
    fg: '#e6eef7', fgDim: '#9aabbf', fgFaint: '#5e6e80',
    accent: '#5a9bd6', accentBright: '#7eb6e8',
    sage: '#7fb8a9', terra: '#d68a6e', ink: '#a4b5c8',
  },
  forest: {
    name: 'Forest',
    bg: '#10140d', bgElevated: '#181e15', bgCard: '#212a1d',
    border: '#2c372a', borderBright: '#445040',
    fg: '#e6ecdf', fgDim: '#a3ad9a', fgFaint: '#646c5e',
    accent: '#9ab87e', accentBright: '#b9d29c',
    sage: '#8aab85', terra: '#c87a5a', ink: '#7a93a8',
  },
  stone: {
    name: 'Stone',
    bg: '#1c1d20', bgElevated: '#26282b', bgCard: '#2f3236',
    border: '#3a3d42', borderBright: '#52565c',
    fg: '#e8e8e8', fgDim: '#a0a0a3', fgFaint: '#65676b',
    accent: '#bfa17a', accentBright: '#d7b994',
    sage: '#8aab85', terra: '#c87a5a', ink: '#7a93a8',
  },
};

const FONT_DISPLAY = '"Fraunces", "Iowan Old Style", Georgia, serif';
const FONT_BODY = '"Manrope", -apple-system, system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';

const ThemeContext = createContext(THEMES.brass);
const useTheme = () => useContext(ThemeContext);

// =============================================================
// ICON LIBRARY (for custom habits)
// =============================================================
const ICON_LIBRARY = {
  Dumbbell, Footprints, Droplet, BookOpen, Briefcase, Phone, Moon, GraduationCap,
  Bike, Coffee, Heart, Music, Pencil, Sunrise, Sunset, Activity, Brain, Apple,
  Pill, Wallet, ShoppingBag, Code, Camera, Languages, Hammer, Lightbulb,
  BookMarked, Star,
};

const COLOR_PALETTE = [
  '#c87a5a', '#8aab85', '#7a93a8', '#c8975a', '#9a8fb5', '#e3b378',
  '#6b9a9c', '#8a7eb5', '#d68a6e', '#a8c879', '#b58fc8', '#d9c876',
];

// =============================================================
// DEFAULT HABITS (used only on first load)
// =============================================================
const DEFAULT_HABITS = [
  { id: 'gym',       name: 'Gym',           iconName: 'Dumbbell',     type: 'binary',  color: '#c87a5a', sortOrder: 1 },
  { id: 'walking',   name: 'Walking',       iconName: 'Footprints',   type: 'numeric', target: 8000,  unit: 'steps',   step: 500,  color: '#8aab85', sortOrder: 2 },
  { id: 'water',     name: 'Water',         iconName: 'Droplet',      type: 'numeric', target: 8,     unit: 'glasses', step: 1,    color: '#7a93a8', sortOrder: 3 },
  { id: 'bible',     name: 'Bible Study',   iconName: 'BookOpen',     type: 'binary',  color: '#c8975a', sortOrder: 4 },
  { id: 'work',      name: 'Day Job Focus', iconName: 'Briefcase',    type: 'binary',  color: '#9a8fb5', sortOrder: 5 },
  { id: 'ringbase',  name: 'RingBase',      iconName: 'Phone',        type: 'numeric', target: 30,    unit: 'mins',    step: 5,    color: '#e3b378', sortOrder: 6 },
  { id: 'fyp',       name: 'FYP Work',      iconName: 'GraduationCap', type: 'numeric', target: 60,    unit: 'mins',    step: 15,   color: '#6b9a9c', sortOrder: 7 },
  { id: 'sleep',     name: 'Sleep',         iconName: 'Moon',         type: 'numeric', target: 7,     unit: 'hrs',     step: 0.5,  color: '#8a7eb5', sortOrder: 8 },
];

const getIcon = (iconName) => ICON_LIBRARY[iconName] || Star;

// =============================================================
// ACHIEVEMENTS (built-in)
// =============================================================
const ACHIEVEMENTS = [
  { id: 'first_log',    name: 'Cast Off',         desc: 'Log your first habit',                  iconName: 'Anchor' },
  { id: 'streak_3',     name: 'Building Steam',   desc: '3-day streak on any habit',             iconName: 'Flame' },
  { id: 'streak_7',     name: 'Week One Down',    desc: '7-day streak on any habit',             iconName: 'Flame' },
  { id: 'streak_14',    name: 'Two Weeks Strong', desc: '14-day streak on any habit',            iconName: 'Flame' },
  { id: 'streak_30',    name: 'Habit Forged',     desc: '30-day streak on any habit',            iconName: 'Award' },
  { id: 'streak_100',   name: 'Centurion',        desc: '100-day streak on any habit',           iconName: 'Trophy' },
  { id: 'perfect_day',  name: 'Perfect Day',      desc: 'Complete every habit in one day',       iconName: 'Star' },
  { id: 'perfect_3',    name: 'Trifecta',         desc: '3 perfect days in a row',               iconName: 'Star' },
  { id: 'perfect_7',    name: 'Iron Will',        desc: '7 perfect days in a row',               iconName: 'Trophy' },
  { id: 'water_week',   name: 'Hydrated',         desc: 'Hit water goal 7 days running',         iconName: 'Droplet' },
  { id: 'gym_4_week',   name: 'In the Iron',      desc: 'Gym 4 times in one week',               iconName: 'Dumbbell' },
  { id: 'scripture_7',  name: 'Daily Bread',      desc: 'Bible study 7 days running',            iconName: 'BookMarked' },
  { id: 'rest_5',       name: 'Rest Discipline',  desc: 'Hit sleep target 5 days running',       iconName: 'Moon' },
  { id: 'walker_50k',   name: 'Long Hauler',      desc: '50,000 steps in a week',                iconName: 'Footprints' },
  { id: 'fyp_5h',       name: 'Final Year Grind', desc: '5 hours of FYP work in a week',         iconName: 'GraduationCap' },
  { id: 'side_hustle',  name: 'Side Hustle',      desc: '3 hours of RingBase in a week',         iconName: 'Phone' },
  { id: 'logger_30',    name: 'Faithful Logger',  desc: 'Log on 30 different days',              iconName: 'Calendar' },
];

const ICON_MAP = {
  Anchor, Flame, Award, Trophy, Star, Droplet, Dumbbell, BookMarked, Moon,
  Footprints, GraduationCap, Phone, Calendar,
};

// =============================================================
// VERSES (World English Bible — public domain)
// =============================================================
const VERSES = [
  { ref: 'Joshua 1:9',          text: 'Be strong and courageous. Don\u2019t be afraid; don\u2019t be dismayed, for the Lord your God is with you wherever you go.' },
  { ref: 'Psalm 23:1',          text: 'The Lord is my shepherd; I shall lack nothing.' },
  { ref: 'Proverbs 3:5\u20136', text: 'Trust in the Lord with all your heart, and don\u2019t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.' },
  { ref: 'Isaiah 40:31',        text: 'Those who wait for the Lord will renew their strength. They will mount up with wings like eagles.' },
  { ref: 'Jeremiah 29:11',      text: '\u201CFor I know the plans I have for you,\u201D says the Lord, \u201Cplans for peace, and not for evil, to give you hope and a future.\u201D' },
  { ref: 'Matthew 6:33',        text: 'But seek first God\u2019s Kingdom and his righteousness; and all these things will be given to you as well.' },
  { ref: 'Matthew 11:28',       text: 'Come to me, all you who labour and are heavily burdened, and I will give you rest.' },
  { ref: 'John 14:6',           text: 'Jesus said, \u201CI am the way, the truth, and the life. No one comes to the Father, except through me.\u201D' },
  { ref: 'John 16:33',          text: 'In the world you have trouble; but cheer up! I have overcome the world.' },
  { ref: 'Romans 8:28',         text: 'We know that all things work together for good for those who love God.' },
  { ref: 'Romans 8:31',         text: 'If God is for us, who can be against us?' },
  { ref: 'Romans 12:2',         text: 'Don\u2019t be conformed to this world, but be transformed by the renewing of your mind.' },
  { ref: '1 Corinthians 10:13', text: 'God is faithful, who will not allow you to be tempted above what you are able, but will make the way of escape with the temptation.' },
  { ref: '1 Corinthians 13:4',  text: 'Love is patient and is kind. Love doesn\u2019t envy. Love doesn\u2019t brag, is not proud.' },
  { ref: '2 Corinthians 5:17',  text: 'If anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.' },
  { ref: 'Galatians 5:22\u201323', text: 'The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control.' },
  { ref: 'Ephesians 2:8\u20139',   text: 'For by grace you have been saved through faith, and that not of yourselves; it is the gift of God.' },
  { ref: 'Ephesians 6:10',      text: 'Be strong in the Lord, and in the strength of his might.' },
  { ref: 'Philippians 4:6\u20137', text: 'Don\u2019t be anxious about anything, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.' },
  { ref: 'Philippians 4:13',    text: 'I can do all things through Christ who strengthens me.' },
  { ref: 'Colossians 3:23',     text: 'Whatever you do, work heartily, as for the Lord, and not for men.' },
  { ref: '1 Thessalonians 5:16\u201318', text: 'Always rejoice. Pray without ceasing. In everything give thanks.' },
  { ref: '2 Timothy 1:7',       text: 'God didn\u2019t give us a spirit of fear, but of power, love, and self-control.' },
  { ref: 'Hebrews 11:1',        text: 'Faith is assurance of things hoped for, proof of things not seen.' },
  { ref: 'Hebrews 12:1',        text: 'Let us run with perseverance the race that is set before us.' },
  { ref: 'James 1:2\u20133',    text: 'Count it all joy, my brothers, when you fall into various temptations, knowing that the testing of your faith produces endurance.' },
  { ref: '1 Peter 5:7',         text: 'Cast all your worries on him, because he cares for you.' },
  { ref: '1 John 4:8',          text: 'He who doesn\u2019t love doesn\u2019t know God, for God is love.' },
  { ref: 'Psalm 27:1',          text: 'The Lord is my light and my salvation. Whom shall I fear?' },
  { ref: 'Psalm 37:4',          text: 'Also delight yourself in the Lord, and he will give you the desires of your heart.' },
  { ref: 'Psalm 46:10',         text: 'Be still, and know that I am God.' },
  { ref: 'Psalm 91:1\u20132',   text: 'He who dwells in the secret place of the Most High will rest in the shadow of the Almighty.' },
  { ref: 'Psalm 119:105',       text: 'Your word is a lamp to my feet, and a light for my path.' },
  { ref: 'Psalm 139:14',        text: 'I will give thanks to you, for I am fearfully and wonderfully made.' },
  { ref: 'Proverbs 16:3',       text: 'Commit your deeds to the Lord, and your plans shall succeed.' },
  { ref: 'Proverbs 27:17',      text: 'Iron sharpens iron; so a man sharpens his friend\u2019s countenance.' },
  { ref: 'Lamentations 3:22\u201323', text: 'It is because of the Lord\u2019s loving kindnesses that we are not consumed; his compassions don\u2019t fail. They are new every morning.' },
  { ref: 'Isaiah 41:10',        text: 'Don\u2019t you be afraid, for I am with you. Don\u2019t be dismayed, for I am your God.' },
  { ref: 'Mark 10:27',          text: 'With men it is impossible, but not with God; for all things are possible with God.' },
  { ref: 'Romans 5:8',          text: 'God commends his own love towards us, in that while we were yet sinners, Christ died for us.' },
  { ref: 'Galatians 2:20',      text: 'I have been crucified with Christ, and it is no longer I that live, but Christ lives in me.' },
  { ref: 'Philippians 1:6',     text: 'He who began a good work in you will complete it until the day of Jesus Christ.' },
  { ref: 'Hebrews 4:12',        text: 'The word of God is living and active, and sharper than any two-edged sword.' },
  { ref: 'James 4:7',           text: 'Be subject therefore to God. Resist the devil, and he will flee from you.' },
  { ref: '1 Peter 2:9',         text: 'You are a chosen race, a royal priesthood, a holy nation, a people for God\u2019s own possession.' },
  { ref: '1 John 1:9',          text: 'If we confess our sins, he is faithful and righteous to forgive us the sins, and to cleanse us from all unrighteousness.' },
  { ref: 'Proverbs 4:23',       text: 'Keep your heart with all diligence, for out of it is the wellspring of life.' },
  { ref: 'Psalm 1:1\u20132',    text: 'Blessed is the man whose delight is in the Lord\u2019s law. On his law he meditates day and night.' },
  { ref: 'Matthew 5:14',        text: 'You are the light of the world. A city located on a hill can\u2019t be hidden.' },
  { ref: 'Matthew 28:19',       text: 'Go and make disciples of all nations.' },
  { ref: 'Romans 10:9',         text: 'If you confess with your mouth that Jesus is Lord, and believe in your heart that God raised him from the dead, you will be saved.' },
  { ref: '1 Timothy 4:12',      text: 'Let no man despise your youth; but be an example to those who believe.' },
  { ref: 'Colossians 1:17',     text: 'He is before all things, and in him all things are held together.' },
  { ref: 'Genesis 1:1',         text: 'In the beginning, God created the heavens and the earth.' },
  { ref: 'Revelation 3:20',     text: 'Behold, I stand at the door and knock. If anyone hears my voice and opens the door, then I will come in to him.' },
];

const verseForToday = () => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = (new Date() - start);
  const day = Math.floor(diff / 86400000);
  return VERSES[day % VERSES.length];
};

// =============================================================
// STORAGE
// =============================================================
const STORAGE_KEY = 'logbook-state-v2';
const LEGACY_KEY = 'logbook-state-v1';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // Migrate from v1
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy);
      return {
        logs: old.logs || {},
        journal: old.journal || {},
        unlockedAch: old.unlockedAch || [],
        habits: DEFAULT_HABITS,
        customAchievements: [],
        theme: 'brass',
        settings: { showVerse: true },
      };
    }
  } catch (e) {
    console.warn('Load failed', e);
  }
  return null;
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save failed', e);
  }
};

// =============================================================
// DATE HELPERS
// =============================================================
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayKey = () => dateKey(new Date());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a, b) => Math.round((b - a) / 86400000);
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

const formatDateNice = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const formatDateShort = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// =============================================================
// HABIT LOGIC
// =============================================================
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
    if (prev && daysBetween(parseKey(prev), parseKey(d)) === 1) cur++;
    else cur = 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
};

const isPerfectDay = (log, habits) => habits.length > 0 && habits.every(h => isHabitComplete(h, log));

const computeAchievements = (logs, habits, customAchievements) => {
  const unlocked = new Set();
  if (Object.keys(logs).length > 0) unlocked.add('first_log');

  const streaks = habits.map(h => longestStreak(h, logs));
  const maxStreak = Math.max(0, ...streaks);
  if (maxStreak >= 3)   unlocked.add('streak_3');
  if (maxStreak >= 7)   unlocked.add('streak_7');
  if (maxStreak >= 14)  unlocked.add('streak_14');
  if (maxStreak >= 30)  unlocked.add('streak_30');
  if (maxStreak >= 100) unlocked.add('streak_100');

  const water = habits.find(h => h.id === 'water');
  const bible = habits.find(h => h.id === 'bible');
  const sleep = habits.find(h => h.id === 'sleep');
  if (water && longestStreak(water, logs) >= 7) unlocked.add('water_week');
  if (bible && longestStreak(bible, logs) >= 7) unlocked.add('scripture_7');
  if (sleep && longestStreak(sleep, logs) >= 5) unlocked.add('rest_5');

  const dates = Object.keys(logs).sort();
  let perfectChain = 0, bestPerfect = 0, anyPerfect = false;
  let lastDate = null;
  for (const d of dates) {
    if (isPerfectDay(logs[d], habits)) {
      anyPerfect = true;
      if (lastDate && daysBetween(parseKey(lastDate), parseKey(d)) === 1) perfectChain++;
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

  const last7 = (predicate) => {
    const today = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const log = logs[dateKey(addDays(today, -i))];
      if (log) total += predicate(log);
    }
    return total;
  };
  if (last7(l => l.gym ? 1 : 0) >= 4)              unlocked.add('gym_4_week');
  if (last7(l => l.walking || 0) >= 50000)         unlocked.add('walker_50k');
  if (last7(l => l.fyp || 0) >= 300)               unlocked.add('fyp_5h');
  if (last7(l => l.ringbase || 0) >= 180)          unlocked.add('side_hustle');
  if (Object.keys(logs).length >= 30)              unlocked.add('logger_30');

  // Custom achievements
  customAchievements.forEach(ca => {
    const habit = habits.find(h => h.id === ca.habitId);
    if (!habit) return;
    if (ca.type === 'streak' && longestStreak(habit, logs) >= ca.threshold) unlocked.add(ca.id);
    if (ca.type === 'count') {
      const c = Object.values(logs).filter(l => isHabitComplete(habit, l)).length;
      if (c >= ca.threshold) unlocked.add(ca.id);
    }
  });

  return unlocked;
};

// =============================================================
// INSIGHTS
// =============================================================
const generateInsights = (logs, habits) => {
  const insights = [];
  const dates = Object.keys(logs).sort();
  if (dates.length < 5) {
    insights.push({ kind: 'note', text: 'Log a few more days and patterns will start showing up here.' });
    return insights;
  }

  // Best/worst day of week
  const dayCompletion = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
  const dayCount      = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dates) {
    const dt = parseKey(d);
    const dow = dt.getDay();
    const log = logs[d];
    const ratio = habits.filter(h => isHabitComplete(h, log)).length / Math.max(1, habits.length);
    dayCompletion[dow] += ratio;
    dayCount[dow]++;
  }
  const dayAvg = dayCompletion.map((s, i) => dayCount[i] ? s / dayCount[i] : -1);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = -1, bestVal = -1, worstDay = -1, worstVal = 2;
  for (let i = 0; i < 7; i++) {
    if (dayAvg[i] < 0) continue;
    if (dayAvg[i] > bestVal) { bestVal = dayAvg[i]; bestDay = i; }
    if (dayAvg[i] < worstVal) { worstVal = dayAvg[i]; worstDay = i; }
  }
  if (bestDay >= 0 && Object.keys(dates).length >= 7) {
    insights.push({ kind: 'good', text: `${dayNames[bestDay]}s are your strongest day \u2014 ${Math.round(bestVal * 100)}% completion on average.` });
  }
  if (worstDay >= 0 && bestDay !== worstDay && worstVal < 0.6) {
    insights.push({ kind: 'note', text: `${dayNames[worstDay]}s tend to slip \u2014 only ${Math.round(worstVal * 100)}% completion. Worth a look.` });
  }

  // Trend last 7 vs prior 7
  const today = new Date();
  let recent = 0, recentCount = 0, prior = 0, priorCount = 0;
  for (let i = 0; i < 7; i++) {
    const log = logs[dateKey(addDays(today, -i))];
    if (log) {
      recent += habits.filter(h => isHabitComplete(h, log)).length;
      recentCount++;
    }
  }
  for (let i = 7; i < 14; i++) {
    const log = logs[dateKey(addDays(today, -i))];
    if (log) {
      prior += habits.filter(h => isHabitComplete(h, log)).length;
      priorCount++;
    }
  }
  if (recentCount >= 3 && priorCount >= 3) {
    const recentAvg = recent / recentCount;
    const priorAvg = prior / priorCount;
    const delta = recentAvg - priorAvg;
    if (delta >= 0.5) {
      insights.push({ kind: 'good', text: `Trending up \u2014 you\u2019re completing ${delta.toFixed(1)} more habits/day than last week.` });
    } else if (delta <= -0.5) {
      insights.push({ kind: 'warn', text: `Slipping a bit \u2014 ${Math.abs(delta).toFixed(1)} fewer habits/day vs last week.` });
    }
  }

  // Per-habit streak highlights
  habits.forEach(h => {
    const cur = computeStreak(h, logs);
    if (cur >= 5) insights.push({ kind: 'good', text: `${h.name}: ${cur}-day streak running.` });
  });

  // Most consistent habit
  if (dates.length >= 10) {
    let bestHabit = null, bestRate = 0;
    habits.forEach(h => {
      const c = dates.filter(d => isHabitComplete(h, logs[d])).length;
      const rate = c / dates.length;
      if (rate > bestRate) { bestRate = rate; bestHabit = h; }
    });
    if (bestHabit && bestRate >= 0.7) {
      insights.push({ kind: 'good', text: `${bestHabit.name} is your most consistent \u2014 ${Math.round(bestRate * 100)}% of logged days.` });
    }
  }

  return insights;
};

// =============================================================
// MAIN APP
// =============================================================
export default function App() {
  const [view, setView] = useState('today');
  const [loaded, setLoaded] = useState(false);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [logs, setLogs] = useState({});
  const [journal, setJournal] = useState({});
  const [unlockedAch, setUnlockedAch] = useState(new Set());
  const [customAchievements, setCustomAchievements] = useState([]);
  const [themeName, setThemeName] = useState('brass');
  const [settings, setSettings] = useState({ showVerse: true });
  const [newAchievement, setNewAchievement] = useState(null);

  // Modal state
  const [showSettings, setShowSettings] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [editingDate, setEditingDate] = useState(null);

  const theme = THEMES[themeName] || THEMES.brass;

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
    const saved = loadState();
    if (saved) {
      setLogs(saved.logs || {});
      setJournal(saved.journal || {});
      setUnlockedAch(new Set(saved.unlockedAch || []));
      setHabits(saved.habits && saved.habits.length ? saved.habits : DEFAULT_HABITS);
      setCustomAchievements(saved.customAchievements || []);
      setThemeName(saved.theme || 'brass');
      setSettings(saved.settings || { showVerse: true });
    }
    setLoaded(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!loaded) return;
    saveState({
      logs, journal,
      unlockedAch: Array.from(unlockedAch),
      habits, customAchievements,
      theme: themeName, settings,
    });
  }, [logs, journal, unlockedAch, habits, customAchievements, themeName, settings, loaded]);

  // Recompute achievements
  useEffect(() => {
    if (!loaded) return;
    const fresh = computeAchievements(logs, habits, customAchievements);
    const newly = [...fresh].filter(id => !unlockedAch.has(id));
    if (newly.length) {
      setUnlockedAch(fresh);
      const allDefs = [...ACHIEVEMENTS, ...customAchievements];
      const newest = allDefs.find(a => a.id === newly[0]);
      if (newest) {
        setNewAchievement(newest);
        setTimeout(() => setNewAchievement(null), 4000);
      }
    }
  }, [logs, habits, customAchievements, loaded]);

  // URL action handler (Siri Shortcuts etc.)
  useEffect(() => {
    if (!loaded) return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (!action) return;

    const habitId = params.get('habit');
    const habit = habits.find(h => h.id === habitId);
    if (!habit) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    const today = todayKey();
    setLogs(prev => {
      const t = prev[today] || {};
      let nextVal = t[habit.id];
      if (action === 'toggle') {
        if (habit.type === 'binary') nextVal = !t[habit.id];
        else nextVal = (t[habit.id] || 0) >= habit.target ? 0 : habit.target;
      } else if (action === 'increment') {
        const amt = parseFloat(params.get('amount') || habit.step || 1);
        nextVal = Math.max(0, (t[habit.id] || 0) + amt);
      } else if (action === 'set') {
        const amt = parseFloat(params.get('amount') || 0);
        nextVal = amt;
      } else if (action === 'complete') {
        if (habit.type === 'binary') nextVal = true;
        else nextVal = habit.target;
      }
      return { ...prev, [today]: { ...t, [habit.id]: nextVal } };
    });

    window.history.replaceState({}, '', window.location.pathname);
  }, [loaded]);

  const today = todayKey();
  const todayLog = logs[today] || {};

  const updateHabitForDate = useCallback((habitId, value, dateStr) => {
    setLogs(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), [habitId]: value }
    }));
  }, []);

  const incrementHabitToday = useCallback((habit, delta) => {
    setLogs(prev => {
      const t = prev[today] || {};
      const cur = t[habit.id] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [today]: { ...t, [habit.id]: next } };
    });
  }, [today]);

  const toggleBinaryToday = useCallback((habit) => {
    setLogs(prev => {
      const t = prev[today] || {};
      return { ...prev, [today]: { ...t, [habit.id]: !t[habit.id] } };
    });
  }, [today]);

  const completedToday = habits.filter(h => isHabitComplete(h, todayLog)).length;
  const isPerfect = habits.length > 0 && completedToday === habits.length;

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
        minHeight: '100vh', background: theme.bg, color: theme.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_DISPLAY, fontSize: '1.5rem', fontStyle: 'italic'
      }}>
        opening the logbook…
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{
        minHeight: '100vh',
        background: theme.bg,
        backgroundImage: `radial-gradient(ellipse at top, ${theme.bgElevated} 0%, ${theme.bg} 60%)`,
        color: theme.fg, fontFamily: FONT_BODY, paddingBottom: '88px',
      }}>
        {/* Achievement toast */}
        {newAchievement && <AchievementToast ach={newAchievement} />}

        <style>{`
          @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes sheetIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          button { -webkit-tap-highlight-color: transparent; }
          * { box-sizing: border-box; }
          input, textarea, select { font-family: inherit; }
        `}</style>

        {/* Header */}
        <header style={{ padding: '32px 20px 8px', maxWidth: 480, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
              color: theme.fgFaint, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase'
            }}>
              <Compass size={14} />
              <span>The Logbook</span>
            </div>
            <h1 style={{
              fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400, margin: 0,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              {greeting}, <span style={{ fontStyle: 'italic', color: theme.accent }}>Ola</span>
            </h1>
            <div style={{ color: theme.fgDim, fontSize: 13, marginTop: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>
              {formatDateNice(new Date())}
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'transparent', border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: 8, cursor: 'pointer', color: theme.fgDim,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        </header>

        <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>
          {view === 'today' && (
            <TodayView
              habits={habits} todayLog={todayLog} logs={logs}
              completedToday={completedToday} isPerfect={isPerfect}
              toggleBinary={toggleBinaryToday} incrementHabit={incrementHabitToday}
              journal={journal} setJournal={setJournal} today={today}
              showVerse={settings.showVerse}
              onEditYesterday={() => setEditingDate(dateKey(addDays(new Date(), -1)))}
            />
          )}
          {view === 'progress' && (
            <ProgressView
              habits={habits} logs={logs}
              onTapDay={(k) => setEditingDate(k)}
              onOpenWeekly={() => setShowWeeklyReview(true)}
            />
          )}
          {view === 'goals' && <GoalsView habits={habits} logs={logs} />}
          {view === 'achievements' && <AchievementsView unlocked={unlockedAch} customAchievements={customAchievements} />}
        </main>

        <BottomNav view={view} setView={setView} />

        {/* Modals */}
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            themeName={themeName} setThemeName={setThemeName}
            habits={habits} setHabits={setHabits}
            customAchievements={customAchievements} setCustomAchievements={setCustomAchievements}
            settings={settings} setSettings={setSettings}
            logs={logs} setLogs={setLogs}
            journal={journal} setJournal={setJournal}
            unlockedAch={unlockedAch} setUnlockedAch={setUnlockedAch}
          />
        )}
        {showWeeklyReview && (
          <WeeklyReviewModal
            habits={habits} logs={logs}
            onClose={() => setShowWeeklyReview(false)}
          />
        )}
        {editingDate && (
          <DayEditorModal
            dateStr={editingDate} habits={habits} logs={logs}
            onUpdate={updateHabitForDate}
            onClose={() => setEditingDate(null)}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
}

// =============================================================
// TOP-LEVEL VIEWS
// =============================================================
function AchievementToast({ ach }) {
  const theme = useTheme();
  const Icon = ICON_MAP[ach.iconName] || Trophy;
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      background: theme.bgCard, border: `1px solid ${theme.accent}`,
      padding: '12px 20px', borderRadius: 14, zIndex: 50,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${theme.accent}33`,
      display: 'flex', alignItems: 'center', gap: 12, maxWidth: 'calc(100vw - 32px)',
      animation: 'slideDown 0.4s ease-out'
    }}>
      <div style={{
        background: `${theme.accent}22`, borderRadius: 10, padding: 8,
        border: `1px solid ${theme.accent}55`
      }}>
        <Icon size={22} color={theme.accentBright} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: theme.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Achievement unlocked
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600 }}>
          {ach.name}
        </div>
      </div>
    </div>
  );
}

function TodayView({ habits, todayLog, logs, completedToday, isPerfect, toggleBinary, incrementHabit, journal, setJournal, today, showVerse, onEditYesterday }) {
  const theme = useTheme();
  const pct = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const verse = useMemo(() => verseForToday(), []);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Verse card */}
      {showVerse && (
        <div style={{
          background: `linear-gradient(135deg, ${theme.bgElevated}, ${theme.bgCard})`,
          border: `1px solid ${theme.border}`, borderLeft: `3px solid ${theme.accent}`,
          borderRadius: 12, padding: '16px 18px', marginTop: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Quote size={12} color={theme.accent} />
            <div style={{ fontSize: 10, color: theme.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Verse for today
            </div>
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: 15, fontStyle: 'italic',
            lineHeight: 1.5, color: theme.fg,
          }}>
            {verse.text}
          </div>
          <div style={{
            fontSize: 11, color: theme.accent, marginTop: 6,
            fontFamily: FONT_MONO, letterSpacing: 0.5,
          }}>
            — {verse.ref}
          </div>
        </div>
      )}

      {/* Day summary */}
      <div style={{
        background: theme.bgElevated, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: 20, marginTop: 16, marginBottom: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        {isPerfect && (
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.08,
            background: `radial-gradient(circle at 80% 20%, ${theme.accent}, transparent 60%)`,
            pointerEvents: 'none'
          }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ fontSize: 11, color: theme.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Today's progress
            </div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 300, lineHeight: 1, marginTop: 4,
              color: isPerfect ? theme.accentBright : theme.fg,
            }}>
              {completedToday}<span style={{ color: theme.fgFaint, fontSize: 28 }}>/{habits.length}</span>
            </div>
            <div style={{ fontSize: 13, color: theme.fgDim, marginTop: 4, fontStyle: isPerfect ? 'italic' : 'normal' }}>
              {isPerfect ? '✦ a perfect day' : `${pct}% complete`}
            </div>
          </div>
          <CircleProgress pct={pct} perfect={isPerfect} />
        </div>
      </div>

      {/* Habits */}
      {habits.length === 0 ? (
        <div style={{
          padding: 24, borderRadius: 14, background: theme.bgElevated,
          border: `1px dashed ${theme.borderBright}`, textAlign: 'center',
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontStyle: 'italic', color: theme.fgDim }}>
            No habits yet. Open Settings to add some.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {habits.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(h => (
            <HabitCard
              key={h.id} habit={h}
              value={todayLog[h.id]}
              streak={computeStreak(h, logs)}
              onToggle={() => toggleBinary(h)}
              onIncrement={(d) => incrementHabit(h, d)}
            />
          ))}
        </div>
      )}

      {/* Edit yesterday button */}
      <button
        onClick={onEditYesterday}
        style={{
          width: '100%', marginTop: 14, padding: '12px',
          background: 'transparent', border: `1px solid ${theme.border}`,
          borderRadius: 12, color: theme.fgDim, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <RotateCcw size={14} />
        Edit yesterday
      </button>

      {/* Journal */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 18, fontStyle: 'italic',
          color: theme.fgDim, marginBottom: 10
        }}>
          A line for today
        </div>
        <textarea
          value={journal[today] || ''}
          onChange={e => setJournal(prev => ({ ...prev, [today]: e.target.value }))}
          placeholder="What's on your mind…"
          style={{
            width: '100%', minHeight: 80, padding: 14, borderRadius: 12,
            background: theme.bgElevated, border: `1px solid ${theme.border}`,
            color: theme.fg, fontFamily: FONT_BODY, fontSize: 14, resize: 'vertical',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = theme.accent}
          onBlur={e => e.target.style.borderColor = theme.border}
        />
      </div>
    </div>
  );
}

function HabitCard({ habit, value, streak, onToggle, onIncrement }) {
  const theme = useTheme();
  const Icon = getIcon(habit.iconName);
  const isComplete = isHabitComplete(habit, { [habit.id]: value });
  const v = value ?? 0;

  return (
    <div style={{
      background: isComplete ? `${habit.color}15` : theme.bgElevated,
      border: `1px solid ${isComplete ? habit.color + '66' : theme.border}`,
      borderRadius: 14, padding: 14,
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${habit.color}22`, border: `1px solid ${habit.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
              fontSize: 11, color: theme.accent, fontFamily: FONT_MONO,
            }}>
              <Flame size={11} fill={theme.accent} />
              <span>{streak}</span>
            </div>
          )}
        </div>
        {habit.type === 'numeric' && (
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.fgDim, marginTop: 2 }}>
            <span style={{ color: isComplete ? habit.color : theme.fg }}>{v}</span>
            <span style={{ color: theme.fgFaint }}> / {habit.target} {habit.unit}</span>
          </div>
        )}
      </div>

      {habit.type === 'binary' ? (
        <button
          onClick={onToggle}
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: isComplete ? habit.color : 'transparent',
            border: `1.5px solid ${isComplete ? habit.color : theme.borderBright}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          {isComplete && <Check size={20} color={theme.bg} strokeWidth={3} />}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onIncrement(-habit.step)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'transparent', border: `1px solid ${theme.borderBright}`,
              color: theme.fgDim, cursor: 'pointer',
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
              color: isComplete ? theme.bg : habit.color, cursor: 'pointer',
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

function CircleProgress({ pct, perfect }) {
  const theme = useTheme();
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke={theme.border} strokeWidth="4" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={perfect ? theme.accentBright : theme.accent}
        strokeWidth="4" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

// =============================================================
// PROGRESS VIEW
// =============================================================
function ProgressView({ habits, logs, onTapDay, onOpenWeekly }) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const log = logs[dateKey(d)] || {};
      const completed = habits.filter(h => isHabitComplete(h, log)).length;
      out.push({ day: d.toLocaleDateString('en-GB', { weekday: 'short' }), completed });
    }
    return out;
  }, [logs, habits]);

  const totalDays = Object.keys(logs).length;
  const totalPerfect = Object.values(logs).filter(l => isPerfectDay(l, habits)).length;
  const insights = useMemo(() => generateInsights(logs, habits), [logs, habits]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingTop: 20 }}>
      {/* Insights */}
      {insights.length > 0 && (
        <div style={{
          background: theme.bgElevated, border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: 16, marginBottom: 16,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
          }}>
            <Lightbulb size={16} color={theme.accent} />
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16 }}>Insights</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.slice(0, 5).map((ins, i) => (
              <div key={i} style={{
                fontSize: 13, lineHeight: 1.45,
                color: ins.kind === 'good' ? theme.fg : ins.kind === 'warn' ? theme.fg : theme.fgDim,
                paddingLeft: 10,
                borderLeft: `2px solid ${ins.kind === 'good' ? theme.accent : ins.kind === 'warn' ? '#c87a5a' : theme.border}`,
              }}>
                {ins.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatTile label="Days logged" value={totalDays} icon={Calendar} />
        <StatTile label="Perfect days" value={totalPerfect} icon={Star} accent />
      </div>

      {/* Weekly review button */}
      <button
        onClick={onOpenWeekly}
        style={{
          width: '100%', padding: 14, marginBottom: 16,
          background: theme.bgElevated, border: `1px solid ${theme.accent}55`,
          borderRadius: 14, cursor: 'pointer', color: theme.fg,
          fontFamily: FONT_BODY, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Activity size={18} color={theme.accent} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16 }}>Open weekly review</span>
        </span>
        <ArrowRight size={18} color={theme.accent} />
      </button>

      {/* 7-day chart */}
      <div style={{
        background: theme.bgElevated, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: '20px 16px 12px', marginBottom: 16,
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, marginBottom: 4 }}>The last seven days</div>
        <div style={{ fontSize: 12, color: theme.fgDim, marginBottom: 16, fontFamily: FONT_MONO }}>habits completed per day</div>
        <div style={{ height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 6, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid stroke={theme.border} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="day" stroke={theme.fgFaint} tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} />
              <YAxis stroke={theme.fgFaint} tick={{ fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} domain={[0, Math.max(habits.length, 1)]} />
              <Tooltip contentStyle={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 8, fontFamily: FONT_MONO, fontSize: 12 }} cursor={{ fill: `${theme.accent}11` }} />
              <Bar dataKey="completed" fill={theme.accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streaks */}
      <div style={{
        background: theme.bgElevated, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, marginBottom: 12 }}>Streaks</div>
        {habits.map(h => {
          const cur = computeStreak(h, logs);
          const best = longestStreak(h, logs);
          const Icon = getIcon(h.iconName);
          return (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: `1px solid ${theme.border}`,
            }}>
              <Icon size={16} color={h.color} />
              <div style={{ flex: 1, fontSize: 14 }}>{h.name}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: theme.fg }}>
                <span style={{ color: cur > 0 ? theme.accent : theme.fgFaint }}>{cur}</span>
                <span style={{ color: theme.fgFaint }}> / best {best}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap (tappable) */}
      <Heatmap logs={logs} habits={habits} onTapDay={onTapDay} />
    </div>
  );
}

function StatTile({ label, value, icon: Icon, accent }) {
  const theme = useTheme();
  return (
    <div style={{
      background: theme.bgElevated, border: `1px solid ${theme.border}`,
      borderRadius: 14, padding: 14,
    }}>
      <Icon size={16} color={accent ? theme.accent : theme.fgDim} />
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 400, marginTop: 8,
        color: accent ? theme.accentBright : theme.fg,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: theme.fgDim, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

function Heatmap({ logs, habits, onTapDay }) {
  const theme = useTheme();
  const cells = useMemo(() => {
    const out = [];
    for (let i = 41; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const k = dateKey(d);
      const log = logs[k] || {};
      const c = habits.filter(h => isHabitComplete(h, log)).length;
      out.push({ d, k, c, total: Math.max(habits.length, 1) });
    }
    return out;
  }, [logs, habits]);

  return (
    <div style={{
      background: theme.bgElevated, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18 }}>Six weeks at a glance</div>
        <div style={{ fontSize: 11, color: theme.fgDim, fontStyle: 'italic' }}>tap a day to edit</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => {
          const ratio = cell.c / cell.total;
          const opacity = ratio === 0 ? 0.08 : 0.2 + ratio * 0.8;
          const accentBg = `rgba(${hexToRgb(theme.accent)}, ${opacity})`;
          return (
            <button
              key={i}
              onClick={() => onTapDay(cell.k)}
              style={{
                aspectRatio: '1', borderRadius: 4, padding: 0,
                background: ratio > 0 ? accentBg : theme.border,
                border: `1px solid ${ratio > 0.99 ? theme.accentBright : 'transparent'}`,
                cursor: 'pointer',
              }}
              title={`${cell.d.toLocaleDateString('en-GB')}: ${cell.c}/${cell.total}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

// =============================================================
// GOALS VIEW
// =============================================================
function GoalsView({ habits, logs }) {
  const theme = useTheme();

  // Auto-generate goals from habits + a few preset weekly aggregations
  const presets = useMemo(() => {
    const today = new Date();
    let stepsTotal = 0, fypMins = 0, ringMins = 0, gymCount = 0, bibleCount = 0;
    let waterDays = 0, sleepDays = 0;
    for (let i = 0; i < 7; i++) {
      const log = logs[dateKey(addDays(today, -i))] || {};
      if (log.gym) gymCount++;
      if (log.bible) bibleCount++;
      stepsTotal += log.walking || 0;
      fypMins += log.fyp || 0;
      ringMins += log.ringbase || 0;
      const water = habits.find(h => h.id === 'water');
      const sleep = habits.find(h => h.id === 'sleep');
      if (water && isHabitComplete(water, log)) waterDays++;
      if (sleep && isHabitComplete(sleep, log)) sleepDays++;
    }
    const list = [];
    if (habits.find(h => h.id === 'gym'))      list.push({ name: 'Gym sessions',  current: gymCount,    target: 4,     unit: 'this week', color: '#c87a5a' });
    if (habits.find(h => h.id === 'walking'))  list.push({ name: 'Walking',       current: stepsTotal,  target: 56000, unit: 'steps this week', color: '#8aab85' });
    if (habits.find(h => h.id === 'water'))    list.push({ name: 'Water goal hit', current: waterDays,  target: 7,     unit: 'days this week', color: '#7a93a8' });
    if (habits.find(h => h.id === 'bible'))    list.push({ name: 'Bible study',   current: bibleCount,  target: 7,     unit: 'days this week', color: '#c8975a' });
    if (habits.find(h => h.id === 'fyp'))      list.push({ name: 'FYP work',      current: fypMins,     target: 420,   unit: 'mins this week', color: '#6b9a9c' });
    if (habits.find(h => h.id === 'ringbase')) list.push({ name: 'RingBase',      current: ringMins,    target: 210,   unit: 'mins this week', color: '#e3b378' });
    if (habits.find(h => h.id === 'sleep'))    list.push({ name: 'Sleep target',  current: sleepDays,   target: 5,     unit: 'days this week', color: '#8a7eb5' });
    return list;
  }, [logs, habits]);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingTop: 20 }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 22, fontStyle: 'italic',
        color: theme.fgDim, marginBottom: 16
      }}>
        This week's targets
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {presets.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const done = pct >= 100;
          return (
            <div key={i} style={{
              background: theme.bgElevated,
              border: `1px solid ${done ? g.color + '66' : theme.border}`,
              borderRadius: 14, padding: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 500 }}>{g.name}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: theme.fgDim }}>
                  <span style={{ color: done ? g.color : theme.fg }}>{g.current.toLocaleString()}</span>
                  <span style={{ color: theme.fgFaint }}> / {g.target.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: theme.fgFaint, marginTop: 2, marginBottom: 10 }}>{g.unit}</div>
              <div style={{ height: 6, background: theme.border, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, background: g.color,
                  transition: 'width 0.4s ease', borderRadius: 99,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 24, padding: 18, borderRadius: 14,
        background: theme.bgElevated, border: `1px dashed ${theme.borderBright}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <GraduationCap size={16} color="#6b9a9c" />
          <div style={{ fontSize: 11, color: theme.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Final year project
          </div>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontStyle: 'italic', color: theme.fgDim, lineHeight: 1.4 }}>
          Send through your FYP brief — milestones, deadlines, deliverables — and a dedicated tracker will land here.
        </div>
      </div>
    </div>
  );
}

// =============================================================
// ACHIEVEMENTS VIEW
// =============================================================
function AchievementsView({ unlocked, customAchievements }) {
  const theme = useTheme();
  const allAchievements = [...ACHIEVEMENTS, ...customAchievements];
  const total = allAchievements.length;
  const got = unlocked.size;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingTop: 20 }}>
      <div style={{
        background: theme.bgElevated, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center',
      }}>
        <Trophy size={28} color={theme.accent} />
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 300, marginTop: 8 }}>
          {got}<span style={{ color: theme.fgFaint, fontSize: 22 }}> / {total}</span>
        </div>
        <div style={{ fontSize: 12, color: theme.fgDim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Honours earned
        </div>
      </div>

      {customAchievements.length > 0 && (
        <>
          <SectionHeader>Your own</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {customAchievements.map(a => (
              <AchievementCard key={a.id} ach={a} unlocked={unlocked.has(a.id)} custom />
            ))}
          </div>
        </>
      )}

      <SectionHeader>Built-in</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {ACHIEVEMENTS.map(a => (
          <AchievementCard key={a.id} ach={a} unlocked={unlocked.has(a.id)} />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  const theme = useTheme();
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontSize: 13, color: theme.fgDim,
      letterSpacing: 1.5, textTransform: 'uppercase',
      marginBottom: 8, marginTop: 4,
    }}>
      {children}
    </div>
  );
}

function AchievementCard({ ach, unlocked, custom }) {
  const theme = useTheme();
  const Icon = ICON_MAP[ach.iconName] || Star;
  return (
    <div style={{
      background: unlocked ? `${theme.accent}11` : theme.bgElevated,
      border: `1px solid ${unlocked ? theme.accent + '55' : theme.border}`,
      borderRadius: 14, padding: 14, opacity: unlocked ? 1 : 0.55,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: unlocked ? `${theme.accent}22` : 'transparent',
        border: `1px solid ${unlocked ? theme.accent + '66' : theme.borderBright}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        {unlocked
          ? <Icon size={18} color={theme.accentBright} />
          : <Lock size={14} color={theme.fgFaint} />}
      </div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600,
        color: unlocked ? theme.fg : theme.fgDim, marginBottom: 4,
      }}>
        {ach.name}
      </div>
      <div style={{ fontSize: 11, color: theme.fgDim, lineHeight: 1.4 }}>
        {ach.desc}
      </div>
      {custom && (
        <div style={{
          marginTop: 6, fontSize: 10, color: theme.fgFaint,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Custom
        </div>
      )}
    </div>
  );
}

// =============================================================
// BOTTOM NAV
// =============================================================
function BottomNav({ view, setView }) {
  const theme = useTheme();
  const items = [
    { id: 'today',        icon: Sparkles,    label: 'Today' },
    { id: 'progress',     icon: TrendingUp,  label: 'Progress' },
    { id: 'goals',        icon: Target,      label: 'Goals' },
    { id: 'achievements', icon: Trophy,      label: 'Honours' },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: theme.bgElevated, borderTop: `1px solid ${theme.border}`,
      padding: '8px 0 16px', backdropFilter: 'blur(12px)', zIndex: 40,
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
                color: active ? theme.accent : theme.fgDim,
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

// =============================================================
// MODAL SHELL
// =============================================================
function Modal({ title, onClose, children }) {
  const theme = useTheme();
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'overlayIn 0.2s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '92vh',
          background: theme.bg, border: `1px solid ${theme.border}`,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          display: 'flex', flexDirection: 'column',
          animation: 'sheetIn 0.3s ease-out',
        }}
      >
        <div style={{
          padding: '14px 18px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: `1px solid ${theme.border}`,
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 500 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: theme.fgDim, padding: 6, display: 'flex',
            }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 18, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// SETTINGS MODAL
// =============================================================
function SettingsModal({
  onClose, themeName, setThemeName,
  habits, setHabits, customAchievements, setCustomAchievements,
  settings, setSettings, logs, setLogs, journal, setJournal,
  unlockedAch, setUnlockedAch,
}) {
  const theme = useTheme();
  const [section, setSection] = useState('main');

  const sections = [
    { id: 'theme',     label: 'Theme',         icon: Palette },
    { id: 'habits',    label: 'Habits',        icon: Edit2 },
    { id: 'custom',    label: 'Custom honours', icon: Trophy },
    { id: 'data',      label: 'Backup & data', icon: Save },
    { id: 'siri',      label: 'Siri shortcuts', icon: Zap },
    { id: 'display',   label: 'Display',       icon: Eye },
  ];

  return (
    <Modal title="Settings" onClose={onClose}>
      {section === 'main' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', background: theme.bgElevated,
                  border: `1px solid ${theme.border}`, borderRadius: 12,
                  color: theme.fg, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 15,
                }}
              >
                <Icon size={18} color={theme.accent} />
                <span style={{ flex: 1, textAlign: 'left' }}>{s.label}</span>
                <ArrowRight size={16} color={theme.fgFaint} />
              </button>
            );
          })}
        </div>
      )}

      {section !== 'main' && (
        <div>
          <button
            onClick={() => setSection('main')}
            style={{
              background: 'transparent', border: 'none', color: theme.fgDim,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              padding: 0, marginBottom: 16, fontSize: 13,
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {section === 'theme'    && <ThemeSettings themeName={themeName} setThemeName={setThemeName} />}
          {section === 'habits'   && <HabitsSettings habits={habits} setHabits={setHabits} />}
          {section === 'custom'   && <CustomAchSettings habits={habits} customAchievements={customAchievements} setCustomAchievements={setCustomAchievements} />}
          {section === 'data'     && <DataSettings logs={logs} setLogs={setLogs} journal={journal} setJournal={setJournal} habits={habits} setHabits={setHabits} customAchievements={customAchievements} setCustomAchievements={setCustomAchievements} unlockedAch={unlockedAch} setUnlockedAch={setUnlockedAch} themeName={themeName} setThemeName={setThemeName} settings={settings} setSettings={setSettings} />}
          {section === 'siri'     && <SiriSettings habits={habits} />}
          {section === 'display'  && <DisplaySettings settings={settings} setSettings={setSettings} />}
        </div>
      )}
    </Modal>
  );
}

function ThemeSettings({ themeName, setThemeName }) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Object.entries(THEMES).map(([key, t]) => (
        <button
          key={key}
          onClick={() => setThemeName(key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 12, background: t.bg,
            border: `2px solid ${themeName === key ? t.accent : t.border}`,
            borderRadius: 12, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: t.bg, border: `1px solid ${t.border}` }} />
            <div style={{ width: 18, height: 18, borderRadius: 4, background: t.accent }} />
            <div style={{ width: 18, height: 18, borderRadius: 4, background: t.fg }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: t.fg }}>{t.name}</div>
            <div style={{ fontSize: 11, color: t.fgDim, marginTop: 2 }}>{themeName === key ? 'Current' : 'Tap to apply'}</div>
          </div>
          {themeName === key && <Check size={18} color={t.accent} />}
        </button>
      ))}
    </div>
  );
}

function HabitsSettings({ habits, setHabits }) {
  const theme = useTheme();
  const [editing, setEditing] = useState(null);

  const handleAdd = () => {
    const newHabit = {
      id: 'h_' + Date.now(),
      name: 'New habit',
      iconName: 'Star',
      type: 'binary',
      color: COLOR_PALETTE[habits.length % COLOR_PALETTE.length],
      sortOrder: habits.length + 1,
    };
    setHabits([...habits, newHabit]);
    setEditing(newHabit.id);
  };

  const handleUpdate = (id, patch) => {
    setHabits(habits.map(h => h.id === id ? { ...h, ...patch } : h));
  };

  const handleDelete = (id) => {
    if (confirm('Delete this habit? Logs for it will stay but it disappears from the dashboard.')) {
      setHabits(habits.filter(h => h.id !== id));
      setEditing(null);
    }
  };

  if (editing) {
    const habit = habits.find(h => h.id === editing);
    if (!habit) { setEditing(null); return null; }
    return <HabitEditor habit={habit} onUpdate={(patch) => handleUpdate(habit.id, patch)} onDelete={() => handleDelete(habit.id)} onBack={() => setEditing(null)} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {habits.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(h => {
          const Icon = getIcon(h.iconName);
          return (
            <button
              key={h.id}
              onClick={() => setEditing(h.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: theme.bgElevated,
                border: `1px solid ${theme.border}`, borderRadius: 12,
                color: theme.fg, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${h.color}22`, border: `1px solid ${h.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color={h.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: theme.fgDim, fontFamily: FONT_MONO }}>
                  {h.type === 'binary' ? 'tap to mark done' : `target ${h.target} ${h.unit}`}
                </div>
              </div>
              <ChevronRight size={16} color={theme.fgFaint} />
            </button>
          );
        })}
      </div>
      <button
        onClick={handleAdd}
        style={{
          width: '100%', marginTop: 12, padding: '14px',
          background: 'transparent', border: `1px dashed ${theme.borderBright}`,
          borderRadius: 12, color: theme.fgDim, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <PlusIcon size={16} /> Add habit
      </button>
    </div>
  );
}

function HabitEditor({ habit, onUpdate, onDelete, onBack }) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: 'none', color: theme.fgDim,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          padding: 0, fontSize: 13, alignSelf: 'flex-start',
        }}
      >
        <ChevronLeft size={16} /> Back to habits
      </button>

      <Field label="Name">
        <input
          value={habit.name}
          onChange={e => onUpdate({ name: e.target.value })}
          style={inputStyle(theme)}
        />
      </Field>

      <Field label="Type">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onUpdate({ type: 'binary' })}
            style={pillStyle(theme, habit.type === 'binary')}
          >Done / not done</button>
          <button
            onClick={() => onUpdate({ type: 'numeric', target: habit.target || 8, unit: habit.unit || '', step: habit.step || 1 })}
            style={pillStyle(theme, habit.type === 'numeric')}
          >Numeric</button>
        </div>
      </Field>

      {habit.type === 'numeric' && (
        <>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Target">
              <input
                type="number" value={habit.target}
                onChange={e => onUpdate({ target: parseFloat(e.target.value) || 0 })}
                style={inputStyle(theme)}
              />
            </Field>
            <Field label="Step">
              <input
                type="number" value={habit.step}
                onChange={e => onUpdate({ step: parseFloat(e.target.value) || 1 })}
                style={inputStyle(theme)}
              />
            </Field>
          </div>
          <Field label="Unit (e.g. mins, glasses, steps)">
            <input
              value={habit.unit || ''}
              onChange={e => onUpdate({ unit: e.target.value })}
              style={inputStyle(theme)}
            />
          </Field>
        </>
      )}

      <Field label="Colour">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {COLOR_PALETTE.map(c => (
            <button
              key={c}
              onClick={() => onUpdate({ color: c })}
              style={{
                aspectRatio: '1', borderRadius: 10, padding: 0,
                background: c, cursor: 'pointer',
                border: `2px solid ${habit.color === c ? theme.fg : 'transparent'}`,
              }}
            />
          ))}
        </div>
      </Field>

      <Field label="Icon">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {Object.keys(ICON_LIBRARY).map(name => {
            const Icon = ICON_LIBRARY[name];
            const active = habit.iconName === name;
            return (
              <button
                key={name}
                onClick={() => onUpdate({ iconName: name })}
                style={{
                  aspectRatio: '1', borderRadius: 10, padding: 0,
                  background: active ? `${habit.color}33` : theme.bgElevated,
                  border: `1px solid ${active ? habit.color : theme.border}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon size={18} color={active ? habit.color : theme.fgDim} />
              </button>
            );
          })}
        </div>
      </Field>

      <button
        onClick={onDelete}
        style={{
          marginTop: 8, padding: 12, background: 'transparent',
          border: `1px solid #c87a5a55`, borderRadius: 10,
          color: '#c87a5a', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <Trash2 size={14} /> Delete habit
      </button>
    </div>
  );
}

function Field({ label, children }) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <div style={{ fontSize: 11, color: theme.fgDim, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      {children}
    </div>
  );
}

function inputStyle(theme) {
  return {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    background: theme.bgElevated, border: `1px solid ${theme.border}`,
    color: theme.fg, fontSize: 14, outline: 'none', fontFamily: FONT_BODY,
  };
}

function pillStyle(theme, active) {
  return {
    flex: 1, padding: '10px 12px', borderRadius: 10,
    background: active ? `${theme.accent}22` : theme.bgElevated,
    border: `1px solid ${active ? theme.accent : theme.border}`,
    color: active ? theme.accentBright : theme.fg,
    cursor: 'pointer', fontSize: 13, fontFamily: FONT_BODY,
  };
}

function CustomAchSettings({ habits, customAchievements, setCustomAchievements }) {
  const theme = useTheme();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', desc: '', habitId: habits[0]?.id, type: 'streak', threshold: 7 });

  const handleAdd = () => {
    if (!draft.name.trim() || !draft.habitId) return;
    const newAch = {
      id: 'cust_' + Date.now(),
      name: draft.name,
      desc: draft.desc || `${draft.type === 'streak' ? draft.threshold + '-day streak' : draft.threshold + ' total days'} on ${habits.find(h => h.id === draft.habitId)?.name}`,
      iconName: 'Star',
      habitId: draft.habitId,
      type: draft.type,
      threshold: parseInt(draft.threshold) || 1,
    };
    setCustomAchievements([...customAchievements, newAch]);
    setDraft({ name: '', desc: '', habitId: habits[0]?.id, type: 'streak', threshold: 7 });
    setAdding(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this achievement?')) {
      setCustomAchievements(customAchievements.filter(a => a.id !== id));
    }
  };

  return (
    <div>
      {customAchievements.length === 0 && !adding && (
        <div style={{ fontSize: 13, color: theme.fgDim, marginBottom: 16, fontStyle: 'italic' }}>
          Add your own goals to chase. e.g. "30-day Bible streak", "100 gym sessions logged".
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {customAchievements.map(a => {
          const habit = habits.find(h => h.id === a.habitId);
          return (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', background: theme.bgElevated,
              border: `1px solid ${theme.border}`, borderRadius: 12,
            }}>
              <Star size={16} color={theme.accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: theme.fgDim }}>
                  {a.type === 'streak' ? `${a.threshold}-day streak` : `${a.threshold} total days`} on {habit?.name || '?'}
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: theme.fgFaint, padding: 4,
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div style={{
          padding: 14, background: theme.bgElevated,
          border: `1px solid ${theme.border}`, borderRadius: 12,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <Field label="Name">
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={inputStyle(theme)} placeholder="e.g. Iron Streak" />
          </Field>
          <Field label="Habit">
            <select value={draft.habitId} onChange={e => setDraft({ ...draft, habitId: e.target.value })} style={inputStyle(theme)}>
              {habits.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Type">
              <select value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })} style={inputStyle(theme)}>
                <option value="streak">Streak (days in a row)</option>
                <option value="count">Count (total days done)</option>
              </select>
            </Field>
            <Field label="Threshold">
              <input type="number" value={draft.threshold} onChange={e => setDraft({ ...draft, threshold: e.target.value })} style={inputStyle(theme)} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ ...pillStyle(theme, false), flex: 1 }}>Cancel</button>
            <button onClick={handleAdd} style={{ ...pillStyle(theme, true), flex: 1 }}>Save</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            width: '100%', padding: '14px',
            background: 'transparent', border: `1px dashed ${theme.borderBright}`,
            borderRadius: 12, color: theme.fgDim, cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <PlusIcon size={16} /> New custom honour
        </button>
      )}
    </div>
  );
}

function DataSettings(props) {
  const theme = useTheme();
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');

  const handleExport = () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      logs: props.logs,
      journal: props.journal,
      unlockedAch: Array.from(props.unlockedAch),
      habits: props.habits,
      customAchievements: props.customAchievements,
      theme: props.themeName,
      settings: props.settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportText(ev.target.result);
      setImportMsg('Loaded — review then tap Import.');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      if (!data.logs) throw new Error('No logs found in file.');
      if (!confirm('This will overwrite your current data. Continue?')) return;
      props.setLogs(data.logs || {});
      props.setJournal(data.journal || {});
      props.setUnlockedAch(new Set(data.unlockedAch || []));
      if (data.habits && data.habits.length) props.setHabits(data.habits);
      props.setCustomAchievements(data.customAchievements || []);
      if (data.theme) props.setThemeName(data.theme);
      if (data.settings) props.setSettings(data.settings);
      setImportMsg('Restored. ✓');
      setImportText('');
    } catch (err) {
      setImportMsg('Failed: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 6 }}>Backup</div>
        <div style={{ fontSize: 13, color: theme.fgDim, marginBottom: 10, lineHeight: 1.4 }}>
          Downloads a JSON file with everything: logs, journal, habits, settings. Email it to yourself for safekeeping.
        </div>
        <button
          onClick={handleExport}
          style={{
            width: '100%', padding: 12, background: `${theme.accent}22`,
            border: `1px solid ${theme.accent}`, borderRadius: 10,
            color: theme.accentBright, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: FONT_BODY, fontSize: 14,
          }}
        >
          <Download size={16} /> Export backup
        </button>
      </div>

      <div style={{ height: 1, background: theme.border }} />

      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 6 }}>Restore</div>
        <div style={{ fontSize: 13, color: theme.fgDim, marginBottom: 10, lineHeight: 1.4 }}>
          Load a backup file you exported earlier. This replaces your current data.
        </div>
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: 12, background: theme.bgElevated,
          border: `1px dashed ${theme.borderBright}`, borderRadius: 10,
          color: theme.fgDim, cursor: 'pointer', fontSize: 14, marginBottom: 8,
        }}>
          <Upload size={16} /> Choose backup file
          <input type="file" accept="application/json,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
        {importText && (
          <button
            onClick={handleImport}
            style={{
              width: '100%', padding: 12, background: `${theme.accent}22`,
              border: `1px solid ${theme.accent}`, borderRadius: 10,
              color: theme.accentBright, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 14,
            }}
          >
            Import this file
          </button>
        )}
        {importMsg && (
          <div style={{ fontSize: 12, color: theme.fgDim, marginTop: 8, fontStyle: 'italic' }}>
            {importMsg}
          </div>
        )}
      </div>
    </div>
  );
}

function SiriSettings({ habits }) {
  const theme = useTheme();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: theme.fgDim, lineHeight: 1.5 }}>
        You can build iOS Shortcuts that open these URLs to log habits hands-free with Siri. e.g. "Hey Siri, log gym".
      </div>

      <div style={{
        background: theme.bgElevated, border: `1px solid ${theme.border}`,
        borderRadius: 12, padding: 14,
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, marginBottom: 10 }}>How to set one up</div>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.fgDim, lineHeight: 1.6 }}>
          <li>Open the Shortcuts app on iPhone → tap +</li>
          <li>Add action: <em>Open URLs</em></li>
          <li>Paste a URL from below</li>
          <li>Name the shortcut what you'd say to Siri ("Log gym")</li>
          <li>Done. Just say "Hey Siri, log gym".</li>
        </ol>
      </div>

      <div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, marginBottom: 10 }}>Your URLs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {habits.map(h => {
            const action = h.type === 'binary' ? 'toggle' : 'increment';
            const url = h.type === 'binary'
              ? `${baseUrl}/?action=toggle&habit=${h.id}`
              : `${baseUrl}/?action=increment&habit=${h.id}&amount=${h.step}`;
            return (
              <div key={h.id} style={{
                background: theme.bgElevated, border: `1px solid ${theme.border}`,
                borderRadius: 10, padding: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(url); }}
                    style={{
                      background: `${theme.accent}22`, border: `1px solid ${theme.accent}55`,
                      borderRadius: 6, color: theme.accentBright,
                      fontSize: 11, padding: '4px 8px', cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 10, color: theme.fgDim,
                  wordBreak: 'break-all', lineHeight: 1.4,
                }}>
                  {url}
                </div>
                <div style={{ fontSize: 10, color: theme.fgFaint, marginTop: 4 }}>
                  {h.type === 'binary' ? 'Toggles done/not done' : `Adds ${h.step} ${h.unit || ''}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DisplaySettings({ settings, setSettings }) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={() => setSettings({ ...settings, showVerse: !settings.showVerse })}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: theme.bgElevated,
          border: `1px solid ${theme.border}`, borderRadius: 12,
          color: theme.fg, cursor: 'pointer', textAlign: 'left',
        }}
      >
        {settings.showVerse ? <Eye size={18} color={theme.accent} /> : <EyeOff size={18} color={theme.fgDim} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14 }}>Daily verse</div>
          <div style={{ fontSize: 11, color: theme.fgDim }}>
            {settings.showVerse ? 'Showing on Today screen' : 'Hidden'}
          </div>
        </div>
      </button>
    </div>
  );
}

// =============================================================
// WEEKLY REVIEW MODAL
// =============================================================
function WeeklyReviewModal({ habits, logs, onClose }) {
  const theme = useTheme();

  const stats = useMemo(() => {
    const today = new Date();
    const thisWeek = { perfect: 0, completed: 0, byHabit: {} };
    const lastWeek = { perfect: 0, completed: 0, byHabit: {} };

    habits.forEach(h => {
      thisWeek.byHabit[h.id] = { count: 0, total: 0 };
      lastWeek.byHabit[h.id] = { count: 0, total: 0 };
    });

    for (let i = 0; i < 7; i++) {
      const log = logs[dateKey(addDays(today, -i))];
      if (log) {
        if (isPerfectDay(log, habits)) thisWeek.perfect++;
        habits.forEach(h => {
          if (isHabitComplete(h, log)) thisWeek.byHabit[h.id].count++;
          if (h.type === 'numeric') thisWeek.byHabit[h.id].total += log[h.id] || 0;
          thisWeek.completed += isHabitComplete(h, log) ? 1 : 0;
        });
      }
    }
    for (let i = 7; i < 14; i++) {
      const log = logs[dateKey(addDays(today, -i))];
      if (log) {
        if (isPerfectDay(log, habits)) lastWeek.perfect++;
        habits.forEach(h => {
          if (isHabitComplete(h, log)) lastWeek.byHabit[h.id].count++;
          if (h.type === 'numeric') lastWeek.byHabit[h.id].total += log[h.id] || 0;
          lastWeek.completed += isHabitComplete(h, log) ? 1 : 0;
        });
      }
    }
    return { thisWeek, lastWeek };
  }, [logs, habits]);

  const delta = stats.thisWeek.completed - stats.lastWeek.completed;

  return (
    <Modal title="Weekly review" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          padding: 16, background: theme.bgElevated,
          border: `1px solid ${theme.border}`, borderRadius: 14,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: theme.fgDim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Last 7 days
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 38, fontWeight: 300 }}>
            {stats.thisWeek.completed}
          </div>
          <div style={{ fontSize: 13, color: theme.fgDim }}>habits completed</div>
          {stats.lastWeek.completed > 0 && (
            <div style={{ fontSize: 12, marginTop: 6, color: delta >= 0 ? theme.accent : '#c87a5a' }}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} vs prior week
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatTile label="Perfect days" value={stats.thisWeek.perfect} icon={Star} accent />
          <StatTile label="Best streak" value={Math.max(0, ...habits.map(h => computeStreak(h, logs)))} icon={Flame} />
        </div>

        <div>
          <SectionHeader>By habit</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.map(h => {
              const Icon = getIcon(h.iconName);
              const w = stats.thisWeek.byHabit[h.id];
              const lw = stats.lastWeek.byHabit[h.id];
              return (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 10, background: theme.bgElevated,
                  border: `1px solid ${theme.border}`, borderRadius: 10,
                }}>
                  <Icon size={16} color={h.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: theme.fgDim, fontFamily: FONT_MONO }}>
                      {h.type === 'binary'
                        ? `${w.count} / 7 days`
                        : `${w.total.toLocaleString()} ${h.unit} • ${w.count}/7 hit goal`}
                    </div>
                  </div>
                  {lw.count > 0 && w.count !== lw.count && (
                    <div style={{
                      fontSize: 11, fontFamily: FONT_MONO,
                      color: w.count > lw.count ? theme.accent : '#c87a5a',
                    }}>
                      {w.count > lw.count ? '+' : ''}{w.count - lw.count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {stats.thisWeek.completed === 0 && (
          <div style={{
            padding: 16, background: theme.bgElevated,
            border: `1px dashed ${theme.borderBright}`, borderRadius: 12,
            fontSize: 13, color: theme.fgDim, fontStyle: 'italic', textAlign: 'center',
          }}>
            Nothing logged this week yet. Start small.
          </div>
        )}
      </div>
    </Modal>
  );
}

// =============================================================
// DAY EDITOR MODAL
// =============================================================
function DayEditorModal({ dateStr, habits, logs, onUpdate, onClose }) {
  const theme = useTheme();
  const log = logs[dateStr] || {};
  const date = parseKey(dateStr);
  const isToday = dateStr === todayKey();
  const isFuture = date > new Date();

  const handleToggle = (habit) => {
    onUpdate(habit.id, !log[habit.id], dateStr);
  };

  const handleIncrement = (habit, delta) => {
    const cur = log[habit.id] || 0;
    onUpdate(habit.id, Math.max(0, cur + delta), dateStr);
  };

  return (
    <Modal title={isToday ? 'Today' : formatDateNice(date)} onClose={onClose}>
      {isFuture ? (
        <div style={{ fontSize: 13, color: theme.fgDim, fontStyle: 'italic', padding: 12 }}>
          Can't log future days.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {habits.length === 0 ? (
            <div style={{ fontSize: 13, color: theme.fgDim, fontStyle: 'italic' }}>No habits yet.</div>
          ) : (
            habits.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(h => (
              <HabitCard
                key={h.id} habit={h}
                value={log[h.id]}
                streak={0}
                onToggle={() => handleToggle(h)}
                onIncrement={(d) => handleIncrement(h, d)}
              />
            ))
          )}
          <div style={{ fontSize: 11, color: theme.fgFaint, marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>
            Changes save automatically.
          </div>
        </div>
      )}
    </Modal>
  );
}
