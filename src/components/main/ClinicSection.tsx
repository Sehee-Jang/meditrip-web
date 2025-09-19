"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";
import { ClinicListItem } from "@/types/clinic";
import { fetchClinics } from "@/services/hospitals/fetchClinics";
import { selectRecommendedClinics } from "@/services/hospitals/selectRecommendedClinics";
import ClinicList from "@/components/hospitals/ClinicList";

export default function ClinicSection() {
  const t = useTranslations("clinic");
  const locale = useLocale();

  const [allClinics, setAllClinics] = useState<ClinicListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchClinics();
        if (mounted) setAllClinics(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const recommended = useMemo(
    () => selectRecommendedClinics(allClinics, { take: 6 }),
    [allClinics]
  );

  return (
    <section className='py-10'>
      <Container>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-xl md:text-2xl font-semibold'>
              {t("section.title")}
            </h2>
            <p className='text-sm text-muted-foreground'>{t("section.desc")}</p>
          </div>

          {/* 데스크탑 CTA */}
          <Link
            href='/hospital'
            className='hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs
                       border border-border
                       text-foreground/70
                       hover:bg-accent hover:text-accent-foreground
                       transition-colors'
          >
            {t("section.button")}
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* 병원 리스트 */}
        {loading ? (
          <div className='min-h-[16rem] grid place-items-center text-muted-foreground'>
            {t("clinicList.loading")}
          </div>
        ) : (
          <ClinicList clinics={recommended} />
        )}

        {/* 모바일 CTA */}
        <div className='md:hidden mt-6 flex justify-center'>
          <Link
            href='/hospital'
            locale={locale}
            className='flex w-full max-w-xs items-center justify-center gap-1 rounded-md
                       border border-border
                       bg-card text-card-foreground
                       px-4 py-3 text-sm font-medium
                       hover:bg-accent hover:text-accent-foreground
                       transition-colors'
          >
            {t("section.button")}
            <ChevronRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
