import { notFound } from "next/navigation";
import { getOpeningById, getAllOpenings } from "@/lib/openings/service";
import { InteractiveOpeningDetail } from "@/components/openings/InteractiveOpeningDetail";

interface OpeningDetailPageProps {
  params: {
    openingId: string;
  };
}

export function generateStaticParams() {
  const openings = getAllOpenings();
  // Prerender top 100 popular opening slugs statically
  return openings.slice(0, 100).map((op) => ({
    openingId: op.id,
  }));
}

export default function OpeningDetailPage({ params }: OpeningDetailPageProps) {
  const opening = getOpeningById(params.openingId);

  if (!opening) {
    notFound();
  }

  const parentOpening = opening.parentId ? getOpeningById(opening.parentId) : undefined;
  const childrenOpenings = (opening.childrenIds || [])
    .map((id) => getOpeningById(id))
    .filter(Boolean) as typeof opening[];

  return (
    <InteractiveOpeningDetail
      opening={opening}
      parentOpening={parentOpening}
      childrenOpenings={childrenOpenings}
    />
  );
}
