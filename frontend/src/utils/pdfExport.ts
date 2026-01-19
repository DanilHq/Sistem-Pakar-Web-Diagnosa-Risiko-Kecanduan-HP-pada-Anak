import jsPDF from 'jspdf';
import type { DiagnosisResponse } from '../types';

export function exportDiagnosisToPDF(
  diagnosis: DiagnosisResponse,
  symptomsText: { code: string; text: string }[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Hasil Diagnosa Kecanduan HP pada Anak', margin, yPosition);
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, margin, yPosition);
  yPosition += 15;

  // Category Result
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Kategori Risiko:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(16);
  const categoryColor = getCategoryColor(diagnosis.category?.level || 0);
  doc.setTextColor(categoryColor.r, categoryColor.g, categoryColor.b);
  doc.text(diagnosis.category?.name || diagnosis.result_code, margin, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 10;

  // Description
  if (diagnosis.matched_description) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(diagnosis.matched_description, maxWidth);
    doc.text(descLines, margin, yPosition);
    yPosition += descLines.length * 5 + 10;
  }

  // Active Symptoms
  yPosition = checkPageBreak(doc, yPosition, 40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Gejala yang Terdeteksi:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (diagnosis.active_symptoms.length === 0) {
    doc.text('Tidak ada gejala yang terdeteksi.', margin, yPosition);
    yPosition += 10;
  } else {
    symptomsText.forEach((symptom, index) => {
      yPosition = checkPageBreak(doc, yPosition, 10);
      doc.text(`${index + 1}. ${symptom.text}`, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  // Recommendation
  yPosition = checkPageBreak(doc, yPosition, 40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Rekomendasi:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const recLines = doc.splitTextToSize(diagnosis.recommendation || 'Tidak ada rekomendasi.', maxWidth);
  recLines.forEach((line: string) => {
    yPosition = checkPageBreak(doc, yPosition, 10);
    doc.text(line, margin, yPosition);
    yPosition += 5;
  });
  yPosition += 10;

  // Trace Information
  yPosition = checkPageBreak(doc, yPosition, 40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Trace Inferensi (Forward Chaining):', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  diagnosis.trace.forEach((trace) => {
    yPosition = checkPageBreak(doc, yPosition, 15);
    const status = trace.matched ? '[TERPENUHI]' : '[TIDAK TERPENUHI]';
    doc.setFont('helvetica', 'bold');
    doc.text(`${trace.rule_code} ${status}`, margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Kondisi: ${trace.conditions.join(', ')}`, margin + 5, yPosition);
    yPosition += 7;
  });

  // Disclaimer
  yPosition = checkPageBreak(doc, yPosition, 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 0, 0);
  doc.text('DISCLAIMER:', margin, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  const disclaimerText =
    'Hasil diagnosa ini adalah skrining awal dan BUKAN pengganti diagnosis profesional. ' +
    'Untuk diagnosis yang akurat dan penanganan yang tepat, silakan konsultasi dengan ' +
    'psikolog anak, dokter anak, atau tenaga kesehatan mental profesional.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, maxWidth);
  disclaimerLines.forEach((line: string) => {
    yPosition = checkPageBreak(doc, yPosition, 10);
    doc.text(line, margin, yPosition);
    yPosition += 5;
  });

  // Save PDF
  const fileName = `Diagnosa_Kecanduan_HP_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function checkPageBreak(doc: jsPDF, yPosition: number, requiredSpace: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPosition + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return yPosition;
}

function getCategoryColor(level: number): { r: number; g: number; b: number } {
  switch (level) {
    case 0: // Normal
      return { r: 16, g: 185, b: 129 }; // green
    case 1: // Ringan
      return { r: 245, g: 158, b: 11 }; // yellow/amber
    case 2: // Sedang
      return { r: 249, g: 115, b: 22 }; // orange
    case 3: // Berat
      return { r: 220, g: 38, b: 38 }; // red
    default:
      return { r: 0, g: 0, b: 0 }; // black
  }
}
