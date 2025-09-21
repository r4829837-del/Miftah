import { Question } from '../lib/storage';

// Questions pour الميول المهنية (Professional Inclinations)
export const professionalQuestions: Question[] = [
  {
    id: 'prof-1',
    text: 'أي من المجالات التالية تفضل العمل فيها؟',
    type: 'multiple_choice',
    options: [
      'الطب والعلوم الصحية',
      'الهندسة والتكنولوجيا',
      'التعليم والتدريب',
      'الفنون والإبداع',
      'الأعمال والإدارة',
      'القانون والعدالة'
    ],
    correctAnswer: ''
  },
  {
    id: 'prof-2',
    text: 'ما نوع البيئة التي تفضل العمل فيها؟',
    type: 'multiple_choice',
    options: [
      'مكتب هادئ ومنظم',
      'مختبر أو ورشة عمل',
      'في الهواء الطلق',
      'مع الناس والجمهور',
      'بيئة ديناميكية ومتغيرة',
      'بيئة إبداعية ومرنة'
    ],
    correctAnswer: ''
  },
  {
    id: 'prof-3',
    text: 'أي من هذه الأنشطة تستمتع بها أكثر؟',
    type: 'multiple_choice',
    options: [
      'حل المشاكل المعقدة',
      'مساعدة الآخرين',
      'الإبداع والابتكار',
      'التدريس والتوضيح',
      'القيادة والإدارة',
      'البحث والتحليل'
    ],
    correctAnswer: ''
  },
  {
    id: 'prof-4',
    text: 'ما نوع التحدي الذي تفضل مواجهته؟',
    type: 'multiple_choice',
    options: [
      'تحديات فكرية ومعرفية',
      'تحديات اجتماعية وإنسانية',
      'تحديات تقنية وعملية',
      'تحديات إبداعية وفنية',
      'تحديات إدارية وتنظيمية',
      'تحديات بحثية وعلمية'
    ],
    correctAnswer: ''
  },
  {
    id: 'prof-5',
    text: 'كيف تفضل قضاء وقت فراغك؟',
    type: 'multiple_choice',
    options: [
      'القراءة والتعلم',
      'مساعدة الآخرين',
      'ممارسة الهوايات الإبداعية',
      'ممارسة الرياضة',
      'التخطيط والتنظيم',
      'الاستكشاف والاكتشاف'
    ],
    correctAnswer: ''
  }
];

// Questions pour القدرات الفكرية (Cognitive Abilities)
export const cognitiveQuestions: Question[] = [
  {
    id: 'cog-1',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أستمتع بحل الألغاز والتحديات العقلية',
      'أجد سهولة في التفاعل مع أشخاص مختلفين عني'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-2',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أحب مقارنة أفكاري بتحليلات الآخرين',
      'أفضل الوصول إلى نتيجة عبر نقاش جماعي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-3',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'عند مواجهة مشكلة، أعتمد على قدرتي على التحليل المنطقي',
      'أكثر ما يزعجني هو التردد وعدم الحسم'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-4',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أحب تنظيم المعلومات بشكل مرتب ومنهجي',
      'أفضل إنجاز المهام خطوة بخطوة حتى النهاية'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-5',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أنا متفائل بقدرتي على إيجاد حلول',
      'حتى في الظروف الصعبة، أحافظ على تركيزي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-6',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'عند الحديث، أهتم بتحليل ردود فعل الآخرين',
      'غالبًا ما أشارك أفكاري وملاحظاتي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-7',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أؤمن أن التفكير الجماعي ينتج أفضل الحلول',
      'أعتقد أن أحيانًا الحدس يتفوق على المنطق'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-8',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أستمتع بالأنشطة التي تحفّز الذهن',
      'أفضّل الروتين الذي يمنحني الاستقرار'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-9',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'لدي قدرة على ملاحظة التفاصيل الصغيرة',
      'لا أترك نفسي تنشغل بالقلق كثيرًا'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-10',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'كثيرًا ما أتمكن من إقناع الآخرين بأفكاري',
      'أحب النقاش مع الجميع لاكتساب أفكار جديدة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-11',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أتكيف مع طريقة حديثي حسب مستوى الطرف الآخر',
      'غالبًا ما أستشير الآخرين قبل اتخاذ قرارات مهمة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-12',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أؤمن أن كل شخص يمكن أن يقدم فكرة جيدة',
      'أعتمد على إحساسي الداخلي أكثر من الحقائق أحيانًا'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-13',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أحب إشراك الآخرين في القرارات الكبيرة',
      'أرى التغيير كفرصة لتطوير قدراتي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-14',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'يقال عني أنني أستخدم أساليب مبتكرة',
      'أعتمد أحيانًا على تكرار العادات نفسها'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-15',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أستمتع بتجربة طرق جديدة لحل المشكلات',
      'لا تفوتني أي تفاصيل صغيرة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-16',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أنظم أفكاري بشكل منهجي',
      'أتعامل بهدوء دون قلق زائد'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-17',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أملك قدرة قوية على التركيز في التفاصيل',
      'لا أسمح لمشاكلي أن تظهر بسهولة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-18',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أستطيع قيادة الآخرين نحو حل منطقي',
      'أحب سماع آراء متنوعة قبل اتخاذ القرار'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-19',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أحاول دائمًا أن أجعل أفكاري واضحة للطرف الآخر',
      'أعتمد كثيرًا على الحدس والشعور'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-20',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أؤمن أن لدى الجميع شيئًا مهمًا ليضيفه',
      'لا أحب البقاء في نفس الروتين طويلًا'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-21',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أقارن وجهة نظري بوجهات نظر الآخرين قبل القرار',
      'أعمل عادة وفق نفس النمط العقلي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-22',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'لدي غالبًا حدس يساعدني على اختيار الصحيح',
      'أهتم بمراجعة التفاصيل بدقة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-23',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أبحث عن التغيير والهروب من الروتين',
      'أرى أن لا شيء يستحق القلق المفرط'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-24',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أفضل وجود قواعد أو إرشادات لعملي',
      'حتى لو تعقدت الأمور، أبقى متماسكًا'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-25',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'يقال إن لدي شخصية قيادية',
      'أتبنى مشاعري أساسًا في اتخاذ القرارات'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-26',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أختار كلماتي بعناية عند التعبير',
      'أحب التنقل بين مهام مختلفة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-27',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'يهمني أن أفهم كيف يرى الآخرون الأمور',
      'لا أستطيع التركيز في جو فوضوي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-28',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أطرح أسئلة لأفهم آراء الآخرين بوضوح',
      'ألاحظ أشياء قد لا ينتبه لها الآخرون'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-29',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أشعر أحيانًا بأفكار لا أستطيع تفسيرها منطقيًا',
      'أستطيع دائمًا إيجاد مخرج مهما كان الوضع'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-30',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أعتبر نفسي متعدد المهارات',
      'أفضل الاعتماد على نفسي عند الحاجة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-31',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أعطي التوجيهات للآخرين بسهولة',
      'أحب التغيير وتجربة بيئات جديدة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-32',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أكسب ثقة الناس بسرعة',
      'يساعدني التصنيف على تنظيم ذهني'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-33',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أحب تبادل الأفكار والخبرات باستمرار',
      'لا أتحمل الأخطاء غير الدقيقة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-34',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أبحث عن آراء مختلفة قبل اتخاذ القرار',
      'أفضل التفكير بهدوء دون قلق'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-35',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أحيانًا أعرف الحل الصحيح دون تفسير منطقي',
      'أثق غالبًا بآراء المقربين مني'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-36',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أشعر بالراحة في موقع القيادة',
      'أحتاج إلى تنظيم الأمور من حولي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-37',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أستطيع إقناع الآخرين بأسلوبي',
      'ألاحظ تفاصيل لا يراها الآخرون'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-38',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'نادرًا ما أحكم على الآخرين',
      'أتوقع مستقبلًا مليئًا بالفرص'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-39',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أفضل القرارات المشتركة أكثر من الفردية',
      'أحتفظ دائمًا بأفكاري الخاصة لنفسي'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-40',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'عندما أتحدث، أنجح بجذب الانتباه',
      'أراجع دائمًا عملي قبل تسليمه'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-41',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أهتم بانطباع الآخرين عني',
      'أؤمن بالحظ الجيد أحيانًا'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-42',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أرى أن لكل رأي جانب يمكن الدفاع عنه',
      'لا أحب الكشف عن ذاتي مباشرة'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-43',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أستمتع باتخاذ القرارات الجماعية',
      'أرى الأمور من زاوية إيجابية دائمًا'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-44',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أجعل نفسي محل تقدير بسهولة',
      'أفضل التحلي بالتواضع'
    ],
    correctAnswer: ''
  },
  {
    id: 'cog-45',
    text: 'حدد العبارة التي تشبهك إلى حد كبير:',
    type: 'multiple_choice',
    options: [
      'أحب أن أكون في دائرة التركيز',
      'أبقى هادئًا مهما كانت الظروف'
    ],
    correctAnswer: ''
  }
];

