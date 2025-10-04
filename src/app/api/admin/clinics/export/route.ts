import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { adminDb, getFirebaseUserFromRequest } from "@/lib/firebaseAdmin";
import { LOCALES_TUPLE } from "@/constants/locales";
import type { ClinicDoc, PackageDoc } from "@/types/clinic";
import type { LocalizedRichTextDoc, LocalizedTextDoc } from "@/types/common";
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLINIC_COLUMNS: readonly string[] = [
  "id",
  "status",
  "displayOrder",
  "isExclusive",
  "isFavorite",
  "rating",
  "reviewCount",
  "phone",
  "website",
  "categoryKeys",
  "tagSlugs",
  "amenities",
  "weeklyClosedDays",
  "images",
  "socialsJson",
  "geo_lat",
  "geo_lng",
  "weeklyHoursJson",
  "doctorsJson",
  "createdAt",
  "updatedAt",
  ...LOCALES_TUPLE.map((locale) => `name_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `address_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `introTitle_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `introSubtitle_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `hoursNote_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `events_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `reservationNotices_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `description_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `highlights_${locale}`),
];

const PACKAGE_COLUMNS: readonly string[] = [
  "clinicId",
  "clinicName_ko",
  "packageId",
  "createdAt",
  "updatedAt",
  ...LOCALES_TUPLE.map((locale) => `title_${locale}`),
  ...LOCALES_TUPLE.map((locale) => `subtitle_${locale}`),
  "price_ko",
  "price_ja",
  "duration_ko",
  "duration_ja",
  "packageImages",
  "treatmentDetailsJson",
  ...LOCALES_TUPLE.map((locale) => `precautions_${locale}`),
];

type FirestoreTimestamp = AdminTimestamp | Date | null | undefined;

function timestampToIso(ts: FirestoreTimestamp): string {
  if (!ts) return "";
  if (ts instanceof Date) return ts.toISOString();
  if (typeof (ts as AdminTimestamp).toDate === "function") {
    return (ts as AdminTimestamp).toDate().toISOString();
  }
  return "";
}

function localizedToRow(
  value: Partial<LocalizedTextDoc> | undefined,
  prefix: string,
  target: Record<string, string | number | boolean | null>
) {
  for (const locale of LOCALES_TUPLE) {
    const key = `${prefix}_${locale}`;
    target[key] = value?.[locale] ?? "";
  }
}

function localizedRichToRow(
  value: Partial<LocalizedRichTextDoc> | undefined,
  prefix: string,
  target: Record<string, string | number | boolean | null>
) {
  for (const locale of LOCALES_TUPLE) {
    const key = `${prefix}_${locale}`;
    target[key] = value?.[locale] ? JSON.stringify(value[locale]) : "";
  }
}

function localizedStringArrayToRow(
  value: Record<string, string[]> | undefined,
  prefix: string,
  target: Record<string, string | number | boolean | null>
) {
  for (const locale of LOCALES_TUPLE) {
    const key = `${prefix}_${locale}`;
    const items = value?.[locale];
    target[key] = Array.isArray(items) ? items.join("\n") : "";
  }
}

function formatArray(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join("\n");
  }
  return "";
}

function formatJson(value: unknown): string {
  return value ? JSON.stringify(value) : "";
}

