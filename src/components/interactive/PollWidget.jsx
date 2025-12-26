import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PollWidget({ question, options }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const mockPoll = {
    question: question || 'What time do you prefer to study?',
    options: options || [
      { text: 'Morning (6-9 AM)', votes: 45 },
      { text: 'Afternoon (1-4 PM)', votes: 32 },
      { text: 'Evening (8-11 PM)', votes: 67 },
      { text: 'Night (11 PM+)', votes: 23 },
    ],
    totalVotes: 167
  };

  const handleVote = () => {
    if (selectedOption !== null) {
      setHasVoted(true);
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-600" />
          Community Poll
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">{mockPoll.question}</h3>

        <div className="space-y-2">
          {mockPoll.options.map((option, idx) => {
            const percentage = (option.votes / mockPoll.totalVotes) * 100;
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => !hasVoted && setSelectedOption(idx)}
                disabled={hasVoted}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  hasVoted
                    ? 'cursor-default'
                    : selectedOption === idx
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-white border-2 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{option.text}</span>
                  {hasVoted && (
                    <span className="text-sm font-bold text-slate-900">{percentage.toFixed(0)}%</span>
                  )}
                </div>
                {hasVoted && (
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {!hasVoted ? (
          <Button
            onClick={handleVote}
            disabled={selectedOption === null}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl"
          >
            Vote
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 pt-2">
            <Users className="w-4 h-4" />
            <span>{mockPoll.totalVotes} total votes</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}