import PDFDocument from "pdfkit";
import type { GeneratedPaper } from "../types/paper.types.js";

const difficultyLabel: Record<string, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

export function generatePaperPdf(paper: GeneratedPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text(paper.schoolName, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Subject: ${paper.subject}`, { align: "center" });
    doc.text(`Class: ${paper.className}`, { align: "center" });
    doc.moveDown();

    doc
      .fontSize(10)
      .text(`Time Allowed: ${paper.timeAllowed}`, { continued: true })
      .text(`Maximum Marks: ${paper.maxMarks}`, { align: "right" });
    doc.moveDown();
    doc.font("Helvetica-Oblique").text(paper.generalInstruction);
    doc.font("Helvetica");
    doc.moveDown();

    doc.text("Name: _________________________");
    doc.text("Roll Number: _________________________");
    doc.text(`Class: ${paper.className} Section: _________________________`);
    doc.moveDown();

    for (const section of paper.sections) {
      doc.moveDown();
      doc.fontSize(13).text(section.title, { align: "center" });
      if (section.subtitle) {
        doc.fontSize(11).text(section.subtitle);
      }
      doc.font("Helvetica-Oblique").fontSize(10).text(section.instruction);
      doc.font("Helvetica").moveDown(0.5);

      for (const q of section.questions) {
        const tag = difficultyLabel[q.difficulty] || q.difficulty;
        doc
          .fontSize(10)
          .text(
            `${q.number}. [${tag}] ${q.text} [${q.marks} Mark${q.marks > 1 ? "s" : ""}]`
          );
        doc.moveDown(0.3);
      }
    }

    doc.moveDown();
    doc.fontSize(11).text("End of Question Paper", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("Answer Key:", { underline: true });
    doc.moveDown(0.5);

    for (const item of paper.answerKey) {
      doc.fontSize(10).text(`${item.number}. ${item.answer}`);
      doc.moveDown(0.3);
    }

    doc.end();
  });
}
