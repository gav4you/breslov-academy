import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function CourseCloner({ courses = [], onClone }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [options, setOptions] = useState({
    copyLessons: true,
    copyQuizzes: true,
    copyResources: true,
    copyDiscussions: false
  });

  const cloneCourse = () => {
    if (selectedCourse && newTitle) {
      onClone?.({
        originalId: selectedCourse.id,
        newTitle,
        options
      });
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Copy className="w-5 h-5 text-purple-600" />
          <div>
            <div>Clone Course</div>
            <div className="text-sm text-slate-600 font-normal">Duplicate existing shiurim</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Select course to clone
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {courses.map((course, idx) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedCourse?.id === course.id
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-white border-2 border-slate-200 hover:border-purple-200'
                }`}
              >
                <div className="font-bold text-slate-900">{course.title}</div>
                <div className="text-xs text-slate-600">
                  {course.lessons_count || 0} lessons
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedCourse && (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                New course title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Advanced Likutey Moharan Study"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                What to copy
              </label>
              {[
                { key: 'copyLessons', label: 'Lessons & Content' },
                { key: 'copyQuizzes', label: 'Quizzes & Assessments' },
                { key: 'copyResources', label: 'Resources & Downloads' },
                { key: 'copyDiscussions', label: 'Discussion Topics' }
              ].map(option => (
                <div key={option.key} className="flex items-center gap-3 p-2">
                  <Checkbox
                    checked={options[option.key]}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, [option.key]: checked })
                    }
                  />
                  <label className="text-sm text-slate-700">{option.label}</label>
                </div>
              ))}
            </div>

            <Button
              onClick={cloneCourse}
              disabled={!newTitle}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Clone
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}