import { CATEGORIES } from "@/constants/categories";
import type { Video } from "@/types/video";

export const mockQuestions = [
  {
    username: "익명",
    date: "2025.07.15",
    category: CATEGORIES.women,
    question: "생리불순이 자주 발생하는데, 침 치료로도 개선이 될까요?",
    answers: 1,
  },
  {
    username: "소라맘",
    date: "2025.07.14",
    category: CATEGORIES.stress,
    question: "스트레스로 잠을 못 자는데, 한약이 도움이 되나요?",
    answers: 1,
  },
];

export const mockShorts = [
  {
    id: "1",
    youtubeUrl: "https://www.youtube.com/shorts/pYfr5DhnOak",
    thumbnail: "/images/shorts_thumb2.jpg",
    category: CATEGORIES.stress,
    title: "스트레스 완화를 위한 호흡법",
  },
  {
    id: "2",
    youtubeUrl: "https://www.youtube.com/shorts/pYfr5DhnOak",
    thumbnail: "/images/shorts_thumb2.jpg",
    category: CATEGORIES.stress,
    title: "스트레스 완화를 위한 호흡법",
  },
  {
    id: "3",
    youtubeUrl: "https://www.youtube.com/shorts/pYfr5DhnOak",
    thumbnail: "/images/shorts_thumb2.jpg",
    category: CATEGORIES.stress,
    title: "스트레스 완화를 위한 호흡법",
  },
  {
    id: "4",
    youtubeUrl: "https://www.youtube.com/shorts/pYfr5DhnOak",
    thumbnail: "/images/shorts_thumb2.jpg",
    category: CATEGORIES.stress,
    title: "스트레스 완화를 위한 호흡법",
  },
  {
    id: "5",
    youtubeUrl: "https://www.youtube.com/shorts/eedVPzSACkU",
    thumbnail: "/images/shorts_thumb3.jpg",
    category: CATEGORIES.diet,
    title: "체지방 감량에 좋은 침자리",
  },
  {
    id: "6",
    youtubeUrl: "https://www.youtube.com/shorts/eedVPzSACkU",
    thumbnail: "/images/shorts_thumb3.jpg",
    category: CATEGORIES.diet,
    title: "체지방 감량에 좋은 침자리",
  },
  {
    id: "7",
    youtubeUrl: "https://www.youtube.com/shorts/eedVPzSACkU",
    thumbnail: "/images/shorts_thumb3.jpg",
    category: CATEGORIES.diet,
    title: "체지방 감량에 좋은 침자리",
  },
  {
    id: "8",
    youtubeUrl: "https://www.youtube.com/shorts/eedVPzSACkU",
    thumbnail: "/images/shorts_thumb3.jpg",
    category: CATEGORIES.diet,
    title: "체지방 감량에 좋은 침자리",
  },

  {
    id: "9",
    youtubeUrl: "https://www.youtube.com/shorts/1KsyWcipOJA",
    thumbnail: "/images/shorts_thumb1.jpg",
    category: CATEGORIES.immunity,
    title: "기침과 가래에 좋은 한방차 만들기",
  },
  {
    id: "10",
    youtubeUrl: "https://www.youtube.com/shorts/1KsyWcipOJA",
    thumbnail: "/images/shorts_thumb1.jpg",
    category: CATEGORIES.immunity,
    title: "기침과 가래에 좋은 한방차 만들기",
  },
  {
    id: "11",
    youtubeUrl: "https://www.youtube.com/shorts/1KsyWcipOJA",
    thumbnail: "/images/shorts_thumb1.jpg",
    category: CATEGORIES.immunity,
    title: "기침과 가래에 좋은 한방차 만들기",
  },
  {
    id: "12",
    youtubeUrl: "https://www.youtube.com/shorts/1KsyWcipOJA",
    thumbnail: "/images/shorts_thumb1.jpg",
    category: CATEGORIES.immunity,
    title: "기침과 가래에 좋은 한방차 만들기",
  },
  {
    id: "13",
    youtubeUrl: "https://www.youtube.com/shorts/KrhhJw9Fq4Y",
    thumbnail: "/images/shorts_thumb4.jpg",
    category: CATEGORIES.antiaging,
    title: "10년 젊어지는 쳐진눈 올리기 마사지",
  },
  {
    id: "14",
    youtubeUrl: "https://www.youtube.com/shorts/KrhhJw9Fq4Y",
    thumbnail: "/images/shorts_thumb4.jpg",
    category: CATEGORIES.antiaging,
    title: "10년 젊어지는 쳐진눈 올리기 마사지",
  },
  {
    id: "15",
    youtubeUrl: "https://www.youtube.com/shorts/KrhhJw9Fq4Y",
    thumbnail: "/images/shorts_thumb4.jpg",
    category: CATEGORIES.antiaging,
    title: "10년 젊어지는 쳐진눈 올리기 마사지",
  },
  {
    id: "16",
    youtubeUrl: "https://www.youtube.com/shorts/KrhhJw9Fq4Y",
    thumbnail: "/images/shorts_thumb4.jpg",
    category: CATEGORIES.antiaging,
    title: "10년 젊어지는 쳐진눈 올리기 마사지",
  },
];

export const getMockVideos = (): Video[] =>
  mockShorts.map((v) => ({
    id: String(v.id),
    title: v.title,
    youtubeUrl: v.youtubeUrl,
    thumbnailUrl: v.thumbnail,
    category: v.category,
    viewCount: Math.floor(Math.random() * 10000 + 500),
  }));
