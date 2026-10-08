// All on-screen copy lives here so fonts.ts can load only the glyph chunks used.

export const SMOKE_COLUMNS = [
  '仁義なき戦い',
  '極道の華',
  '喧嘩上等',
  '六十年代',
  '神室町の夜',
  '男の器を見極める',
  '義理と人情',
  '絶対的な絆',
];

export const CHARACTERS = {
  jojo: {
    name: 'JOJO',
    nameJP: 'ジョジョ',
    title: 'NEON EXILE',
    titleJP: 'ネオンの流れ者',
    kanji: '流',
  },
  sevas: {
    name: 'SEVAS',
    nameJP: 'セヴァス',
    title: "KAMURO'S CAREGIVER",
    titleJP: '神室町の世話係',
    kanji: '護',
  },
};

export const CLASH_STAMP = '対決';
export const HEAT_LABEL_JP = 'ヒート';
export const FLICKER_KANJI = '極道龍虎仁義侠拳魂怒熱闘炎狂鬼神斬覇華桜昇喧嘩漢血';

export const ALL_JP_TEXT = [
  ...SMOKE_COLUMNS,
  ...Object.values(CHARACTERS).flatMap((c) => [c.nameJP, c.titleJP, c.kanji]),
  CLASH_STAMP,
  HEAT_LABEL_JP,
  FLICKER_KANJI,
  '【】・',
].join('');

export const NEON_WORD = 'sixties';

// --- Montage remake ("6ties kitsch 5") ---
export const MONTAGE = {
  goal: 'ゴール!!',
  goAhead: '勝ち越し',
  hexDecoded: 'LOOK AT WHAT IT DID TO ME',
  heatAction: {label: 'HEAT ACTION', labelJP: 'ヒートアクション', name: 'ESSENCE OF THE HIT-AND-RUN'},
  styles: [
    {name: 'BRAWLER', jp: 'チンピラ'},
    {name: 'RUSH', jp: 'ラッシュ'},
    {name: 'BEAST', jp: '壊し屋'},
  ],
  substory: {labelJP: 'サブストーリー', number: 'SUBSTORY 06', title: 'How Are We Not Dead?', complete: 'COMPLETE', stamp: '完'},
  heat: {big: '熱', label: 'HEAT MODE'},
  legendJP: 'そして、伝説へ。',
  legendEN: 'AND SO, INTO LEGEND.',
  // Kanji stamped on cuts: 闇 dark, 蹴 kick, 夜 night, 銃 gun, 怨 grudge, 龍 dragon, 影 shadow, 謎 mystery, 血 blood, 変 change, 勝 victory
  stamps: '闇蹴夜銃怨龍影謎血変勝',
};
