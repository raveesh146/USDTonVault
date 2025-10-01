import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EpochSummary, ProofBundle } from '@/types/vault';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProofDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epoch: EpochSummary | null;
  proofData?: ProofBundle;
}

export function ProofDetailDrawer({ open, onOpenChange, epoch, proofData }: ProofDetailDrawerProps) {
  if (!epoch) return null;

  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
    VERIFIED: { icon: CheckCircle2, color: 'text-success', label: 'Verified' },
    REJECTED: { icon: XCircle, color: 'text-destructive', label: 'Rejected' },
  };

  const config = statusConfig[epoch.status];
  const Icon = config.icon;

  // Mock proof data if not provided
  const displayProof = proofData || {
    epochId: epoch.epochId,
    publicInputs: {
      vaultAddress: 'EQCvaultaddress...',
      epochId: epoch.epochId,
      startNav: '950000.00',
      endNav: '1050000.00',
      pnlPct: epoch.pnlPct,
      timestamp: Date.now(),
    },
    proof: {
      a: ['0x1234...', '0x5678...'],
      b: [['0xabcd...', '0xefgh...'], ['0xijkl...', '0xmnop...']],
      c: ['0xqrst...', '0xuvwx...'],
    },
    proofHash: epoch.proofTx || '0xmockhash...',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Epoch #{epoch.epochId} Proof</SheetTitle>
          <SheetDescription>
            Zero-knowledge proof verification details
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="outline" className="gap-1">
              <Icon className={cn("w-3 h-3", config.color)} />
              {config.label}
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Public Inputs</h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {Object.entries(displayProof.publicInputs).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-mono">{typeof value === 'number' ? value : String(value).slice(0, 20)}...</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Proof Hash</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-mono break-all">{displayProof.proofHash}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Proof Components</h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Component A</span>
                <pre className="text-xs font-mono mt-1 overflow-x-auto">
                  {JSON.stringify(displayProof.proof.a, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Component C</span>
                <pre className="text-xs font-mono mt-1 overflow-x-auto">
                  {JSON.stringify(displayProof.proof.c, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {epoch.proofTx && (
            <div>
              <h4 className="text-sm font-medium mb-3">Transaction</h4>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-mono break-all">{epoch.proofTx}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
