import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { FieldValue } from "firebase-admin/firestore";
import type { DocumentReference } from "firebase-admin/firestore";

import { adminDb, getFirebaseUserFromRequest } from "@/lib/firebaseAdmin";
import {
  CLINIC_COLUMNS,
  PACKAGE_COLUMNS,
} from "@/services/admin/clinics/excelSchema";
import { LOCALES_TUPLE } from "@/constants/locales";
import type { ClinicDoc, PackageDoc } from "@/types/clinic";
import type {
  LocalizedRichTextDoc,
  LocalizedStringArray,
  LocalizedTextDoc,
} from "@/types/common";
import type { JSONContent } from "@/types/tiptap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SheetName = "Clinics" | "Packages";

interface RowError {
  sheet: SheetName;
  row: number;
  errors: string[];
}

interface ClinicRowPayload {
  id?: string;
  data: Partial<ClinicDoc>;
  rowNumber: number;
}

interface PackageRowPayload {
  clinicId: string;
  packageId?: string;
  data: Partial<PackageDoc>;
  rowNumber: number;
}

const TRUTHY_VALUES = new Set(["true", "1", "yes", "y", "on"]);

function splitCommaOrNewline(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseBoolean(value: string): boolean {
  if (!value) return false;
  return TRUTHY_VALUES.has(value.trim().toLowerCase());
}

function parseOptionalNumber(
  raw: string,
  label: string,
  errors: string[]
): number | undefined {
  if (!raw) return undefined;
  const num = Number(raw);
  if (Number.isNaN(num)) {
    errors.push(`${label} 값이 숫자가 아닙니다.`);
    return undefined;
  }
  return num;
}

function parseRequiredNumber(
  raw: string,
  label: string,
  errors: string[]
): number | undefined {
  if (!raw) {
    errors.push(`${label} 값이 비어 있습니다.`);
    return undefined;
  }
  const num = Number(raw);
  if (Number.isNaN(num)) {
    errors.push(`${label} 값이 숫자가 아닙니다.`);
    return undefined;
  }
  return num;
}

function safeParseJson<T>(
  raw: string,
  label: string,
  errors: string[]
): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    errors.push(`${label} JSON 파싱에 실패했습니다.`);
    return undefined;
  }
}

function buildLocalizedText(
  row: Record<string, string>,
  prefix: string
): LocalizedTextDoc {
  const result = {} as LocalizedTextDoc;
  for (const locale of LOCALES_TUPLE) {
    result[locale] = (row[`${prefix}_${locale}`] ?? "").trim();
  }
  return result;
}

function buildOptionalLocalizedText(
  row: Record<string, string>,
  prefix: string
): LocalizedTextDoc | undefined {
  const result = buildLocalizedText(row, prefix);
  const hasValue = LOCALES_TUPLE.some((locale) => result[locale]?.length);
  return hasValue ? result : undefined;
}

function buildLocalizedStringArray(
  row: Record<string, string>,
  prefix: string
): LocalizedStringArray | undefined {
  const result = {} as LocalizedStringArray;
  let hasValue = false;
  for (const locale of LOCALES_TUPLE) {
    const values = splitLines(row[`${prefix}_${locale}`] ?? "");
    if (values.length > 0) hasValue = true;
    result[locale] = values;
  }
  return hasValue ? result : undefined;
}

function convertPlainTextToRichTextDoc(text: string): JSONContent {
  const lines = text.split(/\r?\n/);
  const content: JSONContent[] = [];

  let paragraphBuffer: string[] = [];
  let currentList: JSONContent[] | null = null;

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    const paragraphText = paragraphBuffer.join(" ").trimEnd();
    if (paragraphText.length === 0) {
      paragraphBuffer = [];
      return;
    }
    content.push({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: paragraphText,
        },
      ],
    });
    paragraphBuffer = [];
  }

  function flushList() {
    if (!currentList || currentList.length === 0) {
      currentList = null;
      return;
    }
    content.push({
      type: "bulletList",
      content: currentList,
    });
    currentList = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    const bulletMatch = trimmed.match(/^-\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!currentList) {
        currentList = [];
      }
      currentList.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: bulletMatch[1]
              ? [
                  {
                    type: "text",
                    text: bulletMatch[1],
                  },
                ]
              : [],
          },
        ],
      });
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushList();

  if (content.length === 0) {
    throw new Error("Empty rich text content");
  }

  return {
    type: "doc",
    content,
  };
}

