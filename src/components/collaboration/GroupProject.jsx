import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupProject({ project, teamMembers, onJoinTeam, userEmail }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  const teams = project?.teams || [];
  const userTeam = teams.find(t => t.members?.includes(userEmail));

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Group Project: {project?.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-purple-50 rounded-xl">
          <h4 className="font-bold text-slate-900 mb-2">Project Overview</h4>
          <p className="text-slate-700 mb-3">{project?.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Teams of {project?.team_size} students
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Due: {new Date(project?.due_date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {userTeam ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-900">You're on Team {userTeam.name}</span>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-slate-900 text-sm">Team Members:</div>
              {userTeam.members?.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {member[0]}
                  </div>
                  <span className="text-sm text-slate-700">{member}</span>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl">
              Go to Team Workspace
            </Button>
          </div>
        ) : (
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Available Teams</h4>
            <div className="space-y-3">
              {teams.filter(t => (t.members?.length || 0) < project?.team_size).map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{team.name}</div>
                      <div className="text-sm text-slate-600">
                        {team.members?.length || 0}/{project?.team_size} members
                      </div>
                    </div>
                    <Button
                      onClick={() => onJoinTeam?.(team.id)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
                    >
                      Join Team
                    </Button>
                  </div>
                </motion.div>
              ))}

              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => onJoinTeam?.('new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}