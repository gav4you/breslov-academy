import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Eye, GripVertical, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';

export default function TeachCourseCurriculum({ course, user }) {
  const [showDialog, setShowDialog] = useState(false);
  const [orderedLessons, setOrderedLessons] = useState([]);
  const queryClient = useQueryClient();
  const schoolId = course?.school_id;

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['course-lessons', course.id],
    queryFn: () => scopedFilter('Lesson', schoolId, { course_id: course.id }, 'order', 1000),
    enabled: !!course && !!schoolId
  });

  useEffect(() => {
    if (lessons.length > 0) {
      setOrderedLessons(lessons);
    }
  }, [lessons]);

  const createLessonMutation = useMutation({
    mutationFn: async (title) => {
      const maxOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) : 0;
      return await scopedCreate('Lesson', schoolId, {
        course_id: course.id,
        created_by: user.email,
        title,
        content: '',
        language: course?.language || 'en',
        order: maxOrder + 1,
        status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-lessons']);
      setShowDialog(false);
      toast.success('Lesson created!');
    }
  });

  const logAudit = async (action, entityType, entityId, metadata = {}) => {
    if (!schoolId || !user?.email) return;
    try {
      await scopedCreate('AuditLog', schoolId, {
        school_id: schoolId,
        user_email: user.email,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata
      });
    } catch {
      // best effort
    }
  };

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => scopedUpdate('Lesson', id, data, schoolId, true),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['course-lessons']);
      toast.success('Updated!');
      if (variables?.audit) {
        logAudit(
          variables.audit.action,
          variables.audit.entity_type,
          variables.audit.entity_id,
          variables.audit.metadata
        );
      }
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (newOrder) => {
      // Optimistic update handled by local state
      // Persist changes: update 'order' field for each lesson
      // In a real app, send { ids: [...] } to a batch reorder endpoint.
      // Here we update them one by one (inefficient but works for small lists)
      const promises = newOrder.map((lesson, index) => {
        if (lesson.order !== index + 1) {
          return scopedUpdate('Lesson', lesson.id, { order: index + 1 }, schoolId, true);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-lessons']);
      toast.success('Order saved');
    },
    onError: () => {
      toast.error('Failed to save order');
      queryClient.invalidateQueries(['course-lessons']); // Revert
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ data }) => scopedUpdate('Course', course.id, data, schoolId, true),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['course']);
      toast.success('Course published!');
      if (variables?.audit) {
        logAudit(
          variables.audit.action,
          variables.audit.entity_type,
          variables.audit.entity_id,
          variables.audit.metadata
        );
      }
    }
  });

  const handleCreateLesson = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createLessonMutation.mutate(formData.get('title'));
  };

  const toggleLessonStatus = (lesson) => {
    const newStatus = lesson.status === 'draft' ? 'published' : 'draft';
    updateLessonMutation.mutate({
      id: lesson.id,
      data: { status: newStatus },
      audit: {
        action: newStatus === 'published' ? 'PUBLISH_LESSON' : 'UNPUBLISH_LESSON',
        entity_type: 'Lesson',
        entity_id: lesson.id,
        metadata: { status: newStatus }
      }
    });
  };

  const publishCourse = () => {
    if (lessons.length === 0) {
      toast.error('Add at least one lesson before publishing');
      return;
    }
    updateCourseMutation.mutate({
      data: { status: 'published', is_published: true },
      audit: {
        action: 'PUBLISH_COURSE',
        entity_type: 'Course',
        entity_id: course.id,
        metadata: { status: 'published' }
      }
    });
  };

  const bulkUpdateStatus = useMutation({
    mutationFn: async (status) => {
      const promises = orderedLessons.map(l => 
        scopedUpdate('Lesson', l.id, { status }, schoolId, true)
      );
      await Promise.all(promises);
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries(['course-lessons']);
      toast.success(`All lessons ${status === 'published' ? 'published' : 'moved to draft'}`);
      logAudit(
        status === 'published' ? 'BULK_PUBLISH_LESSONS' : 'BULK_UNPUBLISH_LESSONS',
        'Lesson',
        course.id,
        { status, count: orderedLessons.length }
      );
    }
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedLessons(items);
    reorderMutation.mutate(items);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Curriculum</CardTitle>
          <div className="flex items-center space-x-2">
            {lessons.length > 1 && (
              <div className="flex border rounded-md mr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-r-none border-r"
                  onClick={() => bulkUpdateStatus.mutate('published')}
                  disabled={bulkUpdateStatus.isPending}
                >
                  Publish All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-l-none"
                  onClick={() => bulkUpdateStatus.mutate('draft')}
                  disabled={bulkUpdateStatus.isPending}
                >
                  Draft All
                </Button>
              </div>
            )}
            {course.status === 'draft' && lessons.length > 0 && (
              <Button onClick={publishCourse}>
                <Check className="w-4 h-4 mr-2" />
                Publish Course
              </Button>
            )}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Lesson</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateLesson} className="space-y-4">
                  <Input name="title" placeholder="Lesson title" required />
                  <Button type="submit" className="w-full">Create Lesson</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : orderedLessons.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-slate-600 mb-4">No lessons yet</p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Lesson
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="lessons">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {orderedLessons.map((lesson, index) => (
                      <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center space-x-3 p-4 border rounded-lg bg-white ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-500 w-6">#{index + 1}</span>
                                <h4 className="font-semibold">{lesson.title}</h4>
                                <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
                                  {lesson.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleLessonStatus(lesson)}
                              >
                                {lesson.status === 'draft' ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Publish
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-1" />
                                    Unpublish
                                  </>
                                )}
                              </Button>
                              <Link to={createPageUrl(`TeachLesson?id=${lesson.id}`)}>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Link to={createPageUrl(`LessonViewer?id=${lesson.id}`)} target="_blank">
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
