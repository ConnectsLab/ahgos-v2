'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Star, CheckCircle2 } from 'lucide-react';

interface PublicFeedbackFormProps {
  business: {
    id: number;
    name: string;
  };
  campaign?: {
    id: number;
    name: string;
  };
}

export function PublicFeedbackForm({ business, campaign }: PublicFeedbackFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          campaignId: campaign?.id,
          rating,
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setIsSuccess(true);
      setText('');
    } catch {
      setError(
        'Could not submit your feedback. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-10 px-4 space-y-4 max-w-sm mx-auto">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Thank you!</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your feedback has been received and shared directly with{' '}
          {business.name}.
        </p>
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSuccess(false)}
            className="text-xs"
          >
            Submit another response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          {business.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {campaign ? `How was your experience at ${campaign.name}?` : 'How was your experience?'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition-transform active:scale-95"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30 hover:text-muted-foreground/60'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {rating === 5 && 'Excellent'}
            {rating === 4 && 'Good'}
            {rating === 3 && 'Average'}
            {rating === 2 && 'Poor'}
            {rating === 1 && 'Terrible'}
          </span>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="review-text"
            className="text-sm font-medium text-foreground block"
          >
            Tell us about your experience
          </label>
          <Textarea
            id="review-text"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What went well? What could we improve?"
            disabled={isSubmitting}
            className="resize-none text-base sm:text-sm"
            required
          />
        </div>

        {error && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base sm:text-sm font-medium"
          disabled={isSubmitting || !text.trim()}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <span>Sending feedback...</span>
            </div>
          ) : (
            'Submit feedback'
          )}
        </Button>
      </form>
    </div>
  );
}
