'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';

export default function AskQuestionPage() {
  const [review, setReview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit() {
    if (!review.trim() || isProcessing) return;

    setIsProcessing(true);
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
    } catch (e) {
      console.error(e);
      // optionally show an error toast here
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="lg:w-1/2 sm:w-[90%] sm:p-2 mx-auto space-y-2">
        <p>What Do you think of our Product ?</p>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          disabled={isProcessing}
        />
        <Button
          className="h-11 w-full"
          onClick={handleSubmit}
          disabled={isProcessing || review.trim().length === 0}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Spinner />
              Sending Review ...
            </div>
          ) : (
            'Send Review'
          )}
        </Button>
      </div>
    </div>
  );
}
