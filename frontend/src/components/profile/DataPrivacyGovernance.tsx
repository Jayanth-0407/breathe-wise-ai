'use client';

import React from 'react';
import { Lock, Download, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DataPrivacyGovernanceProps {
  onExportData: () => void;
  onClearData: () => void;
  downloading: boolean;
}

export function DataPrivacyGovernance({
  onExportData,
  onClearData,
  downloading,
}: DataPrivacyGovernanceProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-forest-600" />
          <CardTitle className="text-sm">Data Privacy & Sovereignty</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 text-xs text-slate-600 leading-relaxed">
        <p>
          BreatheWise AI is built on the principle of <strong>data minimization</strong>. Your health and GPS location data are never sold or shared with third-party advertisers.
        </p>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportData}
            disabled={downloading}
            className="w-full gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> {downloading ? 'Preparing Export...' : 'Export Data (JSON)'}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={onClearData}
            className="w-full gap-1.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Wipe Local Tracking Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
