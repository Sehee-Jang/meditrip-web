import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { adminDb, getFirebaseUserFromRequest } from "@/lib/firebaseAdmin";
import type { ClinicDoc, PackageDoc } from "@/types/clinic";
import type { LocalizedTagLabel } from "@/types/tag";
import {
  CLINIC_COLUMNS,
  HIDDEN_CLINIC_COLUMNS,
  PACKAGE_COLUMNS,
  formatArray,
  formatJson,
  localizedRichToRow,
  localizedStringArrayToRow,
  localizedToRow,
} from "@/services/admin/clinics/excelSchema";
import { LocalizedRichTextDoc, LocalizedTextDoc } from "@/types/common";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function buildWorkbook() {
  const db = adminDb();
  const clinicsSnap = await db.collection("clinics").get();

  const tagsSnap = await db.collection("tags").get();
  const tagLabelMap = new Map<string, string>();
  for (const doc of tagsSnap.docs) {
    const data = doc.data() as { labels?: LocalizedTagLabel };
    const koLabel = data.labels?.ko?.trim();
    tagLabelMap.set(doc.id, koLabel && koLabel.length > 0 ? koLabel : doc.id);
  }

  const clinicRows: Record<string, string | number | boolean | null>[] = [];
  const packageRows: Record<string, string | number | boolean | null>[] = [];

  for (const doc of clinicsSnap.docs) {
    const data = doc.data() as ClinicDoc & Record<string, unknown>;

    const clinicRow: Record<string, string | number | boolean | null> = {
      id: doc.id,
      status: (data.status as string) ?? "",
      displayOrder: (data.displayOrder as number | undefined) ?? null,
      isExclusive: Boolean(data.isExclusive),
      rating: (data.rating as number | undefined) ?? 0,
      reviewCount: (data.reviewCount as number | undefined) ?? 0,
      phone: typeof data.phone === "string" ? data.phone : "",
      website: typeof data.website === "string" ? data.website : "",
      categoryKeys: Array.isArray(data.categoryKeys)
        ? data.categoryKeys.join(", ")
        : "",
      tagSlugs: Array.isArray(data.tagSlugs)
        ? data.tagSlugs.map((slug) => tagLabelMap.get(slug) ?? slug).join(", ")
        : "",
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
        treatmentProcessJson: formatJson(pkg.treatmentProcess),
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
  for (const columnKey of HIDDEN_CLINIC_COLUMNS) {
    const column = clinicsSheet.getColumn(columnKey);
    if (column) {
      column.hidden = true;
    }
  }
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
