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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Scale className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Halacha Guide</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Practical Jewish law for contemporary life
          </p>
        </motion.div>

        {/* Search */}
        <Card className="glass-card border-0 shadow-xl">
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${cat.color} rounded-xl flex items-center justify-center text-2xl mb-2 mx-auto group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{cat.name.replace('_', ' ')}</h3>
                    <p className="text-xs text-slate-600">{cat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rulings */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            {searchQuery ? 'Search Results' : 'Recent Rulings'}
          </h2>
          {filteredRulings.length > 0 ? (
            <div className="space-y-4">
              {filteredRulings.map((ruling) => (
                <motion.div
                  key={ruling.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="glass-card border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-6">
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