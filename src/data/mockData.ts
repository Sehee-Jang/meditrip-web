export type ShortVideo = {
  id: number;
  youtubeUrl: string;
  thumbnail: string;
  category: "스트레스" | "다이어트" | "면역관리" | "여성질환" | "안티에이징";
  title: string;
};

export const mockShorts: ShortVideo[] = [
  {
    id: 1,
    youtubeUrl: "https://www.youtube.com/shorts/1KsyWcipOJA",
    thumbnail: "/images/shorts_thumb1.jpg",
    category: "면역관리",
    title: "기침과 가래에 좋은 한방차 만들기",
  },
  {
    id: 2,
    youtubeUrl: "https://www.youtube.com/shorts/pYfr5DhnOak",
    thumbnail: "/images/shorts_thumb2.jpg",
    category: "스트레스",
    title: "스트레스 완화를 위한 호흡법",
  },
  {
    id: 3,
    youtubeUrl: "https://www.youtube.com/shorts/eedVPzSACkU",
    thumbnail: "/images/shorts_thumb3.jpg",
    category: "다이어트",
    title: "체지방 감량에 좋은 침자리",
  },
  {
    id: 4,
    youtubeUrl: "https://www.youtube.com/shorts/KrhhJw9Fq4Y",
    thumbnail: "/images/shorts_thumb4.jpg",
    category: "안티에이징",
    title: "10년 젊어지는 쳐진눈 올리기 마사지",
  },
];
