/**
 * Primal Logic - Tips (豆知識)
 *
 * カーニボアダイエットに関するTipsデータ
 * ローディング中やアプリ起動時にランダム表示
 */

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty?: number; // 1-4 (⭐の数)
}

export const TIPS_DATA: Tip[] = [
  {
    id: 'tip_001',
    title: '花粉症と炭水化物の関係',
    content:
      '花粉症の症状は、実は炭水化物の摂取と深く関係しています。炭水化物を摂取すると血糖値が上がり、炎症反応が促進されます。カーニボアダイエットで炭水化物を完全に除去することで、多くの人が花粉症の症状が軽減または消失することを報告しています。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_002',
    title: '食物繊維は本当に必要？',
    content:
      '一般的に「食物繊維は腸に良い」と言われますが、実際には食物繊維は腸の刺激物であり、特に過敏性腸症候群（IBS）の人は食物繊維を除去することで症状が改善することが多いです。カーニボアでは食物繊維を完全に除去し、肉のみで腸の健康を維持します。',
    category: '消化',
    difficulty: 2,
  },
  {
    id: 'tip_003',
    title: 'レクチンと関節痛',
    content:
      '植物に含まれるレクチンは、関節軟骨に結合しやすく、炎症を引き起こす可能性があります。カーニボアで植物を完全に除去することで、多くの人が関節痛から解放されています。',
    category: '炎症',
    difficulty: 1,
  },
  {
    id: 'tip_004',
    title: 'オキサレートの蓄積',
    content:
      'ほうれん草やナッツなどに含まれるオキサレートは、体内に蓄積すると腎臓結石や関節痛の原因になることがあります。カーニボアではこれらの食品を完全に避けるため、オキサレート関連の問題が発生しません。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_005',
    title: '電解質バランスの重要性',
    content:
      'カーニボアではナトリウム排出が加速するため、積極的な塩分摂取（5000-8000mg/日）が必要です。また、マグネシウムとカリウムも重要で、肉汁を捨てずに摂取することでカリウムを補給できます。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_006',
    title: 'ケトフルとナトリウム',
    content:
      'カーニボア移行初期に起こる「ケトフル」（頭痛、疲労）は、主にナトリウム不足が原因です。低インスリン状態では腎臓からのナトリウム排出が加速するため、高用量のナトリウムが必要です。塩水を飲むことで症状が改善します。',
    category: '移行期',
    difficulty: 1,
  },
  {
    id: 'tip_007',
    title: 'ヘム鉄の吸収率',
    content:
      '動物性食品に含まれるヘム鉄は、植物性食品の非ヘム鉄と比べて5-10倍の吸収率があります。カーニボアでは鉄分不足の心配がほとんどありません。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_008',
    title: 'ビタミンB12の重要性',
    content:
      'ビタミンB12は動物性食品にのみ含まれます。植物性食品には含まれないため、完全菜食主義者はB12サプリメントが必要ですが、カーニボアでは自然に十分なB12を摂取できます。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_009',
    title: 'タウリンと心臓の健康',
    content:
      'タウリンは心臓の健康に重要なアミノ酸で、動物性食品（特に内臓肉、魚、貝類）に豊富に含まれています。植物性食品には含まれないため、カーニボアでは自然に十分なタウリンを摂取できます。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_010',
    title: 'コラーゲンと関節の健康',
    content:
      'コラーゲンは関節、皮膚、骨の健康に重要です。骨付き肉、皮付き肉、骨スープには豊富なコラーゲンが含まれています。カーニボアではこれらの部位を積極的に摂取することで、コラーゲンを自然に補給できます。',
    category: '健康',
    difficulty: 1,
  },
  {
    id: 'tip_011',
    title: 'DHA/EPAと脳の健康',
    content:
      'オメガ3脂肪酸（DHA/EPA）は脳の健康に重要です。魚（特にサーモン、サバ、イワシ）に豊富に含まれています。週に2-3回は魚を食べることで、十分なオメガ3を摂取できます。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_012',
    title: '骨スープのメリット',
    content:
      '骨スープにはグリシン、プロリン、コラーゲンが豊富に含まれています。腸の健康、関節の健康、睡眠の質向上に役立ちます。食事に骨スープを取り入れることで、これらの栄養素を簡単に補給できます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_013',
    title: '内臓肉の栄養密度',
    content:
      '内臓肉（レバー、心臓、腎臓）は非常に高い栄養密度を持っています。レバーにはビタミンA、鉄、B12が豊富に含まれています。週に1-2回、少量の内臓肉を食べることで、栄養バランスが大幅に改善されます。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_014',
    title: '乳製品とカーニボア',
    content:
      'カーニボアでは乳製品の扱いが分かれます。乳糖不耐症がない場合は、バター、チーズ、生クリームは許可されることが多いです。しかし、牛乳は避けるべきです。乳糖不耐症がある場合は、全ての乳製品を避けることを推奨します。',
    category: '実践',
    difficulty: 2,
  },
  {
    id: 'tip_015',
    title: '塩の種類と重要性',
    content:
      'カーニボアでは積極的な塩分摂取が必要です。一般的な食塩でも構いませんが、天然塩（海塩、ヒマラヤ塩、ケルティック塩）にはミネラルが豊富に含まれています。肉に直接塩を振って食べることで、効率的に塩分を摂取できます。',
    category: '実践',
    difficulty: 1,
  },
  {
    id: 'tip_016',
    title: 'P:F比率の目安',
    content:
      'カーニボアではタンパク質と脂質の比率（P:F比率）が重要です。一般的には1:1から1:2（脂質がタンパク質の1-2倍）が推奨されます。脂身の多い肉を選ぶことで、自然にこの比率を維持できます。',
    category: '実践',
    difficulty: 2,
  },
  {
    id: 'tip_017',
    title: '移行期の注意点',
    content:
      'カーニボアに移行する際は、最初の1-2週間は「ケトフル」と呼ばれる症状（頭痛、疲労、イライラ）が出ることがあります。これは体がケトーシスに適応する過程です。塩分と水分を十分に摂取することで、症状を軽減できます。',
    category: '移行期',
    difficulty: 1,
  },
  {
    id: 'tip_018',
    title: '消化の問題と対処法',
    content:
      '移行初期に消化の問題（下痢、便秘）が出ることがあります。これは腸内細菌の変化によるものです。通常は1-2週間で改善します。脂質を控えめにして、タンパク質を中心に摂取することで、症状を緩和できます。',
    category: '移行期',
    difficulty: 2,
  },
  {
    id: 'tip_019',
    title: '外食時の選択肢',
    content:
      '外食時は、プレーンバーガー（パンなし）、ステーキ、焼き魚、刺身などが良い選択肢です。調味料やソースには糖分や植物性オイルが含まれていることが多いため、できるだけシンプルな調理法を選びましょう。',
    category: '実践',
    difficulty: 1,
  },
  {
    id: 'tip_020',
    title: '肉の調理温度',
    content:
      '肉の調理温度は、安全性と栄養素の保持のバランスが重要です。ステーキは中まで火を通さず、表面を焼くだけでも十分に安全です。適度な加熱で、タンパク質の消化吸収も良くなります。',
    category: '実践',
    difficulty: 1,
  },
  {
    id: 'tip_021',
    title: 'ビタミンDと太陽光',
    content:
      'ビタミンDは太陽光を浴びることで体内で合成されます。カーニボアでは魚や卵にもビタミンDが含まれますが、日光浴も重要です。1日15-30分の太陽光暴露で、十分なビタミンDを合成できます。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_022',
    title: 'カリウムの補給方法',
    content:
      'カーニボアではカリウムの摂取も重要です。肉汁を捨てずに摂取することで、カリウムを補給できます。また、肉自体にもカリウムが含まれています。塩化カリウムを使用することも選択肢の一つです。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_023',
    title: 'マグネシウム不足のサイン',
    content:
      'マグネシウム不足のサインには、筋肉のけいれん、不眠、イライラなどがあります。カーニボアではマグネシウムの摂取が不足しがちなため、必要に応じてマグネシウムサプリメントを検討しましょう。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_024',
    title: '運動パフォーマンスとカーニボア',
    content:
      'カーニボアに適応すると、多くの人が運動パフォーマンスが向上することを報告しています。特に持久力が向上し、体脂肪率が下がります。適応には数週間から数ヶ月かかることがあるため、忍耐が必要です。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_025',
    title: '睡眠の質の改善',
    content:
      'カーニボアに移行すると、多くの人が睡眠の質が改善することを報告しています。血糖値の変動が少なくなり、深い睡眠が取れるようになります。就寝前の重い食事は避け、軽めの食事にしましょう。',
    category: '健康',
    difficulty: 1,
  },
  {
    id: 'tip_026',
    title: 'コレステロールの誤解',
    content:
      '血中コレステロール値の上昇は、カーニボアでは正常な反応です。コレステロールは細胞膜、ホルモン、ビタミンDの合成に必要です。LDLコレステロールが高いからといって、必ずしも問題ではありません。',
    category: '健康',
    difficulty: 3,
  },
  {
    id: 'tip_027',
    title: '体重減少と体重維持',
    content:
      'カーニボアでは多くの人が体重減少を経験しますが、適切な体重に達した後は自然に体重が維持されます。脂質とタンパク質を十分に摂取することで、過度な体重減少を防ぐことができます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_028',
    title: '女性特有の考慮事項',
    content:
      '女性は月経周期に応じて、栄養需要が変化します。特に鉄分の需要が高まる時期があります。レバーや赤身肉を積極的に摂取することで、鉄分を補給できます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_029',
    title: '水分摂取の重要性',
    content:
      'カーニボアでは、初期は水分の排出が増えることがあります。十分な水分と塩分を摂取することで、脱水を防ぐことができます。喉が渇いたと感じたら、積極的に水分を補給しましょう。',
    category: '実践',
    difficulty: 1,
  },
  {
    id: 'tip_030',
    title: '食事のタイミング',
    content:
      'カーニボアでは、1日1-2食で十分なことが多いです。頻繁に食べる必要がなくなり、空腹感が減ります。体の声に従い、本当に空腹の時だけ食べることで、自然な食事リズムが確立されます。',
    category: '実践',
    difficulty: 1,
  },
  {
    id: 'tip_031',
    title: 'グリシンとメチオニンのバランス',
    content:
      '筋肉肉にはメチオニンが多く、コラーゲン（骨、皮、軟骨）にはグリシンが多く含まれます。メチオニン過多は炎症を促進する可能性があるため、骨付き肉や皮付き肉を食べることで、グリシンとメチオニンのバランスを整えることができます。',
    category: '栄養',
    difficulty: 3,
  },
  {
    id: 'tip_032',
    title: 'ビタミンK2の重要性',
    content:
      'ビタミンK2は骨の健康と心血管の健康に重要です。動物性食品（特に草飼いの肉、内臓肉、発酵食品）に豊富に含まれています。カーニボアでは自然に十分なK2を摂取できます。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_033',
    title: '亜鉛と免疫機能',
    content:
      '亜鉛は免疫機能、創傷治癒、味覚に重要です。赤身肉、内臓肉、貝類に豊富に含まれています。カーニボアでは亜鉛不足の心配がほとんどありません。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_034',
    title: 'セレンと甲状腺の健康',
    content:
      'セレンは甲状腺ホルモンの合成に必要です。魚、内臓肉、卵に豊富に含まれています。週に数回は魚や内臓肉を食べることで、十分なセレンを摂取できます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_035',
    title: 'コリンと脳の健康',
    content:
      'コリンは脳の健康、記憶、学習に重要です。卵黄、内臓肉、魚に豊富に含まれています。特に卵黄はコリンの優れた供給源です。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_036',
    title: 'ビタミンAの過剰摂取の誤解',
    content:
      'レバーを食べるとビタミンA過剰になるという懸念がありますが、実際にはビタミンAの毒性は非常に稀です。週に1-2回、少量のレバーを食べることは安全で、栄養的に有益です。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_037',
    title: 'オメガ3とオメガ6の比率',
    content:
      '現代の食事ではオメガ6が過多になりがちですが、カーニボアでは草飼いの肉や魚を選ぶことで、オメガ3とオメガ6のバランスを整えることができます。週に2-3回は魚を食べることを推奨します。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_038',
    title: 'カルシウムの摂取',
    content:
      'カーニボアではカルシウムの摂取が不足するという懸念がありますが、実際には骨付き肉、小魚、骨スープからカルシウムを摂取できます。また、カルシウムの吸収にはビタミンDとK2が重要です。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_039',
    title: 'リンとカルシウムのバランス',
    content:
      '肉にはリンが多く含まれますが、カルシウムも同時に摂取することでバランスを保つことができます。骨付き肉や骨スープを食べることで、リンとカルシウムのバランスを整えることができます。',
    category: '栄養',
    difficulty: 3,
  },
  {
    id: 'tip_040',
    title: '銅と亜鉛のバランス',
    content:
      '内臓肉には銅が多く含まれますが、亜鉛も同時に摂取することでバランスを保つことができます。赤身肉と内臓肉を組み合わせて食べることで、銅と亜鉛のバランスを整えることができます。',
    category: '栄養',
    difficulty: 3,
  },
  {
    id: 'tip_041',
    title: 'ビタミンB群の重要性',
    content:
      'ビタミンB群（B1, B2, B3, B5, B6, B7, B9, B12）はエネルギー代謝、神経機能、DNA合成に重要です。動物性食品には全てのB群が豊富に含まれています。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_042',
    title: '葉酸（Folate）とB12の関係',
    content:
      '葉酸とB12は協力して働きます。どちらもDNA合成と赤血球の形成に必要です。カーニボアでは両方とも十分に摂取できます。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_043',
    title: 'ビタミンEの摂取',
    content:
      'ビタミンEは抗酸化物質として重要です。動物性食品には比較的少ないですが、卵や内臓肉に含まれています。また、ビタミンEの必要量は低炭水化物状態では減少する可能性があります。',
    category: '栄養',
    difficulty: 2,
  },
  {
    id: 'tip_044',
    title: 'ヨウ素と甲状腺',
    content:
      'ヨウ素は甲状腺ホルモンの合成に必要です。魚、貝類、海藻に豊富に含まれています。週に数回は魚を食べることで、十分なヨウ素を摂取できます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_045',
    title: 'モリブデンと硫黄代謝',
    content:
      'モリブデンは硫黄アミノ酸の代謝に必要です。内臓肉、特にレバーに豊富に含まれています。週に1-2回の内臓肉で十分です。',
    category: '栄養',
    difficulty: 3,
  },
  {
    id: 'tip_046',
    title: 'クロムと血糖値',
    content:
      'クロムはインスリンの作用を改善し、血糖値の安定に役立ちます。肉、特に内臓肉に含まれています。カーニボアでは血糖値が安定するため、クロムの需要も減少します。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_047',
    title: 'マンガンと抗酸化',
    content:
      'マンガンは抗酸化酵素の構成要素として重要です。内臓肉、特にレバーに含まれています。週に1-2回の内臓肉で十分です。',
    category: '栄養',
    difficulty: 3,
  },
  {
    id: 'tip_048',
    title: 'フッ素と骨の健康',
    content:
      'フッ素は骨と歯の健康に重要です。魚、特に小魚や骨付き魚に含まれています。週に数回は魚を食べることで、十分なフッ素を摂取できます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_049',
    title: 'ケイ素とコラーゲン',
    content:
      'ケイ素はコラーゲンの合成に重要です。骨スープや骨付き肉に含まれています。骨スープを定期的に飲むことで、ケイ素を補給できます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_050',
    title: 'バナジウムと血糖値',
    content:
      'バナジウムはインスリンの作用を改善し、血糖値の安定に役立ちます。内臓肉、特にレバーに含まれています。',
    category: '健康',
    difficulty: 3,
  },
  {
    id: 'tip_051',
    title: 'ニッケルと代謝',
    content:
      'ニッケルは特定の酵素の活性化に必要です。内臓肉、特にレバーに含まれています。週に1-2回の内臓肉で十分です。',
    category: '栄養',
    difficulty: 3,
  },
  {
    id: 'tip_052',
    title: 'ホウ素と骨の健康',
    content:
      'ホウ素は骨の健康とカルシウム代謝に重要です。肉には比較的少ないですが、骨スープに含まれています。',
    category: '健康',
    difficulty: 3,
  },
  {
    id: 'tip_053',
    title: '塩素と電解質バランス',
    content:
      '塩素はナトリウムと共に電解質バランスを保つために重要です。塩（塩化ナトリウム）を摂取することで、塩素も同時に補給できます。',
    category: '栄養',
    difficulty: 1,
  },
  {
    id: 'tip_054',
    title: '移行期の便秘',
    content:
      'カーニボア移行初期に便秘になることがあります。これは食物繊維を除去したことによる一時的な反応です。通常は1-2週間で改善します。水分と塩分を十分に摂取することで、症状を緩和できます。',
    category: '移行期',
    difficulty: 1,
  },
  {
    id: 'tip_055',
    title: '移行期の下痢',
    content:
      'カーニボア移行初期に下痢になることがあります。これは脂質の摂取量が急に増えたことによる一時的な反応です。脂質を控えめにして、タンパク質を中心に摂取することで、症状を緩和できます。',
    category: '移行期',
    difficulty: 1,
  },
  {
    id: 'tip_056',
    title: '移行期の疲労感',
    content:
      'カーニボア移行初期に疲労感が出ることがあります。これは体がケトーシスに適応する過程です。塩分と水分を十分に摂取し、十分な睡眠を取ることで、症状を軽減できます。',
    category: '移行期',
    difficulty: 1,
  },
  {
    id: 'tip_057',
    title: '移行期のイライラ',
    content:
      'カーニボア移行初期にイライラすることがあります。これは血糖値の変動や電解質のバランスが崩れたことによる一時的な反応です。塩分を十分に摂取し、時間をかけて適応することで、症状が改善します。',
    category: '移行期',
    difficulty: 1,
  },
  {
    id: 'tip_058',
    title: '適応期間の個人差',
    content:
      'カーニボアへの適応期間は個人差があります。早い人は1-2週間、遅い人は数ヶ月かかることがあります。焦らず、体の声に従いながら続けることが重要です。',
    category: '移行期',
    difficulty: 1,
  },
  {
    id: 'tip_059',
    title: '運動とカーニボア',
    content:
      'カーニボアに適応すると、多くの人が運動パフォーマンスが向上することを報告しています。特に持久力が向上し、体脂肪率が下がります。適応期間中は運動強度を下げることを推奨します。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_060',
    title: 'カーニボアとメンタルヘルス',
    content:
      'カーニボアに移行すると、多くの人がメンタルヘルスが改善することを報告しています。不安やうつ症状が軽減し、集中力が向上します。これは血糖値の安定と炎症の減少によるものと考えられます。',
    category: '健康',
    difficulty: 2,
  },
  {
    id: 'tip_mindset_001',
    title: '完璧主義の罠',
    content: '「100点か0点か」という考え方は継続の敵です。1回ピザを食べたからといって、全てが台無しになるわけではありません。重要なのは、次の食事ですぐにカーニボアに戻ることです。',
    category: 'Mindset',
    difficulty: 2,
  },
  {
    id: 'tip_mindset_002',
    title: '自分軸を持つ',
    content: '周囲の意見に流されず、「自分がどう感じるか」を大切にしましょう。他人の批判よりも、自分の体の調子の良さが最大の証拠です。',
    category: 'Mindset',
    difficulty: 2,
  },
  {
    id: 'tip_social_001',
    title: '社交での「毒」の管理法',
    content: '友人との食事で避けられない場合、ピザやパスタを食べることもあるでしょう。それは「失敗」ではなく「ソーシャルコスト」です。翌日16時間断食をして、代謝をリセットすれば問題ありません。',
    category: 'Social',
    difficulty: 2,
  },
  {
    id: 'tip_social_002',
    title: '孤独とコルチゾール',
    content: '過度な孤独感はストレスホルモン（コルチゾール）を上昇させ、代謝に悪影響を与えます。たまには友人と食事を楽しみ、心をリフレッシュさせることも、広い意味での「健康管理」です。',
    category: 'Social',
    difficulty: 3,
  },
  {
    id: 'tip_social_003',
    title: '断る技術',
    content: '飲み会では「ドクターストップで...」と言うのが最も角が立ちません。「アレルギー」と言うのも効果的です。無理に説明して論争になるのを避けましょう。',
    category: 'Social',
    difficulty: 1,
  },
];