// Questions pour الذكاء العاطفي (Emotional Intelligence)
export const emotionalQuestions: Question[] = [
  {
    id: 'emo-1',
    text: 'عندما يخبرك صديقك أنه حزين، ماذا تفعل؟',
    type: 'multiple_choice',
    options: [
      'تستمع إليه باهتمام',
      'تحاول إسعافه بنصائح',
      'تتجاهل الموضوع',
      'تحاول تغيير الموضوع'
    ],
    correctAnswer: 'تستمع إليه باهتمام'
  },
  {
    id: 'emo-2',
    text: 'كيف تتعامل مع الغضب؟',
    type: 'multiple_choice',
    options: [
      'أتنفس بعمق وأحاول الهدوء',
      'أعبر عن غضبي فوراً',
      'أكتم غضبي',
      'أحاول تجاهل المشكلة'
    ],
    correctAnswer: 'أتنفس بعمق وأحاول الهدوء'
  },
  {
    id: 'emo-3',
    text: 'عندما ترى شخصاً يبكي، ما شعورك؟',
    type: 'multiple_choice',
    options: [
      'أشعر بالتعاطف وأريد المساعدة',
      'أشعر بعدم الارتياح',
      'لا أتأثر',
      'أشعر بالانزعاج'
    ],
    correctAnswer: 'أشعر بالتعاطف وأريد المساعدة'
  },
  {
    id: 'emo-4',
    text: 'كيف تتعامل مع النقد؟',
    type: 'multiple_choice',
    options: [
      'أستمع وأحاول التعلم',
      'أدافع عن نفسي فوراً',
      'أشعر بالإهانة',
      'أتجاهل النقد'
    ],
    correctAnswer: 'أستمع وأحاول التعلم'
  },
  {
    id: 'emo-5',
    text: 'عندما تشعر بالتوتر، ماذا تفعل؟',
    type: 'multiple_choice',
    options: [
      'أمارس تقنيات الاسترخاء',
      'أشكو للآخرين',
      'أكتم مشاعري',
      'أحاول الهروب من المشكلة'
    ],
    correctAnswer: 'أمارس تقنيات الاسترخاء'
  }
];

