import React, { useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSession } from '@/components/hooks/useSession';
import { scopedFilter } from '@/components/api/scoped';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import MetaTags from '@/components/seo/MetaTags';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Box,
  Building2,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { tokens, cx } from '@/components/theme/tokens';

const SCHOOL_FIELDS = [
  'id',
  'name',
  'slug',
  'logo_url',
  'description',
  'tagline',
  'brand_primary',
  'status',
  'is_public'
];

const OFFER_FIELDS = [
  'id',
  'name',
  'description',
  'offer_type',
  'price_cents',
  'billing_interval',
  'access_scope',
  'is_active'
];

const COUPON_FIELDS = [
  'id',
  'code',
  'discount_type',
  'discount_value',
  'usage_limit',
  'usage_count',
  'expires_at',
  'is_active'
];

const PORTAL_OPTIONS = [
  { value: 'student', label: 'Student Portal', route: '/login/student' },
  { value: 'teacher', label: 'Teacher Portal', route: '/login/teacher' },
  { value: 'admin', label: 'Admin Portal', route: '/login/admin' }
];

const OFFER_LABELS = {
  SUBSCRIPTION: 'Subscription',
  BUNDLE: 'Bundle',
  COURSE: 'Course',
  ADDON: 'Add-on'
};

export default function PublicHome() {
  const { user, isLoading } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [portal, setPortal] = useState('student');

  if (!isLoading && user) return <Navigate to="/app" replace />;

  const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
    queryKey: ['public-schools'],
    queryFn: async () => {
      try {
        const results = await base44.entities.School.filter({ is_public: true }, 'name', 50, { fields: SCHOOL_FIELDS });
        return results || [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 300_000
  });

  const publicSchools = useMemo(() => {
    return (schools || []).filter((school) => school?.is_public !== false && school?.status !== 'inactive');
  }, [schools]);

  const selectedSchoolId = selectedSchool?.id || null;
  const selectedSchoolSlug = selectedSchool?.slug || '';
  const hasStorefront = !!selectedSchoolSlug;
  const storefrontPath = selectedSchoolSlug ? `/s/${selectedSchoolSlug}` : '#';
  const pricingPath = selectedSchoolSlug ? `/s/${selectedSchoolSlug}/pricing` : '#';

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSchools = useMemo(() => {
    if (!normalizedQuery) return [];
    return publicSchools
      .filter((school) => {
        const name = String(school?.name || '').toLowerCase();
        const slug = String(school?.slug || '').toLowerCase();
        const description = String(school?.description || school?.tagline || '').toLowerCase();
        return name.includes(normalizedQuery) || slug.includes(normalizedQuery) || description.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [publicSchools, normalizedQuery]);

  const portalRoute = useMemo(() => {
    const match = PORTAL_OPTIONS.find((option) => option.value === portal);
    return match?.route || '/login/student';
  }, [portal]);

  const portalHref = useMemo(() => {
    if (!selectedSchoolSlug) return portalRoute;
    const params = new URLSearchParams({ schoolSlug: selectedSchoolSlug });
    return `${portalRoute}?${params.toString()}`;
  }, [portalRoute, selectedSchoolSlug]);

  const { data: offersRaw = [], isLoading: isLoadingOffers } = useQuery({
    queryKey: ['public-offers', selectedSchoolId],
    queryFn: () => scopedFilter('Offer', selectedSchoolId, { is_active: true }, '-created_date', 20, { fields: OFFER_FIELDS }),
    enabled: !!selectedSchoolId
  });

  const { data: couponsRaw = [], isLoading: isLoadingCoupons } = useQuery({
    queryKey: ['public-coupons', selectedSchoolId],
    queryFn: () => scopedFilter('Coupon', selectedSchoolId, { is_active: true }, '-created_date', 20, { fields: COUPON_FIELDS }),
    enabled: !!selectedSchoolId
  });

  const offers = useMemo(() => {
    return (offersRaw || []).filter((offer) => offer?.is_active !== false);
  }, [offersRaw]);

  const groupedOffers = useMemo(() => {
    return {
      subscriptions: offers.filter((offer) => offer.offer_type === 'SUBSCRIPTION'),
      bundles: offers.filter((offer) => offer.offer_type === 'BUNDLE'),
      courses: offers.filter((offer) => offer.offer_type === 'COURSE'),
      addons: offers.filter((offer) => offer.offer_type === 'ADDON')
    };
  }, [offers]);

  const coupons = useMemo(() => {
    const now = new Date();
    return (couponsRaw || [])
      .filter((coupon) => coupon?.is_active !== false)
      .filter((coupon) => {
        if (!coupon?.expires_at) return true;
        return new Date(coupon.expires_at) > now;
      });
  }, [couponsRaw]);

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    setSearchQuery(nextValue);
    if (!nextValue) {
      setSelectedSchool(null);
    }
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setSearchQuery(school?.name || school?.slug || '');
  };

  const handleSchoolSelectById = (value) => {
    const match = publicSchools.find((school) => String(school?.id) === String(value));
    if (match) {
      handleSchoolSelect(match);
    }
  };

  const showResults = normalizedQuery.length > 1;

  return (
    <div className="flex flex-col bg-background">
      <MetaTags
        title="Breslov Academy"
        description="Discover trusted Torah schools, protected learning, and premium courses across the Breslov Academy network."
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(205,160,92,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.06),transparent_50%)]" />
        <div className={cx(tokens.page.inner, "relative py-16 lg:py-24")}>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold text-primary">
                Breslov Academy LMS
              </Badge>
              <h1 className={cx(tokens.text.h1, "text-4xl sm:text-5xl lg:text-6xl")}>Find your school. Learn with certainty.</h1>
              <p className={cx(tokens.text.lead, "max-w-xl")}>
                A premium, multi-tenant platform built for protected Torah learning. Secure materials today, with AI tutoring
                and the Virtual Beit Midrash arriving next.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-12 px-6" asChild>
                  <Link to="/s/demo">
                    Browse demo school
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6" asChild>
                  <Link to="/signup/school">Request school onboarding</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Protected content by default
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary/70" />
                  Multi-tenant by design
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary/70" />
                  AI tutoring in the roadmap
                </div>
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-primary/70" />
                  VR Beit Midrash coming soon
                </div>
              </div>
            </div>

            <GlassCard className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Find your school</p>
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search by school name or slug"
                      className="h-12 pl-10"
                    />
                  </div>

                  {showResults && (
                    <div className="mt-3 space-y-2">
                      {filteredSchools.length > 0 ? (
                        filteredSchools.map((school) => (
                          <button
                            key={school.id}
                            type="button"
                            onClick={() => handleSchoolSelect(school)}
                            className="w-full rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-muted"
                          >
                            <div className="flex items-center gap-3">
                              {school.logo_url ? (
                                <img src={school.logo_url} alt={school.name} className="h-10 w-10 rounded-md object-cover" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                  <Building2 className="h-5 w-5" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">{school.name}</p>
                                <p className="text-xs text-muted-foreground">/{school.slug}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                          {isLoadingSchools ? 'Loading schools...' : 'No schools found. Try a different name.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedSchool && (
                  <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Selected school</p>
                        <p className="text-xs text-muted-foreground">{selectedSchool.name}</p>
                      </div>
                      <Badge variant="secondary">/{selectedSchool.slug}</Badge>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {hasStorefront ? (
                    <Button size="sm" className="h-10" asChild>
                      <Link to={storefrontPath}>
                        Enter storefront
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" className="h-10" disabled>
                      Enter storefront
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSchool(null);
                    }}
                    disabled={!searchQuery && !selectedSchool}
                  >
                    Clear
                  </Button>
                </div>

                <div className="border-t border-border/60 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student login</p>
                    <Badge variant="outline">Secure access</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Select value={portal} onValueChange={setPortal}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose portal" />
                      </SelectTrigger>
                      <SelectContent>
                        {PORTAL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button className="h-11" asChild>
                      <Link to={portalHref}>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose your portal before entering the school environment.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className={cx(tokens.page.inner, "space-y-10")}>
          <SectionHeader
            title="Secure learning that scales"
            description="Every school gets its own protected library, branded storefront, and private portal."
          />
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureTile
              icon={ShieldCheck}
              title="Airtight protection"
              description="Watermarked materials, preview limits, and strict access rules keep premium content secure."
            />
            <FeatureTile
              icon={Bot}
              title="AI tutoring ready"
              description="Contextual AI tutoring and lesson assistance are in active development for V11."
            />
            <FeatureTile
              icon={Box}
              title="Virtual Beit Midrash"
              description="Immersive study rooms are coming to help talmidim learn together in 3D."
            />
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 lg:py-24">
        <div className={cx(tokens.page.inner, "space-y-10")}>
          <SectionHeader
            title="Subscriptions and fees"
            description="Review school-specific pricing, bundles, and coupons before entering the portal."
            right={
              <Select
                value={selectedSchool?.id ? String(selectedSchool.id) : ''}
                onValueChange={handleSchoolSelectById}
                disabled={!publicSchools.length}
              >
                <SelectTrigger className="min-w-[220px]">
                  <SelectValue placeholder={publicSchools.length ? 'Pick a school' : 'No schools loaded'} />
                </SelectTrigger>
                <SelectContent>
                  {publicSchools.map((school) => (
                    <SelectItem key={school.id} value={String(school.id)}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />

          {!selectedSchool ? (
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Select a school to view subscriptions, bundles, and available coupons.
              </p>
            </GlassCard>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-6">
                <OfferGroup
                  title="Subscriptions"
                  subtitle="Monthly or yearly access for full libraries"
                  offers={groupedOffers.subscriptions}
                  emptyLabel="No subscriptions published yet."
                />
                <OfferGroup
                  title="Bundles"
                  subtitle="Multi-course packages"
                  offers={groupedOffers.bundles}
                  emptyLabel="No bundles published yet."
                />
                <OfferGroup
                  title="Single courses"
                  subtitle="One-time enrollments"
                  offers={groupedOffers.courses}
                  emptyLabel="No single-course offers published yet."
                />
                <OfferGroup
                  title="Add-ons"
                  subtitle="Licenses and supplemental access"
                  offers={groupedOffers.addons}
                  emptyLabel="No add-ons published yet."
                />
              </div>

              <div className="space-y-6">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Coupons</h3>
                    <Badge variant="outline">{coupons.length}</Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {isLoadingCoupons ? (
                      <p className="text-sm text-muted-foreground">Loading coupons...</p>
                    ) : coupons.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active coupons available.</p>
                    ) : (
                      coupons.slice(0, 6).map((coupon) => <CouponRow key={coupon.id} coupon={coupon} />)
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-base font-semibold">Fee overview</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Preview pricing details and compare plans before committing to a school portal.
                  </p>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Secure checkout and entitlement tracking
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Bundles and courses are scoped per school
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Discounts applied automatically at checkout
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={pricingPath}>View full pricing</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={storefrontPath}>Visit storefront</Link>
                    </Button>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {isLoadingOffers && selectedSchool && (
            <div className="text-xs text-muted-foreground">Loading offers...</div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className={cx(tokens.page.inner, "space-y-10")}>
          <SectionHeader
            title="Built for every role"
            description="Clear paths for talmidim, bachurim, and Rabbanim who manage learning at scale."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <PersonaCard
              title="Talmidim and Bachurim"
              subtitle="A safe, guided path to learning"
              items={[
                'Instant school search and storefront previews',
                'Locked material protection with premium previews',
                'Private progress, notes, and downloads'
              ]}
            />
            <PersonaCard
              title="Rabbis and Teachers"
              subtitle="Authoring and enterprise tools"
              items={[
                'Course and lesson authoring scoped to each school',
                'Analytics, coupons, and enrollment management',
                'Audit logs for publishing and pricing changes'
              ]}
            />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className={cx(tokens.page.inner)}>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-2xl sm:px-12 sm:py-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to launch your school?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base opacity-90">
                Launch a branded storefront, protect your materials, and teach with confidence.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button size="lg" variant="secondary" className="h-12 px-8" asChild>
                  <Link to="/signup/school">Request onboarding</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <Link to="/contact">Talk with our team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureTile({ icon: Icon, title, description }) {
  return (
    <GlassCard className="p-6" hover>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </GlassCard>
  );
}

function OfferGroup({ title, subtitle, offers, emptyLabel }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="secondary">{offers.length}</Badge>
      </div>
      {offers.length === 0 ? (
        <GlassCard className="p-4 text-sm text-muted-foreground">{emptyLabel}</GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer }) {
  const priceLabel = formatPrice(offer?.price_cents);
  const offerLabel = OFFER_LABELS[offer?.offer_type] || offer?.offer_type || 'Offer';

  return (
    <GlassCard className="p-5" hover>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{offer?.name || offerLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {offer?.description || 'Pricing details are provided by the school.'}
          </p>
        </div>
        <Badge variant="outline">{offerLabel}</Badge>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{priceLabel}</span>
        {offer?.offer_type === 'SUBSCRIPTION' && offer?.billing_interval && (
          <span className="text-xs text-muted-foreground">/{offer.billing_interval}</span>
        )}
      </div>
    </GlassCard>
  );
}

function CouponRow({ coupon }) {
  const discountLabel = formatDiscount(coupon);
  const usageLabel = coupon?.usage_limit
    ? `${coupon.usage_count || 0}/${coupon.usage_limit} used`
    : `${coupon?.usage_count || 0} used`;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2">
      <div>
        <p className="text-xs font-semibold text-foreground">{coupon?.code}</p>
        <p className="text-[11px] text-muted-foreground">{usageLabel}</p>
      </div>
      <Badge variant="secondary">{discountLabel}</Badge>
    </div>
  );
}

function PersonaCard({ title, subtitle, items }) {
  return (
    <GlassCard className="p-6" hover>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function formatPrice(priceCents) {
  const numericPrice = Number(priceCents);
  if (!Number.isFinite(numericPrice)) return 'Contact school';
  const formatted = (numericPrice / 100).toFixed(numericPrice % 100 === 0 ? 0 : 2);
  return `$${formatted}`;
}

function formatDiscount(coupon) {
  if (!coupon) return '0';
  if (coupon.discount_type === 'PERCENTAGE') return `${coupon.discount_value}%`;
  if (coupon.discount_type === 'AMOUNT') return `$${coupon.discount_value}`;
  return `$${coupon.discount_value || 0}`;
}
