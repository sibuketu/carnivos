/**
 * Community Conversations - コミュニティ会話のモックデータ
 *
 * ユーザー同士の会話がデータとして解析され、集合知になる設計
 */

export interface CommunityConversation {
  id: string;
  title: string;
  category: 'question' | 'experience' | 'tip';
  author: string;
  content: string;
  replies: number;
  views: number;
  upvotes: number;
  timestamp: string;
  tags: string[];
}

export const mockConversations: CommunityConversation[] = [
  {
    id: '1',
    title: '下痢が続いています。どう対処すべきですか？',
    category: 'question',
    author: '匿名ユーザーA',
    content: 'カーニボアを始めて3日目ですが、下痢が続いています。塩分を増やすべきでしょうか？',
    replies: 12,
    views: 245,
    upvotes: 8,
    timestamp: '2時間前',
    tags: ['下痢', '初心者', '症状'],
  },
  {
    id: '2',
    title: '便秘が改善しました！マグネシウム600mgで',
    category: 'experience',
    author: '匿名ユーザーB',
    content:
      'マグネシウムを600mg摂取するようにしたら、便秘が完全に改善しました。2週間続けています。',
    replies: 5,
    views: 189,
    upvotes: 15,
    timestamp: '5時間前',
    tags: ['便秘', '改善', 'マグネシウム'],
  },
  {
    id: '3',
    title: '違反後の回復方法について',
    category: 'question',
    author: '匿名ユーザーC',
    content: 'うっかり炭水化物を摂取してしまいました。16時間ファスティングで回復できますか？',
    replies: 18,
    views: 312,
    upvotes: 11,
    timestamp: '1日前',
    tags: ['違反', '回復', 'ファスティング'],
  },
  {
    id: '4',
    title: '塩分の摂取量について',
    category: 'question',
    author: '匿名ユーザーD',
    content: '1日どのくらいの塩分を摂取すべきですか？5000mg以上と聞きましたが...',
    replies: 23,
    views: 456,
    upvotes: 19,
    timestamp: '1日前',
    tags: ['塩分', 'ナトリウム', '初心者'],
  },
  {
    id: '5',
    title: '頭痛が続いています。ナトリウム不足でしょうか？',
    category: 'question',
    author: '匿名ユーザーE',
    content: 'カーニボアを始めてから頭痛が続いています。ナトリウムを増やすべきでしょうか？',
    replies: 9,
    views: 167,
    upvotes: 6,
    timestamp: '2日前',
    tags: ['頭痛', 'ナトリウム', '症状'],
  },
  {
    id: '6',
    title: 'こむら返りがなくなりました',
    category: 'experience',
    author: '匿名ユーザーF',
    content:
      'マグネシウムを増やしたら、こむら返りが完全になくなりました。毎日400mg摂取しています。',
    replies: 4,
    views: 134,
    upvotes: 12,
    timestamp: '2日前',
    tags: ['こむら返り', '改善', 'マグネシウム'],
  },
];
