import { MOCK_CAMPAIGNS } from "@/data/mockData";
import { CampaignDetailClient } from "./CampaignDetailClient";
import type { Metadata } from "next";

export function generateStaticParams() {
  return MOCK_CAMPAIGNS.map((c) => ({
    id: c.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id || c.slug === id);
  if (!campaign) return { title: "Campaign Not Found" };
  return {
    title: `${campaign.title} | CampusHub Campaigns`,
    description: campaign.summary,
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDetailClient id={id} />;
}
