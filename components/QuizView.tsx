import React, { useState, useEffect } from 'react';
import { Subject, Grade, Question, QuestionType } from '../types';
import { generateDailyQuestions, gradeQuizSubmission } from '../services/geminiService';
import { Loader2, CheckCircle2, XCircle, ChevronRight, Send } from 'lucide-react';

interface Props {
  subject: Subject;
  grade: Grade;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

type ViewState = 'GENERATING' | 'ANSWERING' | 'GRADING' | 'RESULT';

export const QuizView: React.FC<Props> = ({ subject, grade, onComplete, onCancel }) => {
  const [viewState, setViewState] = useState<ViewState>('GENERATING');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [gradingResult, setGradingResult] = useState<{ score: number; feedback: string; corrections: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate questions on mount
  useEffect(() => {
    const init = async () => {
      try {
        const qs = await generateDailyQuestions(subject, grade);
        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(''));
        setViewState('ANSWERING');
      } catch (e: any) {
        setError(e.message);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (answers.some(a => a.trim() === '')) {
      if (!window.confirm("还有题目没做完哦，确定要提交吗？")) return;
    }

    setViewState('GRADING');
    try {
      const result = await gradeQuizSubmission(questions, answers, subject);
      setGradingResult(result);
      setViewState('RESULT');
    } catch (e) {
      setError("评分失败，请重试。");
      setViewState('ANSWERING');
    }
  };

  const handleFinish = () => {
    if (gradingResult) {
      onComplete(gradingResult.score);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <div className="text-red-500 mb-4 text-xl font-bold">哎呀！出错了</div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={onCancel} className="bg-gray-200 px-6 py-2 rounded-lg font-bold">返回</button>
      </div>
    );
  }

  if (viewState === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">AI老师正在出题...</h2>
        <p className="text-gray-500">为 {grade} {subject} 准备练习中</p>
      </div>
    );
  }

  if (viewState === 'GRADING') {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">AI老师正在批改...</h2>
        <p className="text-gray-500">稍等一下，马上出成绩！</p>
      </div>
    );
  }

  if (viewState === 'RESULT' && gradingResult) {
    return (
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-6 rounded-full shadow-lg mb-4 border-4 border-yellow-300">
             <span className="text-5xl font-black text-purple-600">{gradingResult.score}</span>
             <span className="text-xl text-gray-400 font-bold">/10</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {gradingResult.score === 10 ? '太棒了！满分！🎉' : gradingResult.score >= 8 ? '很不错！继续加油！👏' : '别灰心，下次会更好！💪'}
          </h2>
          <p className="text-gray-600 bg-blue-50 p-4 rounded-xl inline-block max-w-full">
            "{gradingResult.feedback}"
          </p>
        </div>

        <div className="space-y-4 mb-8">
            <h3 className="font-bold text-gray-700 text-lg">错题解析</h3>
            {gradingResult.corrections.length === 0 && (
                <div className="text-center text-green-600 py-4 bg-green-50 rounded-lg">全对啦！没有错题。</div>
            )}
            {gradingResult.corrections.map((c, idx) => {
                if (c.isCorrect) return null;
                const question = questions.find(q => q.id === c.questionId);
                return (
                    <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-xl">
                        <div className="font-medium text-gray-800 mb-2">
                           <span className="bg-red-200 text-red-800 px-2 rounded text-xs mr-2">题 {idx + 1}</span>
                           {question?.content}
                        </div>
                        <div className="text-sm text-red-600 mb-1">你的答案: {answers[idx]}</div>
                        <div className="text-sm text-green-700 font-bold mb-2">正确答案: {question?.correctAnswer}</div>
                        <div className="text-sm text-gray-600 bg-white p-2 rounded border border-red-100">
                            💡 {c.explanation}
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center">
          <button 
            onClick={handleFinish}
            className="w-full max-w-md bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            完成打卡 (+{gradingResult.score} 积分) <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#f3f4f6] pt-2 pb-4 z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{subject}练习</h2>
          <p className="text-sm text-gray-500">{grade} · 每日10题</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">放弃</button>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0">
                {idx + 1}
              </span>
              <p className="text-lg font-medium text-gray-800 pt-1 leading-relaxed">{q.content}</p>
            </div>

            {q.type === QuestionType.MULTIPLE_CHOICE && q.options ? (
              <div className="grid gap-3 pl-11">
                {q.options.map((opt, oIdx) => {
                   // Heuristic to extract option letter if present, mostly trusting AI format
                   const isSelected = answers[idx] === opt;
                   return (
                    <button
                        key={oIdx}
                        onClick={() => handleAnswerChange(idx, opt)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected 
                            ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-md' 
                            : 'border-gray-100 hover:border-blue-200 text-gray-600'
                        }`}
                    >
                        {opt}
                    </button>
                   );
                })}
              </div>
            ) : (
              <div className="pl-11">
                <textarea
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="在这里输入你的答案..."
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none h-24 text-lg"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t flex justify-center z-20">
        <button 
          onClick={handleSubmit}
          className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          交卷 <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};