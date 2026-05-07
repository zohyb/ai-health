import jsPDF from 'jspdf';

export const generatePDFReport = (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(128, 0, 0); // Maroon
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('AI Health Diagnosis Report', 20, 25);
  
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(data.timestamp).toLocaleString()}`, pageWidth - 70, 25);

  // User Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Symptoms:', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  const splitSymptoms = doc.splitTextToSize(data.symptoms, pageWidth - 40);
  doc.text(splitSymptoms, 20, 65);

  let currentY = 65 + (splitSymptoms.length * 7);

  // Analysis Result
  doc.setFont('helvetica', 'bold');
  doc.text('Diagnosis Prediction:', 20, currentY + 10);
  
  doc.setFont('helvetica', 'normal');
  data.predictions.forEach((pred, index) => {
    doc.text(`${pred.disease} - ${pred.confidence}% Confidence`, 25, currentY + 20 + (index * 7));
  });

  currentY = currentY + 20 + (data.predictions.length * 7);

  // Risk Level
  doc.setFont('helvetica', 'bold');
  doc.text(`Risk Level: ${data.riskLevel}`, 20, currentY + 10);

  // Reasoning
  doc.text('AI Reasoning:', 20, currentY + 20);
  doc.setFont('helvetica', 'normal');
  const splitReasoning = doc.splitTextToSize(data.reasoning, pageWidth - 40);
  doc.text(splitReasoning, 20, currentY + 30);

  currentY = currentY + 30 + (splitReasoning.length * 7);

  // Recommendation
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendation:', 20, currentY + 10);
  doc.setFont('helvetica', 'normal');
  const splitRec = doc.splitTextToSize(data.recommendation, pageWidth - 40);
  doc.text(splitRec, 20, currentY + 20);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Disclaimer: This is an AI-generated report for educational purposes and not a professional medical diagnosis.', 20, doc.internal.pageSize.getHeight() - 10);

  doc.save(`Health_Report_${new Date().getTime()}.pdf`);
};
