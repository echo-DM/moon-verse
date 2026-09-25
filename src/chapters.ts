export type Chapter = {
  title: string;
  subtitle: string;
  verse: string;
  lines: string[];
  note: string;
  camera: [number, number, number];
  target: [number, number, number];
  moon: [number, number, number];
};
export const chapters: Chapter[] = [
  {
    title: "把酒问天",
    subtitle: "A QUESTION TO THE MOON",
    verse: "明月几时有？\n把酒问青天。",
    lines: ["明月几时有？把酒问青天。", "不知天上宫阙，今夕是何年。"],
    note: "一杯酒，一轮月。随东坡的目光，走进千年前的夜色。",
    camera: [27, 15, 42],
    target: [0, 5, 0],
    moon: [6.66, 16.22, -19.72],
  },
  {
    title: "琼楼玉宇",
    subtitle: "A PALACE ABOVE THE CLOUDS",
    verse: "我欲乘风归去，\n又恐琼楼玉宇。",
    lines: ["我欲乘风归去，", "又恐琼楼玉宇，高处不胜寒。"],
    note: "乘风入云，天上宫阙近在眼前。月色愈清，高处愈寒。",
    camera: [28, 18, 39],
    target: [0, 9, 0],
    moon: [4.53, 20, -21.58],
  },
  {
    title: "起舞清影",
    subtitle: "DANCING WITH MY SHADOW",
    verse: "起舞弄清影，\n何似在人间。",
    lines: ["起舞弄清影，何似在人间。"],
    note: "归来庭院，清影随身。人间的一盏灯，也有自己的温度。",
    camera: [20, 14, 32],
    target: [0, 6, 0],
    moon: [0.44, 14.52, -29.99],
  },
  {
    title: "月照无眠",
    subtitle: "MOONLIGHT THROUGH THE WINDOW",
    verse: "转朱阁，低绮户，\n照无眠。",
    lines: ["转朱阁，低绮户，照无眠。"],
    note: "月光转过朱阁，穿过窗棂，落在一个未眠人的肩头。",
    camera: [22, 15, 32],
    target: [2, 6, 0],
    moon: [2.45, 13.93, -29.98],
  },
  {
    title: "对月问别",
    subtitle: "A FULL MOON, A DISTANT HEART",
    verse: "不应有恨，\n何事长向别时圆？",
    lines: ["不应有恨，", "何事长向别时圆？"],
    note: "舟行渐远，空亭独立。水上的月圆，照见人间的离别。",
    camera: [29, 14, 40],
    target: [0, 3, 0],
    moon: [5.23, 13.88, -20.5],
  },
  {
    title: "悲欢圆缺",
    subtitle: "EVERYTHING WAXES AND WANES",
    verse: "人有悲欢离合，\n月有阴晴圆缺。",
    lines: ["人有悲欢离合，月有阴晴圆缺，", "此事古难全。"],
    note: "云有聚散，月有盈亏。桥的两端，各有一段人生。",
    camera: [30, 17, 42],
    target: [0, 4, -1],
    moon: [7.35, 15.37, -18.9],
  },
  {
    title: "千里婵娟",
    subtitle: "BENEATH THE VERY SAME MOON",
    verse: "但愿人长久，\n千里共婵娟。",
    lines: ["但愿人长久，千里共婵娟。"],
    note: "山河相隔，月色相连。愿此刻的清辉，也落在你身旁。",
    camera: [37, 19, 46],
    target: [0, 5, -2],
    moon: [11.47, 18.38, -13.77],
  },
];
export const numerals = ["一", "二", "三", "四", "五", "六", "七"];
