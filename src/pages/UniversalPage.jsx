import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Trash2, CornerDownRight, Loader2, Database } from 'lucide-react';
import { getEntityDefinition } from '@/components/api/entityRegistry';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import AutoForm from '@/components/ui/AutoForm';
import EmptyState from '@/components/ui/EmptyState';

export default function UniversalPage() {
  const { pageName } = useParams();
  
  // Normalize page name to entity key
  const entityKey = pageName ? pageName.replace(/-./g, x => x[1].toUpperCase()).replace(/^./, x => x.toUpperCase()) : 'Dashboard';
  const def = getEntityDefinition(entityKey);
  
  const [items, setItems] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await db.list(entityKey);
      setItems(data || []);
    } catch (e) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [entityKey]);

  const handleCreate = async (data) => {
    try {
      await db.create(entityKey, data);
      setIsDialogOpen(false);
      await refresh();
      toast.success(`${def.label} created`);
    } catch (e) {
      toast.error('Creation failed: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await db.delete(entityKey, id);
        await refresh();
        toast.success('Deleted');
      } catch {
        toast.error('Deletion failed');
      }
    }
  };

  const CreateButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create {def.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New {def.label}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AutoForm schema={def.schema} onSubmit={handleCreate} />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageShell title={def.label} subtitle={`Manage ${def.label}s`}>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={`Search ${def.label}s...`} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          {CreateButton}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
          <p className="text-slate-500 text-sm">Loading {def.label.toLowerCase()} data...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState 
          icon={def.icon ? (require('lucide-react')[def.icon] || Database) : Database}
          title={`No ${def.label}s found`}
          description={`Get started by creating your first ${def.label.toLowerCase()}.`}
          action={CreateButton}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  {def.listFields.map(f => (
                    <th key={f} className="px-6 py-3 font-medium capitalize">{f.replace(/_/g, ' ')}</th>
                  ))}
                  {def.relationships && <th className="px-6 py-3 font-medium">Relationships</th>}
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 group">
                    {def.listFields.map(f => (
                      <td key={f} className="px-6 py-4">
                        {typeof item[f] === 'boolean' ? (
                          <Badge variant={item[f] ? 'default' : 'secondary'}>{item[f] ? 'Yes' : 'No'}</Badge>
                        ) : (
                          item[f] || '-'
                        )}
                      </td>
                    ))}
                    
                    {def.relationships && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {def.relationships.map(rel => (
                            <Button key={rel.target} variant="outline" size="sm" asChild>
                              <Link to={`/admin/${rel.target.toLowerCase()}`}>
                                <CornerDownRight className="h-3 w-3 mr-1" />
                                {rel.label}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
