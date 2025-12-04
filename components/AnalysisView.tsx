import React from 'react';
import { ScriptAnalysis } from '../types';
import { Zap, Target, Layers, Activity, Fingerprint } from 'lucide-react';

interface AnalysisViewProps {
  analysis: ScriptAnalysis;
  onNext: () => void;
  onBack: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onNext, onBack }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">스타일 분석 완료</h2>
        <p className="text-slate-400">제공해주신 대본의 DNA 분석 결과입니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hook Strategy */}
        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-pink-500">
          <div className="flex items-center gap-3 mb-3 text-pink-400">
            <Zap size={20} />
            <h3 className="font-semibold text-lg">후킹 전략</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">{analysis.hookStrategy}</p>
        </div>

        {/* Tone */}
        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-3 mb-3 text-cyan-400">
            <Fingerprint size={20} />
            <h3 className="font-semibold text-lg">톤앤매너</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">{analysis.tone}</p>
        </div>

        {/* Pacing */}
        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3 mb-3 text-amber-400">
            <Activity size={20} />
            <h3 className="font-semibold text-lg">속도감(Pacing)</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">{analysis.pacing}</p>
        </div>

        {/* Audience */}
        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3 mb-3 text-emerald-400">
            <Target size={20} />
            <h3 className="font-semibold text-lg">타겟 시청자</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">{analysis.targetAudience}</p>
        </div>
      </div>

      {/* Structure */}
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6 text-indigo-400">
          <Layers size={20} />
          <h3 className="font-semibold text-lg">내러티브 구조</h3>
        </div>
        <div className="space-y-4">
          {analysis.structure.map((section, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-700">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-medium text-slate-200">{section.sectionName}</h4>
                <p className="text-sm text-slate-400 mt-1">{section.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <button 
          onClick={onBack}
          className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
        >
          뒤로
        </button>
        <button 
          onClick={onNext}
          className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-8 font-medium text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
        >
          <span className="mr-2">이 스타일 복제하기</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;