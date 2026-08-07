import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import heroMobileImg from '../../assets/images/hero_mobile.png';
import splitCardImg from '../../assets/images/split_card.png';
import { ScrollImageSequence } from './ScrollImageSequence';
import { FinancialHealthHero } from '../dashboard/FinancialHealthHero';
import { QuickStats } from '../dashboard/QuickStats';
import { SpendingCharts } from '../dashboard/SpendingCharts';
import { DailySafeToSpend } from '../dashboard/DailySafeToSpend';
import { BudgetPlanner } from '../budget/BudgetPlanner';
import { GoalTracker } from '../savings/GoalTracker';
import type { Transaction, Budget, SavingsGoal } from '../../types';

interface LandingPageProps {
  onAuthTrigger: (mode: 'signin' | 'signup' | 'demo') => void;
}

// Predefined FAQ Data
const FAQ_DATA = [
  {
    question: "Is FinBuddy actually free for students?",
    answer: "Yes, 100%! All core features—expense logging, budget planner, live bill splitting, savings goal tracker, and basic AI insights—are completely free for college students with no hidden charges or subscription gates."
  },
  {
    question: "How does the live bill splitting work without cards?",
    answer: "FinBuddy utilizes real-time Firestore listeners. You initiate a splitting session, which displays a room QR code. When roommates scan it on their phones, they are instantly added to your screen. You split items, and balances updates instantly across all connected screens in real-time."
  },
  {
    question: "Can I use FinBuddy without connecting my bank account?",
    answer: "Absolutely. FinBuddy is designed with student privacy in mind. We do not require direct bank login credentials. You input transactions via manual logging, voice entry, or receipt scanner OCR instantly."
  },
  {
    question: "How secure is my data on the dashboard?",
    answer: "Your security is our priority. We host our database on Firebase Secure Rules and secure Cloud Firestore. None of your data is shared, sold, or exposed to third-party ad companies."
  },
  {
    question: "What makes the AI Money Coach different from generic calculators?",
    answer: "Generic apps just show numbers. The AI Money Coach analyzes your personalized habits (e.g. 'You order dinner on Swiggy every Friday between 8-10 PM') and provides actionable strategies (e.g. 'Skipping Swiggy today gets you 12% closer to your Goa Trip goal')."
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthTrigger }) => {
  // GSAP scroll trigger sequence refs
  const sequenceSectionRef = useRef<HTMLDivElement>(null);
  const sequencePinnedRef = useRef<HTMLDivElement>(null);
  const scrollDistance = 5000; // configurable scroll distance

  // Reduced motion and mobile detection
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect reduced motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', motionListener);

    // Detect mobile viewport width
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mediaQuery.removeEventListener('change', motionListener);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Pre-seed local state for interactive preview components
  const [landingTransactions, setLandingTransactions] = useState<Transaction[]>([
    { id: 't1', amount: 8000, type: 'income', category: 'Income', date: new Date().toISOString().split('T')[0], note: 'Monthly Pocket Allowance' },
    { id: 't2', amount: 12000, type: 'income', category: 'Income', date: new Date().toISOString().split('T')[0], note: 'Freelance Frontend Design' },
    { id: 't3', amount: 860, type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0], note: 'Swiggy Dinner' },
    { id: 't4', amount: 350, type: 'expense', category: 'Transport', date: new Date().toISOString().split('T')[0], note: 'Uber cab to campus' },
    { id: 't5', amount: 199, type: 'expense', category: 'Subscriptions', date: new Date().toISOString().split('T')[0], note: 'Spotify Student Premium' },
    { id: 't6', amount: 1800, type: 'expense', category: 'Shopping', date: new Date().toISOString().split('T')[0], note: 'Textbooks' }
  ]);

  const [landingBudgets, setLandingBudgets] = useState<Budget[]>([
    { category: 'Food', limit: 4000 },
    { category: 'Transport', limit: 1500 },
    { category: 'Subscriptions', limit: 1000 },
    { category: 'Shopping', limit: 3000 }
  ]);

  const [landingGoals, setLandingGoals] = useState<SavingsGoal[]>([
    { id: 'g1', name: 'MacBook Pro M4', targetAmount: 120000, currentAmount: 78000, targetDate: '2026-12-31' },
    { id: 'g2', name: 'Goa Trip with Roomies', targetAmount: 12000, currentAmount: 8000, targetDate: '2026-10-15' }
  ]);

  // ── CRITICAL: prevent browser scroll restoration from auto-scrolling on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Clear any hash routes if not a split guest route
      const hash = window.location.hash;
      if (hash && !hash.startsWith('#/split/')) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    }
  }, []);

  // Sticky Navbar blur on scroll state
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lenis Smooth Scroll Initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Enforce immediate top position alignment in Lenis
    lenis.scrollTo(0, { immediate: true });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Section 8: AI Money Coach chat simulator
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([
    { sender: 'ai', text: "Hey! I'm your AI Money Coach. Select a goal or write something to start saving smarter." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const simulateAIResponse = (userPrompt: string, aiResponse: string) => {
    if (isTyping) return;
    
    setChatMessages(prev => [...prev, { sender: 'user', text: userPrompt }]);
    setIsTyping(true);

    setTimeout(() => {
      let currentLength = 0;
      setChatMessages(prev => [...prev, { sender: 'ai', text: '' }]);
      
      const interval = setInterval(() => {
        currentLength += 3;
        if (currentLength >= aiResponse.length) {
          clearInterval(interval);
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { sender: 'ai', text: aiResponse };
            return updated;
          });
          setIsTyping(false);
        } else {
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { sender: 'ai', text: aiResponse.slice(0, currentLength) + '▎' };
            return updated;
          });
        }
      }, 15);
    }, 800);
  };

  useEffect(() => {
    if (chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  // Section 14: FAQ accordion expanded indices
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // Social Proof counter simulation (triggered immediately for this design-only showcase)
  const [stats, setStats] = useState({ expenses: 0, accuracy: 0, students: 0, savings: 0 });
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setStats({
        expenses: Math.min(Math.round((10000 / steps) * step), 10000),
        accuracy: Math.min(Math.round((98 / steps) * step), 98),
        students: Math.min(Math.round((5000 / steps) * step), 5000),
        savings: Math.min(Math.round((92 / steps) * step), 92),
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // CRUD handlers for preview states
  const handleUpdateBudget = (updatedBudget: Budget) => {
    setLandingBudgets(prev => {
      const exists = prev.some(b => b.category === updatedBudget.category);
      if (exists) {
        return prev.map(b => b.category === updatedBudget.category ? updatedBudget : b);
      }
      return [...prev, updatedBudget];
    });
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `g_mock_${Date.now()}`
    };
    setLandingGoals(prev => [...prev, goal]);
  };

  const handleUpdateGoalAmount = (id: string, amount: number) => {
    setLandingGoals(prev => prev.map(g => {
      if (g.id === id) {
        // Register savings transfer transaction
        const newTx: Transaction = {
          id: `t_mock_${Date.now()}`,
          amount,
          type: 'expense',
          category: 'Others',
          date: new Date().toISOString().split('T')[0],
          note: `Transfer to ${g.name}`
        };
        setLandingTransactions(prevTx => [newTx, ...prevTx]);
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setLandingGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="bg-white text-[#1b1c1c] w-full min-h-screen relative overflow-x-hidden selection:bg-neon-green selection:text-black">
      
      {/* ──────────────────────────────
          SECTION 1: GLASSMORPHISM NAVBAR
          ────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: scrolled ? '12px' : '16px',
          left: '24px',
          right: '24px',
          zIndex: 100,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          borderRadius: '18px',
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: scrolled ? 'blur(25px)' : 'blur(20px)',
          WebkitBackdropFilter: scrolled ? 'blur(25px)' : 'blur(20px)',
          border: '1px solid rgba(18, 18, 18, 0.08)',
          boxShadow: scrolled ? '0 8px 32px rgba(18, 18, 18, 0.08)' : '0 8px 30px rgba(18, 18, 18, 0.05)',
          padding: '12px 24px',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/logo.png" alt="FinBuddy" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-hanken font-extrabold text-[15px] text-[#121212] uppercase tracking-tight">
              Fin<span className="text-[#006E2A]">Buddy</span>
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              ['Overview', '#overview'],
              ['Budgeting', '#budget'],
              ['Splits', '#split'],
              ['Savings', '#savings'],
              ['Features', '#features'],
              ['FAQ', '#faq']
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={e => {
                  e.preventDefault();
                  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="font-hanken text-[11px] font-bold uppercase tracking-wider text-[#5F5E5E] hover:text-[#121212] transition-colors decoration-none"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onAuthTrigger('signin')}
              className="font-hanken text-[11px] font-bold uppercase tracking-wider text-[#5F5E5E] hover:text-[#121212] bg-transparent border-none cursor-pointer transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => onAuthTrigger('signup')}
              className="font-hanken text-[11px] font-bold uppercase tracking-wider text-white bg-[#121212] hover:bg-[#006E2A] border-none cursor-pointer px-5 py-2.5 rounded-full transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ──────────────────────────────
          SECTION 2: HERO (GSAP SCRUB CANVAS OR STATIC FALLBACK)
          ────────────────────────────── */}
      {!isMobile && !reducedMotion ? (
        <section ref={sequenceSectionRef} className="hero-sequence w-full bg-white relative" style={{ minHeight: '500vh' }}>
          <div ref={sequencePinnedRef} className="hero-sticky w-full h-screen overflow-hidden relative flex flex-col justify-center">
            
            {/* 1. Subtle ambient green glow behind canvas (z-index 0) */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 75% 50%, rgba(15, 238, 101, 0.12), transparent 45%)',
              }}
            />

            {/* 2. Full-Screen Canvas Background (z-index 1) */}
            <div className="absolute inset-0 z-1 pointer-events-none w-full h-full">
              <ScrollImageSequence
                sectionRef={sequenceSectionRef}
                pinnedRef={sequencePinnedRef}
                scrollDistance={scrollDistance}
                onProgressUpdate={(progress, frame) => {
                  console.log({ progress, frame });
                }}
              />
            </div>

            {/* 3. Legibility Gradient Fade (z-index 2) */}
            <div
              className="absolute inset-0 z-2 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.3) 60%, transparent 80%)',
              }}
            />

            {/* 4. Overlay Content (z-index 10) */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full h-full flex items-center relative z-10">
              {/* Left Column Copy */}
              <div className="flex flex-col text-left justify-center gap-6" style={{ maxWidth: '540px', pointerEvents: 'auto' }}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 self-start">
                  <span className="w-2 h-2 rounded-full bg-[#0FEE65] animate-pulse"></span>
                  <span className="font-hanken text-[10px] font-bold uppercase tracking-wider text-black/65">
                    AI Powered Student Finance Dashboard
                  </span>
                </div>

                <h1 className="font-sans text-5xl sm:text-7xl font-extrabold tracking-tight text-[#121212] leading-[1.05] m-0">
                  YOUR MONEY.<br />
                  YOUR <span className="text-[#006E2A]" style={{ textShadow: '0 0 32px rgba(15,238,101,0.2)' }}>WAY.</span>
                </h1>

                <p className="font-sans text-base text-[#5F5E5E] leading-relaxed max-w-md m-0">
                  FinBuddy gives students one simple place to track spending, manage budgets, split expenses, and build better financial habits.
                </p>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => onAuthTrigger('signup')}
                    className="bg-[#121212] text-white hover:bg-[#006E2A] px-8 py-4 rounded-full font-hanken font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md border-none"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => {
                      document.querySelector('#overview')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#F5F3F3] border border-black/10 text-black hover:bg-white px-8 py-4 rounded-full font-hanken font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Explore FinBuddy
                  </button>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-12 z-20 flex flex-col items-start gap-2 pointer-events-none">
              <span className="font-hanken text-[9px] font-bold uppercase tracking-widest text-[#5F5E5E]">
                Scroll to explore
              </span>
              <div className="w-0.5 h-8 bg-black/10 relative overflow-hidden rounded-full">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-[#0fee65] rounded-full animate-scroll-dash" />
              </div>
            </div>

          </div>
        </section>
      ) : (
        /* Static Mobile/Reduced Motion Fallback */
        <section className="relative w-full min-h-screen flex flex-col justify-start bg-white text-[#121212] overflow-hidden">
          {/* Subtle Radial Glow */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 65%, rgba(15, 238, 101, 0.10), transparent 45%)',
            }}
          />
          <div className="w-full flex-1 max-w-7xl mx-auto px-6 pt-32 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            {/* Copy */}
            <div className="w-full lg:w-1/2 flex flex-col text-left gap-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 self-start">
                <span className="w-2 h-2 rounded-full bg-[#0FEE65] animate-pulse"></span>
                <span className="font-hanken text-[10px] font-bold uppercase tracking-wider text-black/65">
                  AI Powered Student Finance Dashboard
                </span>
              </div>

              <h1 className="font-sans text-5xl sm:text-7xl font-extrabold tracking-tight text-[#121212] leading-[1.05] m-0">
                YOUR MONEY.<br />
                YOUR <span className="text-[#006E2A]">WAY.</span>
              </h1>

              <p className="font-sans text-base text-[#5F5E5E] max-w-lg leading-relaxed m-0">
                FinBuddy gives students one simple place to track spending, manage budgets, split expenses, and build better financial habits.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button
                  onClick={() => onAuthTrigger('signup')}
                  className="bg-[#121212] text-white hover:bg-[#006E2A] px-8 py-4 rounded-full font-hanken font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md border-none"
                >
                  Get Started
                </button>
                <button
                  onClick={() => {
                    document.querySelector('#overview')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#F5F3F3] border border-black/10 text-black hover:bg-white px-8 py-4 rounded-full font-hanken font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Explore FinBuddy
                </button>
              </div>
            </div>

            {/* Static Mockup */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <img
                src={heroMobileImg}
                alt="FinBuddy Mockup"
                className="w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[420px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
              />
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────
          SECTION 3: SOCIAL PROOF
          ────────────────────────────── */}
      <section className="bg-[#F5F3F3] border-t border-b border-[rgba(18,18,18,0.10)] py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            [stats.expenses.toLocaleString() + '+', 'Expenses Tracked'],
            [stats.accuracy + '%', 'Budget Accuracy'],
            [stats.students.toLocaleString() + '+', 'Students Active'],
            [stats.savings + '%', 'Savings Success']
          ].map(([val, label]) => (
            <div key={label} className="flex flex-col justify-center items-center">
              <span className="text-4xl sm:text-5xl font-black text-[#121212] tracking-tight leading-none numeric-display">
                {val}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5E5E] font-hanken mt-2.5">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 4: FINANCIAL OVERVIEW
          ────────────────────────────── */}
      <section id="overview" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center bg-white">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5E5E] font-hanken">Overview</span>
        <h2 className="font-hanken text-4xl md:text-5xl font-black text-[#121212] tracking-tight mt-3 mb-16">
          Know where your money goes.
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <FinancialHealthHero transactions={landingTransactions} budgets={landingBudgets} />
            <QuickStats transactions={landingTransactions} />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <DailySafeToSpend transactions={landingTransactions} budgets={landingBudgets} />
            <SpendingCharts transactions={landingTransactions} />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 5: BUDGETING
          ────────────────────────────── */}
      <section id="budget" className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center bg-white border-t border-[rgba(18,18,18,0.06)]">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5E5E] font-hanken">Budgeting</span>
        <h2 className="font-hanken text-4xl md:text-5xl font-black text-[#121212] tracking-tight mt-3 mb-16">
          Budget without the spreadsheet.
        </h2>
        <div className="bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-6 md:p-8 shadow-2xl">
          <BudgetPlanner
            budgets={landingBudgets}
            transactions={landingTransactions}
            onUpdateBudget={handleUpdateBudget}
          />
        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 6: SPLIT BILLS
          ────────────────────────────── */}
      <section id="split" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center bg-white border-t border-[rgba(18,18,18,0.06)]">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5E5E] font-hanken">Bill Splits</span>
        <h2 className="font-hanken text-4xl md:text-5xl font-black text-[#121212] tracking-tight mt-3 mb-16">
          Split expenses. Skip the awkward math.
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          {/* Left Column Description + Split Card Mockup */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h3 className="font-hanken text-2xl font-bold text-[#121212] m-0">
              Host live splits and sync balances instantly.
            </h3>
            <p className="font-sans text-base text-[#5F5E5E] leading-relaxed m-0">
              Create split groups for rent, dinners, or trip rides. Share the group QR code instantly. As roomies scan, their names appear live. Enter shared bills and settle up without hassle.
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => onAuthTrigger('signup')}
                className="bg-[#121212] text-white hover:bg-black px-6 py-3.5 rounded-full font-hanken font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Create Split Room
              </button>
            </div>
            
            {/* Live split room container */}
            <div className="rounded-[24px] border border-white/10 bg-[#121212] p-5 shadow-2xl mt-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 m-0">Live Split Room</p>
                  <h4 className="mt-1 font-hanken text-base font-bold text-white m-0">Roomies Dinner</h4>
                </div>
                <span className="rounded-full bg-neon-green/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-neon-green">Live Sync</span>
              </div>
              <div className="mt-4 space-y-3 text-xs text-white/70">
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                  <span>Pizza & mocktails</span>
                  <span className="font-semibold text-white">₹1,240</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                  <span>Shared rides</span>
                  <span className="font-semibold text-white">₹360</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-neon-green/20 bg-neon-green/10 px-3 py-2.5">
                  <span className="text-neon-green">Your share</span>
                  <span className="font-semibold text-neon-green">₹530</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column Split Image Mock */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="bg-[#F5F3F3] border border-[rgba(18,18,18,0.08)] rounded-[32px] p-6 shadow-xl flex items-center justify-center w-full max-w-[500px]">
              <img
                src={splitCardImg}
                alt="Split Card Mockup"
                className="w-full h-auto max-h-[380px] object-contain drop-shadow-lg rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 7: SAVINGS GOALS
          ────────────────────────────── */}
      <section id="savings" className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center bg-white border-t border-[rgba(18,18,18,0.06)]">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5E5E] font-hanken">Savings goals</span>
        <h2 className="font-hanken text-4xl md:text-5xl font-black text-[#121212] tracking-tight mt-3 mb-16">
          Small steps. Bigger goals.
        </h2>
        <div className="bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-6 md:p-8 shadow-2xl">
          <GoalTracker
            goals={landingGoals}
            transactions={landingTransactions}
            onAddGoal={handleAddGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onDeleteGoal={handleDeleteGoal}
          />
        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 8: AI MONEY COACH
          ────────────────────────────── */}
      <section id="coach" className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="bg-[#121212] text-white rounded-[32px] p-8 md:p-16 border border-white/15 relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-neon-green/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-5 text-left flex flex-col gap-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20 self-start">
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span className="font-hanken text-[10px] font-bold uppercase tracking-wider">Meet Your Assistant</span>
              </div>
              <h2 className="font-hanken text-4xl md:text-5xl font-black tracking-tight text-white leading-tight m-0">
                Conversational AI Money Coach
              </h2>
              <p className="font-sans text-sm text-white/60 leading-relaxed m-0">
                FinBuddy analyzes your manual spending logs, canteens split volumes, and budget plans. The AI coach points out your cost leaks conversational, giving suggestions that map direct to your milestones.
              </p>
              <button
                onClick={() => onAuthTrigger('signup')}
                className="bg-neon-green text-black font-hanken font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full self-start hover:shadow-[0_0_20px_rgba(15,238,101,0.5)] transition-all cursor-pointer"
              >
                Try AI Coach
              </button>
            </div>

            {/* Right Column Interactive Chat Sandbox */}
            <div className="lg:col-span-7 flex flex-col relative z-10 w-full">
              <div className="bg-[#1e2022] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl h-[360px] justify-between">
                
                {/* Chat Message Window */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 hide-scrollbar">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-sans text-left leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0FEE65] text-black font-bold'
                          : 'bg-[#121212] text-white border border-white/5'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-pulse">
                      <div className="bg-[#121212] text-white border border-white/5 max-w-[80%] rounded-2xl p-3.5 text-xs text-left">
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Predefined Interactive Prompts */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  <button
                    disabled={isTyping}
                    onClick={() => simulateAIResponse(
                      "How can I save ₹3000?", 
                      "Reduce food delivery spending by 12% next week. Cancel your unused Netflix subscription, and transfer ₹100 daily to your Goa Trip goal."
                    )}
                    className="bg-[#121212] hover:bg-white/10 border border-white/5 text-[9px] font-bold text-white px-3 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50 font-sans"
                  >
                    💡 How can I save ₹3000?
                  </button>
                  <button
                    disabled={isTyping}
                    onClick={() => simulateAIResponse(
                      "Where am I leaking cash?", 
                      "Your logs show ₹1,850 spent on chai canteen lunches this month, which is 42% higher than your target. Bring that down to hit your Laptop Goal."
                    )}
                    className="bg-[#121212] hover:bg-white/10 border border-white/5 text-[9px] font-bold text-white px-3 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50 font-sans"
                  >
                    🔍 Where am I leaking cash?
                  </button>
                  <button
                    disabled={isTyping}
                    onClick={() => simulateAIResponse(
                      "Analyze my subscription costs.", 
                      "You have Spotify and ChatGPT Plus costing ₹1,148/mo. Cancel ChatGPT for the break month to save 28% instantly."
                    )}
                    className="bg-[#121212] hover:bg-white/10 border border-white/5 text-[9px] font-bold text-white px-3 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50 font-sans"
                  >
                    💳 Subscription analysis
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 9: PREMIUM FEATURES BENTO GRID
          ────────────────────────────── */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center bg-grid-pattern">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5E5E] font-hanken">Bento Grid Layout</span>
        <h2 className="font-hanken text-4xl md:text-5xl font-black text-[#121212] tracking-tight mt-3 mb-16">
          FinBuddy Feature Bento Grid.
        </h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[180px]">
          
          {/* Card 1: Track Spending (Large - 8cols/2rows) */}
          <div className="md:col-span-8 md:row-span-2 bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-8 text-left flex flex-col justify-between hover-lift-dark">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-4xl text-[#0FEE65]">trending_up</span>
              <span className="bg-[#0FEE65]/10 text-[#0FEE65] text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">Visual Overview</span>
            </div>
            <div>
              <h3 className="font-hanken font-bold text-2xl text-white mb-2">Track Spending</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans max-w-md m-0">
                Log transactions manually or let OCR parse bills. Spending is sorted automatically into Food, Travel, Subscriptions, and Shopping with interactive ledger sheets.
              </p>
            </div>
            <div className="flex gap-4 text-[10px] text-white/40 border-t border-white/5 pt-3">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#0FEE65]"></span>Local Encryption</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#006E2A]"></span>Sync Status Live</span>
            </div>
          </div>

          {/* Card 2: Budget Smarter (Medium - 4cols/2rows) */}
          <div className="md:col-span-4 md:row-span-2 bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-6 text-left flex flex-col justify-between hover-lift-dark">
            <span className="material-symbols-outlined text-4xl text-[#006E2A] self-start">document_scanner</span>
            <div>
              <h3 className="font-hanken font-bold text-lg text-white mb-2">Budget Smarter</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans m-0">
                Set category limits in one interface. Live bars display progress ratios and alert you when spending hits 80% of thresholds.
              </p>
            </div>
            <div className="bg-[#1e2022] border border-white/5 p-3 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0FEE65] text-sm">check_circle</span>
              <div className="text-[9px]">
                <p className="text-white/40 font-bold uppercase tracking-wider m-0">Food & Dining Limit</p>
                <p className="text-white font-bold m-0">₹1,240 / ₹2,000</p>
              </div>
            </div>
          </div>

          {/* Card 3: Split Expenses (Small - 4cols/1row) */}
          <div className="md:col-span-4 bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-6 text-left flex flex-col justify-between hover-lift-dark">
            <div className="flex justify-between items-center">
              <h4 className="font-hanken font-bold text-sm text-white m-0">Split Expenses</h4>
              <span className="material-symbols-outlined text-base text-[#0FEE65]">sync</span>
            </div>
            <p className="text-xs text-white/50 font-sans leading-normal m-0">
              Host bill-splitting rooms. Roomies join via QR code to settle balances instantly in real-time.
            </p>
          </div>

          {/* Card 4: Savings Goals (Small - 4cols/1row) */}
          <div className="md:col-span-4 bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-6 text-left flex flex-col justify-between hover-lift-dark">
            <div className="flex justify-between items-center">
              <h4 className="font-hanken font-bold text-sm text-white m-0">Savings Goals</h4>
              <span className="material-symbols-outlined text-base text-[#006E2A]">savings</span>
            </div>
            <p className="text-xs text-white/50 font-sans leading-normal m-0">
              Set milestones for laptops, student trips, or funds with calculators to track pace.
            </p>
          </div>

          {/* Card 5: Financial Insights (Small - 4cols/1row) */}
          <div className="md:col-span-4 bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-6 text-left flex flex-col justify-between hover-lift-dark">
            <div className="flex justify-between items-center">
              <h4 className="font-hanken font-bold text-sm text-white m-0">Financial Insights</h4>
              <span className="material-symbols-outlined text-base text-[#0FEE65]">psychology</span>
            </div>
            <p className="text-xs text-white/50 font-sans leading-normal m-0">
              Personalized AI Money Coach reviews transaction histories to suggest custom savings plans.
            </p>
          </div>

          {/* Card 6: Student-focused Finance (Medium - 12cols/1row) */}
          <div className="md:col-span-12 bg-[#121212] border border-white/[0.08] text-white rounded-[24px] p-6 text-left flex items-center justify-between hover-lift-dark">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-[#0FEE65]">verified_user</span>
              <div>
                <h4 className="font-hanken font-bold text-sm text-white m-0">Student-focused Finance</h4>
                <p className="text-xs text-white/50 font-sans leading-normal mt-1 m-0">
                  Zero bank credentials needed. We host secure manual entries, voice uploads, or image scans. Highly secure local browser syncing.
                </p>
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest hidden sm:inline">Secure ledger v1.0</span>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 10: FAQs
          ────────────────────────────── */}
      <section id="faq" className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5E5E] font-hanken font-bold">Common Queries</span>
        <h2 className="font-hanken text-4xl md:text-5xl font-black text-[#121212] tracking-tight mt-3 mb-16">
          Frequently Asked Questions
        </h2>

        <div className="flex flex-col gap-4 text-left">
          {FAQ_DATA.map((faq, idx) => {
            const isExpanded = faqExpanded === idx;
            return (
              <div
                key={idx}
                className="border-b border-gray-150 pb-5 pt-1"
              >
                <button
                  onClick={() => setFaqExpanded(isExpanded ? null : idx)}
                  className="w-full flex justify-between items-center bg-transparent border-none font-hanken font-bold text-base text-black text-left cursor-pointer focus:outline-none p-0"
                >
                  <span>{faq.question}</span>
                  <span className="material-symbols-outlined text-black/40 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(45deg)' : 'none' }}>
                    add
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs text-[#5F5E5E] leading-relaxed font-sans pr-8 m-0">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────
          SECTION 11: FINAL CTA
          ────────────────────────────── */}
      <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto text-center">
        <div className="bg-[#121212] text-white rounded-[32px] p-12 md:p-24 border border-white/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,238,101,0.06),transparent_70%)] pointer-events-none animate-pulse-glow"></div>

          <span className="text-[10px] uppercase font-bold tracking-widest text-[#0FEE65] font-hanken relative z-10">Start Tracking Today</span>
          <h2 className="font-hanken text-4xl sm:text-6xl font-black tracking-tight text-white mt-4 mb-6 relative z-10 max-w-2xl mx-auto leading-tight m-0">
            Ready To Build Better Money Habits?
          </h2>
          <p className="text-sm text-white/55 font-sans leading-relaxed max-w-md mx-auto mb-10 relative z-10 m-0">
            Join thousands of college students saving smarter, splitting room bills live, and tracking budgets. Free forever, setup takes 10 seconds.
          </p>

          <button
            onClick={() => onAuthTrigger('signup')}
            className="bg-[#0FEE65] text-black font-hanken font-black text-sm uppercase tracking-wider px-10 py-5 rounded-full relative z-10 hover:bg-white transition-all cursor-pointer shadow-lg hover:scale-102"
          >
            Start Free Now
          </button>
        </div>
      </section>

      {/* ──────────────────────────────
          FOOTER
          ────────────────────────────── */}
      <footer className="bg-[#121212] text-white border-t border-white/[0.08] py-16 px-6 md:px-12 mt-20 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 text-left">
          
          {/* Logo Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="FinBuddy Logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-hanken font-extrabold text-lg text-white uppercase tracking-tight">FinBuddy</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed font-sans max-w-sm m-0">
              An AI-powered personal finance dashboard built exclusively for student life. Track allowances, split rent, settle bills, and budget with ease.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h5 className="font-hanken font-bold text-xs uppercase tracking-wider text-white/80 m-0">Product</h5>
            <div className="flex flex-col gap-2 text-xs text-white/40 font-medium">
              <a href="#overview" className="hover:text-[#0FEE65] transition-colors decoration-none">Overview</a>
              <a href="#budget" className="hover:text-[#0FEE65] transition-colors decoration-none">Budgeting</a>
              <a href="#split" className="hover:text-[#0FEE65] transition-colors decoration-none">Live Splits</a>
              <a href="#savings" className="hover:text-[#0FEE65] transition-colors decoration-none">Savings Goals</a>
            </div>
          </div>

          {/* Resources Links */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h5 className="font-hanken font-bold text-xs uppercase tracking-wider text-white/80 m-0">Resources</h5>
            <div className="flex flex-col gap-2 text-xs text-white/40 font-medium font-sans">
              <a href="#faq" className="hover:text-[#0FEE65] transition-colors font-sans decoration-none">FAQ Centre</a>
              <a href="#" className="hover:text-[#0FEE65] transition-colors font-sans decoration-none font-sans">Student Guides</a>
              <a href="#" className="hover:text-[#0FEE65] transition-colors font-sans decoration-none font-sans">Privacy Policy</a>
              <a href="#" className="hover:text-[#0FEE65] transition-colors font-sans decoration-none font-sans">Terms of Service</a>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 flex flex-col gap-4 font-sans">
            <h5 className="font-hanken font-bold text-xs uppercase tracking-wider text-white/80 m-0">Subscribe to Insights</h5>
            <p className="text-xs text-white/40 font-sans leading-relaxed m-0">
              Get monthly student budgeting hacks and AI recommendations.
            </p>
            <div className="flex gap-2 w-full">
              <input
                type="email"
                required
                placeholder="your.email@college.edu"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-neon-green flex-1"
              />
              <button
                onClick={() => alert("Thanks for subscribing!")}
                className="bg-[#0FEE65] text-black font-hanken font-bold text-xs uppercase px-4 py-2.5 rounded-xl hover:bg-white cursor-pointer font-sans border-none"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30 font-sans">
          <span>&copy; {new Date().getFullYear()} FinBuddy. Built for Hackathons.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors decoration-none">Twitter</a>
            <a href="#" className="hover:text-white transition-colors decoration-none">GitHub</a>
            <a href="#" className="hover:text-white transition-colors decoration-none">Discord</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
