'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function AskQuestionPage() {
  const [review, setReview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!review.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: 5, text: review }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await response.json();
      setReview('');
      setIsSubmitted(true);
    } catch {
      setError(
        'Could not send review. Please check your connection and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
        <div className="max-w-sm w-full mx-auto text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Thank you!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your review has been received. Thank you for taking the time to
            share your thoughts.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitted(false)}
              className="text-xs"
            >
              Submit another review
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="lg:w-1/2 sm:w-[90%] sm:p-2 mx-auto space-y-3">
        <p className="text-base font-medium">
          What do you think of our product?
        </p>
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
            {error}
          </p>
        )}
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          disabled={isProcessing}
          placeholder="Write your review here..."
        />
        <Button
          className="h-11 w-full"
          onClick={handleSubmit}
          disabled={isProcessing || review.trim().length === 0}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Spinner />
              Sending Review...
            </div>
          ) : (
            'Send Review'
          )}
        </Button>
      </div>
    </div>
  );
}
