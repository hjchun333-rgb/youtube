import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, RotateCcw, Download } from 'lucide-react';

interface ScriptResultProps {
  script: string;
  topic: string;
  onReset: () => void;
}

const ScriptResult: React.FC<ScriptResultProps> = ({ script, topic, onReset }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    alert("대본이 클립보드에 복사되었습니다!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([script], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${topic.replace(/\s+/g, '_')}_script.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">생성된 대본</h2>
          <p className="text-indigo-400 text-sm mt-1">주제: {topic}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="클립보드에 복사"
          >
            <Copy size={18} />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="마크다운 다운로드"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-700 flex-grow overflow-hidden">
        <div className="h-[600px] overflow-y-auto pr-4 script-content">
           <ReactMarkdown 
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-6 mb-4 pb-2 border-b border-slate-700" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-indigo-300 mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-200 mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-slate-300 leading-7 mb-4" {...props} />,
              strong: ({node, ...props}) => <strong className="text-white font-bold bg-indigo-900/30 px-1 rounded" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside text-slate-300 mb-4 pl-4" {...props} />,
              li: ({node, ...props}) => <li className="mb-2" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 my-4 italic text-slate-400 bg-slate-800/50 rounded-r" {...props} />,
            }}
           >
             {script}
           </ReactMarkdown>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <RotateCcw size={18} />
          다시 시작하기
        </button>
      </div>
    </div>
  );
};

export default ScriptResult;