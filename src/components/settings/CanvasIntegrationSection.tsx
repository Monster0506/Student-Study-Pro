import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, ClipboardList, Megaphone, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { CanvasImportPreviewTable } from './CanvasImportPreviewTable';
import { CanvasImportSummary } from './CanvasImportSummary';

interface CanvasIntegrationSectionProps {
  canvasUrl: string;
  canvasToken: string;
  isConnected: boolean;
  isPreviewed: boolean;
  importLoading: boolean;
  importError: string | null;
  importPreview: any[];
  onUrlChange: (url: string) => void;
  onTokenChange: (token: string) => void;
  onConnect: () => Promise<void>;
  onPreview: () => Promise<void>;
  onImport: () => Promise<void>;
  onRemovePreviewItem: (idx: number) => void;
  loadingStep: 'idle' | 'connecting' | 'fetching_courses' | 'fetching_assignments' | 'fetching_quizzes' | 'fetching_discussions' | 'fetching_announcements' | 'saving' | 'importing';
}

const typeIcon = (type: string) => {
  if (type === 'assignment') return <FileText className="w-4 h-4 text-green-500 inline-block mr-1" />;
  if (type === 'quiz') return <ClipboardList className="w-4 h-4 text-pink-500 inline-block mr-1" />;
  if (type === 'announcement') return <Megaphone className="w-4 h-4 text-orange-500 inline-block mr-1" />;
  if (type === 'discussion_topic') return <Megaphone className="w-4 h-4 text-purple-500 inline-block mr-1" />;
  return null;
};

export const CanvasIntegrationSection: React.FC<CanvasIntegrationSectionProps> = ({
  canvasUrl,
  canvasToken,
  isConnected,
  isPreviewed,
  importLoading,
  importError,
  importPreview,
  onUrlChange,
  onTokenChange,
  onConnect,
  onPreview,
  onImport,
  onRemovePreviewItem,
  loadingStep,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleConnect = async () => {
    await onConnect();
  };
  const handlePreview = async () => {
    await onPreview();
  };
  const handleImport = async () => {
    await onImport();
    setSuccessMessage('Successfully imported courses and events!');
  };

  const isAnyLoading = importLoading || loadingStep !== 'idle';

  let loadingText = '';
  if (loadingStep === 'connecting') loadingText = 'Connecting to Canvas…';
  else if (loadingStep === 'fetching_courses') loadingText = 'Fetching courses…';
  else if (loadingStep === 'fetching_assignments') loadingText = 'Fetching assignments…';
  else if (loadingStep === 'fetching_quizzes') loadingText = 'Fetching quizzes…';
  else if (loadingStep === 'fetching_discussions') loadingText = 'Fetching discussions…';
  else if (loadingStep === 'fetching_announcements') loadingText = 'Fetching announcements…';
  else if (loadingStep === 'saving') loadingText = 'Saving to your calendar…';
  else if (loadingStep === 'importing') loadingText = 'Importing to your calendar…';

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Canvas Integration</h2>
      <div className="flex flex-col gap-4 max-w-md">
        <Label htmlFor="canvas-url">Canvas URL</Label>
        <Input
          id="canvas-url"
          type="text"
          placeholder="https://schoolname.instructure.com"
          value={canvasUrl}
          onChange={e => onUrlChange(e.target.value)}
          className="w-full"
          disabled={isAnyLoading}
        />
        <Label htmlFor="canvas-token">API Token</Label>
        <Input
          id="canvas-token"
          type="password"
          placeholder="Paste your Canvas API token"
          value={canvasToken}
          onChange={e => onTokenChange(e.target.value)}
          className="w-full"
          disabled={isAnyLoading}
        />
        <Button
          className="w-fit"
          onClick={handleConnect}
          type="button"
          disabled={isAnyLoading || isConnected}
        >
          {isConnected ? 'Connected' : (isAnyLoading && loadingStep === 'connecting') ? (
            <span className="flex items-center"><Loader2 className="animate-spin w-4 h-4 mr-2" />Connecting…</span>
          ) : 'Connect'}
        </Button>
        {isConnected && !isPreviewed && (
          <Button
            className="w-fit bg-green-600 hover:bg-green-700 text-white"
            onClick={handlePreview}
            type="button"
            disabled={isAnyLoading}
          >
            {isAnyLoading && loadingStep === 'fetching_courses' ? (
              <span className="flex items-center"><Loader2 className="animate-spin w-4 h-4 mr-2" />Loading Preview…</span>
            ) : 'Preview Import'}
          </Button>
        )}
        {isConnected && isPreviewed && (
          <Button
            className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleImport}
            type="button"
            disabled={isAnyLoading}
          >
            {isAnyLoading && loadingStep === 'importing' ? (
              <span className="flex items-center"><Loader2 className="animate-spin w-4 h-4 mr-2" />Importing…</span>
            ) : 'Add to My Courses & Calendar'}
          </Button>
        )}
        {isAnyLoading && loadingText && (
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mt-2">
            <Loader2 className="animate-spin w-4 h-4" />
            <span>{loadingText}</span>
          </div>
        )}
        {successMessage && (
          <div className="text-green-600 dark:text-green-400 text-sm mt-2">{successMessage}</div>
        )}
        {importError && <div className="text-destructive text-sm">{importError}</div>}
      </div>
      {/* Import preview/results */}
      {importPreview.length > 0 && (
        <div className="mt-6 bg-muted rounded-lg p-4">
          <CanvasImportPreviewTable
            importPreview={importPreview}
            onRemovePreviewItem={onRemovePreviewItem}
            typeIcon={typeIcon}
          />
          <CanvasImportSummary importPreview={importPreview} />
        </div>
      )}
    </Card>
  );
}; 