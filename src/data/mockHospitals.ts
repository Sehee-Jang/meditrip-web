import type { Hospital } from "@/types/hospital";

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

        // 상세 정보
        process: [
          { icon: "📋", title: "검사 및 검진" },
          { icon: "🌿", title: "한방 시술" },
          { icon: "🏃", title: "운동 처방" },
          { icon: "🥗", title: "식단 처방" },
          { icon: "💊", title: "한약 처방" },
          { icon: "💬", title: "사후관리" },
        ],
        details: [
          {
            title: "검사 및 검진",
            description:
              "디지털 장비로 검사를 시행하여 외국인 환자에게 객관적인 지표를 바탕으로 설명합니다. 체계저인 검사 프로세스를 통해 종합적인 진단을 내리고 이에 적합한 한방 치료 방법을 처방합니다",
            image: "/images/process/pk01_step1.png",
          },
          {
            title: "개인 맞춤형 한방 시술",
            description:
              "검사 및 검진 결과를 바탕으로 가장 효과적인 한방 치료를 시행합니다. 장침, 전기침, 약침 등이 진행되며, 장기 능력 개선을 위한 장기 리프팅과 체형 개선을 위한 추나가 병행됩니다.",
            image: "/images/process/pk01_step2.png",
          },
          {
            title: "지속적인 관리를 위한 운동 처방",
            description:
              "프라이빗 운동 공간에서 1:1 운동 방법을 처방하고 귀국 후에도 지속할 수 있는 운동 플랜을 제시합니다. 필요 시, 한국에 머무는 동안 종로에 위치한 운동 센터에서 원하는 시간에 운동하실 수 있습니다.",
            image: "/images/process/pk01_step3.png",
          },
          {
            title: "개인 체질을 반영한 식단 처방",
            description:
              "개인에게 맞는 음식, 맞지 않는 음식에 대해 알려주고 다이어트에 효과적인 식단을 설계합니다. 체질에 맞는 식단 플랜을 개인 맞춤형으로 제공하여 귀국 후에도 식단 관리를 할 수 있도록 보조합니다.",
            image: "/images/process/pk01_step4.png",
          },

          {
            title: "개인 맞춤형 한약 처방시술",
            description:
              "직접 한의원에서 조제한 탕약, 환, 가루약 등을 받아 보실 수 있어 믿을 수 있으며, 효과가 뛰어납니다. 외국인 환자가 귀국 시 반출을 위한 포장 규격, 무게, 처방 기간을 준수하여 귀국 시에도 편리하게 한약을 가져가실 수 있습니다.",
            image: "/images/process/pk01_step5.png",
          },
          {
            title: "사후관리",
            description:
              "모든 진료 후 꾸준한 사후 관리를 통해, 귀국 후에도 궁금한 부분을 해소해드립니다. 궁금한 점을 24시간 온라인을 통해 문의 가능합니다.",
            image: "/images/process/pk01_step6.png",
          },
        ],
        cautions:
          "모든 진료는 전문 의료진과 상담 후 개인에 맞춰 진행되므로, 패키지에 포함된 항목이 변경 될 수 있습니다. 의료법에 의해 의료 상담은 의료진을 통해서만 가능합니다. 의료 시술, 부작용, 주의사항 등의 자세한 사항은 각 병·의원의 온라인 창구 (웹사이트, 소셜미디어)를 통해 문의바랍니다. ",
      },
      {
        id: "naturalLifting",
        title: "Natural lifting: Filler Acupuncture Treatment",
        price: "90만 원",
        duration: "90분",
        photos: ["/images/packages/woo_pk02.jpg"],
        rating: 0,
        reviewCount: 0,

        // 상세 정보
        process: [
          { icon: "📋", title: "검사 및 검진" },
          { icon: "🌿", title: "인대 교정술" },
          { icon: "🏃", title: "교정침" },
          { icon: "🥗", title: "매선시술" },
          { icon: "💊", title: "거상운동" },
          { icon: "💬", title: "사후관리" },
        ],
        details: [
          {
            title: "얼굴 3D 촬영 및 자세/걸음걸이 측정",
            description:
              "디지털 장비로 검사를 시행하여 외국인 환자에게 객관적인 지표를 바탕으로 설명합니다. 체계적인 검사 프로세스를 통해 종합적인 진단을 내리고 이에 적합한 한방 치료 방법을 처방합니다.",
            image: "/images/process/pk02_step1.png",
          },
          {
            title: "인대 교정술",
            description:
              "한의사가 직접 안면 인대를 마사지하여 안면 인대를 교정합니다. 또한, 노화와 중력으로 인해 처진 장기를 인체해부학적으로 마사지하여 끌어올려줍니다. 연결된 근육들이 재정렬되어 즉각적인 안면 리프팅 효과를 확인할 수 있습니다.",
            image: "/images/process/pk02_step2.png",
          },
          {
            title: "교정침",
            description:
              "교정침을 통해 보다 직접적인 근육에 자극을 주어 안면 교정에 탁월한 효과를 볼 수 있습니다. 통증은 적고 효과는 빨라 만족도가 높은 침술입니다.",
            image: "/images/process/pk02_step3.png",
          },
          {
            title: "매선시술",
            description:
              "한방 약실을 피부 및 근육층에 주입하여 처진 피부를 개선하고 주름을 완화하며, 탄력을 되찾아주는 시술입니다. 녹는 실을 사용하여 시간이 지나면서 자연스럽게 분해되고, 콜라겐 생성을 촉진하여 피부 재생 효과를 얻을 수 있습니다.",
            image: "/images/process/pk02_step4.png",
          },
          {
            title: "거상운동",
            description:
              "얼굴 근육을 단련하여 피부 탄력을 높이고 처짐이나 주름을 개선하는 운동입니다. 평상시 꾸준히 실천하여 지속력을 높여주고, 피부노화를 예방하는 데 도움이 됩니다.",
            image: "/images/process/pk02_step5.png",
          },
          {
            title: "사후관리",
            description:
              "모든 진료 후 꾸준한 사후 관리를 통해, 귀국 후에도 궁금한 부분을 해소해드립니다. 궁금한 점을 24시간 온라인을 통해 문의 가능합니다.",
            image: "/images/process/pk01_step6.png",
          },
        ],
        cautions: "예약 전 알레르기 여부를 꼭 알려주세요.",
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
