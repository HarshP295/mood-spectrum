import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Admin: React.FC = () => {
  const { state } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [tips, setTips] = useState<Array<{ id: string; title: string; content: string; tags?: string[] }>>([]);
  const [search, setSearch] = useState('');

  const isAdmin = state.user?.role === 'admin';

  const fetchTips = async () => {
    const res = await fetch('/api/tips');
    if (!res.ok) return;
    const data = await res.json();
    setTips(data.items.map((d: any) => ({ id: d._id || d.id, title: d.title, content: d.content, tags: d.tags })));
  };

  useEffect(() => {
    fetchTips();
    // websocket updates
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'tip.created') fetchTips();
        if (msg.type === 'tip.deleted') setTips((prev) => prev.filter((t) => t.id !== msg.payload.id));
        if (msg.type === 'tip.updated') fetchTips();
      } catch {}
    };
    return () => ws.close();
  }, []);

  const filteredTips = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return tips;
    return tips.filter((t) => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || (t.tags || []).some((x) => x.toLowerCase().includes(q)));
  }, [tips, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const token = localStorage.getItem('mindflow_token');
    const res = await fetch('/api/tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        title,
        content,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || 'Failed to create tip');
      return;
    }
    setTitle('');
    setContent('');
    setTags('');
    setMessage('Tip created');
    fetchTips();
  };

  const onDelete = async (id: string) => {
    const token = localStorage.getItem('mindflow_token');
    const res = await fetch(`/api/tips/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    if (!res.ok) return;
    setTips((prev) => prev.filter((t) => t.id !== id));
  };

  if (!state.isAuthenticated) return <div style={{ padding: 16 }}>Please login.</div>;
  if (!isAdmin) return <div style={{ padding: 16 }}>Forbidden. Admins only.</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 960, margin: '0 auto' }}>
        <Card>
          <CardHeader>
            <CardTitle>Create Wellness Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={6} />
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="submit">Create</Button>
                {message && <span>{message}</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ marginBottom: 12 }}>
              <Input placeholder="Search tips" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTips.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</TableCell>
                      <TableCell>{(t.tags || []).join(', ')}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {/* For brevity, only delete is implemented in UI now */}
                          <Button variant="destructive" onClick={() => onDelete(t.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>No tips found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;


