import { useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className='py-10 px-4 md:flex md:justify-between md:items-center bg-gray-100'>
      <div className='w-full md:w-1/2 h-64 bg-gray-300 flex items-center justify-center'>
        <span>Image Slider (예정)</span>
      </div>
      <div className='w-full md:w-1/2 mt-6 md:mt-0'>
        <h2 className='text-2xl font-bold whitespace-pre-line'>{t("title")}</h2>
        <p className='mt-2 text-gray-700'>{t("subtitle")}</p>
        <button className='mt-4 px-6 py-2 bg-black text-white rounded'>
          {t("button")}
        </button>
      </div>
    </section>
  );
}
