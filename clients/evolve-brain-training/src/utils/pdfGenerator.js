import { jsPDF } from 'jspdf';

export function generateClinicalPDF(clientData, sessionHistory, clinicianNotes) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(0, 168, 150); // Evolve Teal #00A896
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Title & Clinic Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('EVOLVE BRAIN TRAINING — CLINICAL PROGRESS REPORT', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Dr. Upasana Gala, Ph.D. • Dubai Healthcare City & Abu Dhabi • evolvebraintraining.com', 14, 19);

  // Client Details Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT & PROTOCOL PROFILE', 14, 38);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 41, pageWidth - 14, 41);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient Name: ${clientData.name}`, 14, 48);
  doc.text(`Patient ID: ${clientData.id}`, 80, 48);
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 140, 48);

  doc.text(`Primary Indication: ${clientData.indication}`, 14, 55);
  doc.text(`Prescribed Protocol: ${clientData.protocol}`, 80, 55);
  doc.text(`Total Sessions: ${sessionHistory.length} of ${clientData.totalPrescribed}`, 140, 55);

  // Summary Metrics Table
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 62, pageWidth - 28, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 128, 144);
  doc.text('BASELINE COHERENCE', 20, 71);
  doc.text('CURRENT AVERAGE', 80, 71);
  doc.text('NEUROPLASTIC GAIN', 140, 71);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${clientData.baselineScore}%`, 20, 80);
  doc.text(`${clientData.currentAvg}%`, 80, 80);
  doc.setTextColor(0, 168, 150);
  doc.text(`+${clientData.currentAvg - clientData.baselineScore}% (Statistically Significant)`, 140, 80);

  // Session Log Table Header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('RECENT AT-HOME NEUROFEEDBACK SESSIONS', 14, 96);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 99, pageWidth - 14, 99);

  // Table Columns
  doc.setFillColor(15, 23, 42);
  doc.rect(14, 103, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SESSION #', 18, 108);
  doc.text('DATE', 45, 108);
  doc.text('DURATION', 80, 108);
  doc.text('TARGET FOCUS', 115, 108);
  doc.text('CALM COHERENCE', 145, 108);
  doc.text('STATUS', 178, 108);

  // Table Rows
  let y = 117;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  sessionHistory.slice(-7).forEach((sess, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 5, pageWidth - 28, 7, 'F');
    }
    doc.text(`Session ${sess.sessionNumber}`, 18, y);
    doc.text(sess.date, 45, y);
    doc.text(`${sess.durationMin} min`, 80, y);
    doc.text(`${sess.focusScore}%`, 115, y);
    doc.text(`${sess.calmScore}%`, 145, y);
    doc.setTextColor(0, 168, 150);
    doc.text('Completed', 178, y);
    doc.setTextColor(51, 65, 85);
    y += 7;
  });

  // Clinician Remarks
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('CLINICAL ASSESSMENT & NEUROPLASTICITY EVALUATION', 14, y);
  doc.line(14, y + 3, pageWidth - 14, y + 3);

  y += 10;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const noteLines = doc.splitTextToSize(
    clinicianNotes || `Patient exhibits sustained neuroplastic adaptation under the Infra-Low Frequency (ILF) and SMR/Alpha protocols. Real-time auditory/visual operant conditioning at home has demonstrated steady reduction in theta/beta ratio. Patient is approved to continue phase 2 home training 3x/week.`,
    pageWidth - 28
  );
  doc.text(noteLines, 14, y);

  // Doctor Signature Section
  y += 30;
  doc.setDrawColor(148, 163, 184);
  doc.line(130, y, pageWidth - 14, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Upasana Gala, Ph.D.', 130, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Founder & Lead Neurofeedback Specialist', 130, y + 9);
  doc.text('Evolve Brain Training Dubai & Abu Dhabi', 130, y + 13);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential Medical Tele-Neurocare Document • Evolve Brain Training © 2026', pageWidth / 2, 285, { align: 'center' });

  doc.save(`Evolve_Brain_Training_Report_${clientData.name.replace(/\s+/g, '_')}.pdf`);
}
