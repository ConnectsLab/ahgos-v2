import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function getSentimentBadge(sentiment: string | null) {
  if (!sentiment) return null;

  switch (sentiment) {
    case 'positive':
      return <Badge variant="success">Positive</Badge>;
    case 'negative':
      return <Badge variant="destructive">Negative</Badge>;
    case 'neutral':
      return <Badge variant="neutral">Neutral</Badge>;
    case 'mixed':
      return <Badge variant="warning">Mixed</Badge>;
    default:
      return <Badge variant="default">{sentiment}</Badge>;
  }
}

export function getStatusBadge(status: 'DONE' | 'PENDING' | 'FAILED') {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="info" className="gap-1">
          <Clock className="h-3 w-3 animate-spin" />
          <span>Analyzing...</span>
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Analysis failed</span>
        </Badge>
      );
    case 'DONE':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Analyzed</span>
        </Badge>
      );
  }
}
