import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, BookOpen, HelpCircle, List } from 'lucide-react';
import { toast } from 'sonner';
import { buildCacheKey, scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
import { requestAiTutorResponse } from '@/components/ai/aiClient';

export default function AiTutorPanel({
  contextType,
  contextId,
  contextTitle,
  contextContent,
  contextCourseId,
  user,
  schoolId,
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const queryClient = useQueryClient();
  const isLocked = !contextContent;

  const logPolicy = async (action, reason) => {
    if (!schoolId || !user?.email) return;
    try {
      await scopedCreate('AiTutorPolicyLog', schoolId, {
        user_email: user.email,
        action,
        reason,
        context_type: contextType,
        context_id: contextId
      });
    } catch {
      // best effort
    }
  };

  const { data: session } = useQuery({
    queryKey: buildCacheKey('ai-session', schoolId, contextId),
    queryFn: async () => {
      const sessions = await scopedFilter('AiTutorSession', schoolId, {
        user_email: user.email,
        context_id: contextId
      }, '-updated_date', 1);
      if (sessions[0]?.messages) {
        setMessages(sessions[0].messages);
      }
      return sessions[0];
    },
    enabled: !!contextId && !!user && !!schoolId
  });

  const formatSources = (sources) => {
    if (!Array.isArray(sources) || sources.length === 0) return '';
    const lines = sources.map((source) => {
      const title = source.title || 'Source';
      return `- ${title}`;
    });
    return `\n\nSources:\n${lines.join('\n')}`;
  };

  const askMutation = useMutation({
    mutationFn: async ({ prompt, action }) => {
      const result = await requestAiTutorResponse({
        prompt,
        action,
        school_id: schoolId,
        context_type: contextType,
        context_id: contextId,
        context_title: contextTitle,
        context_content: contextContent,
        course_id: contextCourseId,
        context_locked: isLocked,
        lesson_id: contextType === 'LESSON' ? contextId : null,
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
      });
      const sourcesNote = formatSources(result?.sources);
      const reply = `${result?.response || 'No response available.'}${sourcesNote}`;

      const newMessages = [
        ...messages,
        { role: 'user', content: prompt },
        { role: 'assistant', content: reply }
      ];

      // Save session
      if (session) {
        await scopedUpdate('AiTutorSession', session.id, {
          messages: newMessages
        }, schoolId, true);
      } else {
        await scopedCreate('AiTutorSession', schoolId, {
          user_email: user.email,
          context_type: contextType,
          context_id: contextId,
          messages: newMessages
        });
      }

      // Log for safety
      await scopedCreate('AiTutorPolicyLog', schoolId, {
        user_email: user.email,
        action: 'ALLOWED',
        reason: `AI ${action} request`,
        context_type: contextType,
        context_id: contextId
      });

      return newMessages;
    },
    onSuccess: (newMessages) => {
      setMessages(newMessages);
      setInput('');
      queryClient.invalidateQueries(buildCacheKey('ai-session', schoolId, contextId));
    },
    onError: (error) => {
      if (error?.status === 403) {
        toast.error('This content is locked. Enroll to unlock AI assistance.');
        return;
      }
      toast.error('Request limit reached. Please try again later.');
    }
  });

  const handleQuickAction = (action) => {
    if (!contextContent) {
      logPolicy('BLOCKED', 'content_locked');
      toast.error('This content is locked. Enroll to unlock AI assistance.');
      return;
    }
    const prompts = {
      explain: `Explain the main concepts in "${contextTitle}"`,
      quiz: `Create quiz questions about "${contextTitle}"`,
      summarize: `Summarize the key points in "${contextTitle}"`
    };
    askMutation.mutate({ prompt: prompts[action], action });
  };

  return (
    <Card className={isLocked ? 'opacity-70' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Ask the Rav (AI)
          <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLocked && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50 text-center">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              Enroll in this course to unlock AI learning assistance.
            </p>
          </div>
        )}
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('explain')}
            disabled={askMutation.isPending || isLocked}
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Explain
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('quiz')}
            disabled={askMutation.isPending || isLocked}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Quiz Me
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('summarize')}
            disabled={askMutation.isPending || isLocked}
          >
            <List className="w-4 h-4 mr-1" />
            Summarize
          </Button>
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' : 'bg-slate-50 dark:bg-slate-900/40 mr-8'
            }`}>
              <p className="text-sm font-medium mb-1 text-foreground">
                {msg.role === 'user' ? 'You' : 'AI Tutor'}
              </p>
              <p className="text-sm text-muted-foreground">{msg.content}</p>
            </div>
          ))}
          {askMutation.isPending && (
            <div className="text-center py-4">
              <div className="animate-pulse text-slate-500">Thinking...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLocked ? "Enroll to ask questions..." : "Ask a question..."}
            rows={3}
            disabled={isLocked}
          />
          <Button 
            onClick={() => askMutation.mutate({ prompt: input, action: 'custom' })}
            disabled={!input.trim() || askMutation.isPending || isLocked}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Ask
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Note: AI responses are in beta. Real AI integration coming soon!
        </p>
      </CardContent>
    </Card>
  );
}
