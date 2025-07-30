import type { Hospital } from "@/types/Hospital";

const mockHospitals: Hospital[] = [
  {
    id: "woojooyon",
    category: "traditional",
    name: "우주연 한의원",
    address: "종로구 북촌로12길 41 2층",
    photos: [
      "/images/hospitals/woo1.jpg",
      "/images/hospitals/woo2.jpg",
      "/images/hospitals/woo3.jpg",
      "/images/hospitals/woo4.jpg",
      "/images/hospitals/woo5.jpg",
    ],

    isFavorite: false,
    rating: 4.5,
    reviewCount: 12,
    packages: [
      {
        id: "detoxSlimming",
        title: "Detox & Slimming: Enzyme Herbal Medicine Detox Clinic",
        price: "80만 원",
        duration: "90분",
        photos: ["/images/packages/woo_pk01.jpg"],
        rating: 0,
        reviewCount: 0,
      },
      {
        id: "naturalLifting",
        title: "Natural lifting: Filler Acupuncture Treatment",
        price: "90만 원",
        duration: "90분",
        photos: ["/images/packages/woo_pk02.jpg"],
        rating: 0,
        reviewCount: 0,
      },
      {
        id: "innerPeace",
        title:
          "Inner Peace & balance : Mind-Calming Acupuncture & Oriental Sound Bath",
        price: "70만 원",
        duration: "60분",
        photos: ["/images/packages/woo_pk03.jpg"],
        rating: 0,
        reviewCount: 0,
      },
      {
        id: "senseAwakening",
        title:
          "Sense Awakening:  psychological healing through traditional Korean color painting",
        price: "70만 원",
        duration: "60분",
        photos: ["/images/packages/woo_pk04.jpg"],
        rating: 0,
        reviewCount: 0,
      },
    ],
  },
  {
    id: "abcd",
    category: "wellness",
    name: "슬리밍 프로 클리닉",
    address: "강남구 테헤란로 27길 15",
    photos: ["/images/hospitals/woo3.jpg", "/images/hospitals/woo4.jpg"],
    isFavorite: false,
    rating: 4.8,
    reviewCount: 20,
    packages: [
      {
        id: "inner_peace",
        title:
          "Inner Peace & balance : Mind-Calming Acupuncture & Oriental Sound Bath",
        price: "70만 원",
        duration: "60분",
        photos: ["/images/packages/woo_pk03.jpg"],
        rating: 0,
        reviewCount: 0,
      },
      // 추가 패키지…
    ],
  },
  // …필요한 만큼 계속 추가
];

export default mockHospitals;
