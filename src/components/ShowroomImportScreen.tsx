import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  ArrowLeft,
  Upload,
  FileText,
  Download,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShowroomImportScreenProps {
  onBack: () => void;
  onImportComplete: () => void;
}

export default function ShowroomImportScreen({
  onBack,
  onImportComplete
}: ShowroomImportScreenProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      toast.success(`Successfully imported products from ${file.name}`);
      onImportComplete();
    }, 2000);
  };

  const downloadTemplate = () => {
    toast.info('Template download started');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Top App Bar */}
      <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant">
        <div className="flex items-center h-16 px-4">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <h1 className="title-large text-on-surface flex-1">
            Import products
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Instructions */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
          <h2 className="title-medium text-on-surface mb-4">Before you start</h2>
          <ol className="space-y-2 body-medium text-on-surface-variant">
            <li className="flex gap-2">
              <span>1.</span>
              <span>Download the CSV/XLSX template with required fields</span>
            </li>
            <li className="flex gap-2">
              <span>2.</span>
              <span>Fill in your product data (SKU, title, price, MOQ, etc.)</span>
            </li>
            <li className="flex gap-2">
              <span>3.</span>
              <span>Upload the file and validate the data</span>
            </li>
            <li className="flex gap-2">
              <span>4.</span>
              <span>Review and publish your products</span>
            </li>
          </ol>
        </div>

        {/* Download Template */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-on-primary-container" />
            </div>
            <div className="flex-1">
              <h3 className="title-small text-on-surface mb-1">Product import template</h3>
              <p className="body-small text-on-surface-variant mb-4">
                Download the template with all required fields and formatting guidelines
              </p>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="border-outline hover:bg-surface-container-high"
              >
                <Download className="w-4 h-4 mr-2" />
                Download template
              </Button>
            </div>
          </div>
        </div>

        {/* Upload File */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
          <h3 className="title-small text-on-surface mb-4">Upload your file</h3>
          
          <div className="border-2 border-dashed border-outline rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-tertiary">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="body-medium">{file.name}</span>
                  </div>
                  <p className="body-small text-on-surface-variant">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="body-medium text-on-surface mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="body-small text-on-surface-variant">
                    CSV or XLSX files only
                  </p>
                </div>
              )}
            </label>
          </div>

          {file && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 bg-primary text-on-primary"
              >
                {isUploading ? 'Uploading...' : 'Upload and validate'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFile(null)}
                disabled={isUploading}
                className="border-outline"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* API Connection (Future) */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-6 opacity-50">
          <h3 className="title-small text-on-surface mb-2">API connection</h3>
          <p className="body-small text-on-surface-variant mb-4">
            Connect your e-commerce platform or ERP system for automatic syncing
          </p>
          <Button variant="outline" disabled className="border-outline">
            Coming soon
          </Button>
        </div>
      </div>
    </div>
  );
}
