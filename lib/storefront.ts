import { getPool } from "@/lib/db";
import type { StoreProduct } from "@/components/store/store-grid";
import { cacheLife, cacheTag } from "next/cache";

export type StoreEventTier = {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  sold: number;
  perks: string[] | null;
};

export type StoreEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  venue: string | null;
  category: string | null;
  start_at: string | null;
  end_at: string | null;
  capacity: number;
  imageUrl: string;
  tiers: StoreEventTier[];
};

export type StorefrontData = {
  org: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    currency: string;
  };
  products: StoreProduct[];
  events: StoreEvent[];
};

export const STITCH_EVENT_IMAGES: Record<string, string> = {
  "innovation-week-2026":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCkGKgKw6VSLV0diILC4W0PfrGA6B9tq3jZvcSkvYE9S-VMbx9vHq9gLKNJFuehPV1U14V8WZ88g0iA-NYbFxes0na0xc1rWe48QTJbfLihpw0Uig8fud1sKPutN7SWTPsgSBON6fsK7fJPkVv8CHMssuaagJUbhC5WMd_qjetlBZ5sZACYCxY6gcvav64SCCvwYRwz5WwLtJZpezsCBAACb_vysbBhFVM8GQepBVJF",
  "hack-the-campus-48h":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBX0_sC-dBDNzTjGeMvufMkk8Qg4WCPEPsmdaK5iRrCO-8z86fjhpzEVkuy7Gj7kT7qQ8-3WEfilcspSo_Uz3Zv7-Gfw6izdmC8wl86RyHShaaOH2_SrPzBq4msM5CtHppM38HmdR69cueX_91mXhTqcQr9gE7ELh1pXl4IRsMDYso5hu9xNIlmrqeoSiPrxLZKpiII6JXtdD2DmQ79_SZU2E83M-ka5ILxlIobnOwT",
  "ai-ml-bootcamp":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDIPnnJOUxuHtxBaAWqdc6D93UZ9eJ9rcbZK_lBiyj2jGcF92Zp2TtpviuATHuZwSkn6qFA5lNlKVNO79FwkV13w0VoN4siz_KgZZXQpt3BzQmZRpBIOoBnd3HfJB6TAcvBCd3w-F1ZoPIYz9RnbwQ7hERL4UnsXS_fnR58f25BGnNO2KLF2sWOIvsnEJRU_cMqevtsnz7WmPvF8RHBKgMj6f01uEH5Copxxsx97S__",
  "startup-career-fair":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD0B52QC0MXKLYsgDYceb5ZlJ3LwKx8vxRjsPNEyTqZywg54BlqLkIV66RMBjQ6Pyf0_pIwKirQjVQQI7akm96YiJsISqXiTT1ZlpS44QylONJFRaDPn6EGb_8dtxpKrjGzmAqj6v_rnL05ckQb-muRqQpE78oj4b89iuHLIZxSEh_0SyJYf0fRuBPp1DsHbc4X5c9TCLYzEePP-S5IhWPdbPeP0fJwvq_71mjlcBI6",
  "cybersecurity-night":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBfg4nSH4ImbNw_beLGvmzVsh5puf-o_2gDfLVVimRL3fzDc2tLc_kX1Fyoe8LeqYN0ySRi8PCcIotw5FhDHtNUt3sFGBG1oVAiJ17xr2jzPwsDnJlBHTup78L3WeO6czQ92PGk-HNWvfD2M0G29DJW6W7Eq0lC3cvvbPkj9wEPO1A2eSZGH7xFW3m32d7dPvRxZ_evOWAuJ4obMJPmVwhsisEumYwJu0f_Rf8Q5UPO",
};

