import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Folder, Upload, Image, Link as LinkIcon, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function ClassProject({ project, courseId, userEmail, onSubmit }) {
  const [submission, setSubmission] = useState({
    description: '',
    project_url: '',
    files: []
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    const uploadedFiles = [];
    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedFiles.push({ name: file.name, url: result.file_url });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setSubmission(prev => ({
      ...prev,
      files: [...prev.files, ...uploadedFiles]
    }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    await onSubmit?.({
      project_id: project.id,
      user_email: userEmail,
      course_id: courseId,
      description: submission.description,
      project_url: submission.project_url,
      files: submission.files,
      status: 'submitted'
    });
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>{project.title}</CardTitle>
            <p className="text-sm text-slate-600">Apply what you've learned</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-xl">
          <h4 className="font-bold text-slate-900 mb-2">Project Brief</h4>
          <p className="text-slate-700 mb-3">{project.description}</p>
          
          {project.requirements && (
            <div>
              <div className="font-bold text-slate-900 text-sm mb-2">Requirements:</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {project.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Project Description
          </label>
          <Textarea
            value={submission.description}
            onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
            placeholder="Describe your project and what you learned..."
            className="min-h-[120px] rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Project URL (optional)
          </label>
          <div className="flex gap-2">
            <LinkIcon className="w-5 h-5 text-slate-400 mt-3" />
            <Input
              value={submission.project_url}
              onChange={(e) => setSubmission({ ...submission, project_url: e.target.value })}
              placeholder="https://your-project-link.com"
              className="flex-1 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload Files
          </label>
          <label className="block">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                {uploading ? 'Uploading...' : 'Click to upload images, videos, or documents'}
              </p>
            </div>
          </label>

          {submission.files.length > 0 && (
            <div className="mt-3 space-y-2">
              {submission.files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <Image className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-700 flex-1">{file.name}</span>
                  <button
                    onClick={() => setSubmission({
                      ...submission,
                      files: submission.files.filter((_, i) => i !== idx)
                    })}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!submission.description.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-6 rounded-2xl"
        >
          <Send className="w-5 h-5 mr-2" />
          Submit Project
        </Button>

        <div className="text-center text-sm text-slate-600">
          Your project will be visible to the community for peer feedback
        </div>
      </CardContent>
    </Card>
  );
}