function parseRichTextCell(
  raw: string,
  label: string,
  errors: string[]
): JSONContent | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed) as JSONContent;
  } catch {
    try {
      return convertPlainTextToRichTextDoc(trimmed);
    } catch {
      errors.push(`${label} JSON 파싱에 실패했습니다.`);
      return undefined;
    }
  }
}

function buildLocalizedRichText(
  row: Record<string, string>,
  prefix: string,
  errors: string[]
): LocalizedRichTextDoc | undefined {
  const result: Partial<LocalizedRichTextDoc> = {};
  let hasValue = false;
  for (const locale of LOCALES_TUPLE) {
    const raw = row[`${prefix}_${locale}`];
    if (!raw) continue;
    const parsed = parseRichTextCell(raw, `${prefix}_${locale}`, errors);
    if (!parsed) continue;
    result[locale] = parsed;
    hasValue = true;
  }
  return hasValue ? (result as LocalizedRichTextDoc) : undefined;
}

function sanitize<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

function isRowEmpty(row: Record<string, string>): boolean {
  return Object.values(row).every((value) => (value ?? "").trim().length === 0);
}

function ensureArrayOrUndefined(values: string[]): string[] | undefined {
  return values.length > 0 ? values : undefined;
}

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "엑셀 파일이 필요합니다." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const clinicsSheet = workbook.getWorksheet("Clinics");
    const packagesSheet = workbook.getWorksheet("Packages");

    if (!clinicsSheet || !packagesSheet) {
      return NextResponse.json(
        { error: "Clinics 또는 Packages 시트를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    // 변경 ②: cellToString 시그니처 확장
    function cellToString(value: ExcelJS.CellValue | null | undefined): string {
      if (value == null) return "";
      if (typeof value === "object") {
        if ("richText" in value && Array.isArray(value.richText)) {
          return value.richText.map((part) => part.text).join("");
        }
        if ("text" in value && typeof value.text === "string") {
          return value.text;
        }
        if ("result" in value && value.result !== undefined) {
          return cellToString(value.result as ExcelJS.CellValue);
        }
        if ("hyperlink" in value && typeof value.hyperlink === "string") {
          return value.hyperlink;
        }
      }
      return String(value);
    }

    // 변경 ③: 헤더 파싱(Clinics/Packages) 교체
    const clinicsHeaderRow = clinicsSheet.getRow(1);
    const clinicHeader: string[] = [];
    for (let i = 1; i <= CLINIC_COLUMNS.length; i += 1) {
      clinicHeader.push(cellToString(clinicsHeaderRow.getCell(i).value));
    }

    const packagesHeaderRow = packagesSheet.getRow(1);
    const packageHeader: string[] = [];
    for (let i = 1; i <= PACKAGE_COLUMNS.length; i += 1) {
      packageHeader.push(cellToString(packagesHeaderRow.getCell(i).value));
    }
    if (
      CLINIC_COLUMNS.length !== clinicHeader.length ||
      CLINIC_COLUMNS.some((col, index) => clinicHeader[index] !== col)
    ) {
      return NextResponse.json(
        {
          error: "Clinics 시트 헤더가 예상과 다릅니다.",
          expected: CLINIC_COLUMNS,
          received: clinicHeader,
        },
        { status: 400 }
      );
    }

    if (
      PACKAGE_COLUMNS.length !== packageHeader.length ||
      PACKAGE_COLUMNS.some((col, index) => packageHeader[index] !== col)
    ) {
      return NextResponse.json(
        {
          error: "Packages 시트 헤더가 예상과 다릅니다.",
          expected: PACKAGE_COLUMNS,
          received: packageHeader,
        },
        { status: 400 }
      );
    }

    const clinicRows: ClinicRowPayload[] = [];
    const packageRows: PackageRowPayload[] = [];
    const rowErrors: RowError[] = [];

    clinicsSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const values: Record<string, string> = {};
      CLINIC_COLUMNS.forEach((col, index) => {
        values[col] = cellToString(
          row.getCell(index + 1).value as ExcelJS.CellValue
        );
      });
      if (isRowEmpty(values)) return;

      const errors: string[] = [];
      const id = values.id?.trim();
      const status = values.status?.trim();
      if (status !== "visible" && status !== "hidden") {
        errors.push("status 값은 visible 또는 hidden 이어야 합니다.");
      }

      const name = buildLocalizedText(values, "name");
      if (!name.ko?.trim()) {
        errors.push("name_ko 값이 비어 있습니다.");
      }

      const address = buildLocalizedText(values, "address");
      if (!address.ko?.trim()) {
        errors.push("address_ko 값이 비어 있습니다.");
      }

      const introTitle = buildLocalizedText(values, "introTitle");
      const introSubtitle = buildLocalizedText(values, "introSubtitle");

      const displayOrder = parseOptionalNumber(
        values.displayOrder,
        "displayOrder",
        errors
      );
      const rating = parseOptionalNumber(values.rating, "rating", errors) ?? 0;
      const reviewCount =
        parseOptionalNumber(values.reviewCount, "reviewCount", errors) ?? 0;

      const geoLat = parseOptionalNumber(values.geo_lat, "geo_lat", errors);
      const geoLng = parseOptionalNumber(values.geo_lng, "geo_lng", errors);
      if (
        (geoLat !== undefined || geoLng !== undefined) &&
        (geoLat === undefined || geoLng === undefined)
      ) {
        errors.push("geo_lat과 geo_lng는 모두 입력되어야 합니다.");
      }

      const weeklyHours = safeParseJson<ClinicDoc["weeklyHours"]>(
        values.weeklyHoursJson,
        "weeklyHoursJson",
        errors
      );
      const doctors = safeParseJson<ClinicDoc["doctors"]>(
        values.doctorsJson,
        "doctorsJson",
        errors
      );
      const socials = safeParseJson<ClinicDoc["socials"]>(
        values.socialsJson,
        "socialsJson",
        errors
      );

      const hoursNote = buildOptionalLocalizedText(values, "hoursNote");
      const events = buildLocalizedStringArray(values, "events");
      const reservationNotices = buildLocalizedStringArray(
        values,
        "reservationNotices"
      );
      const description = buildLocalizedRichText(values, "description", errors);
      const highlights = buildLocalizedRichText(values, "highlights", errors);

      if (errors.length > 0) {
        rowErrors.push({ sheet: "Clinics", row: rowNumber, errors });
        return;
      }

      const categoryKeys = splitCommaOrNewline(values.categoryKeys ?? "");
      const tagSlugs = splitCommaOrNewline(values.tagSlugs ?? "");
      const amenities = splitCommaOrNewline(values.amenities ?? "");
      const weeklyClosedDays = splitCommaOrNewline(
        values.weeklyClosedDays ?? ""
      );

      const clinicData: Partial<ClinicDoc> = {
        name,
        images: splitLines(values.images ?? ""),
        categoryKeys: ensureArrayOrUndefined(
          categoryKeys
        ) as ClinicDoc["categoryKeys"],
        address,
        tagSlugs: ensureArrayOrUndefined(tagSlugs) as ClinicDoc["tagSlugs"],
        intro: {
          title: introTitle,
          subtitle: introSubtitle,
        },
        isExclusive: parseBoolean(values.isExclusive),
        doctors,
        weeklyHours,
        weeklyClosedDays: ensureArrayOrUndefined(
          weeklyClosedDays
        ) as ClinicDoc["weeklyClosedDays"],
        hoursNote,
        phone: values.phone?.trim() || undefined,
        website: values.website?.trim() || undefined,
        socials,
        description,
        highlights,
        events,
        reservationNotices,
        geo:
          geoLat !== undefined && geoLng !== undefined
            ? { lat: geoLat, lng: geoLng }
            : undefined,
        amenities: ensureArrayOrUndefined(amenities) as ClinicDoc["amenities"],
        rating,
        reviewCount,
        status: status as ClinicDoc["status"],
        displayOrder: displayOrder ?? undefined,
      };

      clinicRows.push({
        id,
        data: sanitize(clinicData),
        rowNumber,
      });
    });

    packagesSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const values: Record<string, string> = {};
      PACKAGE_COLUMNS.forEach((col, index) => {
        values[col] = cellToString(
          row.getCell(index + 1).value as ExcelJS.CellValue
        );
      });
      if (isRowEmpty(values)) return;

      const errors: string[] = [];
      const clinicId = values.clinicId?.trim();
      if (!clinicId) {
        errors.push("clinicId 값이 비어 있습니다.");
      }

      const title = buildLocalizedText(values, "title");
      if (!title.ko?.trim()) {
        errors.push("title_ko 값이 비어 있습니다.");
      }

      const subtitle = buildLocalizedText(values, "subtitle");
      const priceKo = parseRequiredNumber(values.price_ko, "price_ko", errors);
      const priceJa = parseRequiredNumber(values.price_ja, "price_ja", errors);
      const durationKo = parseRequiredNumber(
        values.duration_ko,
        "duration_ko",
        errors
      );
      const durationJa = parseRequiredNumber(
        values.duration_ja,
        "duration_ja",
        errors
      );

      const treatmentDetails = safeParseJson<PackageDoc["treatmentDetails"]>(
        values.treatmentDetailsJson,
        "treatmentDetailsJson",
        errors
      );
      const precautions = buildOptionalLocalizedText(values, "precautions");

      if (errors.length > 0 || !clinicId) {
        rowErrors.push({ sheet: "Packages", row: rowNumber, errors });
        return;
      }

      const packageData: Partial<PackageDoc> = {
        title,
        subtitle,
        price: { ko: priceKo!, ja: priceJa! },
        duration: { ko: durationKo!, ja: durationJa! },
        packageImages: splitLines(values.packageImages ?? ""),
        treatmentDetails,
        precautions,
      };

      packageRows.push({
        clinicId,
        packageId: values.packageId?.trim() || undefined,
        data: sanitize(packageData),
        rowNumber,
      });
    });

    const clinicsCollection = db.collection("clinics");
    const clinicRefCache = new Map<string, DocumentReference>();
    const createdClinicIds: string[] = [];
    const createdPackageRefs: { clinicId: string; packageId: string }[] = [];

    let clinicsCreated = 0;
    let clinicsUpdated = 0;
    let packagesCreated = 0;
    let packagesUpdated = 0;

    for (const clinic of clinicRows) {
      const docRef = clinic.id
        ? clinicsCollection.doc(clinic.id)
        : clinicsCollection.doc();
      let exists = false;
      let existingCreatedAt: unknown;
      if (clinic.id) {
        const snap = await docRef.get();
        exists = snap.exists;
         if (exists) {
           existingCreatedAt = snap.get("createdAt");
         }
      }
      const isCreate = !clinic.id || !exists;

      const payload: Record<string, unknown> = {
        ...clinic.data,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (isCreate) {
        payload.createdAt = FieldValue.serverTimestamp();
      } else if (existingCreatedAt !== undefined) {
        payload.createdAt = existingCreatedAt;
      }

      await docRef.set(sanitize(payload), { merge: false });

      const clinicId = docRef.id;
      clinicRefCache.set(clinicId, docRef);
      if (isCreate) {
        clinicsCreated += 1;
        createdClinicIds.push(clinicId);
      } else {
        clinicsUpdated += 1;
      }
    }

    const packagesByClinic = new Map<string, PackageRowPayload[]>();
    for (const pkg of packageRows) {
      if (!packagesByClinic.has(pkg.clinicId)) {
        packagesByClinic.set(pkg.clinicId, []);
      }
      packagesByClinic.get(pkg.clinicId)!.push(pkg);
    }

    for (const [clinicId, rows] of packagesByClinic.entries()) {
      let clinicRef = clinicRefCache.get(clinicId);
      if (!clinicRef) {
        clinicRef = clinicsCollection.doc(clinicId);
        const snap = await clinicRef.get();
        if (!snap.exists) {
          for (const row of rows) {
            rowErrors.push({
              sheet: "Packages",
              row: row.rowNumber,
              errors: [
                "clinicId에 해당하는 업체룰 찾을 수 없어 패키지를 건너뛰었습니다.",
              ],
            });
          }
          continue;
        }
        clinicRefCache.set(clinicId, clinicRef);
      }

      const packagesCollection = clinicRef.collection("packages");
      for (const row of rows) {
        const docRef = row.packageId
          ? packagesCollection.doc(row.packageId)
          : packagesCollection.doc();
        let exists = false;
        let existingCreatedAt: unknown;
        if (row.packageId) {
          const snap = await docRef.get();
          exists = snap.exists;
          if (exists) {
            existingCreatedAt = snap.get("createdAt");
          }
        }
        const isCreate = !row.packageId || !exists;

        const payload: Record<string, unknown> = {
          ...row.data,
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (isCreate) {
          payload.createdAt = FieldValue.serverTimestamp();
        } else if (existingCreatedAt !== undefined) {
          payload.createdAt = existingCreatedAt;
        }

        await docRef.set(sanitize(payload), { merge: false });

        if (isCreate) {
          packagesCreated += 1;
          createdPackageRefs.push({ clinicId, packageId: docRef.id });
        } else {
          packagesUpdated += 1;
        }
      }
    }

    const summary = {
      clinics: { created: clinicsCreated, updated: clinicsUpdated },
      packages: {
        created: packagesCreated,
        updated: packagesUpdated,
        note: "시트에 없는 기존 패키지는 삭제하지 않고 그대로 유지합니다.",
      },
    };

    return NextResponse.json({
      summary,
      errors: rowErrors,
      createdClinicIds,
      createdPackages: createdPackageRefs,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "FIREBASE_ADMIN_ENV_MISSING"
        ? "Server misconfigured (Firebase Admin env missing)"
        : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
