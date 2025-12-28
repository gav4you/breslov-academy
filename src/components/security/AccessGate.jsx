import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, ShoppingCart, Eye } from 'lucide-react';

export default function AccessGate({ 
  courseId, 
  schoolSlug,
  message = "This content is only available to enrolled students",
  showPreviewButton = false,
  onPreviewClick,
  showCopyLicenseCTA = false,
  showDownloadLicenseCTA = false,
  copyLicenseOfferId,
  downloadLicenseOfferId
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-600" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">Content Protected</h3>
          <p className="text-slate-600 mb-6">{message}</p>

          <div className="space-y-3">
            {showPreviewButton && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onPreviewClick}
              >
                <Eye className="w-4 h-4 mr-2" />
                Watch Preview
              </Button>
            )}

            <Link to={createPageUrl(`CourseSales?slug=${schoolSlug}&courseId=${courseId}`)}>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase Access
              </Button>
            </Link>

            {showCopyLicenseCTA && copyLicenseOfferId && (
              <Link to={createPageUrl(`SchoolCheckout?offerId=${copyLicenseOfferId}`)}>
                <Button variant="outline" className="w-full">
                  Unlock Copy Rights
                </Button>
              </Link>
            )}

            {showDownloadLicenseCTA && downloadLicenseOfferId && (
              <Link to={createPageUrl(`SchoolCheckout?offerId=${downloadLicenseOfferId}`)}>
                <Button variant="outline" className="w-full">
                  Unlock Download Rights
                </Button>
              </Link>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Need help? Contact school administration
          </p>
        </CardContent>
      </Card>
    </div>
  );
}