import { XMLParser } from "fast-xml-parser";

// 공공데이터 XML → 타입화된 객체
const parser = new XMLParser({
  ignoreAttributes: false, // 속성 유지
  attributeNamePrefix: "", // 속성명 앞에 접두어 없이 처리
});

// xml to json 변환
export function parseXml<T>(xml: string): T {
  return parser.parse(xml) as T;
}