export const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  "tee-navy":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCZoqsNaO5Ex0N6IVf_qkLrMqYjQYpS9fQZd7UOjq6jxmBrFEwyD8YUXaDodlsuiFKADPYe9GJnBXIutDmIQ3YU64oOvxrol49FWL3XBF93KmZo4IRRVyC-yuPm7VfE9ZBFgWQjphAQyGmDuGTVo15bSKE53aAIWtkdn-fOcrvYv8HdCAgpGFJoFyQ5dEPX1xCh19GgEcZOsW4rcVARrn93fx4OpxqUL_cjuPyiCmoO",
  "tee-teal":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWgdgBNZAglNUgA4NfljycnAMlSIV439BpXAkAU4H1n1Pb8nm0uXu03hOELtZSWS2xFFV97Ev-sqgYY_Vv9xVv8EGfI0-fAQ4kqKTlCSdAyMx619n311WmaMzMlvaCnZfYxc52v_1fh55E-Ke14GMK7M-NjLw1OSpEeJtmIa9cW9dk38lUcdJpbXdf_sSeb5amGsfJL_SHrdthsW1dYr9P8jWCysYwGhiMiEER_Ehl",
  "hoodie-midnight":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBONDIJOCIm1jFOr9QdvzBv29vbS8tn1Pai5hmfAk2sx2uu58dydkk-138wEQzSgv6M0iTycK8cowKCBp5Hbs0PAapK4jVgfUZvzY81eDZxIBXcBtDhQ-3BxvWQ9MJqKl57jDBK81xbO_sad_e64LjxgQLiIiR3i0M1P7KVA9FikrgUG7zqSJ5qcEkldg2GXYRQ0kI-9dSYeSi1pJQl6qr0ofsmRR1InF9iW83odl_A",
  "sticker-pack":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDD_2YTpJx99AsnOecnGehlcpmmVfxkczvNDIycmJE9GbvAqccUwy5dMpxRCv_tB-Kt_CyAxL3P4syHNjq_FuRIX5uw8vPMBq7xyHQDL0je0NY2masYRF6HD23A0ThNsxBKkRVMi3SwZXyIR9u9-QxsQ6CXXyy_McPjPFBAm_vh74VGKaY0x5Xu5XouFZp4GOvsY815n7Tw3hwfrxhMV2JUWONgkusvbcut--SzP60C",
  "pin-rocket":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2S_NAZYf91_23nGKR1lgk7wuNb1Jf4R9SSitfZftXGqRxLmsmvXTD8wJQwVfQqG87XtnIYRryRis61bPiYuqHbiRGtJWTs-d4K0kHSiNIVZ4Z0Rj4sRMUcW_jqUaz30cmh6zC37lyqpum35h7QZwWwek3CzTGAY5szKrZ31UsBl3QJsTzPRjg-705mpdx4qDr0EnpPDCpmQ5wpzbOJBxwsArG4m3ZSUP7v1vaNiD2",
  "notebook-dotgrid":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCD0E0_i8ge6BkDxFl3QzbA6OttXNAYbAapvTJFfr7N_tjJob_1JK23MB7zQVHgpDsl2UFwzs1PNF0Jqg1HJLSOrAfhiaYpXtTdXRiUnLqTjWASr73tEpzz1wZ0BdtZUCUmyHTcPw0kvze1RxQX7kX4HIYYAqfVQ3DgORw2Ay_KGbLcpHow7zEf7YJMrEabNbYuLcUMDjyL9GofYJ449Uca0FpPpNvAE6yHfhlCBfRA",
  "tote-canvas":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhwGBAmx0qVOA9hWsPi2LaYs5_qQg89KyZzDDkoEj7gxZ9j61AFBXfiTUlkN55DVFf5K9R7wdqfIg5oU_Q_tuvI8hy-xEElULcqoZNw4JEv-IpOXAkpJ5R_oUzOX8E_8qTx_K5hgK61l27ynj2RNci6A48PpoyvOdHSTsQ1wdSN9gtEDfkVShY7oivDbiZYR1xLOpimqpof3zJiaHn0CP6v9kaCSSWeMs3b83EuTuq",
  "bottle-750":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDi0rI0hkm4ObQPP6bZ8RRp4h2EuNd7OtQro7xzq12KEf0vDNXvCS8wHPs8br6NfsaVIBYgqcP9JnUdIFXf2qCczzeiJxnzrLzJd2IHYKC1-SiQV8BK2rN2IhocSP12V93SlH_vIs8azHJzoiXYVZohp70sWsRbN479HmxDc_PIaelq1dHDEG2rODtRz162pVYJkXPkp4WnSwMn3BSbTbpNd8GzsLSUA4hMxA9_8Q_u",
};

export function resolveProductImage(p: {
  slug: string;
  images?: string[] | null;
}): string {
  return (
    p.images?.[0] ||
    DEFAULT_PRODUCT_IMAGES[p.slug] ||
    DEFAULT_PRODUCT_IMAGES["hoodie-midnight"]
  );
}

