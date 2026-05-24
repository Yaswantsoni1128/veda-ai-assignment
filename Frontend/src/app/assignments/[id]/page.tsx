"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { QuestionPaper } from "@/components/paper/QuestionPaper";
import { api, type Assignment } from "@/lib/api";
import { useAssignmentSocket } from "@/hooks/useAssignmentSocket";

export default function AssignmentOutputPage() {
  const params = useParams();
  const id = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const loadAssignment = useCallback(async () => {
    try {
      const res = await api.getAssignment(id);
      setAssignment(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  useAssignmentSocket(id, (payload) => {
    setProgress(payload.progress ?? 0);
    if (payload.message) setStatusMessage(payload.message);
    if (payload.status) {
      setAssignment((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status,
              generatedPaper: payload.generatedPaper ?? prev.generatedPaper,
              errorMessage: payload.error,
            }
          : prev
      );
    }
    if (payload.status === "completed" || payload.status === "failed") {
      loadAssignment();
      setRegenerating(false);
    }
  });

  const handleRegenerate = async () => {
    setRegenerating(true);
    setStatusMessage("Regenerating question paper...");
    await api.regenerate(id);
  };

  const isProcessing =
    assignment?.status === "pending" ||
    assignment?.status === "processing" ||
    regenerating;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Assignment not found</p>
          <Link href="/assignments" className="text-orange-600 text-sm mt-2 inline-block">
            Back to assignments
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Question Paper" backHref="/assignments" />

      <main className="flex-1 p-4 lg:p-8">
        {isProcessing && (
          <div className="max-w-3xl mx-auto mb-6 bg-gray-800 text-white rounded-2xl px-6 py-4 flex items-center gap-4">
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <div className="flex-1">
              <p className="text-sm">
                {statusMessage ||
                  "Generating your customized question paper with AI..."}
              </p>
              <div className="mt-2 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${progress || 15}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {assignment.status === "failed" && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {assignment.errorMessage || "Generation failed. Try regenerating."}
          </div>
        )}

        {assignment.generatedPaper && (
          <>
            <div className="max-w-3xl mx-auto mb-4 flex flex-wrap gap-3 justify-between items-center">
              <div className="bg-gray-800 text-white rounded-2xl px-5 py-3 text-sm flex-1 min-w-[200px]">
                Certainly! Here is your customized question paper for{" "}
                <strong>{assignment.title}</strong>.
              </div>
              <div className="flex gap-2">
                <a
                  href={api.pdfUrl(id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download as PDF
                </a>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`}
                  />
                  Regenerate
                </button>
              </div>
            </div>

            <QuestionPaper paper={assignment.generatedPaper} />
          </>
        )}

        {!assignment.generatedPaper && !isProcessing && (
          <div className="text-center py-16 text-gray-500">
            <p>No paper generated yet.</p>
            <button
              type="button"
              onClick={handleRegenerate}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-full text-sm"
            >
              Generate Now
            </button>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
