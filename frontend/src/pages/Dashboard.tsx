import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Upload, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWeb3Contract } from '@/hooks/useWeb3Contract';
import { storageService, type StoredAttachment } from '@/services/storageService';

const CATEGORIES = [
  { label: 'Fire', value: 0 },
  { label: 'Medical', value: 1 },
  { label: 'Flood', value: 2 },
  { label: 'Crime', value: 3 },
  { label: 'Other', value: 4 },
];

const SEVERITIES = [
  { label: 'Low', value: 0 },
  { label: 'Medium', value: 1 },
  { label: 'High', value: 2 },
  { label: 'Critical', value: 3 },
];

export default function Dashboard() {
  const { connectWallet, isConnected, userAddress, createIncident } = useWeb3Contract();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<number>(CATEGORIES[0].value);
  const [severity, setSeverity] = useState<number>(SEVERITIES[1].value);
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<StoredAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'incidents'>('report');

  const preview = useMemo(() =>
    files.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/'),
    })),
  [files]);

  useEffect(() => {
    // Attempt geolocation for convenience
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => {}
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files).slice(0, 10) : [];
    setFiles(list);
  };

  const handleUpload = async () => {
    if (!files.length) return [] as StoredAttachment[];
    const uploaded = await storageService.uploadFiles(files);
    setAttachments(uploaded);
    return uploaded;
  };

  const submitIncident = async () => {
    if (!isConnected) {
      await connectWallet();
    }
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const uploaded = await handleUpload();
      await createIncident(title.trim(), description.trim(), category, severity, lat || 0, lng || 0);
      // For demo: show attachments locally; on-chain stores core incident, off-chain stores media
      setAttachments(uploaded);
      setActiveTab('incidents');
      setTitle('');
      setDescription('');
      setFiles([]);
    } catch (err) {
      console.error('Failed to submit incident', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-500" />
            Community Emergency Coordination Dashboard
          </CardTitle>
          <CardDescription>
            Contract: 0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isConnected ? (
                <>Connected: {userAddress}</>
              ) : (
                <>Wallet not connected</>
              )}
            </div>
            {!isConnected && (
              <Button size="sm" onClick={() => connectWallet()}>Connect Wallet</Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant={activeTab === 'report' ? 'default' : 'outline'} onClick={() => setActiveTab('report')}>Report Incident</Button>
            <Button variant={activeTab === 'incidents' ? 'default' : 'outline'} onClick={() => setActiveTab('incidents')}>View Incidents</Button>
          </div>

          {activeTab === 'report' && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Fire at Elm Street" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Add details..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <select className="h-10 rounded-md border border-slate-300 bg-white px-3" value={category} onChange={(e) => setCategory(Number(e.target.value))}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Severity</Label>
                  <select className="h-10 rounded-md border border-slate-300 bg-white px-3" value={severity} onChange={(e) => setSeverity(Number(e.target.value))}>
                    {SEVERITIES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <div className="flex gap-2">
                    <Input type="number" step="0.000001" placeholder="Lat" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
                    <Input type="number" step="0.000001" placeholder="Lng" value={lng} onChange={(e) => setLng(Number(e.target.value))} />
                    <Button variant="outline" type="button" onClick={() => navigator.geolocation?.getCurrentPosition((pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); })}>
                      <MapPin className="mr-2 h-4 w-4" /> Use My Location
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Attachments (images/videos)</Label>
                <Input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
                {preview.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {preview.map((att) => (
                      <div key={att.url} className="border rounded p-2">
                        <div className="text-xs mb-1 truncate">{att.name}</div>
                        {att.isVideo ? (
                          <div className="text-xs text-muted-foreground bg-slate-100 rounded p-6 text-center">Video selected</div>
                        ) : (
                          <img src={att.url} alt={att.name} className="h-24 w-full object-cover rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={submitIncident} disabled={submitting}>
                  <Upload className="mr-2 h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="grid gap-4">
              <div className="rounded border p-4">
                <div className="text-sm text-muted-foreground">Recent attachments (local preview / IPFS if configured)</div>
                {attachments.length === 0 ? (
                  <div className="text-sm mt-2">No attachments yet.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {attachments.map((att) => (
                      <div key={att.url} className="border rounded p-2">
                        <div className="text-xs mb-1 truncate">{att.name}</div>
                        {att.isVideo ? (
                          <a href={att.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600">Open video</a>
                        ) : (
                          <img src={att.url} alt={att.name} className="h-24 w-full object-cover rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