/**
 * 順番にTipを取得（進捗感を出すため）
 */
export function getSequentialTip(currentIndex?: number): { tip: Tip; index: number } {
  const savedIndex =
    typeof window !== 'undefined' ? localStorage.getItem('tips_current_index') : null;
  let index = currentIndex !== undefined ? currentIndex : savedIndex ? parseInt(savedIndex, 10) : 0;

  if (index >= TIPS_DATA.length) {
    index = 0; // 最後まで行ったら最初に戻る
  }

  const tip = TIPS_DATA[index];

  // 次のインデックスを保存
  if (typeof window !== 'undefined') {
    localStorage.setItem('tips_current_index', String(index + 1));
  }

  return { tip, index };
}

/**
 * 次のTipを取得（順番）
 */
export function getNextTip(currentIndex: number): { tip: Tip; index: number } {
  const nextIndex = currentIndex + 1 >= TIPS_DATA.length ? 0 : currentIndex + 1;
  return getSequentialTip(nextIndex);
}

/**
 * 前のTipを取得（順番）
 */
export function getPrevTip(currentIndex: number): { tip: Tip; index: number } {
  const prevIndex = currentIndex - 1 < 0 ? TIPS_DATA.length - 1 : currentIndex - 1;
  return { tip: TIPS_DATA[prevIndex], index: prevIndex };
}