export const CAMPUS_SOCIETIES = [
  {
    slug: "tech-society",
    name: "Tech Society",
    faculty: "Faculty of Computer Science & Engineering",
    badge: "Tier 1 Society",
    badgeTone: "teal" as const,
    icon: "terminal",
    members: 480,
    eventsCount: 6,
    merchCount: 12,
    description:
      "Flagship student technology body organizing Innovation Week 2026, 48-hour hackathons, applied machine learning bootcamps, and open-source developer sprints.",
    highlights: [
      "PayPal Orders v2 verified bursary account",
      "Host of Hack the Campus 48h & Innovation Week",
      "12 official licensed apparel & tech gear SKUs",
    ],
  },
  {
    slug: "design-guild",
    name: "Design & Multimedia Guild",
    faculty: "School of Creative Media & Design",
    badge: "Creative Partner",
    badgeTone: "success" as const,
    icon: "palette",
    members: 310,
    eventsCount: 8,
    merchCount: 6,
    description:
      "Interdisciplinary guild uniting UI/UX designers, motion artists, and industrial creators for design systems symposiums and studio critiques.",
    highlights: [
      "Official CampusHub 2.0 merchandise co-designer",
      "Weekly Figma & prototyping lab sessions",
      "Annual Creative Media Graduate Exhibition",
    ],
  },
  {
    slug: "sports-council",
    name: "Sports & Esports Council",
    faculty: "University Arena & Student Union",
    badge: "Council Body",
    badgeTone: "primary" as const,
    icon: "sports_esports",
    members: 620,
    eventsCount: 24,
    merchCount: 9,
    description:
      "Governing athletic and collegiate esports council managing inter-faculty championships, varsity leagues, and stadium ticketing.",
    highlights: [
      "Multi-venue arena scheduling via Bryntum",
      "620 registered varsity & esports competitors",
      "Instant QR gate entry across campus stadiums",
    ],
  },
];

/**
 * Cached public storefront dataset shared across /demo and its e-commerce subpages.
 */
export async function getStorefrontData(): Promise<StorefrontData | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("storefront");

  const pool = getPool();
  let orgRes, productsRes, eventsRes;
  try {
    [orgRes, productsRes, eventsRes] = await Promise.all([
      pool.query<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        currency: string;
      }>(
        `select id, name, slug, description, currency from public.organizations
         order by created_at asc limit 1`,
      ),
      pool.query<StoreProduct>(
        `select id, name, slug, description, images, category, price_cents, stock, sku, low_stock_threshold
         from public.products
         where status = 'active'
         order by price_cents asc`,
      ),
      pool.query<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        venue: string | null;
        category: string | null;
        start_at: string | null;
        end_at: string | null;
        capacity: number;
        cover_url: string | null;
        tier_id: string | null;
        tier_name: string | null;
        tier_price_cents: number | null;
        tier_quantity: number | null;
        tier_sold: number | null;
        tier_perks: string[] | null;
      }>(
        `select e.id, e.title, e.slug, e.description, e.cover_url, e.venue, e.category, e.start_at, e.end_at, e.capacity,
                tt.id as tier_id, tt.name as tier_name, tt.price_cents as tier_price_cents,
                tt.quantity as tier_quantity, tt.sold as tier_sold, tt.perks as tier_perks
         left join public.ticket_tiers tt on tt.event_id = e.id
         where e.status = 'published'
         order by e.start_at asc, tt.price_cents asc`,
      ),
    ]);
  } catch (err) {
    console.error("storefront data unavailable", err);
    return null;
  }

  const org = orgRes.rows[0];
  if (!org) return null;

  const byEvent = new Map<string, StoreEvent>();
  const events: StoreEvent[] = [];
  for (const row of eventsRes.rows) {
    let e = byEvent.get(row.id);
    if (!e) {
      e = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        venue: row.venue,
        category: row.category,
        start_at: row.start_at,
        end_at: row.end_at,
        capacity: row.capacity ?? 0,
        imageUrl:
          row.cover_url ||
          STITCH_EVENT_IMAGES[row.slug] ||
          STITCH_EVENT_IMAGES["innovation-week-2026"],
        tiers: [],
      };
      byEvent.set(row.id, e);
      events.push(e);
    }
    if (row.tier_id) {
      e.tiers.push({
        id: row.tier_id,
        name: row.tier_name ?? "",
        price_cents: row.tier_price_cents ?? 0,
        quantity: row.tier_quantity ?? 0,
        sold: row.tier_sold ?? 0,
        perks: row.tier_perks ?? null,
      });
    }
  }

  return {
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      currency: org.currency,
    },
    products: productsRes.rows,
    events,
  };
}
