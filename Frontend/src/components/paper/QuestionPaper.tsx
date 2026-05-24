"use client";

import type { GeneratedPaper } from "@/lib/api";

interface QuestionPaperProps {
  paper: GeneratedPaper;
  showAnswerKey?: boolean;
}

export function QuestionPaper({ paper, showAnswerKey = true }: QuestionPaperProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 max-w-3xl mx-auto print:shadow-none print:border-0">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-xl font-bold text-gray-900">{paper.schoolName}</h2>
        <p className="text-sm text-gray-700">Subject: {paper.subject}</p>
        <p className="text-sm text-gray-700">Class: {paper.className}</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-700 mb-4 gap-2">
        <span>Time Allowed: {paper.timeAllowed}</span>
        <span>Maximum Marks: {paper.maxMarks}</span>
      </div>

      <p className="text-sm italic text-gray-600 mb-6">
        {paper.generalInstruction}
      </p>

      <div className="space-y-2 text-sm mb-8 border-b border-gray-100 pb-6">
        <p>
          Name: <span className="inline-block min-w-[200px] border-b border-gray-400" />
        </p>
        <p>
          Roll Number:{" "}
          <span className="inline-block min-w-[160px] border-b border-gray-400" />
        </p>
        <p>
          Class: {paper.className} Section:{" "}
          <span className="inline-block min-w-[120px] border-b border-gray-400" />
        </p>
      </div>

      {paper.sections.map((section) => (
        <div key={section.title} className="mb-8">
          <h3 className="text-center font-bold text-lg mb-1">{section.title}</h3>
          {section.subtitle && (
            <h4 className="font-semibold text-gray-900 mb-1">{section.subtitle}</h4>
          )}
          <p className="text-sm italic text-gray-600 mb-4">{section.instruction}</p>
          <ol className="space-y-4 list-none">
            {section.questions.map((q) => (
              <li key={q.number} className="text-sm leading-relaxed">
                <span className="font-medium">{q.number}. </span>
                <span>{q.text}</span>
                <span className="text-gray-600 ml-1">
                  [{q.marks} Mark{q.marks > 1 ? "s" : ""}]
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <p className="text-center font-bold text-gray-900 my-8">
        End of Question Paper
      </p>

      {showAnswerKey && paper.answerKey?.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-bold text-lg mb-4">Answer Key:</h3>
          <ol className="space-y-3 list-none">
            {paper.answerKey.map((item) => (
              <li key={item.number} className="text-sm leading-relaxed">
                <span className="font-medium">{item.number}. </span>
                {item.answer}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
