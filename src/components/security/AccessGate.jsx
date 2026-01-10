import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Eye, Clock, ShieldAlert } from 'lucide-react';
import { tokens, cx } from '@/components/theme/tokens';

export default function AccessGate({ 
  courseId, 
  schoolSlug,
  mode = 'LOCKED', // LOCKED | DRIP_LOCKED | PREVIEW_NOTICE
  message,
  showPreviewButton = false,
  onPreviewClick,
  showCopyLicenseCTA = false,
  showDownloadLicenseCTA = false,
  copyLicenseOfferId,
  downloadLicenseOfferId,
  dripAvailableAt,
  dripCountdownLabel
}) {
  const defaultMessage = mode === 'DRIP_LOCKED'
    ? 'This lesson will unlock soon'
    : 'This content is only available to enrolled students';
  
  return (
    <div className="flex items-center justify-center min-h-[500px] p-4 sm:p-8 animate-fadeIn">
      <Card className={cx(tokens.glass.card, "max-w-md w-full border-none shadow-xl")}>
        <CardContent className="p-8 sm:p-12 text-center">
          {mode === 'DRIP_LOCKED' ? (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Release Pending</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">{message || defaultMessage}</p>
              
              {dripAvailableAt && (
                <div className="bg-muted/50 border border-border/50 rounded-xl p-6 mb-8">
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Unlocks on</p>
                  <p className="text-xl font-bold text-foreground">
                    {new Date(dripAvailableAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  {dripCountdownLabel && (
                    <p className="text-sm text-primary font-medium mt-3">{dripCountdownLabel}</p>
                  )}
                </div>
              )}
              
              <Button variant="outline" className="w-full h-12 text-base font-semibold" onClick={() => window.history.back()}>
                Return to Curriculum
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-10 h-10 text-muted-foreground" />
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-3">Enrolment Required</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">{message || defaultMessage}</p>

              <div className="space-y-4">
                {showPreviewButton && (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-base font-semibold border-2"
                    onClick={onPreviewClick}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Preview Lesson
                  </Button>
                )}

                <Link to={createPageUrl(`CourseSales?slug=${schoolSlug}&courseId=${courseId}`)} className="block">
                  <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Unlock this Course
                  </Button>
                </Link>

                {(showCopyLicenseCTA || showDownloadLicenseCTA) && (
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {showCopyLicenseCTA && copyLicenseOfferId && (
                      <Link to={createPageUrl(`SchoolCheckout?offerId=${copyLicenseOfferId}`)}>
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
                          Request Copy Rights
                        </Button>
                      </Link>
                    )}

                    {showDownloadLicenseCTA && downloadLicenseOfferId && (
                      <Link to={createPageUrl(`SchoolCheckout?offerId=${downloadLicenseOfferId}`)}>
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
                          Unlock Downloads
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Questions? <Link to="/contact" className="underline hover:text-primary">Contact Support</Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}