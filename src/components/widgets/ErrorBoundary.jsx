import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
          <Card className="max-w-md glass-effect border-0 premium-shadow-xl rounded-[2rem]">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Oops! Something went wrong</h2>
                <p className="text-slate-600">We encountered an unexpected error</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}