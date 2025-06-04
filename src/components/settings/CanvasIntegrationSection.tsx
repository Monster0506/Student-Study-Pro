import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, ClipboardList, Megaphone } from 'lucide-react';
import React from 'react';
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
  onConnect: () => void;
  onPreview: () => void;
  onImport: () => void;
  onRemovePreviewItem: (idx: number) => void;
}

const typeIcon = (type: string) => {
  if (type === 'assignment') return <FileText className="w-4 h-4 text-green-500 inline-block mr-1" />;
  if (type === 'quiz') return <ClipboardList className="w-4 h-4 text-pink-500 inline-block mr-1" />;
  if (type === 'announcement') return <Megaphone className="w-4 h-4 text-purple-500 inline-block mr-1" />;
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
}) => {
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
        />
        <Label htmlFor="canvas-token">API Token</Label>
        <Input
          id="canvas-token"
          type="password"
          placeholder="Paste your Canvas API token"
          value={canvasToken}
          onChange={e => onTokenChange(e.target.value)}
          className="w-full"
        />
        <Button
          className="w-fit"
          onClick={onConnect}
          type="button"
          disabled={importLoading || isConnected}
        >
          {isConnected ? 'Connected' : importLoading ? 'Connecting...' : 'Connect'}
        </Button>
        {isConnected && !isPreviewed && (
          <Button
            className="w-fit bg-green-600 hover:bg-green-700 text-white"
            onClick={onPreview}
            type="button"
            disabled={importLoading}
          >
            {importLoading ? 'Loading Preview...' : 'Preview Import'}
          </Button>
        )}
        {isConnected && isPreviewed && (
          <Button
            className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onImport}
            type="button"
            disabled={importLoading}
          >
            {importLoading ? 'Importing...' : 'Add to My Courses & Calendar'}
          </Button>
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