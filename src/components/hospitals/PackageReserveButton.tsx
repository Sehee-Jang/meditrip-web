"use client";
import { useRouter } from "next/navigation";
import CommonButton from "../common/CommonButton";

interface Props {
  locale: string;
  hospitalId: string;
  packageId: string;
}

export default function PackageReserveButton({
  locale,
  hospitalId,
  packageId,
}: Props) {
  const router = useRouter();
  const handleReserve = () => {
    router.push(
      `/${locale}/reservations/new?hospitalId=${hospitalId}&packageId=${packageId}`
    );
  };
  return (
    <CommonButton onClick={handleReserve} className='w-full max-w-xs'>
      예약하기
    </CommonButton>
  );
}
