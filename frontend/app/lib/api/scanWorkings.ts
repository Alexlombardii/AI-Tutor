export type WorkedExample = {
  worked_example: Record<`step_${number}`, string>;
};

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

export async function scanWorkings(file: Blob, meta: { practiceQuestionId: string }) {
  const fd = new FormData();
  fd.append("file", file, "workings.jpg");
  fd.append("practice_question_id", meta.practiceQuestionId);

  const res = await fetch(`${API_URL}/api/v1/scanner`, {method: "POST", body: fd,});
  if (!res.ok) throw new Error("scan failed");
  return res.json();          // { worked_example: { step_1: "...", … } }
}
