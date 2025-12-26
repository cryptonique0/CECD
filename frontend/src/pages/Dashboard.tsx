import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Upload, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWeb3Contract } from '@/hooks/useWeb3Contract';
import { storageService, type StoredAttachment } from '@/services/storageService';
import { contractService } from '@/services/contractService';

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

type OnChainIncident = {
  id: number;
  title: string;
  description: string;
  category: number;
  severity: number;
  latitude: number;
  longitude: number;
  reportedBy: string;
  createdAt: number;
  attachments?: StoredAttachment[];
};

export default function Dashboard() {
  const { connectWallet, isConnected, userAddress, createIncident } = useWeb3Contract();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<number>(CATEGORIES[0].value);
  const [severity, setSeverity] = useState<number>(SEVERITIES[1].value);
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'incidents'>('report');
  const [incidents, setIncidents] = useState<OnChainIncident[]>([]);
  const [loading, setLoading] = useState(false);

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

  const fetchIncidents = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const incidentIds = await contractService.getAllIncidents();
      const attachmentsMap = await storageService.getAllAttachments();
      
      const fetchedIncidents = await Promise.all(
        incidentIds.map(async (id: bigint) => {
          const incident = await contractService.getIncident(Number(id));
          const attachments = attachmentsMap.get(id.toString()) || [];
          return {
            id: Number(incident.id),
            title: incident.title,
            description: incident.description,
            category: incident.category,
            severity: incident.severity,
            latitude: Number(incident.latitude) / 1e6,
            longitude: Number(incident.longitude) / 1e6,
            reportedBy: incident.reportedBy,
            createdAt: Number(incident.createdAt),
            attachments,
          };
        })
      );

      setIncidents(fetchedIncidents.reverse()); // Most recent first
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'incidents' && isConnected) {
      fetchIncidents();
    }
  }, [activeTab, isConnected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files).slice(0, 10) : [];
    setFiles(list);
  };

  const submitIncident = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      // Create incident on-chain first to get the ID
      const tx = await createIncident(title.trim(), description.trim(), category, severity, lat || 0, lng || 0);
      
      // Extract incident ID from transaction receipt (assuming it's emitted in an event)
      // For now, we'll use a timestamp-based ID as fallback
      const tempId = Date.now().toString();
      
      // Upload files and store in IndexedDB with incident ID
      if (files.length > 0) {
        await storageService.uploadFiles(files, tempId);
      }
      
      setActiveTab('incidents');
      setTitle('');
      setDescription('');
      setFiles([]);
      
      // Refresh incidents list
      await fetchIncidents();
    } catch (err) {
      console.error('Failed to submit incident', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (value: number) => CATEGORIES.find(c => c.value === value)?.label || 'Unknown';
  const getSeverityLabel = (value: number) => SEVERITIES.find(s => s.value === value)?.label || 'Unknown';
  const getSeverityColor = (value: number) => {
    switch (value) {
      case 3: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 1: return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.000001" placeholder="Latitude" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="flex-1" />
                  <Input type="number" step="0.000001" placeholder="Longitude" value={lng} onChange={(e) => setLng(Number(e.target.value))} className="flex-1" />
                  <Button variant="outline" size="sm" type="button" onClick={() => navigator.geolocation?.getCurrentPosition((pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); })}>
                    <MapPin className="h-4 w-4" />
                  </Button>
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
                          <div className="text-xs text-muted-foreground bg-slate-100 rounded p-6 text-center">Video</div>
                        ) : (
                          <img src={att.url} alt={att.name} className="h-24 w-full object-cover rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={submitIncident} disabled={submitting || !isConnected}>
                  <Upload className="mr-2 h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">On-Chain Incidents</h3>
                <Button variant="outline" size="sm" onClick={fetchIncidents} disabled={loading || !isConnected}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {!isConnected ? (
                <div className="text-center py-8 text-muted-foreground">
                  Connect your wallet to view incidents
                </div>
              ) : loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading incidents...
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No incidents found on-chain
                </div>
              ) : (
                <div className="grid gap-4">
                  {incidents.map((incident) => (
                    <Card key={incident.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <Badge className={`${getSeverityColor(incident.severity)} text-white`}>
                            {getSeverityLabel(incident.severity)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {incident.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 text-sm">
                          <div className="flex gap-4">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-medium">{getCategoryLabel(incident.category)}</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-mono text-xs">{incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-muted-foreground">Reported by:</span>
                            <span className="font-mono text-xs">{incident.reportedBy.slice(0, 6)}...{incident.reportedBy.slice(-4)}</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-muted-foreground">Created:</span>
                            <span>{new Date(incident.createdAt * 1000).toLocaleString()}</span>
                          </div>

                          {incident.attachments && incident.attachments.length > 0 && (
                            <div className="mt-4">
                              <div className="text-sm font-medium mb-2">Attachments</div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {incident.attachments.map((att, idx) => (
                                  <div key={idx} className="border rounded p-2">
                                    <div className="text-xs mb-1 truncate">{att.name}</div>
                                    {att.isVideo ? (
                                      <a href={att.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                        Open video
                                      </a>
                                    ) : (
                                      <img src={att.url} alt={att.name} className="h-20 w-full object-cover rounded" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
