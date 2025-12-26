import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import CertificateView from '../components/certificates/CertificateView';

export default function Certificates() {
  const [user, setUser] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: () => base44.entities.Certificate.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const certificatesWithCourses = certificates.map(cert => ({
    ...cert,
    course: courses.find(c => c.id === cert.course_id)
  })).filter(c => c.course);

  if (selectedCert) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Button onClick={() => setSelectedCert(null)} variant="outline" className="rounded-xl">
          ← Back to Certificates
        </Button>
        <CertificateView
          student={user}
          course={selectedCert.course}
          completionDate={selectedCert.issued_date}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Certificates</h1>
          <p className="text-slate-600 text-lg">Your achievements and completed courses</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificatesWithCourses.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all rounded-[2rem] overflow-hidden cursor-pointer h-full">
                <div className="h-40 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 relative flex items-center justify-center">
                  <Award className="w-20 h-20 text-white/30" />
                </div>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{cert.course.title}</h3>
                    <p className="text-sm text-slate-600">
                      Completed on {new Date(cert.issued_date).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    onClick={() => setSelectedCert(cert)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View & Download
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {certificatesWithCourses.length === 0 && (
            <div className="col-span-full">
              <Card className="glass-effect border-2 border-dashed border-slate-300 rounded-[2rem]">
                <CardContent className="p-12 text-center">
                  <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No certificates yet</h3>
                  <p className="text-slate-600 mb-6">Complete courses to earn certificates</p>
                  <Link to={createPageUrl('Courses')}>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl">
                      Browse Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}