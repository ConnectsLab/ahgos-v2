import { PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import Link from 'next/link';

export function CreateCampaign() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {/* <IconFolderCode /> */}
          <PlusSquare strokeWidth={1.0} />
        </EmptyMedia>
        <EmptyTitle>Welcome</EmptyTitle>
        <EmptyDescription>
          Create your campaign and see what your customers think. ASAP
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button>
          <Link href={'/collect'}>Create Campaign</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