/**
 * ランダムなTipを取得（後方互換性のため残す）
 */
export function getRandomTip(): Tip {
  const randomIndex = Math.floor(Math.random() * TIPS_DATA.length);
  return TIPS_DATA[randomIndex];
}

/**
 * カテゴリ別のTipを取得
 */
export function getTipsByCategory(category: string): Tip[] {
  return TIPS_DATA.filter((tip) => tip.category === category);
}

/**
 * 現在のTip以外のランダムなTipを取得（後方互換性のため残す）
 */
export function getRandomTipExcluding(excludeId: string): Tip {
  const available = TIPS_DATA.filter((tip) => tip.id !== excludeId);
  if (available.length === 0) {
    // 除外するTipがない場合は通常のランダムTipを返す
    return getRandomTip();
  }
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * 保存されたTipのIDリストを取得
 */
function getSavedTipIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('@primal_logic:saved_tips');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Tipを保存済みかチェック
 */
export function isTipSaved(id: string): boolean {
  const ids = getSavedTipIds();
  return ids.includes(id);
}

/**
 * Tipを保存
 */
export function saveTip(tip: Tip): void {
  const ids = getSavedTipIds();
  if (!ids.includes(tip.id)) {
    ids.push(tip.id);
    localStorage.setItem('@primal_logic:saved_tips', JSON.stringify(ids));
  }
}

/**
 * Tipの保存を解除
 */
export function unsaveTip(id: string): void {
  const ids = getSavedTipIds();
  const newIds = ids.filter((savedId) => savedId !== id);
  localStorage.setItem('@primal_logic:saved_tips', JSON.stringify(newIds));
}
