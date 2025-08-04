import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Hospital } from "@/types/hospital";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ClinicListProps {
  clinics: Hospital[];
}

export default function ClinicList({ clinics }: ClinicListProps) {
  const t = useTranslations("hospital-list");

  if (clinics.length === 0) {
    return (
      <p className='text-center text-gray-500'>
        {t("clinicList.emptyMessage")}
      </p>
    );
  }

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-semibold mb-6'>{t("clinicList.title")}</h1>

      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {clinics.map((c) => (
          <li key={c.id}>
            <Card className='group hover:shadow-lg transition-shadow rounded-2xl overflow-hidden'>
              <Link href={`/hospital/${c.id}`} className='block'>
                {/* 대표 이미지 */}
                <div className='relative w-full h-40'>
                  <Image
                    src={c.photos[0] || "/images/placeholder.png"}
                    alt={c.name}
                    fill
                    className='object-cover'
                  />
                  {/* 찜 아이콘 */}
                  <div className='absolute top-3 right-3'>
                    <Heart
                      className={`w-6 h-6 transition ${
                        c.isFavorite
                          ? "text-red-500"
                          : "text-white hover:text-red-500"
                      }`}
                    />
                  </div>
                </div>

                <CardContent className='p-4'>
                  <div className='flex justify-between items-start'>
                    <h2 className='text-lg font-medium text-gray-900'>
                      {c.name}
                    </h2>
                    {/* <Badge variant='outline' className='text-xs'>
                      {t(`category.${c.category}`)}
                    </Badge> */}
                  </div>
                  <p className='mt-1 text-sm text-gray-500'>{c.address}</p>

                  <div className='mt-3 flex items-center text-sm text-gray-700'>
                    <Star className='w-4 h-4 text-yellow-500' />
                    <span className='ml-1 font-medium'>
                      {c.rating.toFixed(1)}
                    </span>
                    <span className='ml-2 text-gray-400'>
                      ({c.reviewCount})
                    </span>
                  </div>
                </CardContent>

                <CardFooter className='px-4 py-2 border-t'>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-sm font-medium text-primary'>
                      {t("clinicList.viewDetails")}
                    </span>
                    <ChevronRight className='w-5 h-5 text-primary' />
                  </div>
                </CardFooter>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
