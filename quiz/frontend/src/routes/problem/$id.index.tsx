import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { getProblem, gradeAnswer } from "../../api/client";
import { ProblemDetail } from "../../components/ProblemDetail";
import { AnswerForm } from "../../components/AnswerForm";
import type { Problem } from "../../types";

export function ProblemPage() {
  const { id } = useParams({ from: "/problem/$id" });
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getProblem(Number(id))
      .then(setProblem)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (answer: string) => {
    setGrading(true);
    setError("");
    try {
      const res = await gradeAnswer(Number(id), answer);
      // Store result in sessionStorage and navigate to result page
      sessionStorage.setItem(
        `grade-result-${id}`,
        JSON.stringify(res.result),
      );
      navigate({ to: "/problem/$id/result", params: { id } });
    } catch (err) {
      setError(`Grading failed: ${err}`);
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-fg-muted py-12">Loading...</div>;
  }

  if (error && !problem) {
    return <div className="text-center text-tn-red py-12">{error}</div>;
  }

  if (!problem) {
    return (
      <div className="text-center text-fg-muted py-12">Problem not found.</div>
    );
  }

  return (
    <div className="space-y-8">
      <ProblemDetail problem={problem} />
      <hr className="border-bg-highlight" />
      <AnswerForm onSubmit={handleSubmit} loading={grading} />
      {error && <div className="text-tn-red text-sm">{error}</div>}
    </div>
  );
}
