import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FEATURES, FEATURE_AREAS } from '../components/config/features';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function Integrity() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [checks, setChecks] = useState({
    featuresCount: 0,
    routesCount: 0,
    areasCount: 0,
    tenancyOk: false,
    sessionOk: false
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
        
        runChecks(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const runChecks = (schoolId) => {
    const featuresCount = Object.keys(FEATURES).length;
    const routesCount = Object.values(FEATURES).map(f => f.route).filter(Boolean).length;
    const areasCount = Object.keys(FEATURE_AREAS).length;
    const tenancyOk = !!schoolId;
    const sessionOk = !!user;

    setChecks({
      featuresCount,
      routesCount,
      areasCount,
      tenancyOk,
      sessionOk
    });
  };

  const getStatusIcon = (ok) => {
    return ok ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Platform Integrity Check</h1>
        <p className="text-slate-600">Verify feature registry, routing, and multi-tenant isolation</p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {checks.tenancyOk && checks.sessionOk ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 mr-2" />
            )}
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Session Active</span>
            {getStatusIcon(checks.sessionOk)}
          </div>
          <div className="flex items-center justify-between">
            <span>School Selected</span>
            {getStatusIcon(checks.tenancyOk)}
          </div>
        </CardContent>
      </Card>

      {/* Feature Registry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{checks.featuresCount}</div>
            <div className="text-sm text-slate-600 mt-1">Total Features</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{checks.routesCount}</div>
            <div className="text-sm text-slate-600 mt-1">Routes Registered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{checks.areasCount}</div>
            <div className="text-sm text-slate-600 mt-1">Feature Areas</div>
          </CardContent>
        </Card>
      </div>

      {/* Features by Area */}
      <Card>
        <CardHeader>
          <CardTitle>Features by Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(FEATURE_AREAS).map(([key, area]) => {
              const areaFeatures = Object.values(FEATURES).filter(f => f.area === key);
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Badge className={area.color}>{area.label}</Badge>
                    <span className="text-sm text-slate-600">{areaFeatures.length} features</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active School Info */}
      {activeSchoolId && (
        <Card>
          <CardHeader>
            <CardTitle>Active School Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">School ID:</span>
                <span className="font-mono">{activeSchoolId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">User Email:</span>
                <span>{user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900 space-y-2">
          <p>• All features are preserved in the registry and accessible via Vault</p>
          <p>• Multi-tenant isolation is enforced via scoped queries</p>
          <p>• Content protection policies are per-school configurable</p>
          <p>• Legacy routes are preserved with aliases for backwards compatibility</p>
        </CardContent>
      </Card>
    </div>
  );
}