import { saveAs } from "file-saver";
import { db } from "@/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export function exportUseCaseSummary(useCase) {
  const lines = [
    `📌 Use Case: ${useCase.title}`,
    `Category: ${useCase.category}`,
    `Type: ${useCase.type}`,
    `Rank: ${useCase.rank}`,
    `Priority: ${useCase.priority}`,
    `Estimated ROI: ${useCase.roiRange}`,
    `Time to ROI: ${useCase.timeToRoi}`,
    ``,
    `🔍 Summary:\n${useCase.summary || useCase.description || "N/A"}`,
    ``,
    `📈 Strategic Alignment Score: ${useCase.alignmentScore}`,
    `Narrative:\n${useCase.alignmentNarrative || "Not provided"}`,
    ``,
    `💰 ROI Narrative:\n${useCase.roiNarrative || "Not provided"}`,
    ``,
    `🧠 Measures:`,
    ...(useCase.measures || []).map(
      (m) => `- ${m.label}: ${m.score} – ${m.rationale || "No rationale"}`
    ),
    ``,
    `🛠️ Implementation:`,
    `- Technical Readiness: ${useCase.technicalReadiness}`,
    `- Integration Complexity: ${useCase.integrationComplexity}`,
    `- Compliance: ${useCase.compliance}`,
    `- Resources: ${useCase.resources}`,
    ``,
    `📘 Linked Playbook Sections:`,
    ...(useCase.playbookSections || []).map((s) => `- ${s}`),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${useCase.title.replace(/\s+/g, "_")}_summary.txt`);
}

export async function sendToPlaybook(useCase) {
  const docId = `${useCase.use_case_id}_${useCase.client_id || "default"}`;

  const payload = {
    ...useCase,
    sentAt: Timestamp.now(),
  };

  try {
    await setDoc(doc(db, "playbookDrafts", docId), payload);
    console.log("✅ Playbook draft saved:", docId);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to save playbook draft:", error);
    return { success: false, error };
  }
}
