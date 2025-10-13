"use client";

import { useFormContext } from "react-hook-form";
import type { ClinicFormInput } from "../form-context";
import { AMENITY_VALUES } from "../form-utils";
import type { AmenityKey } from "@/types/clinic";
import { AMENITY_LABELS_KO } from "@/constants/amenities";
import { Car, Wifi, Info, Shield, Plane } from "lucide-react";

const ICONS: Record<AmenityKey, React.ComponentType<{ className?: string }>> = {
  parking: Car,
  freeWifi: Wifi,
  infoDesk: Info,
  privateCare: Shield,
  airportPickup: Plane,
};

export default function AmenitiesChecklist() {
  const { register } = useFormContext<ClinicFormInput>();

  return (
    <div className='px-5 py-4'>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
        {AMENITY_VALUES.map((k) => {
          const Icon = ICONS[k];
          return (
            <label key={k} className='inline-flex w-full'>
              <input
                type='checkbox'
                value={k}
                {...register("amenities")}
                className='peer sr-only'
              />
              <span
                className='w-full select-none rounded-xl border px-3 py-2 text-sm text-muted-foreground
                               transition peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700
                               peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-indigo-600
                               inline-flex items-center gap-2'
              >
                <Icon className='h-4 w-4' />
                {AMENITY_LABELS_KO[k]}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
