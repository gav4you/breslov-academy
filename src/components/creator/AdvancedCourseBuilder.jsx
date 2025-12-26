import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Video, FileText, CheckSquare, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdvancedCourseBuilder({ onSave }) {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    lessons: [],
    quizzes: [],
    resources: []
  });

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Plus className="w-5 h-5 text-blue-600" />
          Course Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Input
            placeholder="Course Title"
            className="rounded-xl text-xl font-bold"
          />
          <Textarea
            placeholder="Course Description"
            className="min-h-[100px] rounded-xl"
          />
        </div>

        <Tabs defaultValue="lessons">
          <TabsList className="grid grid-cols-3 bg-white rounded-xl">
            <TabsTrigger value="lessons">
              <Video className="w-4 h-4 mr-2" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <CheckSquare className="w-4 h-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FileText className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-3 mt-4">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-3 mt-4">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Quiz
            </Button>
          </TabsContent>

          <TabsContent value="resources" className="space-y-3 mt-4">
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl">
              <Upload className="w-4 h-4 mr-2" />
              Upload Resource
            </Button>
          </TabsContent>
        </Tabs>

        <Button
          onClick={() => onSave?.(course)}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
        >
          Save & Publish Course
        </Button>
      </CardContent>
    </Card>
  );
}