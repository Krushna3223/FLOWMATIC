import jsPDF from 'jspdf';
import { CertificateRequest } from '../types';

export const generateCertificate = (certificate: CertificateRequest): jsPDF => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Add college header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('COLLEGE NAME', 105, 30, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Address Line 1', 105, 40, { align: 'center' });
  doc.text('Address Line 2', 105, 50, { align: 'center' });
  
  // Add certificate title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(getCertificateTitle(certificate.certificateType), 105, 80, { align: 'center' });
  
  // Add certificate number
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificate No: ${certificate.id}`, 20, 100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 110);
  
  // Add certificate content
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  
  const content = getCertificateContent(certificate);
  const splitContent = doc.splitTextToSize(content, 170);
  doc.text(splitContent, 20, 130);
  
  // Add signature section
  doc.setFontSize(12);
  doc.text('Principal Signature:', 20, 220);
  doc.text('College Seal:', 120, 220);
  
  return doc;
};

const getCertificateTitle = (type: string): string => {
  switch (type) {
    case 'bonafide':
      return 'BONAFIDE CERTIFICATE';
    case 'tc':
      return 'TRANSFER CERTIFICATE';
    case 'noc':
      return 'NO OBJECTION CERTIFICATE';
    case 'character':
      return 'CHARACTER CERTIFICATE';
    default:
      return 'CERTIFICATE';
  }
};

const getCertificateContent = (certificate: CertificateRequest): string => {
  const { studentName, studentRollNumber, certificateType, reason } = certificate;
  
  switch (certificateType) {
    case 'bonafide':
      return `This is to certify that ${studentName} (Roll No: ${studentRollNumber}) is a bonafide student of our college. This certificate is issued for the purpose of ${reason}.`;
    
    case 'tc':
      return `This is to certify that ${studentName} (Roll No: ${studentRollNumber}) was a student of our college. This Transfer Certificate is issued for the purpose of ${reason}.`;
    
    case 'noc':
      return `This is to certify that we have no objection for ${studentName} (Roll No: ${studentRollNumber}) to ${reason}. This No Objection Certificate is issued accordingly.`;
    
    case 'character':
      return `This is to certify that ${studentName} (Roll No: ${studentRollNumber}) is a student of good character and conduct during their stay at our college. This Character Certificate is issued for the purpose of ${reason}.`;
    
    default:
      return `This is to certify that ${studentName} (Roll No: ${studentRollNumber}) is a student of our college. This certificate is issued for the purpose of ${reason}.`;
  }
};

export const downloadCertificate = (certificate: CertificateRequest): void => {
  const doc = generateCertificate(certificate);
  const fileName = `${certificate.certificateType}_${certificate.studentRollNumber}_${Date.now()}.pdf`;
  doc.save(fileName);
};

export const getCertificateAsBlob = (certificate: CertificateRequest): Blob => {
  const doc = generateCertificate(certificate);
  return doc.output('blob');
}; 