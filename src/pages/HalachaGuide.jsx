import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scale, Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HalachaGuide() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: rulings = [] } = useQuery({
    queryKey: ['halacha'],
    queryFn: () => base44.entities.HalachaRuling.list()
  });

  const filteredRulings = rulings.filter(r => 
    searchQuery === '' || 
    r.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { name: 'Shabbat', icon: '🕯️', color: 'from-blue-500 to-blue-600' },
    { name: 'Kashrut', icon: '🍇', color: 'from-green-500 to-green-600' },
    { name: 'Tefillah', icon: '🙏', color: 'from-purple-500 to-purple-600' },
    { name: 'Family_Purity', icon: '💧', color: 'from-cyan-500 to-cyan-600' },
    { name: 'Monetary', icon: '💰', color: 'from-amber-500 to-amber-600' },
    { name: 'Festivals', icon: '🎉', color: 'from-pink-500 to-pink-600' }
  ];

  const severityColors = {
    lenient: 'bg-green-100 text-green-800',
    stringent: 'bg-red-100 text-red-800',
    depends: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] premium-shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500 rounded-full blur-[120px]" />
          </div>
          <div className="relative p-10 md:p-14">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white">Halacha Guide</h1>
            </div>
            <p className="text-slate-200 text-xl font-light leading-relaxed">
              Practical Jewish law for contemporary life
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <Card className="glass-effect border-0 premium-shadow rounded-[2rem]">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search halachic questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-1.5 w-16 bg-gradient-to-r from-amber-500 to-transparent rounded-full" />
            <h2 className="text-4xl font-black text-slate-900">Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}


              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all duration-300 group cursor-pointer rounded-[1.5rem] overflow-hidden">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className={`w-20 h-20 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-4xl mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-black text-lg text-slate-900 tracking-tight">{cat.name.replace('_', ' ')}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rulings */}
        <div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
            <h2 className="text-4xl font-black text-slate-900">
              {searchQuery ? 'Search Results' : 'Recent Rulings'}
            </h2>
          </div>
          {filteredRulings.length > 0 ? (
            <div className="space-y-4">
              {filteredRulings.map((ruling) => (
                <motion.div
                  key={ruling.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}


                  whileHover={{ y: -4 }}
                >
                  <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all duration-300 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-slate-900 text-white">{ruling.category}</Badge>
                        <Badge className={severityColors[ruling.severity]}>{ruling.severity}</Badge>
                      </div>
                      <h3 className="font-bold text-xl text-slate-900 mb-3">{ruling.question}</h3>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-slate-700 leading-relaxed">{ruling.ruling}</p>
                      </div>
                      {ruling.sources && ruling.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-sm font-semibold text-slate-600 mb-2">Sources:</p>
                          <p className="text-sm text-slate-600">{ruling.sources.join(', ')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass-card border-2 border-dashed border-slate-300">
              <CardContent className="text-center py-20">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No rulings found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}