async function buildWorkbook() {
  const db = adminDb();
  const clinicsSnap = await db.collection("clinics").get();

  const clinicRows: Record<string, string | number | boolean | null>[] = [];
  const packageRows: Record<string, string | number | boolean | null>[] = [];

  for (const doc of clinicsSnap.docs) {
    const data = doc.data() as ClinicDoc & Record<string, unknown>;

    const clinicRow: Record<string, string | number | boolean | null> = {
      id: doc.id,
      status: (data.status as string) ?? "",
      displayOrder: (data.displayOrder as number | undefined) ?? null,
      isExclusive: Boolean(data.isExclusive),
      isFavorite: Boolean(data.isFavorite),
      rating: (data.rating as number | undefined) ?? 0,
      reviewCount: (data.reviewCount as number | undefined) ?? 0,
      phone: typeof data.phone === "string" ? data.phone : "",
      website: typeof data.website === "string" ? data.website : "",
      categoryKeys: Array.isArray(data.categoryKeys)
        ? data.categoryKeys.join(", ")
        : "",
      tagSlugs: Array.isArray(data.tagSlugs) ? data.tagSlugs.join(", ") : "",
      amenities: Array.isArray(data.amenities) ? data.amenities.join(", ") : "",
      weeklyClosedDays: Array.isArray(data.weeklyClosedDays)
        ? data.weeklyClosedDays.join(", ")
        : "",
      images: Array.isArray(data.images) ? data.images.join("\n") : "",
      socialsJson: formatJson(data.socials),
      geo_lat:
        typeof (data.geo as { lat?: number } | undefined)?.lat === "number"
          ? (data.geo as { lat?: number }).lat!
          : null,
      geo_lng:
        typeof (data.geo as { lng?: number } | undefined)?.lng === "number"
          ? (data.geo as { lng?: number }).lng!
          : null,
      weeklyHoursJson: formatJson(data.weeklyHours),
      doctorsJson: formatJson(data.doctors),
      createdAt: timestampToIso((data.createdAt as FirestoreTimestamp) ?? null),
      updatedAt: timestampToIso((data.updatedAt as FirestoreTimestamp) ?? null),
    };

    localizedToRow(
      data.name as Partial<LocalizedTextDoc> | undefined,
      "name",
      clinicRow
    );
    localizedToRow(
      data.address as Partial<LocalizedTextDoc> | undefined,
      "address",
      clinicRow
    );
    localizedToRow(
      (data.intro as { title?: LocalizedTextDoc })?.title,
      "introTitle",
      clinicRow
    );
    localizedToRow(
      (data.intro as { subtitle?: LocalizedTextDoc })?.subtitle,
      "introSubtitle",
      clinicRow
    );
    localizedToRow(
      data.hoursNote as Partial<LocalizedTextDoc> | undefined,
      "hoursNote",
      clinicRow
    );
    localizedStringArrayToRow(
      data.events as Record<string, string[]> | undefined,
      "events",
      clinicRow
    );
    localizedStringArrayToRow(
      data.reservationNotices as Record<string, string[]> | undefined,
      "reservationNotices",
      clinicRow
    );
    localizedRichToRow(
      data.description as Partial<LocalizedRichTextDoc> | undefined,
      "description",
      clinicRow
    );
    localizedRichToRow(
      data.highlights as Partial<LocalizedRichTextDoc> | undefined,
      "highlights",
      clinicRow
    );

    clinicRows.push(clinicRow);

    const packagesSnap = await doc.ref
      .collection("packages")
      .orderBy("createdAt", "desc")
      .get();

    for (const pkgDoc of packagesSnap.docs) {
      const pkg = pkgDoc.data() as PackageDoc & Record<string, unknown>;
      const packageRow: Record<string, string | number | boolean | null> = {
        clinicId: doc.id,
        clinicName_ko:
          typeof (data.name as Record<string, unknown>)?.ko === "string"
            ? ((data.name as Record<string, string>).ko as string)
            : "",
        packageId: pkgDoc.id,
        createdAt: timestampToIso(
          (pkg.createdAt as FirestoreTimestamp) ?? null
        ),
        updatedAt: timestampToIso(
          (pkg.updatedAt as FirestoreTimestamp) ?? null
        ),
        price_ko:
          typeof (pkg.price as { ko?: number } | undefined)?.ko === "number"
            ? (pkg.price as { ko?: number }).ko!
            : null,
        price_ja:
          typeof (pkg.price as { ja?: number } | undefined)?.ja === "number"
            ? (pkg.price as { ja?: number }).ja!
            : null,
        duration_ko:
          typeof (pkg.duration as { ko?: number } | undefined)?.ko === "number"
            ? (pkg.duration as { ko?: number }).ko!
            : null,
        duration_ja:
          typeof (pkg.duration as { ja?: number } | undefined)?.ja === "number"
            ? (pkg.duration as { ja?: number }).ja!
            : null,
        packageImages: formatArray(pkg.packageImages),
        treatmentDetailsJson: formatJson(pkg.treatmentDetails),
      };

      localizedToRow(
        pkg.title as Partial<LocalizedTextDoc> | undefined,
        "title",
        packageRow
      );
      localizedToRow(
        pkg.subtitle as Partial<LocalizedTextDoc> | undefined,
        "subtitle",
        packageRow
      );
      localizedToRow(
        pkg.precautions as Partial<LocalizedTextDoc> | undefined,
        "precautions",
        packageRow
      );

      packageRows.push(packageRow);
    }
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MediTrip";
  const clinicsSheet = workbook.addWorksheet("Clinics");
  clinicsSheet.columns = CLINIC_COLUMNS.map((key) => ({ header: key, key }));
  clinicsSheet.addRows(clinicRows);

  const packagesSheet = workbook.addWorksheet("Packages");
  packagesSheet.columns = PACKAGE_COLUMNS.map((key) => ({ header: key, key }));
  packagesSheet.addRows(packageRows);

  return workbook;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getFirebaseUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = adminDb();
    const userSnap = await db.collection("users").doc(user.uid).get();
    const role = userSnap.get("role") as string | undefined;
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const workbook = await buildWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer = Buffer.from(buffer);
    const filename = `clinics-export-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return new NextResponse(nodeBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "Content-Length": String(nodeBuffer.length),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "FIREBASE_ADMIN_ENV_MISSING"
        ? "Server misconfigured (Firebase Admin env missing)"
        : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
