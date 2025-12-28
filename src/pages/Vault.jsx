import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Archive, Search } from 'lucide-react';
import { FEATURES, FEATURE_AREAS, getFeaturesByArea } from '../components/config/features';

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('');

  const allFeatures = Object.values(FEATURES);
  const filteredFeatures = allFeatures.filter(f => 
    f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const areas = FEATURE_AREAS;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Archive className="w-8 h-8 text-amber-600 mr-3" />
          <h1 className="text-3xl font-bold">Vault</h1>
        </div>
        <p className="text-slate-600 mb-6">
          Complete directory of all platform features. Nothing is ever removed - everything is preserved here.
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{allFeatures.length}</div>
            <div className="text-sm text-slate-600">Total Features</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getFeaturesByArea('core').length}</div>
            <div className="text-sm text-slate-600">Core</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{getFeaturesByArea('admin').length}</div>
            <div className="text-sm text-slate-600">Admin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{getFeaturesByArea('marketing').length}</div>
            <div className="text-sm text-slate-600">Marketing</div>
          </CardContent>
        </Card>
      </div>

      {/* Features by Area */}
      {Object.entries(areas).map(([areaKey, areaInfo]) => {
        const areaFeatures = filteredFeatures.filter(f => f.area === areaKey);
        if (areaFeatures.length === 0) return null;

        return (
          <Card key={areaKey} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge className={areaInfo.color}>{areaInfo.label}</Badge>
                <span className="ml-2 text-sm text-slate-500">({areaFeatures.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {areaFeatures.map((feature) => {
                  // Use feature.route if it's already a path, otherwise createPageUrl
                  const href = feature.route && feature.route.startsWith('/') 
                    ? feature.route 
                    : createPageUrl(feature.key);
                  
                  return (
                  <Link 
                    key={feature.key} 
                    to={href}
                    className="p-3 border rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium group-hover:text-blue-600 transition-colors">{feature.label}</span>
                      <div className="flex items-center space-x-1">
                        {feature.hidden && (
                          <Badge variant="outline" className="text-xs">Hidden</Badge>
                        )}
                        {feature.vaultOnly && (
                          <Badge variant="secondary" className="text-xs">Vault</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {feature.audiences.join(', ')}
                    </div>
                  </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No features found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}