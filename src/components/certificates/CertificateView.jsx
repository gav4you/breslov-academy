import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function CertificateView({ student, course, completionDate }) {
  const certificateRef = useRef();

  const downloadPDF = async () => {
    const element = certificateRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${course.title}-certificate.pdf`);
  };

  return (
    <div className="space-y-6">
      <div ref={certificateRef} className="bg-white p-16 rounded-3xl shadow-2xl border-8 border-amber-500">
        <div className="text-center space-y-8">
          <Award className="w-24 h-24 text-amber-500 mx-auto" />
          
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-2">Certificate of Completion</h1>
            <p className="text-slate-600 text-xl">This certifies that</p>
          </div>

          <div className="py-6 border-y-4 border-amber-500">
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {student.full_name}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-slate-600 text-xl">has successfully completed the course</p>
            <h3 className="text-4xl font-bold text-slate-900">{course.title}</h3>
            {course.title_hebrew && (
              <p className="text-2xl text-amber-700" dir="rtl">{course.title_hebrew}</p>
            )}
          </div>

          <div className="pt-8 flex justify-between items-end">
            <div className="text-left">
              <div className="border-t-2 border-slate-300 pt-2">
                <p className="text-sm text-slate-600">Date</p>
                <p className="font-bold text-slate-900">{new Date(completionDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-slate-300 pt-2">
                <p className="text-sm text-slate-600">Instructor</p>
                <p className="font-bold text-slate-900">{course.instructor}</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <p className="text-xs text-slate-500">Breslov Academy • Certificate ID: CERT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={downloadPDF}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-8 py-6 rounded-2xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}