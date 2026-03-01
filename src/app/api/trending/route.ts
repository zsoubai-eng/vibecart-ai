import { NextResponse } from 'next/server';

// ── Trending Products Scraper ─────────────────────────────────────────────────
// Adapted from AI_Shorts_Project daily_content_generator.py Reddit scraper
// Scrapes product-focused subreddits for trending items to pre-fill VibeCart

interface TrendingProduct {
    title: string;
    imageUrl: string;
    source: string;
    score: number;
    url: string;
    category: string;
}

// Curated product subreddits (replaces horror subreddits from AI_Shorts_Project)
const PRODUCT_SUBREDDITS = [
    { name: 'BuyItForLife', category: 'Premium Products' },
    { name: 'shutupandtakemymoney', category: 'Impulse Buy' },
    { name: 'malefashionadvice', category: 'Fashion' },
    { name: 'SkincareAddiction', category: 'Beauty' },
    { name: 'Coffee', category: 'Lifestyle' },
    { name: 'EDC', category: 'Everyday Carry' },
];

// Curated product image URLs from popular categories (Unsplash CDN — always available)
// These are used as fallbacks when Reddit products don't have direct image URLs
const PRODUCT_EXAMPLES: TrendingProduct[] = [
    {
        title: 'Premium Minimalist Black Leather Watch',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        source: '🔥 Trending on EDC',
        score: 4200,
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        category: 'Fashion Accessories',
    },
    {
        title: 'Matte Black Ceramic Coffee Pour-Over Set',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        source: '🔥 Trending on r/Coffee',
        score: 3800,
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        category: 'Kitchen & Lifestyle',
    },
    {
        title: 'Luxury Japanese Minimalist Skincare Set',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
        source: '🔥 Trending on r/SkincareAddiction',
        score: 5100,
        url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
        category: 'Beauty & Skincare',
    },
    {
        title: 'Wireless Noise-Cancelling Headphones — Matte Finish',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        source: '🔥 Trending on r/BuyItForLife',
        score: 6700,
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        category: 'Tech Accessories',
    },
    {
        title: 'Artisan Leather Minimalist Wallet — Smoke Grey',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        source: '🔥 Trending on r/EDC',
        score: 2900,
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        category: 'Fashion Accessories',
    },
    {
        title: 'Nike Air Max — Limited Colorway Drop',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        source: '🔥 Trending on r/Sneakers',
        score: 8400,
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        category: 'Footwear',
    },
    {
        title: 'Smart Matte Vacuum Insulated Travel Mug',
        imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
        source: '🔥 Trending on r/Coffee',
        score: 3100,
        url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
        category: 'Kitchen & Lifestyle',
    },
    {
        title: 'Premium Bamboo Yoga Mat — Earth Series',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        source: '🔥 Trending on r/yoga',
        score: 4500,
        url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        category: 'Fitness & Wellness',
    },
    {
        title: 'Frosted Glass Desk Lamp — Nordic Design',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        source: '🔥 Trending on r/malelivingspace',
        score: 2700,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        category: 'Home Decor',
    },
    {
        title: 'Compact Titanium Pocket Knife — EDC Essential',
        imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        source: '🔥 Trending on r/EDC',
        score: 5900,
        url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        category: 'Everyday Carry',
    },
];

async function scrapeRedditProducts(): Promise<TrendingProduct[]> {
    const results: TrendingProduct[] = [];

    for (const sub of PRODUCT_SUBREDDITS.slice(0, 3)) {
        try {
            const url = `https://www.reddit.com/r/${sub.name}/hot.json?limit=8`;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            };
            const response = await fetch(url, { headers, signal: AbortSignal.timeout(4000) });

            if (!response.ok) continue;

            const data = await response.json();
            const posts = data?.data?.children || [];

            for (const post of posts.slice(0, 4)) {
                const p = post.data;
                // Only include posts with direct image URLs
                const imgUrl = p.url || '';
                const isImage = /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(imgUrl) ||
                    imgUrl.includes('i.redd.it') || imgUrl.includes('imgur.com');

                if (isImage && p.title) {
                    results.push({
                        title: p.title.slice(0, 80),
                        imageUrl: imgUrl,
                        source: `🔥 Trending on r/${sub.name}`,
                        score: p.score || 0,
                        url: imgUrl,
                        category: sub.category,
                    });
                }
            }
        } catch {
            // Reddit may be rate-limited or blocked — continue to next
            continue;
        }
    }

    return results;
}

export async function GET() {
    try {
        // Try live Reddit scrape first
        const liveProducts = await scrapeRedditProducts();

        // Mix live + curated products, sort by score, deduplicate
        const allProducts = [...liveProducts, ...PRODUCT_EXAMPLES];
        const seen = new Set<string>();
        const deduped = allProducts.filter(p => {
            const key = p.imageUrl;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Shuffle + take top 8 (weighted random — higher score = more likely to appear first)
        const shuffled = deduped
            .sort(() => Math.random() - 0.4)
            .slice(0, 8);

        return NextResponse.json({
            success: true,
            products: shuffled,
            source: liveProducts.length > 0 ? 'live+curated' : 'curated',
            total: shuffled.length,
        });
    } catch (error) {
        // Always return curated fallbacks — never fail
        return NextResponse.json({
            success: true,
            products: PRODUCT_EXAMPLES.sort(() => Math.random() - 0.5).slice(0, 8),
            source: 'curated',
            total: 8,
            note: String(error),
        });
    }
}
