import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';

export default function SchoolThankYou() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const transactionId = urlParams.get('transactionId');

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const transactions = await base44.entities.Transaction.filter({ id: transactionId });
      return transactions[0];
    },
    enabled: !!transactionId
  });

  const { data: offer } = useQuery({
    queryKey: ['offer', transaction?.offer_id],
    queryFn: async () => {
      const offers = await base44.entities.Offer.filter({ id: transaction.offer_id });
      return offers[0];
    },
    enabled: !!transaction?.offer_id
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Order Received!</h1>
            
            <p className="text-lg text-slate-600 mb-6">
              Thank you for your purchase. We've received your order and will process it shortly.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-slate-700 mb-2">
                <strong>What happens next?</strong>
              </p>
              <p className="text-sm text-slate-600">
                Our team will contact you via email within 24 hours with payment instructions. 
                Once payment is confirmed, you'll receive immediate access to your course(s).
              </p>
            </div>

            {offer && (
              <div className="text-left bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <p><strong>Item:</strong> {offer.name}</p>
                  <p><strong>Order ID:</strong> {transactionId?.substring(0, 8)}</p>
                  <p><strong>Status:</strong> Pending Payment</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link to={createPageUrl(`SchoolLanding?slug=${slug}`)}>
                <Button size="lg" className="w-full">
                  Return to School
                </Button>
              </Link>
              <Link to={createPageUrl('Dashboard')}>
                <Button size="lg" variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}