import React, { useState } from 'react';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, MessageCircle, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';

const POTENTIAL_MATCHES = [
  { id: 1, name: 'Yitzchak M.', interests: ['Talmud', 'Halacha'], time: 'Morning', compatibility: 95 },
  { id: 2, name: 'Benny S.', interests: ['Chassidus', 'Meditation'], time: 'Night', compatibility: 88 },
  { id: 3, name: 'Ari G.', interests: ['Daf Yomi'], time: 'Afternoon', compatibility: 72 },
];

export default function StudyBuddies() {
  const [requests, setRequests] = useState(new Set());

  const sendRequest = (id) => {
    setRequests(prev => new Set(prev).add(id));
    toast.success('Chavruta request sent!');
  };

  return (
    <PageShell 
      title="Study Buddies" 
      subtitle="Find your perfect Chavruta partner"
      actions={
        <Button variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          My Chats
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {POTENTIAL_MATCHES.map((match) => (
          <Card key={match.id} className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
              <div className="absolute -bottom-8 left-6">
                <Avatar className="w-16 h-16 border-4 border-white shadow-sm">
                  <AvatarFallback>{match.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{match.name}</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                  {match.compatibility}% Match
                </Badge>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {match.interests.join(', ')}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="w-4 h-4 mr-2" />
                  Available: {match.time}
                </div>
              </div>

              {requests.has(match.id) ? (
                <Button className="w-full" disabled variant="secondary">
                  <Check className="w-4 h-4 mr-2" />
                  Request Sent
                </Button>
              ) : (
                <Button className="w-full" onClick={() => sendRequest(match.id)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Request Chavruta
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}