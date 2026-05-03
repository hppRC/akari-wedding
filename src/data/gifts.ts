export type Gift = {
  id: string;
  name: string;
  message: string;
  image: string;
};

export const gifts: Gift[] = [
  {
    id: 'pajama',
    name: 'おそろいパジャマ',
    message: 'おそろいのパジャマで仲良く過ごしてね',
    image: 'images/IMG_0022.jpg',
  },
  {
    id: 'air-cleaner',
    name: 'ジアイーノ',
    message: 'よっしーの作った綺麗な空気で過ごしてね',
    image: 'images/IMG_0021.jpg',
  },
  {
    id: 'facial-device',
    name: '美顔器',
    message: 'ツルツルお肌になっちゃおう！',
    image: 'images/IMG_0020.jpg',
  },
  {
    id: 'bread-maker',
    name: 'ホームベーカリー',
    message: '美味しいパンで幸せ家庭になってね',
    image: 'images/IMG_0019.jpg',
  },
  {
    id: 'hair-dryer',
    name: 'ドライヤー',
    message: '2人で美髪になってね',
    image: 'images/IMG_0018.jpg',
  },
  {
    id: 'garment-steamer',
    name: '衣類スチーマー',
    message: 'シワなし服のシゴデキ夫婦を応援します',
    image: 'images/IMG_0017.jpg',
  },
  {
    id: 'shower-head',
    name: 'シャワーヘッド',
    message: '優雅なお風呂時間を過ごしてね',
    image: 'images/IMG_0016.jpg',
  },
  {
    id: 'hot-plate',
    name: 'ホットプレート',
    message: 'パーティだ！',
    image: 'images/IMG_0026.jpg',
  },
  {
    id: 'air-fryer',
    name: 'エアフライヤー',
    message: '時短で美味しく〜',
    image: 'images/IMG_0025.jpg',
  },
];
