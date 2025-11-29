import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useReportIncident, useSuggestIncidentTags } from '../hooks/useQueries';
import { IncidentCategory, IncidentSeverity, ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { AlertCircle, Upload, X, Sparkles, Loader2, Languages } from 'lucide-react';
import { translateToEnglish, needsTranslation } from '../lib/translation';

export default function ReportIncidentDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>(IncidentCategory.hazard);
  const [severity, setSeverity] = useState<IncidentSeverity>(IncidentSeverity.medium);
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    severity: string;
    confidence: number;
  } | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    original: string;
    translated: string;
    language: string;
    confidence: number;
  } | null>(null);

  const reportIncident = useReportIncident();
  const suggestTags = useSuggestIncidentTags();

  // Auto-translate and suggest tags when description changes
  useEffect(() => {
    if (description.trim().length > 20) {
      const timer = setTimeout(() => {
        handleAutoTranslateAndSuggest();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setTranslationResult(null);
    }
  }, [description]);

  const handleAutoTranslateAndSuggest = async () => {
    if (!description.trim()) return;

    let textToAnalyze = description.trim();

    // Check if translation is needed
    if (needsTranslation(description)) {
      const result = translateToEnglish(description);
      setTranslationResult({
        original: description,
        translated: result.translatedText,
        language: result.detectedLanguage,
        confidence: result.confidence,
      });
      textToAnalyze = result.translatedText;
    } else {
      setTranslationResult(null);
    }

    // Get AI suggestions based on (possibly translated) text
    try {
      const result = await suggestTags.mutateAsync({
        description: textToAnalyze,
        imageHash: imageFile ? 'image-hash' : null,
      });

      setAiSuggestion({
        category: result.category,
        severity: result.severity,
        confidence: Number(result.confidence),
      });
      setShowAiSuggestion(true);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;

    // Map AI suggestion to enum values
    const categoryMap: Record<string, IncidentCategory> = {
      fire: IncidentCategory.fire,
      medical: IncidentCategory.medical,
      theft: IncidentCategory.theft,
      flooding: IncidentCategory.flooding,
      hazard: IncidentCategory.hazard,
      kidnapping: IncidentCategory.kidnapping,
      publicHealth: IncidentCategory.publicHealth,
      security: IncidentCategory.security,
    };

    const severityMap: Record<string, IncidentSeverity> = {
      low: IncidentSeverity.low,
      medium: IncidentSeverity.medium,
      high: IncidentSeverity.high,
      critical: IncidentSeverity.critical,
    };

    if (categoryMap[aiSuggestion.category]) {
      setCategory(categoryMap[aiSuggestion.category]);
    }
    if (severityMap[aiSuggestion.severity]) {
      setSeverity(severityMap[aiSuggestion.severity]);
    }

    toast.success('AI suggestions applied');
    setShowAiSuggestion(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Trigger AI suggestion when image is uploaded
      if (description.trim()) {
        handleAutoTranslateAndSuggest();
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let imageBlob: ExternalBlob | null = null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array);
      }

      // Use translated description if available
      const finalDescription = translationResult?.translated || description.trim();

      await reportIncident.mutateAsync({
        title: title.trim(),
        description: finalDescription,
        category,
        severity,
        location: location.trim(),
        image: imageBlob,
        isAnonymous,
      });

      toast.success('Incident reported successfully');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to report incident');
      console.error(error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(IncidentCategory.hazard);
    setSeverity(IncidentSeverity.medium);
    setLocation('');
    setIsAnonymous(false);
    setImageFile(null);
    setImagePreview(null);
    setAiSuggestion(null);
    setShowAiSuggestion(false);
    setTranslationResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-destructive to-chart-1">
          <AlertCircle className="mr-2 h-5 w-5" />
          Report Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report New Incident</DialogTitle>
          <DialogDescription>
            Provide details about the emergency or incident you're reporting. Supports Yoruba, Hausa, and Igbo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Incident Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the incident"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information (English, Yoruba, Hausa, or Igbo)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
            {suggestTags.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI analyzing your description...</span>
              </div>
            )}
          </div>

          {translationResult && (
            <div className="p-4 rounded-lg border border-chart-3 bg-chart-3/10 space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-chart-3" />
                <span className="text-sm font-semibold">Auto-Translation Detected</span>
                <Badge variant="secondary" className="text-xs capitalize">
                  {translationResult.language} → English
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {translationResult.confidence}% confidence
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  <span className="font-medium">Translated:</span> {translationResult.translated}
                </p>
              </div>
            </div>
          )}

          {showAiSuggestion && aiSuggestion && (
            <div className="p-4 rounded-lg border border-chart-1 bg-chart-1/10 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-chart-1" />
                <span className="text-sm font-semibold">AI Severity Assessment</span>
                <Badge variant="secondary" className="text-xs">
                  {aiSuggestion.confidence}% confidence
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Suggested Category:</span>{' '}
                  <span className="capitalize">{aiSuggestion.category}</span>
                </p>
                <p>
                  <span className="font-medium">Suggested Severity:</span>{' '}
                  <span className="capitalize">{aiSuggestion.severity}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={applyAiSuggestion}
                  className="bg-chart-1"
                >
                  Apply Suggestion
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAiSuggestion(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as IncidentCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IncidentCategory.fire}>Fire</SelectItem>
                  <SelectItem value={IncidentCategory.medical}>Medical</SelectItem>
                  <SelectItem value={IncidentCategory.theft}>Theft</SelectItem>
                  <SelectItem value={IncidentCategory.flooding}>Flooding</SelectItem>
                  <SelectItem value={IncidentCategory.hazard}>Hazard</SelectItem>
                  <SelectItem value={IncidentCategory.kidnapping}>Kidnapping</SelectItem>
                  <SelectItem value={IncidentCategory.publicHealth}>Public Health</SelectItem>
                  <SelectItem value={IncidentCategory.security}>Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select value={severity} onValueChange={(value) => setSeverity(value as IncidentSeverity)}>
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IncidentSeverity.low}>Low</SelectItem>
                  <SelectItem value={IncidentSeverity.medium}>Medium</SelectItem>
                  <SelectItem value={IncidentSeverity.high}>High</SelectItem>
                  <SelectItem value={IncidentSeverity.critical}>Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Lagos, Abuja, Kano"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Evidence Image (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="image" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Click to upload an image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous">Anonymous Report (Whisper Mode)</Label>
              <p className="text-xs text-muted-foreground">
                Your identity will not be visible to others
              </p>
            </div>
            <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reportIncident.isPending}
              className="bg-gradient-to-r from-destructive to-chart-1"
            >
              {reportIncident.isPending ? 'Reporting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

