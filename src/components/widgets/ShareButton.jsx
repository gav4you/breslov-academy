import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Mail, Link2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShareButton({ title, url }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
    { name: 'Email', icon: Mail, color: 'bg-slate-600' },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="rounded-2xl"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 z-50"
          >
            <div className="glass-effect border-0 premium-shadow-xl rounded-2xl p-3 min-w-[200px]">
              <div className="space-y-2">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.name}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${option.color} text-white hover:opacity-90 transition-opacity`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{option.name}</span>
                    </button>
                  );
                })}
                <button
                  onClick={copyLink}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  <span className="font-medium text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}