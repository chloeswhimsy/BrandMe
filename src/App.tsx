/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search,
  Upload,
  FileText,
  Linkedin,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Lightbulb,
  UserCheck,
  Award,
  Shield,
  Zap,
  Quote,
  Layout
} from 'lucide-react';
import { UserProfile, PersonalBrandResult, InspirationSnippet, InspirationData, BrandStyleContent } from './types';
import { generateInspiration, generateFinalBrand } from './services/gemini';
import { cn } from './lib/utils';
import { WordCloud } from './components/WordCloud';

const QUESTIONNAIRE = [
  { id: 'q1', question: "How do you typically approach a complex problem?", options: ["Analytical & Data-driven", "Intuitive & Creative", "Collaborative & People-focused", "Action-oriented & Fast"] },
  { id: 'q2', question: "What environment do you thrive in most?", options: ["Structured & Predictable", "Dynamic & Ever-changing", "Mission-driven & Impactful", "Competitive & High-performance"] },
  { id: 'q3', question: "What is your primary motivation at work?", options: ["Mastery of skills", "Autonomy and freedom", "Purpose and contribution", "Recognition and leadership"] },
];

const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Education", "Creative Arts", "Manufacturing", "Retail", "Non-profit"];
const FUNCTIONS = ["Engineering", "Marketing", "Sales", "Design", "Management", "Operations", "Human Resources", "Legal"];

