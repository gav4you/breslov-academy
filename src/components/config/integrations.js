import {
  Video,
  MessageSquare,
  CreditCard,
  Mail,
  Calendar,
  FileText,
  Music,
  Share2
} from 'lucide-react';

export const INTEGRATIONS = {
  zoom: {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule and host live classes directly from your course curriculum.',
    category: 'Video Conferencing',
    icon: Video,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    status: 'available',
    features: [
      'Auto-create meetings for live lessons',
      'Sync recordings to course content',
      'Attendance tracking'
    ]
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    description: 'Build a thriving community with private channels for each course.',
    category: 'Community',
    icon: MessageSquare,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    status: 'available',
    features: [
      'Auto-invite students on enrollment',
      'Role sync based on course access',
      'Private course channels'
    ]
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments globally with the world\'s leading payment processor.',
    category: 'Payments',
    icon: CreditCard,
    color: 'text-violet-500',
    bg: 'bg-violet-100 dark:bg-violet-900/20',
    status: 'connected', // Mock status
    features: [
      'Credit card processing',
      'Subscription management',
      'Automatic payouts'
    ]
  },
  mailchimp: {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync student emails to your marketing lists for targeted campaigns.',
    category: 'Marketing',
    icon: Mail,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    status: 'available',
    features: [
      'Sync new students to audience',
      'Tag students by course',
      'Automated onboarding emails'
    ]
  },
  google_calendar: {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync course schedules and live sessions to your personal calendar.',
    category: 'Productivity',
    icon: Calendar,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/20',
    status: 'available',
    features: [
      'One-way sync of course events',
      'Reminders for live sessions',
      'Instructor availability'
    ]
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Embed Notion pages directly into your lessons for rich documentation.',
    category: 'Content',
    icon: FileText,
    color: 'text-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-800',
    status: 'beta',
    features: [
      'Embed public pages',
      'Sync databases to course resources',
      'Collaborative student wikis'
    ]
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    description: 'Embed playlists and podcasts for immersive learning experiences.',
    category: 'Media',
    icon: Music,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    status: 'available',
    features: [
      'Embed episodes in lessons',
      'Curated study playlists',
      'Artist discovery'
    ]
  },
  zapier: {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect your school to 5,000+ other apps with automated workflows.',
    category: 'Automation',
    icon: Share2,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    status: 'available',
    features: [
      'Trigger actions on enrollment',
      'Sync data to CRMs',
      'Custom notifications'
    ]
  }
};

export const getIntegrationById = (id) => INTEGRATIONS[id];
export const getAllIntegrations = () => Object.values(INTEGRATIONS);
