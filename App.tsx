import React, { useState } from 'react';
import { AppStep, ScriptAnalysis } from './types';
import { analyzeTranscript, generateNewScript } from './services/geminiService';
import StepIndicator from './components/StepIndicator';
import AnalysisView from './components/AnalysisView';
import ScriptResult from './components/ScriptResult';
import { Sparkles, ArrowRight, Video, AlertCircle } from 'lucide-react';

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT_TRANSCRIPT);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [topic, setTopic] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!transcript.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setStep(AppStep.ANALYZING);

    try {
      const result = await analyzeTranscript(transcript);
      setAnalysis(result);
      setStep(AppStep.REVIEW_ANALYSIS);
    } catch (err: any) {
      setError(err.message || "대본 분석에 실패했습니다. 다시 시도해주세요.");
      setStep(AppStep.INPUT_TRANSCRIPT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneration = async () => {
    if (!topic.trim() || !analysis) return;
    
    setIsLoading(true);
    setError(null);
    setStep(AppStep.GENERATING);

    try {
      const result = await generateNewScript(analysis, topic);
      setGeneratedScript(result);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      setError(err.message || "대본 생성에 실패했습니다.");
      setStep(AppStep.INPUT_TOPIC);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.INPUT_TRANSCRIPT);
    setTranscript('');
    setAnalysis(null);
    setTopic('');
    setGeneratedScript('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-200 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ScriptAlchemist
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 animate-fade-in">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="relative">
          {/* STEP 0: INPUT */}
          {step === AppStep.INPUT_TRANSCRIPT && (
            <div className="animate-fade-in glass-panel p-8 rounded-2xl shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">대본 입력. 스타일 분석. 완벽 복제.</h2>
                <p className="text-slate-400">바이럴 영상의 대본을 붙여넣어 성공 공식을 역설계하세요.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">
                  영상 대본
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="전체 대본을 여기에 붙여넣으세요..."
                  className="w-full h-64 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                />
                
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleAnalysis}
                    disabled={!transcript.trim()}
                    className="disabled:opacity-50 disabled:cursor-not-allowed group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                  >
                    <span className="mr-2">스타일 분석하기</span>
                    <Sparkles size={18} className="transition-transform group-hover:rotate-12" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING: ANALYZING */}
          {step === AppStep.ANALYZING && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">대본 분석 중...</h3>
              <p className="text-slate-400">후킹 전략, 속도감, 감정적 트리거를 식별하고 있습니다.</p>
            </div>
          )}

          {/* STEP 2: REVIEW ANALYSIS */}
          {step === AppStep.REVIEW_ANALYSIS && analysis && (
            <AnalysisView 
              analysis={analysis} 
              onNext={() => setStep(AppStep.INPUT_TOPIC)}
              onBack={() => setStep(AppStep.INPUT_TRANSCRIPT)}
            />
          )}

          {/* STEP 3: INPUT NEW TOPIC */}
          {step === AppStep.INPUT_TOPIC && (
            <div className="animate-fade-in glass-panel p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video size={32} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">새로운 영상의 주제는 무엇인가요?</h2>
                <p className="text-slate-400">분석된 스타일을 이 새로운 주제에 적용합니다.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    새 영상 주제
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="예: 3개월 만에 코딩 배우는 법"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleGeneration()}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(AppStep.REVIEW_ANALYSIS)}
                    className="flex-1 py-3 px-4 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    분석으로 돌아가기
                  </button>
                  <button
                    onClick={handleGeneration}
                    disabled={!topic.trim()}
                    className="disabled:opacity-50 disabled:cursor-not-allowed flex-[2] group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                  >
                    <span className="mr-2">대본 생성하기</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING: GENERATING */}
          {step === AppStep.GENERATING && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <Video className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">대본 연성 중...</h3>
              <p className="text-slate-400">바이럴 공식을 '{topic}'에 적용하고 있습니다.</p>
            </div>
          )}

          {/* STEP 4: RESULT */}
          {step === AppStep.RESULT && (
            <ScriptResult 
              script={generatedScript} 
              topic={topic}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;