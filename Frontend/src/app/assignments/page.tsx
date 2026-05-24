"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  FileSearch,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { api, type Assignment } from "@/lib/api";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    api
      .listAssignments()
      .then((res) => setAssignments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    await api.deleteAssignment(id);
    setAssignments((prev) => prev.filter((a) => a._id !== id));
    setMenuOpen(null);
  };

  return (
    <DashboardLayout>
      <Header
        title="Assignment"
        subtitle="Manage and create assignments for your classes."
      />

      <main className="flex-1 p-4 lg:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 && !search ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
              <p className="text-gray-500 text-sm mt-1">
                Manage and create assignments for your classes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filter By
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((a) => (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900 pr-8">{a.title}</h3>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpen(menuOpen === a._id ? null : a._id)
                        }
                        className="p-1 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {menuOpen === a._id && (
                        <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                          <button
                            type="button"
                            onClick={() => router.push(`/assignments/${a._id}`)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            View Assignment
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(a._id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Assigned on: {formatDate(a.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {formatDate(a.dueDate)}
                  </p>
                  <span
                    className={`inline-block mt-3 text-xs px-2 py-1 rounded-full ${
                      a.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : a.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <Link
                href="/assignments/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                Create Assignment
              </Link>
            </div>
          </>
        )}
      </main>

      <Link
        href="/assignments/create"
        className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg"
        aria-label="Create assignment"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </DashboardLayout>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
      <div className="w-32 h-32 mb-6 flex items-center justify-center rounded-full bg-gray-100">
        <FileSearch className="w-16 h-16 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-3">
        No assignments yet
      </h2>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link
        href="/assignments/create"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800"
      >
        <Plus className="w-4 h-4" />
        Create Your First Assignment
      </Link>
    </div>
  );
}
