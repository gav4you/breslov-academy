import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getIntegrationById } from '@/components/config/integrations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cx } from '@/components/theme/tokens';
import PageShell from '@/components/ui/PageShell';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { useSession } from '@/components/hooks/useSession';
import { useIntegration } from '@/components/hooks/useIntegration';
import { base44 } from '@/api/base44Client';
import { buildApiUrl } from '@/api/appClient';

export default function IntegrationDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const appId = params.get('id');
  const app = getIntegrationById(appId);
  const { activeSchoolId } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const connectMode = app?.connectMode || (app?.oauthStartPath ? 'oauth' : 'manual');
  const isOAuth = connectMode === 'oauth';
  const isApiKey = connectMode === 'api_key';
  const providerKey = app?.providerKey || app?.id;

  const { connection, isConnected: hookConnected, refetch: refetchConnection } = useIntegration(providerKey);

  useEffect(() => {
    if (!app) {
      navigate(createPageUrl('IntegrationsMarketplace'));
    }
  }, [app, navigate]);

  if (!app) return null;

  const connected = hookConnected || (!connection && app?.status === 'connected');

  const handleConnect = () => {
    if (isOAuth) {
      if (!activeSchoolId) {
        toast.error('Select a school first');
        return;
      }
      const url = buildApiUrl(app.oauthStartPath, {
        school_id: activeSchoolId,
        provider: providerKey,
        return_url: window.location.href,
      });
      window.location.assign(url);
      return;
    }

    if (!activeSchoolId) {
      toast.error('Select a school first');
      return;
    }
    if (isApiKey && !apiKey.trim()) {
      toast.error('API key required');
      return;
    }
    setIsConnecting(true);
    base44.request('/integrations/connect', {
      method: 'POST',
      body: {
        school_id: activeSchoolId,
        provider: providerKey,
        api_key: isApiKey ? apiKey.trim() : null,
        connect_mode: connectMode,
      },
    }).then(async () => {
      await refetchConnection();
      setApiKey('');
      toast.success(`Successfully connected to ${app.name}`);
    }).catch(() => {
      toast.error('Unable to connect integration');
    }).finally(() => {
      setIsConnecting(false);
    });
  };

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect ${app.name}?`)) return;

    if (isOAuth || isApiKey || connectMode === 'manual') {
      try {
        await base44.request('/integrations/disconnect', {
          method: 'POST',
          body: { school_id: activeSchoolId, provider: providerKey },
        });
        await refetchConnection();
        toast.info(`Disconnected from ${app.name}`);
      } catch (error) {
        toast.error('Unable to disconnect integration');
      }
      return;
    }

    toast.info(`Disconnected from ${app.name}`);
  };

  return (
    <PageShell
      title={
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(createPageUrl('IntegrationsMarketplace'))}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span>{app.name}</span>
        </div>
      }
      subtitle={app.category}
      actions={
        connected ? (
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect App'}
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8">
            <div className="flex items-start gap-6">
              <div className={cx("w-20 h-20 rounded-2xl flex items-center justify-center shrink-0", app.bg)}>
                <app.icon className={cx("w-10 h-10", app.color)} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">About this integration</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {app.description}
                </p>
              </div>
            </div>

            <Separator className="my-8" />

            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {app.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-lg font-semibold mb-4">How it works</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <h4 className="font-medium mb-1">Connect your account</h4>
                  <p className="text-sm text-muted-foreground">Authenticate with {app.name} to grant necessary permissions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-medium mb-1">Configure settings</h4>
                  <p className="text-sm text-muted-foreground">Choose which data to sync and how to handle updates.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <h4 className="font-medium mb-1">Start using</h4>
                  <p className="text-sm text-muted-foreground">Access new features directly within your dashboard.</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4">App Info</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{app.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">2.4.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Developer</span>
                <span className="font-medium">{app.developer || 'Breslov Academy'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={connected ? 'default' : app.status === 'beta' ? 'secondary' : 'outline'} className="capitalize">
                  {connected ? 'connected' : app.status}
                </Badge>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Documentation <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Support <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </GlassCard>

          {isApiKey && !connected && (
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4">API Key</h3>
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Paste API key"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Keys are stored securely and only used for this school's integrations.
                </p>
              </div>
            </GlassCard>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">Verified & Secure</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  This integration has been verified by our team and uses secure OAuth connection methods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