// Questions pour التفكير الإبداعي (Creative Thinking)
export const creativeQuestions: Question[] = [
  {
    id: 'cre-1',
    text: 'أحب تجربة طرق جديدة لإنجاز المهام.',
    type: 'multiple_choice',
    options: [
      'أحب تجربة طرق جديدة لإنجاز المهام.',
      'أفضل اتباع الطرق المجربة والآمنة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-2',
    text: 'تثيرني التحديات التي تتطلب أفكارًا مبتكرة.',
    type: 'multiple_choice',
    options: [
      'تثيرني التحديات التي تتطلب أفكارًا مبتكرة.',
      'أفضل التحديات التي لها حلول واضحة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-3',
    text: 'أستمتع بالتخيل ورسم صور ذهنية جديدة.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالتخيل ورسم صور ذهنية جديدة.',
      'أركز أكثر على ما هو واقعي وملموس.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-4',
    text: 'أغير خططي بسهولة إذا ظهرت فكرة أفضل.',
    type: 'multiple_choice',
    options: [
      'أغير خططي بسهولة إذا ظهرت فكرة أفضل.',
      'أفضل الالتزام بخطتي حتى النهاية.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-5',
    text: 'لدي أفكار متعددة عندما أحاول حل مشكلة.',
    type: 'multiple_choice',
    options: [
      'لدي أفكار متعددة عندما أحاول حل مشكلة.',
      'أبحث غالبًا عن الحل الأسرع والأبسط.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-6',
    text: 'أستمتع بطرح أسئلة غريبة أو مختلفة.',
    type: 'multiple_choice',
    options: [
      'أستمتع بطرح أسئلة غريبة أو مختلفة.',
      'أفضل الالتزام بالأسئلة المباشرة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-7',
    text: 'أرى في الأخطاء فرصة لاكتشاف شيء جديد.',
    type: 'multiple_choice',
    options: [
      'أرى في الأخطاء فرصة لاكتشاف شيء جديد.',
      'أعتبر الأخطاء عائقًا يجب تفاديه.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-8',
    text: 'لدي القدرة على ربط أشياء غير مترابطة لإيجاد فكرة جديدة.',
    type: 'multiple_choice',
    options: [
      'لدي القدرة على ربط أشياء غير مترابطة لإيجاد فكرة جديدة.',
      'أتعامل مع كل شيء بشكل منفصل وواضح.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-9',
    text: 'أشعر بالحماس عند التفكير في حلول غير مألوفة.',
    type: 'multiple_choice',
    options: [
      'أشعر بالحماس عند التفكير في حلول غير مألوفة.',
      'أفضل الحلول العملية والمألوفة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-10',
    text: 'أستمتع بالخيال والأحلام اليقظة.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالخيال والأحلام اليقظة.',
      'أركز غالبًا على الواقع والحقائق.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-11',
    text: 'أستطيع النظر إلى الأمور من زوايا مختلفة.',
    type: 'multiple_choice',
    options: [
      'أستطيع النظر إلى الأمور من زوايا مختلفة.',
      'أركز على الزاوية الأكثر وضوحًا.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-12',
    text: 'أحب المزج بين أفكار من مجالات مختلفة.',
    type: 'multiple_choice',
    options: [
      'أحب المزج بين أفكار من مجالات مختلفة.',
      'أفضل بقاء كل مجال منفصل عن الآخر.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-13',
    text: 'أستمتع بالتجارب غير المعتادة.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالتجارب غير المعتادة.',
      'أشعر براحة أكبر مع الروتين.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-14',
    text: 'أرى الاحتمالات في الأشياء التي تبدو عادية.',
    type: 'multiple_choice',
    options: [
      'أرى الاحتمالات في الأشياء التي تبدو عادية.',
      'أتعامل مع الأشياء كما هي دون خيال إضافي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-15',
    text: 'أبتكر حلولًا جديدة حتى للمشكلات البسيطة.',
    type: 'multiple_choice',
    options: [
      'أبتكر حلولًا جديدة حتى للمشكلات البسيطة.',
      'أفضل استخدام الحلول المتعارف عليها.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-16',
    text: 'أستطيع التفكير بسرعة في مواقف غير متوقعة.',
    type: 'multiple_choice',
    options: [
      'أستطيع التفكير بسرعة في مواقف غير متوقعة.',
      'أحتاج إلى وقت طويل للتفكير في الحلول.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-17',
    text: 'أحب العصف الذهني وجمع أكبر عدد من الأفكار.',
    type: 'multiple_choice',
    options: [
      'أحب العصف الذهني وجمع أكبر عدد من الأفكار.',
      'أفضل التوصل بسرعة إلى فكرة واحدة مناسبة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-18',
    text: 'أستمتع بتجربة أساليب جديدة في عملي.',
    type: 'multiple_choice',
    options: [
      'أستمتع بتجربة أساليب جديدة في عملي.',
      'أفضل التمسك بالأسلوب الذي أجيده.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-19',
    text: 'أجد متعة في التغيير والتجديد.',
    type: 'multiple_choice',
    options: [
      'أجد متعة في التغيير والتجديد.',
      'أشعر بالقلق عند حدوث التغيير.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-20',
    text: 'أستطيع استخدام نفس الشيء بطرق مختلفة.',
    type: 'multiple_choice',
    options: [
      'أستطيع استخدام نفس الشيء بطرق مختلفة.',
      'أستخدم الأشياء فقط لوظيفتها الأساسية.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-21',
    text: 'أرى في التحديات فرصة للتجريب.',
    type: 'multiple_choice',
    options: [
      'أرى في التحديات فرصة للتجريب.',
      'أرى في التحديات عقبة ينبغي تجاوزها بسرعة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-22',
    text: 'أجد نفسي أحيانًا أبتكر أفكارًا غريبة جدًا.',
    type: 'multiple_choice',
    options: [
      'أجد نفسي أحيانًا أبتكر أفكارًا غريبة جدًا.',
      'ألتزم غالبًا بالأفكار الواقعية.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-23',
    text: 'أحب المزج بين الخيال والواقع.',
    type: 'multiple_choice',
    options: [
      'أحب المزج بين الخيال والواقع.',
      'أفضل التفكير الواقعي البحت.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-24',
    text: 'أستمتع باللعب بالكلمات والمعاني.',
    type: 'multiple_choice',
    options: [
      'أستمتع باللعب بالكلمات والمعاني.',
      'أستخدم الكلمات بمعناها المباشر فقط.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-25',
    text: 'أحب البحث عن حلول غير مألوفة.',
    type: 'multiple_choice',
    options: [
      'أحب البحث عن حلول غير مألوفة.',
      'أفضل الحلول التي أثبتت نجاحها سابقًا.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-26',
    text: 'أتعلم بسرعة من التجارب الجديدة.',
    type: 'multiple_choice',
    options: [
      'أتعلم بسرعة من التجارب الجديدة.',
      'أفضل ما هو مألوف لي بالفعل.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-27',
    text: 'أرى في الفشل بداية لفكرة جديدة.',
    type: 'multiple_choice',
    options: [
      'أرى في الفشل بداية لفكرة جديدة.',
      'أعتبر الفشل نهاية الطريق.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-28',
    text: 'أستطيع الدمج بين أفكار تبدو متناقضة.',
    type: 'multiple_choice',
    options: [
      'أستطيع الدمج بين أفكار تبدو متناقضة.',
      'أتعامل مع الأفكار المتناقضة كأشياء منفصلة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-29',
    text: 'أشعر بالفضول تجاه ما هو غير عادي.',
    type: 'multiple_choice',
    options: [
      'أشعر بالفضول تجاه ما هو غير عادي.',
      'أركز أكثر على الأمور المعتادة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-30',
    text: 'أستمتع بالعمل في بيئات مرنة ومتغيرة.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالعمل في بيئات مرنة ومتغيرة.',
      'أفضل العمل في بيئات مستقرة وواضحة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-31',
    text: 'أجد نفسي دائمًا أطرح "ماذا لو؟".',
    type: 'multiple_choice',
    options: [
      'أجد نفسي دائمًا أطرح "ماذا لو؟".',
      'أطرح أسئلة محددة للحصول على إجابات مباشرة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-32',
    text: 'أستطيع رؤية استخدامات جديدة للأشياء القديمة.',
    type: 'multiple_choice',
    options: [
      'أستطيع رؤية استخدامات جديدة للأشياء القديمة.',
      'أستخدم الأشياء كما اعتدت استخدامها.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-33',
    text: 'أستمتع بتحدي القواعد التقليدية أحيانًا.',
    type: 'multiple_choice',
    options: [
      'أستمتع بتحدي القواعد التقليدية أحيانًا.',
      'أفضل احترام القواعد كما هي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-34',
    text: 'أشارك الآخرين أفكاري الغريبة دون تردد.',
    type: 'multiple_choice',
    options: [
      'أشارك الآخرين أفكاري الغريبة دون تردد.',
      'أفضل الاحتفاظ بأفكاري الغريبة لنفسي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-35',
    text: 'أستطيع رؤية الصورة الكبيرة بسهولة.',
    type: 'multiple_choice',
    options: [
      'أستطيع رؤية الصورة الكبيرة بسهولة.',
      'أركز أكثر على التفاصيل الصغيرة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-36',
    text: 'أشعر بالحماس عند تجربة مشروع جديد.',
    type: 'multiple_choice',
    options: [
      'أشعر بالحماس عند تجربة مشروع جديد.',
      'أشعر براحة أكبر مع المشاريع المألوفة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-37',
    text: 'أحب استكشاف أفكار لم يتم التفكير فيها من قبل.',
    type: 'multiple_choice',
    options: [
      'أحب استكشاف أفكار لم يتم التفكير فيها من قبل.',
      'أفضل السير على خطى من سبقوني.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-38',
    text: 'أرى في الخيال أداة مهمة للتطور.',
    type: 'multiple_choice',
    options: [
      'أرى في الخيال أداة مهمة للتطور.',
      'أرى في الخيال وسيلة للترفيه فقط.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-39',
    text: 'أبتكر حلولًا حتى عندما لا يُطلب مني ذلك.',
    type: 'multiple_choice',
    options: [
      'أبتكر حلولًا حتى عندما لا يُطلب مني ذلك.',
      'أنتظر الحاجة قبل التفكير في حلول جديدة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-40',
    text: 'أستطيع الدمج بين أفكار الآخرين وأفكاري.',
    type: 'multiple_choice',
    options: [
      'أستطيع الدمج بين أفكار الآخرين وأفكاري.',
      'أفضل الالتزام بأفكاري وحدي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-41',
    text: 'أستمتع بطرح أفكار جريئة وغير متوقعة.',
    type: 'multiple_choice',
    options: [
      'أستمتع بطرح أفكار جريئة وغير متوقعة.',
      'أفضل طرح أفكار آمنة ومتوقعة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-42',
    text: 'أستطيع إيجاد طرق جديدة للتعبير عن نفسي.',
    type: 'multiple_choice',
    options: [
      'أستطيع إيجاد طرق جديدة للتعبير عن نفسي.',
      'أستخدم دائمًا الطرق التقليدية للتعبير.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-43',
    text: 'أجد في التغيير فرصة للإبداع.',
    type: 'multiple_choice',
    options: [
      'أجد في التغيير فرصة للإبداع.',
      'أجد في التغيير مصدر قلق.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-44',
    text: 'أحب التفكير في أكثر من حل لنفس المشكلة.',
    type: 'multiple_choice',
    options: [
      'أحب التفكير في أكثر من حل لنفس المشكلة.',
      'أركز على حل واحد فقط.'
    ],
    correctAnswer: ''
  },
  {
    id: 'cre-45',
    text: 'أشعر أن الإبداع جزء أساسي من شخصيتي.',
    type: 'multiple_choice',
    options: [
      'أشعر أن الإبداع جزء أساسي من شخصيتي.',
      'أرى أن الإبداع ليس ضروريًا دائمًا.'
    ],
    correctAnswer: ''
  }
];

// Questions pour المهارات الاجتماعية (Social Skills)
export const socialQuestions: Question[] = [
  {
    id: 'soc-1',
    text: 'أستمتع بالتحدث مع أشخاص جدد والتعرف عليهم.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالتحدث مع أشخاص جدد والتعرف عليهم.',
      'أفضل البقاء مع الأشخاص الذين أعرفهم فقط.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-2',
    text: 'أستمع باهتمام عندما يتحدث الآخرون.',
    type: 'multiple_choice',
    options: [
      'أستمع باهتمام عندما يتحدث الآخرون.',
      'أقاطع أحيانًا لأشارك أفكاري بسرعة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-3',
    text: 'أجد من السهل تكوين صداقات جديدة.',
    type: 'multiple_choice',
    options: [
      'أجد من السهل تكوين صداقات جديدة.',
      'أحتاج إلى وقت طويل لأقترب من الناس.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-4',
    text: 'أتعاطف مع مشاعر الآخرين بسهولة.',
    type: 'multiple_choice',
    options: [
      'أتعاطف مع مشاعر الآخرين بسهولة.',
      'أركز أكثر على مواقفي الخاصة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-5',
    text: 'أحب المشاركة في الأنشطة الجماعية.',
    type: 'multiple_choice',
    options: [
      'أحب المشاركة في الأنشطة الجماعية.',
      'أفضل العمل بمفردي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-6',
    text: 'أستطيع التعبير عن رأيي بوضوح أمام الآخرين.',
    type: 'multiple_choice',
    options: [
      'أستطيع التعبير عن رأيي بوضوح أمام الآخرين.',
      'أجد صعوبة أحيانًا في التعبير عن أفكاري.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-7',
    text: 'أسعى لحل الخلافات بشكل ودي.',
    type: 'multiple_choice',
    options: [
      'أسعى لحل الخلافات بشكل ودي.',
      'أفضل تجنب المواجهات حتى لو لم تُحل المشكلة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-8',
    text: 'ألاحظ لغة جسد الآخرين وردود أفعالهم.',
    type: 'multiple_choice',
    options: [
      'ألاحظ لغة جسد الآخرين وردود أفعالهم.',
      'أركز أكثر على ما يقولونه بالكلمات فقط.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-9',
    text: 'أحب دعم وتشجيع الآخرين.',
    type: 'multiple_choice',
    options: [
      'أحب دعم وتشجيع الآخرين.',
      'أركز أكثر على إنجازي الشخصي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-10',
    text: 'أتكيف بسهولة مع مجموعات جديدة.',
    type: 'multiple_choice',
    options: [
      'أتكيف بسهولة مع مجموعات جديدة.',
      'أشعر بالتوتر عند الانضمام إلى مجموعة جديدة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-11',
    text: 'أستمتع بالعمل بروح الفريق.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالعمل بروح الفريق.',
      'أفضل أن أعمل بمفردي لاتخاذ قراراتي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-12',
    text: 'أقدّر آراء الآخرين حتى لو كانت مختلفة عني.',
    type: 'multiple_choice',
    options: [
      'أقدّر آراء الآخرين حتى لو كانت مختلفة عني.',
      'أجد صعوبة في تقبل الآراء التي لا أوافق عليها.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-13',
    text: 'أشارك أفكاري بوضوح في النقاشات.',
    type: 'multiple_choice',
    options: [
      'أشارك أفكاري بوضوح في النقاشات.',
      'أفضّل أن أكون مستمعًا أكثر من متحدث.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-14',
    text: 'أستطيع التعامل مع أشخاص مختلفين عني.',
    type: 'multiple_choice',
    options: [
      'أستطيع التعامل مع أشخاص مختلفين عني.',
      'أرتاح أكثر مع من يشبهونني.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-15',
    text: 'أستطيع طلب المساعدة من الآخرين بسهولة.',
    type: 'multiple_choice',
    options: [
      'أستطيع طلب المساعدة من الآخرين بسهولة.',
      'أفضل الاعتماد على نفسي فقط.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-16',
    text: 'أجد سهولة في تهدئة المواقف المتوترة.',
    type: 'multiple_choice',
    options: [
      'أجد سهولة في تهدئة المواقف المتوترة.',
      'أتوتر مع التوتر المحيط بي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-17',
    text: 'أستمتع بالأنشطة الاجتماعية مثل اللقاءات أو المناسبات.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالأنشطة الاجتماعية مثل اللقاءات أو المناسبات.',
      'أفضل تجنب الأنشطة الاجتماعية الكبيرة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-18',
    text: 'أستطيع تشجيع الآخرين على التعاون.',
    type: 'multiple_choice',
    options: [
      'أستطيع تشجيع الآخرين على التعاون.',
      'أجد صعوبة في تحفيز الآخرين.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-19',
    text: 'أطرح أسئلة لفهم وجهة نظر الآخرين.',
    type: 'multiple_choice',
    options: [
      'أطرح أسئلة لفهم وجهة نظر الآخرين.',
      'أركز أكثر على عرض وجهة نظري.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-20',
    text: 'أعتبر نفسي شخصًا متعاونًا.',
    type: 'multiple_choice',
    options: [
      'أعتبر نفسي شخصًا متعاونًا.',
      'أفضّل إنجاز الأمور بنفسي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-21',
    text: 'أستطيع المزاح وإضافة جو لطيف في المجموعة.',
    type: 'multiple_choice',
    options: [
      'أستطيع المزاح وإضافة جو لطيف في المجموعة.',
      'أفضّل الجدية في معظم المواقف.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-22',
    text: 'أحاول أن أكون لبقًا في تعاملي مع الناس.',
    type: 'multiple_choice',
    options: [
      'أحاول أن أكون لبقًا في تعاملي مع الناس.',
      'أكون مباشرًا حتى لو بدا الأمر حادًا.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-23',
    text: 'ألاحظ بسهولة مشاعر الآخرين.',
    type: 'multiple_choice',
    options: [
      'ألاحظ بسهولة مشاعر الآخرين.',
      'أحتاج أن يشرح لي الآخرون ما يشعرون به.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-24',
    text: 'أستطيع التحدث بثقة أمام مجموعة.',
    type: 'multiple_choice',
    options: [
      'أستطيع التحدث بثقة أمام مجموعة.',
      'أشعر بالحرج عند التحدث أمام مجموعة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-25',
    text: 'أستمتع بمساعدة الآخرين على النجاح.',
    type: 'multiple_choice',
    options: [
      'أستمتع بمساعدة الآخرين على النجاح.',
      'أركز أكثر على نجاحي الشخصي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-26',
    text: 'أعتبر نفسي جيدًا في العمل تحت إشراف قائد.',
    type: 'multiple_choice',
    options: [
      'أعتبر نفسي جيدًا في العمل تحت إشراف قائد.',
      'أفضّل أن أعمل بدون قيود أو تعليمات.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-27',
    text: 'أستطيع كسب ثقة الآخرين بسرعة.',
    type: 'multiple_choice',
    options: [
      'أستطيع كسب ثقة الآخرين بسرعة.',
      'أحتاج إلى وقت طويل لبناء الثقة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-28',
    text: 'أتكيف مع شخصيات مختلفة بسهولة.',
    type: 'multiple_choice',
    options: [
      'أتكيف مع شخصيات مختلفة بسهولة.',
      'أرتاح فقط مع من يتشابهون معي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-29',
    text: 'أحب أن أشارك الآخرين إنجازاتي.',
    type: 'multiple_choice',
    options: [
      'أحب أن أشارك الآخرين إنجازاتي.',
      'أفضّل أن أحتفظ بإنجازاتي لنفسي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-30',
    text: 'أستطيع التعامل مع النقد بشكل إيجابي.',
    type: 'multiple_choice',
    options: [
      'أستطيع التعامل مع النقد بشكل إيجابي.',
      'أجد صعوبة في تقبل النقد.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-31',
    text: 'أستمتع بالتعاون على حل المشكلات.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالتعاون على حل المشكلات.',
      'أفضل أن أجد الحل بمفردي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-32',
    text: 'أعتبر نفسي شخصًا مرحًا واجتماعيًا.',
    type: 'multiple_choice',
    options: [
      'أعتبر نفسي شخصًا مرحًا واجتماعيًا.',
      'أعتبر نفسي أكثر هدوءًا وانطواءً.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-33',
    text: 'أحب تبادل الأفكار مع الآخرين.',
    type: 'multiple_choice',
    options: [
      'أحب تبادل الأفكار مع الآخرين.',
      'أفضل التفكير بمفردي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-34',
    text: 'أستطيع التعامل مع أشخاص مختلفي الثقافات.',
    type: 'multiple_choice',
    options: [
      'أستطيع التعامل مع أشخاص مختلفي الثقافات.',
      'أجد صعوبة في التكيف مع اختلاف الثقافات.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-35',
    text: 'أستمتع بالعمل مع فرق متنوعة.',
    type: 'multiple_choice',
    options: [
      'أستمتع بالعمل مع فرق متنوعة.',
      'أفضل فرقًا تشبهني في التفكير.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-36',
    text: 'أستطيع إقناع الآخرين بسهولة.',
    type: 'multiple_choice',
    options: [
      'أستطيع إقناع الآخرين بسهولة.',
      'أجد صعوبة في إقناع الآخرين.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-37',
    text: 'أحب أن أكون جزءًا من مجموعة نشطة.',
    type: 'multiple_choice',
    options: [
      'أحب أن أكون جزءًا من مجموعة نشطة.',
      'أفضل المجموعات الصغيرة الهادئة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-38',
    text: 'أستطيع الاعتذار بسهولة إذا أخطأت.',
    type: 'multiple_choice',
    options: [
      'أستطيع الاعتذار بسهولة إذا أخطأت.',
      'أجد صعوبة في الاعتراف بالخطأ.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-39',
    text: 'أشارك الآخرين اهتماماتهم.',
    type: 'multiple_choice',
    options: [
      'أشارك الآخرين اهتماماتهم.',
      'أركز أكثر على اهتماماتي الخاصة.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-40',
    text: 'أستطيع التواصل بفعالية حتى مع الغرباء.',
    type: 'multiple_choice',
    options: [
      'أستطيع التواصل بفعالية حتى مع الغرباء.',
      'أشعر بالتحفظ عند التعامل مع الغرباء.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-41',
    text: 'أستمتع بتبادل النكات أو المزاح مع الآخرين.',
    type: 'multiple_choice',
    options: [
      'أستمتع بتبادل النكات أو المزاح مع الآخرين.',
      'أفضل الالتزام بالجدية دائمًا.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-42',
    text: 'أبحث عن التعاون عند مواجهة صعوبة.',
    type: 'multiple_choice',
    options: [
      'أبحث عن التعاون عند مواجهة صعوبة.',
      'أفضّل مواجهة الصعوبات بمفردي.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-43',
    text: 'أستطيع جعل الآخرين يشعرون بالراحة معي.',
    type: 'multiple_choice',
    options: [
      'أستطيع جعل الآخرين يشعرون بالراحة معي.',
      'أجد صعوبة في جعل الآخرين مرتاحين.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-44',
    text: 'أعتبر نفسي منفتحًا على الآخرين.',
    type: 'multiple_choice',
    options: [
      'أعتبر نفسي منفتحًا على الآخرين.',
      'أعتبر نفسي أكثر تحفظًا.'
    ],
    correctAnswer: ''
  },
  {
    id: 'soc-45',
    text: 'أرى أن العلاقات الاجتماعية مهمة للنجاح.',
    type: 'multiple_choice',
    options: [
      'أرى أن العلاقات الاجتماعية مهمة للنجاح.',
      'أعتقد أن النجاح يتحقق بالعمل الفردي أساسًا.'
    ],
    correctAnswer: ''
  }
];

// Fonction pour obtenir les questions selon نوع الاختبار
export function getQuestionsByType(testType: string): Question[] {
  switch (testType) {
    case 'professional':
      return professionalQuestions;
    case 'cognitive':
      return cognitiveQuestions;
    case 'emotional':
      return emotionalQuestions;
    case 'creative':
      return creativeQuestions;
    case 'social':
      return socialQuestions;
    default:
      return [];
  }
}

// Fonction pour obtenir le titre بالعربية
export function getTestTypeTitle(testType: string): string {
  const titles: { [key: string]: string } = {
    'professional': 'الميول المهنية',
    'cognitive': 'القدرات الفكرية',
    'emotional': 'الذكاء العاطفي',
    'creative': 'التفكير الإبداعي',
    'social': 'المهارات الاجتماعية'
  };
  return titles[testType] || '';
}

// Fonction pour obtenir la description détaillée du test
export function getTestDescription(testType: string): string {
  const descriptions: { [key: string]: string } = {
    'professional': 'اختبار لتحديد الميول المهنية والاهتمامات المهنية',
    'cognitive': 'هذا الاختبار يساعدك على التعرف بشكل أفضل على قدراتك العقلية: قوة الملاحظة، سرعة التفكير، القدرة على التحليل، الإبداع، المنطق، والذاكرة. الهدف من هذا الاختبار هو تمكينك من فهم نقاط قوتك الذهنية والجوانب التي يمكنك تطويرها.',
    'emotional': 'اختبار لقياس الذكاء العاطفي والقدرة على إدارة المشاعر',
    'creative': 'اختبار التفكير الإبداعي - الغرض من هذا الاختبار هو مساعدتك على التعرف على قدرتك على الإبداع والتفكير بطرق جديدة وغير تقليدية. ستجد مجموعة من الأسئلة التي تقيس: الخيال، المرونة الذهنية، الأصالة، حب الاستكشاف، وحل المشكلات بطرق مبتكرة.',
    'social': 'اختبار المهارات الاجتماعية - هذا الاختبار يساعدك على التعرف على قدرتك في التعامل مع الآخرين وبناء علاقات اجتماعية إيجابية. ستجد مجموعة من الأسئلة التي تقيس تواصلك، تعاونك، استماعك، ومرونتك في المواقف الاجتماعية المختلفة.'
  };
  return descriptions[testType] || '';
}

// Fonction pour évaluer les résultats du test de capacités intellectuelles
export function evaluateCognitiveTest(answers: { [key: string]: string }): {
  score: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
} {
  const totalQuestions = 45;
  let analyticalScore = 0; // قدرة تحليلية
  let creativeScore = 0; // قدرة إبداعية
  let socialScore = 0; // قدرة اجتماعية
  let leadershipScore = 0; // قدرة قيادية
  let detailScore = 0; // قدرة على التفاصيل

  // Analyser les réponses selon les patterns
  Object.entries(answers).forEach(([questionId, answer]) => {
    const questionNumber = parseInt(questionId.replace('cog-', ''));
    
    if (answer) {
      // Questions analytiques (1, 3, 4, 16, 17, 22, 24, 28, 33, 40)
      if ([1, 3, 4, 16, 17, 22, 24, 28, 33, 40].includes(questionNumber)) {
        if (answer.includes('تحليل') || answer.includes('منهجي') || answer.includes('تفاصيل') || answer.includes('مراجعة')) {
          analyticalScore++;
        }
      }
      
      // Questions créatives (2, 7, 13, 14, 15, 19, 23, 29, 31, 38)
      if ([2, 7, 13, 14, 15, 19, 23, 29, 31, 38].includes(questionNumber)) {
        if (answer.includes('إبداع') || answer.includes('تغيير') || answer.includes('مبتكرة') || answer.includes('حدس')) {
          creativeScore++;
        }
      }
      
      // Questions sociales (6, 10, 11, 12, 18, 20, 21, 27, 34, 35, 39, 42, 43)
      if ([6, 10, 11, 12, 18, 20, 21, 27, 34, 35, 39, 42, 43].includes(questionNumber)) {
        if (answer.includes('آخرين') || answer.includes('نقاش') || answer.includes('جماعي') || answer.includes('مشتركة')) {
          socialScore++;
        }
      }
      
      // Questions de leadership (5, 8, 9, 25, 26, 30, 32, 36, 37, 41, 44, 45)
      if ([5, 8, 9, 25, 26, 30, 32, 36, 37, 41, 44, 45].includes(questionNumber)) {
        if (answer.includes('قيادة') || answer.includes('إقناع') || answer.includes('توجيه') || answer.includes('تركيز')) {
          leadershipScore++;
        }
      }
    }
  });

  const totalScore = analyticalScore + creativeScore + socialScore + leadershipScore + detailScore;
  const percentage = Math.round((totalScore / totalQuestions) * 100);

  // Déterminer le profil dominant
  const maxScore = Math.max(analyticalScore, creativeScore, socialScore, leadershipScore);
  let dominantProfile = '';
  let strengths: string[] = [];
  let recommendations: string[] = [];

  if (analyticalScore === maxScore) {
    dominantProfile = 'التحليلي';
    strengths = ['قوة في التحليل المنطقي', 'القدرة على التنظيم', 'الاهتمام بالتفاصيل', 'المنهجية في التفكير'];
    recommendations = ['تطوير مهارات التفكير النقدي', 'ممارسة حل المشاكل المعقدة', 'دراسة الرياضيات والعلوم'];
  } else if (creativeScore === maxScore) {
    dominantProfile = 'الإبداعي';
    strengths = ['الخيال الواسع', 'القدرة على الابتكار', 'المرونة في التفكير', 'الحدس القوي'];
    recommendations = ['ممارسة الفنون والإبداع', 'تطوير مهارات التصميم', 'الانخراط في مشاريع إبداعية'];
  } else if (socialScore === maxScore) {
    dominantProfile = 'الاجتماعي';
    strengths = ['مهارات التواصل', 'القدرة على العمل الجماعي', 'التعاطف', 'فهم الآخرين'];
    recommendations = ['تطوير مهارات القيادة', 'ممارسة العمل التطوعي', 'دراسة علم النفس والاجتماع'];
  } else if (leadershipScore === maxScore) {
    dominantProfile = 'القيادي';
    strengths = ['القدرة على الإقناع', 'الثقة بالنفس', 'مهارات القيادة', 'القدرة على اتخاذ القرارات'];
    recommendations = ['تطوير مهارات الإدارة', 'ممارسة القيادة في الأنشطة', 'دراسة الإدارة والأعمال'];
  }

  const analysis = `بناءً على إجاباتك، أنت تمتلك شخصية ${dominantProfile} مع نقاط قوة في ${strengths.join(' و ')}.`;

  return {
    score: percentage,
    analysis,
    strengths,
    recommendations
  };
}

// Fonction pour évaluer les résultats du test de التفكير الإبداعي
export function evaluateCreativeTest(answers: { [key: string]: string }): {
  score: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
} {
  const totalQuestions = 45;
  let creativeScore = 0;
  let flexibilityScore = 0;
  let originalityScore = 0;
  let curiosityScore = 0;
  let problemSolvingScore = 0;

  // Analyser les réponses selon les patterns
  Object.entries(answers).forEach(([questionId, answer]) => {
    const questionNumber = parseInt(questionId.replace('cre-', ''));
    
    if (answer) {
      // Questions de créativité générale (1, 2, 9, 15, 25, 36, 37, 39, 41, 45)
      if ([1, 2, 9, 15, 25, 36, 37, 39, 41, 45].includes(questionNumber)) {
        if (answer.includes('جديدة') || answer.includes('مبتكرة') || answer.includes('إبداع') || answer.includes('إبداعي')) {
          creativeScore++;
        }
      }
      
      // Questions de flexibilité mentale (4, 11, 12, 20, 28, 30, 40, 44)
      if ([4, 11, 12, 20, 28, 30, 40, 44].includes(questionNumber)) {
        if (answer.includes('مختلفة') || answer.includes('مزج') || answer.includes('مرنة') || answer.includes('أكثر من')) {
          flexibilityScore++;
        }
      }
      
      // Questions d'originalité (3, 6, 10, 22, 23, 24, 32, 34, 42)
      if ([3, 6, 10, 22, 23, 24, 32, 34, 42].includes(questionNumber)) {
        if (answer.includes('تخيل') || answer.includes('غريبة') || answer.includes('خيال') || answer.includes('جديدة')) {
          originalityScore++;
        }
      }
      
      // Questions de curiosité (7, 13, 21, 26, 29, 31, 33, 35, 38)
      if ([7, 13, 21, 26, 29, 31, 33, 35, 38].includes(questionNumber)) {
        if (answer.includes('اكتشاف') || answer.includes('غير معتادة') || answer.includes('فضول') || answer.includes('ماذا لو')) {
          curiosityScore++;
        }
      }
      
      // Questions de résolution de problèmes créative (5, 8, 14, 16, 17, 18, 19, 27, 43)
      if ([5, 8, 14, 16, 17, 18, 19, 27, 43].includes(questionNumber)) {
        if (answer.includes('متعددة') || answer.includes('ربط') || answer.includes('عصف ذهني') || answer.includes('تجريب')) {
          problemSolvingScore++;
        }
      }
    }
  });

  const totalScore = creativeScore + flexibilityScore + originalityScore + curiosityScore + problemSolvingScore;
  const percentage = Math.round((totalScore / totalQuestions) * 100);

  // Déterminer le profil dominant
  const maxScore = Math.max(creativeScore, flexibilityScore, originalityScore, curiosityScore, problemSolvingScore);
  let dominantProfile = '';
  let strengths: string[] = [];
  let recommendations: string[] = [];

  if (creativeScore === maxScore) {
    dominantProfile = 'المبدع العام';
    strengths = ['قدرة عالية على الإبداع', 'حب التجديد والابتكار', 'الرغبة في تجربة طرق جديدة', 'الانفتاح على الأفكار الجديدة'];
    recommendations = ['ممارسة الأنشطة الفنية والإبداعية', 'تطوير مهارات التصميم', 'الانخراط في مشاريع إبداعية', 'دراسة الفنون والآداب'];
  } else if (flexibilityScore === maxScore) {
    dominantProfile = 'المرن ذهنياً';
    strengths = ['القدرة على التكيف', 'المرونة في التفكير', 'القدرة على رؤية الأمور من زوايا مختلفة', 'الانفتاح على التغيير'];
    recommendations = ['تطوير مهارات التفكير النقدي', 'ممارسة حل المشاكل المعقدة', 'دراسة الفلسفة والمنطق', 'الانخراط في أنشطة متنوعة'];
  } else if (originalityScore === maxScore) {
    dominantProfile = 'الأصيل';
    strengths = ['الخيال الواسع', 'القدرة على التفكير خارج الصندوق', 'الأصالة في الأفكار', 'حب الاستكشاف'];
    recommendations = ['ممارسة الكتابة الإبداعية', 'تطوير مهارات الرسم والتلوين', 'الانخراط في المسرح والفنون', 'دراسة الأدب والشعر'];
  } else if (curiosityScore === maxScore) {
    dominantProfile = 'الفضولي';
    strengths = ['حب الاستكشاف', 'الفضول المعرفي', 'حب التجارب الجديدة', 'الانفتاح على التعلم'];
    recommendations = ['ممارسة البحث العلمي', 'تطوير مهارات الاستقصاء', 'دراسة العلوم والتكنولوجيا', 'الانخراط في الأنشطة الاستكشافية'];
  } else if (problemSolvingScore === maxScore) {
    dominantProfile = 'حل المشاكل الإبداعي';
    strengths = ['القدرة على حل المشاكل بطرق مبتكرة', 'حب التحديات', 'القدرة على ربط الأفكار', 'حب التجريب'];
    recommendations = ['ممارسة الألغاز والتحديات العقلية', 'تطوير مهارات البرمجة', 'دراسة الرياضيات والهندسة', 'الانخراط في مشاريع تقنية'];
  }

  const analysis = `بناءً على إجاباتك، أنت تمتلك شخصية ${dominantProfile} مع نقاط قوة في ${strengths.join(' و ')}.`;

  return {
    score: percentage,
    analysis,
    strengths,
    recommendations
  };
}

// Fonction pour évaluer les résultats du test de المهارات الاجتماعية
export function evaluateSocialTest(answers: { [key: string]: string }): {
  score: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
} {
  const totalQuestions = 45;
  let communicationScore = 0;
  let empathyScore = 0;
  let cooperationScore = 0;
  let adaptabilityScore = 0;
  let leadershipScore = 0;

  // Analyser les réponses selon les patterns
  Object.entries(answers).forEach(([questionId, answer]) => {
    const questionNumber = parseInt(questionId.replace('soc-', ''));
    
    if (answer) {
      // Questions de communication (1, 6, 13, 24, 27, 36, 40)
      if ([1, 6, 13, 24, 27, 36, 40].includes(questionNumber)) {
        if (answer.includes('أستمتع') || answer.includes('أستطيع') || answer.includes('بسهولة') || answer.includes('بفعالية')) {
          communicationScore++;
        }
      }
      
      // Questions d'empathie (2, 4, 8, 9, 19, 23, 25, 39)
      if ([2, 4, 8, 9, 19, 23, 25, 39].includes(questionNumber)) {
        if (answer.includes('باهتمام') || answer.includes('أتعاطف') || answer.includes('ألاحظ') || answer.includes('أحب دعم')) {
          empathyScore++;
        }
      }
      
      // Questions de coopération (5, 11, 12, 15, 18, 20, 25, 31, 42)
      if ([5, 11, 12, 15, 18, 20, 25, 31, 42].includes(questionNumber)) {
        if (answer.includes('الجماعية') || answer.includes('الفريق') || answer.includes('متعاون') || answer.includes('التعاون')) {
          cooperationScore++;
        }
      }
      
      // Questions d'adaptabilité (3, 10, 14, 16, 17, 28, 34, 35, 37, 44)
      if ([3, 10, 14, 16, 17, 28, 34, 35, 37, 44].includes(questionNumber)) {
        if (answer.includes('بسهولة') || answer.includes('أتكيف') || answer.includes('مختلفين') || answer.includes('منفتح')) {
          adaptabilityScore++;
        }
      }
      
      // Questions de leadership (7, 21, 22, 26, 29, 30, 32, 33, 38, 41, 43, 45)
      if ([7, 21, 22, 26, 29, 30, 32, 33, 38, 41, 43, 45].includes(questionNumber)) {
        if (answer.includes('حل الخلافات') || answer.includes('مرح') || answer.includes('لبق') || answer.includes('قائد')) {
          leadershipScore++;
        }
      }
    }
  });

  const totalScore = communicationScore + empathyScore + cooperationScore + adaptabilityScore + leadershipScore;
  const percentage = Math.round((totalScore / totalQuestions) * 100);

  // Déterminer le profil dominant
  const maxScore = Math.max(communicationScore, empathyScore, cooperationScore, adaptabilityScore, leadershipScore);
  let dominantProfile = '';
  let strengths: string[] = [];
  let recommendations: string[] = [];

  if (communicationScore === maxScore) {
    dominantProfile = 'المتواصل المتميز';
    strengths = ['مهارات التواصل الفعال', 'القدرة على التعبير بوضوح', 'الثقة في التحدث أمام الجمهور', 'القدرة على كسب الثقة'];
    recommendations = ['تطوير مهارات العرض والتقديم', 'ممارسة الخطابة العامة', 'دراسة فنون التواصل', 'الانخراط في أنشطة النقاش'];
  } else if (empathyScore === maxScore) {
    dominantProfile = 'المتعاطف';
    strengths = ['فهم مشاعر الآخرين', 'القدرة على الاستماع الفعال', 'دعم وتشجيع الآخرين', 'الاهتمام بالآخرين'];
    recommendations = ['تطوير مهارات الاستشارة', 'ممارسة العمل التطوعي', 'دراسة علم النفس', 'الانخراط في أنشطة خدمة المجتمع'];
  } else if (cooperationScore === maxScore) {
    dominantProfile = 'المتعاون';
    strengths = ['حب العمل الجماعي', 'القدرة على التعاون', 'تقدير آراء الآخرين', 'طلب المساعدة عند الحاجة'];
    recommendations = ['تطوير مهارات إدارة الفريق', 'ممارسة العمل الجماعي', 'دراسة إدارة الأعمال', 'الانخراط في مشاريع جماعية'];
  } else if (adaptabilityScore === maxScore) {
    dominantProfile = 'المرن اجتماعياً';
    strengths = ['القدرة على التكيف', 'الانفتاح على الآخرين', 'التعامل مع التنوع', 'المرونة في المواقف المختلفة'];
    recommendations = ['تطوير مهارات القيادة', 'ممارسة العمل في بيئات متنوعة', 'دراسة العلاقات الدولية', 'الانخراط في أنشطة ثقافية متنوعة'];
  } else if (leadershipScore === maxScore) {
    dominantProfile = 'القائد الاجتماعي';
    strengths = ['حل الخلافات', 'إضافة جو إيجابي', 'اللباقة في التعامل', 'تقدير العلاقات الاجتماعية'];
    recommendations = ['تطوير مهارات القيادة', 'ممارسة إدارة الفرق', 'دراسة الإدارة والقيادة', 'الانخراط في مناصب قيادية'];
  }

  const analysis = `بناءً على إجاباتك، أنت تمتلك شخصية ${dominantProfile} مع نقاط قوة في ${strengths.join(' و ')}.`;

  return {
    score: percentage,
    analysis,
    strengths,
    recommendations
  };
}