export default function App() {
  const [showHome, setShowHome] = useState(true);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonalBrandResult | null>(null);
  const [inspiration, setInspiration] = useState<InspirationData | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<BrandStyleContent | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    questionnaireAnswers: {},
    uploadedDocs: {},
    jobFunction: '',
    industry: '',
    resumeText: '',
    linkedinUrl: '',
    personalNuance: '',
  });

  const handleFileUpload = (type: keyof UserProfile['uploadedDocs'], fileName: string) => {
    setProfile(prev => ({
      ...prev,
      uploadedDocs: { ...prev.uploadedDocs, [type]: fileName }
    }));
  };

  const handleInspirationFetch = async () => {
    if (!profile.jobFunction || !profile.industry) return;
    setLoading(true);
    try {
      const data = await generateInspiration(profile.jobFunction, profile.industry);
      setInspiration(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const brand = await generateFinalBrand(profile);
      setResult(brand);
    } catch (error) {
      alert("Failed to generate brand. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return Object.keys(profile.questionnaireAnswers).length === QUESTIONNAIRE.length;
      case 1: return profile.jobFunction && profile.industry;
      case 2: return profile.resumeText || profile.linkedinUrl;
      default: return true;
    }
  };

  if (showHome) {
    return <HomeView onStart={() => setShowHome(false)} />;
  }

  if (result && selectedStyle) {
    return (
      <BrandResultView 
        result={selectedStyle} 
        onReset={() => { setResult(null); setSelectedStyle(null); setStep(0); setShowHome(true); }} 
        onBackToStyles={() => setSelectedStyle(null)}
      />
    );
  }

  if (result && !selectedStyle) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <header className="text-center space-y-4 floating">
            <h1 className="text-5xl font-bold tracking-tight font-display">Choose Your Brand Voice</h1>
            <p className="text-lg opacity-70">Select the dream that best represents your professional soul.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {result.styles.map((style, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                onClick={() => setSelectedStyle(style)}
                className="surreal-card text-left flex flex-col h-full group hover:bg-white/40"
              >
                <div className="w-14 h-14 rounded-2xl bg-pastel-lavender flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layout className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-display">{style.styleName}</h3>
                <p className="opacity-60 italic mb-8 flex-grow leading-relaxed">"{style.exampleSnippet}"</p>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest group-hover:gap-4 transition-all">
                  Embrace Style <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>
          
          <div className="flex justify-center pt-12">
            <button 
              onClick={() => setResult(null)}
              className="surreal-button-secondary"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Architect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-white/20 z-50">
        <motion.div 
          className="h-full bg-surreal-ink"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / 5) * 100}%` }}
        />
      </div>

      <main className="max-w-4xl mx-auto pt-24 pb-32 px-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <header className="space-y-6 floating">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-pastel-lavender border border-white/40 text-xl font-bold uppercase tracking-wider">
                  <BrainCircuit className="w-6 h-6" /> Step 1: Inner Landscape
                </div>
                <p className="text-2xl opacity-70">Let's map the constellations of your professional DNA.</p>
              </header>

              <div className="space-y-10">
                {QUESTIONNAIRE.map((q) => (
                  <div key={q.id} className="space-y-6">
                    <h3 className="text-2xl font-semibold font-display">{q.question}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setProfile(p => ({ ...p, questionnaireAnswers: { ...p.questionnaireAnswers, [q.id]: opt } }))}
                          className={cn(
                            "p-6 rounded-[2rem] text-left transition-all duration-300",
                            profile.questionnaireAnswers[q.id] === opt 
                              ? "bg-surreal-ink text-white shadow-2xl scale-[1.02]" 
                              : "surreal-glass hover:bg-white/40"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-10 border-t border-white/20">
                  <h3 className="text-2xl font-display font-bold mb-8">Upload Artifacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['values', 'strength', 'leadership'] as const).map((type) => (
                      <div key={type} className="relative group">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(type, e.target.files[0].name)}
                        />
                        <div className={cn(
                          "surreal-card flex flex-col items-center gap-4 text-center",
                          profile.uploadedDocs[type] ? "bg-pastel-mint/40 border-pastel-mint" : "group-hover:bg-white/40"
                        )}>
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            profile.uploadedDocs[type] ? "bg-surreal-ink text-white" : "bg-white/40"
                          )}>
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-bold capitalize tracking-widest">{type}</span>
                          {profile.uploadedDocs[type] && <span className="text-[10px] opacity-60 truncate w-full">{profile.uploadedDocs[type]}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <header className="space-y-6 floating">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-pastel-peach border border-white/40 text-xl font-bold uppercase tracking-wider">
                  <Lightbulb className="w-6 h-6" /> Step 2: Collective Dreams
                </div>
                <h1 className="text-6xl font-bold tracking-tight font-display">Learn from Peers</h1>
                <p className="text-2xl opacity-70">Observe the echoes of success in your industry.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-4">Industry Realm</label>
                  <select 
                    value={profile.industry}
                    onChange={(e) => setProfile(p => ({ ...p, industry: e.target.value }))}
                    className="w-full p-5 rounded-[2rem] surreal-glass focus:outline-none focus:ring-2 focus:ring-pastel-lavender appearance-none"
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-4">Role Essence</label>
                  <select 
                    value={profile.jobFunction}
                    onChange={(e) => setProfile(p => ({ ...p, jobFunction: e.target.value }))}
                    className="w-full p-5 rounded-[2rem] surreal-glass focus:outline-none focus:ring-2 focus:ring-pastel-lavender appearance-none"
                  >
                    <option value="">Select Function</option>
                    {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleInspirationFetch}
                disabled={loading || !profile.industry || !profile.jobFunction}
                className="surreal-button-primary w-full justify-center py-5 text-lg"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                Summon Inspiration
              </button>

              {inspiration && (
                <div className="space-y-16 pt-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 text-center">Industry Bubble Cloud</h3>
                    <WordCloud words={inspiration.keywords} />
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 text-center">LinkedIn Echoes</h3>
                    <div className="grid gap-6">
                      {inspiration.snippets.map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="surreal-card space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pastel-blue flex items-center justify-center">
                              <Quote className="w-5 h-5 opacity-40" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">{item.name} • {item.role}</span>
                          </div>
                          <p className="text-xl italic opacity-80 leading-relaxed">"{item.summarySentence}"</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <header className="space-y-6 floating">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-pastel-mint border border-white/40 text-xl font-bold uppercase tracking-wider">
                  <UserCheck className="w-6 h-6" /> Step 3: Earthly Proof
                </div>
                <h1 className="text-6xl font-bold tracking-tight font-display">Professional Proof</h1>
                <p className="text-2xl opacity-70">Anchor your brand in the reality of your achievements.</p>
              </header>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Resume Content
                  </label>
                  <textarea 
                    value={profile.resumeText}
                    onChange={(e) => setProfile(p => ({ ...p, resumeText: e.target.value }))}
                    placeholder="Paste your professional history here..."
                    rows={10}
                    className="w-full p-8 rounded-[3rem] surreal-glass focus:outline-none focus:ring-2 focus:ring-pastel-lavender resize-none text-lg"
                  />
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-pastel-peach px-6 py-2 rounded-full border border-white/40 font-bold">Or</span></div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-4 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" /> LinkedIn Portal
                  </label>
                  <input 
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile(p => ({ ...p, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full p-6 rounded-[2rem] surreal-glass focus:outline-none focus:ring-2 focus:ring-pastel-lavender text-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <header className="space-y-6 floating">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-pastel-lavender border border-white/40 text-xl font-bold uppercase tracking-wider">
                  <Zap className="w-6 h-6" /> Step 4: Personal Nuance
                </div>
                <h1 className="text-6xl font-bold tracking-tight font-display">The Human Element</h1>
                <p className="text-2xl opacity-70">Share the fun facts, identity labels, or quirks that make you human.</p>
              </header>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-4 flex items-center gap-2">
                    <Quote className="w-4 h-4" /> Random Facts & Identity
                  </label>
                  <textarea 
                    value={profile.personalNuance}
                    onChange={(e) => setProfile(p => ({ ...p, personalNuance: e.target.value }))}
                    placeholder="E.g., I'm a marathon runner, a sci-fi enthusiast, or a first-generation immigrant..."
                    rows={8}
                    className="w-full p-8 rounded-[3rem] surreal-glass focus:outline-none focus:ring-2 focus:ring-pastel-peach resize-none text-lg"
                  />
                  <p className="text-sm opacity-50 italic ml-4">This helps us weave more personality into your brand voice.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-12 text-center py-20">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-pastel-lavender border border-white/40 text-xl font-bold uppercase tracking-wider floating mx-auto">
                <Sparkles className="w-6 h-6" /> Step 5: Manifestation
              </div>
              <div className="w-32 h-32 bg-surreal-ink rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl floating">
                <Award className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-7xl font-bold tracking-tight font-display">Ready to Architect?</h1>
              <p className="text-2xl opacity-70 max-w-lg mx-auto leading-relaxed">The stars have aligned. We are ready to manifest your unique professional identity.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step <= 4 && (
          <div className="fixed bottom-12 left-0 right-0 px-6 z-50">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <button 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className={cn(
                  "surreal-button-secondary",
                  step === 0 ? "opacity-20 cursor-not-allowed" : ""
                )}
              >
                <ChevronLeft className="w-5 h-5" /> Retreat
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={() => setStep(s => s + 1)}
                  disabled={!isStepValid()}
                  className="surreal-button-primary"
                >
                  Advance <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="surreal-button-primary"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Award className="w-6 h-6" />}
                  Manifest Brand
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function BrandResultView({ result, onReset, onBackToStyles }: { result: BrandStyleContent, onReset: () => void, onBackToStyles: () => void }) {
  return (
    <div className="min-h-screen selection:bg-pastel-lavender selection:text-surreal-ink">
      <header className="fixed top-0 left-0 right-0 z-50 surreal-glass">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-surreal-ink rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold tracking-tight text-2xl font-display">BrandMe</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onBackToStyles} className="surreal-button-secondary py-2.5 text-sm">
              <ChevronLeft className="w-4 h-4" /> Back to Styles
            </button>
            <button onClick={onReset} className="surreal-button-secondary py-2.5 text-sm">
              Start Over
            </button>
          </div>
        </div>
      </header>
      <main className="pt-32 pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-20">
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
            {/* Style Badge */}
            <div className="flex justify-center floating">
              <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/40 border border-white/60 text-sm font-bold uppercase tracking-[0.3em] shadow-lg">
                <Shield className="w-5 h-5" /> {result.styleName} Manifestation
              </div>
            </div>

            {/* Core Identity Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="surreal-card space-y-6 bg-pastel-lavender/30">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Top 5 Strengths</h3>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg font-medium">
                      <div className="w-2 h-2 rounded-full bg-surreal-ink/20" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surreal-card space-y-6 bg-pastel-mint/30">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Top 5 Values</h3>
                <ul className="space-y-3">
                  {result.values.map((v, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg font-medium">
                      <div className="w-2 h-2 rounded-full bg-surreal-ink/20" /> {v}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surreal-card space-y-6 bg-pastel-blue/30">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">5 Key Words</h3>
                <div className="flex flex-wrap gap-3">
                  {result.keywords.map((k, i) => (
                    <span key={i} className="px-5 py-2.5 rounded-full bg-white/60 border border-white text-sm font-bold shadow-sm">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Distinction */}
            <div className="space-y-8 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 text-xs font-bold uppercase tracking-widest opacity-60">
                <Award className="w-4 h-4" /> The Distinction
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-display">
                What distinguishes you from your peers?
              </h2>
              <p className="text-2xl md:text-3xl opacity-70 font-light leading-relaxed italic">
                {result.distinction}
              </p>
            </div>

            {/* One Sentence */}
            <div className="space-y-8 text-center py-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 text-xs font-bold uppercase tracking-widest opacity-60">
                <Zap className="w-4 h-4" /> Brand Essence
              </div>
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none font-display italic text-surreal-ink">
                "{result.oneSentenceSummary}"
              </h2>
            </div>

            {/* LinkedIn Summary */}
            <div className="space-y-10">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 text-xs font-bold uppercase tracking-widest opacity-60">
                  <Linkedin className="w-4 h-4" /> LinkedIn Summary
                </div>
              </div>
              <div className="surreal-card p-12 md:p-20 relative overflow-hidden group bg-white/40">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-pastel-lavender/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pastel-peach/40 rounded-full blur-3xl" />
                <p className="text-2xl md:text-3xl opacity-80 font-light leading-relaxed whitespace-pre-wrap relative z-10 font-display">
                  {result.longSummary}
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

function HomeView({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-center text-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl space-y-12"
      >
        <div className="w-24 h-24 bg-surreal-ink rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl floating">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight font-display text-surreal-ink">
            Architect Your <br />
            <span className="italic">Professional Soul</span>
          </h1>
          <p className="text-2xl opacity-70 max-w-2xl mx-auto leading-relaxed">
            Welcome to the Brand Architect. Before we manifest your unique identity, let's prepare the foundations of your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="surreal-card space-y-4 bg-pastel-lavender/30">
            <h3 className="text-xl font-bold font-display flex items-center gap-2">
              <FileText className="w-5 h-5" /> Essential Artifacts
            </h3>
            <p className="opacity-70">Please have your <strong>Resume</strong> text or <strong>LinkedIn URL</strong> ready. These are the anchors of your professional reality.</p>
          </div>

          <div className="surreal-card space-y-4 bg-pastel-mint/30">
            <h3 className="text-xl font-bold font-display flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" /> Recommended Insights
            </h3>
            <p className="opacity-70 text-sm">For a deeper manifestation, we suggest completing these surveys first:</p>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <a href="https://www.viacharacter.org/Account/Register" target="_blank" rel="noopener noreferrer" className="underline hover:text-surreal-ink transition-colors">
                  VIA Character Strengths
                </a>
              </li>
              <li>
                <a href="https://www.thegoodproject.org/value-sort" target="_blank" rel="noopener noreferrer" className="underline hover:text-surreal-ink transition-colors">
                  Value Sort Survey
                </a>
              </li>
              <li>
                <a href="https://www.keirsey.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-surreal-ink transition-colors">
                  Keirsey Temperament (MBTI)
                </a>
              </li>
            </ul>
            <p className="text-[10px] italic opacity-50 mt-2">Keep a screenshot or PDF of your results—you'll upload them in Step 1.</p>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="surreal-button-primary px-16 py-8 text-2xl mx-auto mt-12"
        >
          Begin Manifestation <ChevronRight className="w-8 h-8" />
        </button>
      </motion.div>
    </div>
  );
}
