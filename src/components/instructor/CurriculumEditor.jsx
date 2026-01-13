import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Plus, Trash2, Edit2, Video, FileText, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock initial data structure
const initialData = {
  modules: {
    'mod-1': {
      id: 'mod-1',
      title: 'Introduction',
      lessonIds: ['less-1', 'less-2']
    },
    'mod-2': {
      id: 'mod-2',
      title: 'Advanced Concepts',
      lessonIds: ['less-3']
    }
  },
  lessons: {
    'less-1': { id: 'less-1', title: 'Welcome', type: 'video' },
    'less-2': { id: 'less-2', title: 'Reading Guide', type: 'text' },
    'less-3': { id: 'less-3', title: 'Quiz 1', type: 'quiz' }
  },
  moduleOrder: ['mod-1', 'mod-2']
};

export default function CurriculumEditor() {
  const [data, setData] = useState(initialData);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'module') {
      const newModuleOrder = Array.from(data.moduleOrder);
      newModuleOrder.splice(source.index, 1);
      newModuleOrder.splice(destination.index, 0, draggableId);

      setData({
        ...data,
        moduleOrder: newModuleOrder
      });
      return;
    }

    const start = data.modules[source.droppableId];
    const finish = data.modules[destination.droppableId];

    if (start === finish) {
      const newLessonIds = Array.from(start.lessonIds);
      newLessonIds.splice(source.index, 1);
      newLessonIds.splice(destination.index, 0, draggableId);

      const newModule = {
        ...start,
        lessonIds: newLessonIds
      };

      setData({
        ...data,
        modules: {
          ...data.modules,
          [newModule.id]: newModule
        }
      });
      return;
    }

    // Moving between modules
    const startLessonIds = Array.from(start.lessonIds);
    startLessonIds.splice(source.index, 1);
    const newStart = {
      ...start,
      lessonIds: startLessonIds
    };

    const finishLessonIds = Array.from(finish.lessonIds);
    finishLessonIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      lessonIds: finishLessonIds
    };

    setData({
      ...data,
      modules: {
        ...data.modules,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    });
  };

  const addModule = () => {
    const newId = `mod-${Date.now()}`;
    const newModule = { id: newId, title: 'New Module', lessonIds: [] };
    setData({
      ...data,
      modules: { ...data.modules, [newId]: newModule },
      moduleOrder: [...data.moduleOrder, newId]
    });
  };

  const addLesson = (moduleId) => {
    const newId = `less-${Date.now()}`;
    const newLesson = { id: newId, title: 'New Lesson', type: 'text' };
    const module = data.modules[moduleId];
    
    setData({
      ...data,
      lessons: { ...data.lessons, [newId]: newLesson },
      modules: {
        ...data.modules,
        [moduleId]: {
          ...module,
          lessonIds: [...module.lessonIds, newId]
        }
      }
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-500" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Curriculum</h2>
        <Button onClick={addModule}>
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-modules" direction="vertical" type="module">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {data.moduleOrder.map((moduleId, index) => {
                const module = data.modules[moduleId];
                const lessons = module.lessonIds.map(id => data.lessons[id]);

                return (
                  <Draggable key={module.id} draggableId={module.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} className="bg-slate-50 rounded-lg border border-slate-200">
                        <div className="p-4 flex items-center justify-between bg-white border-b rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <div {...provided.dragHandleProps} className="cursor-grab text-slate-400 hover:text-slate-600">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">{module.title}</span>
                            <span className="text-xs text-slate-400">({lessons.length} lessons)</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <Droppable droppableId={module.id} type="lesson">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="p-4 space-y-2 min-h-[50px]">
                              {lessons.map((lesson, index) => (
                                <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded">
                                          {getIcon(lesson.type)}
                                        </div>
                                        <span>{lesson.title}</span>
                                      </div>
                                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                        <Edit2 className="w-4 h-4 text-slate-400" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-dashed text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50"
                                onClick={() => addLesson(module.id)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Lesson
                              </Button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
