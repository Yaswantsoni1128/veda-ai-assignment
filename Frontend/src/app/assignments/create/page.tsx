"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  Calendar,
  X,
  Plus,
  Mic,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import {
  useAssignmentStore,
  QUESTION_TYPE_OPTIONS,
} from "@/store/assignmentStore";
import { api } from "@/lib/api";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    form,
    setTitle,
    setDueDate,
    setAdditionalInstructions,
    setUploadedFile,
    addQuestionTypeRow,
    removeQuestionTypeRow,
    updateQuestionTypeRow,
    getTotals,
    validateForm,
    resetForm,
  } = useAssignmentStore();

  const { totalQuestions, totalMarks } = getTotals();

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadFile(file);
      setUploadedFile(res.data.fileName, res.data.extractedText);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createAssignment({
        title: form.title,
        dueDate: form.dueDate,
        questionTypeRows: form.questionTypeRows,
        additionalInstructions: form.additionalInstructions || undefined,
        extractedText: form.extractedText || undefined,
        uploadedFileName: form.uploadedFileName || undefined,
        autoGenerate: true,
      });
      resetForm();
      router.push(`/assignments/${res.data._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <Header
        title="Create Assignment"
        subtitle="Set up a new assignment for your students."
      />

      <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-6">Assignment Details</h2>

          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 hover:border-orange-300 transition cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.text,.md"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Choose a file or drag & drop it here
            </p>
            <p className="text-xs text-gray-400 mb-4">
              PDF or text, up to 10MB (optional)
            </p>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
            >
              {uploading ? "Uploading..." : "Browse Files"}
            </button>
            {form.uploadedFileName && (
              <p className="text-xs text-green-600 mt-3">
                ✓ {form.uploadedFileName}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quiz on Electricity"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Question Types *
            </label>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">Question Type</th>
                    <th className="pb-2 pr-4">No. of Questions</th>
                    <th className="pb-2 pr-4">Marks</th>
                    <th className="pb-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {form.questionTypeRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-3 pr-4">
                        <select
                          value={row.type}
                          onChange={(e) =>
                            updateQuestionTypeRow(i, "type", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          {QUESTION_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={1}
                          value={row.count}
                          onChange={(e) =>
                            updateQuestionTypeRow(
                              i,
                              "count",
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={1}
                          value={row.marksPerQuestion}
                          onChange={(e) =>
                            updateQuestionTypeRow(
                              i,
                              "marksPerQuestion",
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                        />
                      </td>
                      <td className="py-3">
                        {form.questionTypeRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestionTypeRow(i)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {form.questionTypeRows.map((row, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
                >
                  <select
                    value={row.type}
                    onChange={(e) =>
                      updateQuestionTypeRow(i, "type", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Questions</label>
                      <input
                        type="number"
                        min={1}
                        value={row.count}
                        onChange={(e) =>
                          updateQuestionTypeRow(
                            i,
                            "count",
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-full mt-1 px-3 py-2 bg-white border rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Marks each</label>
                      <input
                        type="number"
                        min={1}
                        value={row.marksPerQuestion}
                        onChange={(e) =>
                          updateQuestionTypeRow(
                            i,
                            "marksPerQuestion",
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-full mt-1 px-3 py-2 bg-white border rounded-lg"
                      />
                    </div>
                  </div>
                  {form.questionTypeRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestionTypeRow(i)}
                      className="text-sm text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestionTypeRow}
              className="mt-4 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <Plus className="w-4 h-4" />
              Add Question Type
            </button>

            <div className="flex justify-end gap-6 mt-4 text-sm text-gray-600">
              <span>Total Questions: <strong>{totalQuestions}</strong></span>
              <span>Total Marks: <strong>{totalMarks}</strong></span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <div className="relative">
              <textarea
                value={form.additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <Mic className="absolute bottom-3 right-3 w-5 h-5 text-gray-300" />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <Link
              href="/assignments"
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full text-sm hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              {submitting ? "Generating..." : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
