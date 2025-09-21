import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PDFViewerProps {
  isVisible: boolean;
  onClose: () => void;
}

// Deprecated placeholder to avoid import breaks during stepwise revert
export default function ChatbotLogin() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
        content: `أنت Appamine، مساعد ذكي متخصص في التوجيه والإرشاد المهني. أنت ودود ومفيد ومطلع على جميع جوانب التوجيه المهني والاستشارة.

مهمتك:
- مساعدة المستخدمين في التوجيه والإرشاد المهني
- الإجابة على الأسئلة حول المسارات المهنية، الاختبارات، التقارير، والتوجيه
- تقديم معلومات مفيدة حول التوجيه المهني والإرشاد

أسلوبك:
- ودود ومهني
- دقيق ومفصل في الإجابات
- مفيد وعملي
- يتحدث العربية الفصحى بوضوح

        إذا سألك المستخدم "من أنت؟" أو أسئلة مماثلة، اشرح له أنك Appamine، المساعد الذكي لمستشار التوجيه والإرشاد المهني، وأنك هنا لمساعدته في جميع احتياجاته التوجيهية والإرشادية.`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [dynamicContent, setDynamicContent] = useState<{
    isVisible: boolean;
    contentType: string;
    data: any;
  }>({
    isVisible: false,
    contentType: '',
    data: null
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkLoginCommand = (message: string): boolean => {
    const loginCommands = ['لوحة التحكم', 'dashboard', 'login', 'دخول', 'تحكم', 'control panel'];
    return loginCommands.some(cmd => 
      message.toLowerCase().includes(cmd.toLowerCase())
    );
  };

  // Système d'interprétation intelligente - Comprend l'intention naturelle
  const interpretUserIntent = (message: string) => {
    const arabicMessage = message.toLowerCase();
    
    // Analyse sémantique des mots-clés arabes
    const keywords = {
      reports: ['تقرير', 'تقارير', 'rapport', 'reports'],
      students: ['طالب', 'طلاب', 'étudiant', 'étudiants', 'élève', 'élèves'],
      tests: ['اختبار', 'اختبارات', 'test', 'tests', 'examen', 'examens'],
      groups: ['مجموعة', 'مجموعات', 'groupe', 'groupes'],
      schedule: ['جدول', 'موعد', 'horaire', 'rendez-vous'],
      goals: ['هدف', 'أهداف', 'objectif', 'objectifs'],
      recommendations: ['توصية', 'توصيات', 'recommandation', 'recommandations']
    };
    
    // Détection de l'intention principale
    let primaryIntent = null;
    for (const [intent, words] of Object.entries(keywords)) {
      if (words.some(word => arabicMessage.includes(word))) {
        primaryIntent = intent;
        break;
      }
    }
    
    // Détection de l'action demandée
    const actions = {
      open: ['افتح', 'أريد', 'عرض', 'أرني', 'show', 'open', 'want'],
      create: ['إنشاء', 'أضف', 'جديد', 'create', 'add', 'new'],
      search: ['بحث', 'ابحث', 'find', 'search', 'look for'],
      edit: ['تعديل', 'عدل', 'edit', 'modify', 'change']
    };
    
    let requestedAction = 'open'; // Par défaut
    for (const [action, words] of Object.entries(actions)) {
      if (words.some(word => arabicMessage.includes(word))) {
        requestedAction = action;
        break;
      }
    }
    
    // Détection du contexte spécifique
    let specificContext = null;
    if (arabicMessage.includes('عملية الإعلام') || arabicMessage.includes('information process')) {
      specificContext = 'information-report';
    } else if (arabicMessage.includes('شامل') || arabicMessage.includes('comprehensive')) {
      specificContext = 'comprehensive-report';
    }
    
    return {
      primaryIntent,
      requestedAction,
      specificContext,
      originalMessage: message
    };
  };

  // Système d'interprétation intelligente - Interroge l'application et affiche directement
  const handleAdvancedNavigation = (message: string): boolean => {
    // Commandes d'interprétation intelligente (PRIORITÉ ABSOLUE)
    const intelligentCommands = {
      // Interprétation des rapports - Affichage direct
      'افتح تقرير عملية الإعلام': {
        action: 'openPdf',
        target: 'information-report',
        message: 'تم فتح تقرير عملية الإعلام! 📋',
        description: 'تقرير عملية الإعلام والتوجيه للتلاميذ'
      },
      'أريد تقرير عملية الإعلام': {
        action: 'openPdf',
        target: 'information-report',
        message: 'تم فتح تقرير عملية الإعلام! 📋',
        description: 'تقرير عملية الإعلام والتوجيه للتلاميذ'
      },
      'عرض تقرير عملية الإعلام': {
        action: 'openPdf',
        target: 'information-report',
        message: 'تم فتح تقرير عملية الإعلام! 📋',
        description: 'تقرير عملية الإعلام والتوجيه للتلاميذ'
      },
      'تقرير عملية الإعلام': {
        action: 'openPdf',
        target: 'information-report',
        message: 'تم فتح تقرير عملية الإعلام! 📋',
        description: 'تقرير عملية الإعلام والتوجيه للتلاميذ'
      },
      
      // Interprétation des étudiants - Affichage direct
      'عرض قائمة الطلاب': {
        action: 'openStudentList',
        target: 'student-list',
        message: 'تم فتح قائمة الطلاب! 👥',
        description: 'قائمة جميع الطلاب المسجلين'
      },
      'أريد رؤية الطلاب': {
        action: 'openStudentList',
        target: 'student-list',
        message: 'تم فتح قائمة الطلاب! 👥',
        description: 'قائمة جميع الطلاب المسجلين'
      },
      
      // Interprétation des tests - Affichage direct
      'عرض الاختبارات المتاحة': {
        action: 'openTestList',
        target: 'test-list',
        message: 'تم فتح قائمة الاختبارات! 📚',
        description: 'جميع الاختبارات المتاحة'
      },
      'أريد رؤية الاختبارات': {
        action: 'openTestList',
        target: 'test-list',
        message: 'تم فتح قائمة الاختبارات! 📚',
        description: 'جميع الاختبارات المتاحة'
      }
    };

    // Vérifier les commandes d'interprétation intelligente (PRIORITÉ ABSOLUE)
    console.log('🔍 Vérification des commandes intelligentes pour:', message);
    
    // Utiliser le nouveau système d'interprétation intelligente
    const intent = interpretUserIntent(message);
    console.log('🧠 Intention détectée:', intent);
    
    // Interroger la base de données virtuelle
    const queryResult = queryVirtualDatabase(intent);
    console.log('📊 Résultat de la requête:', queryResult);
    
    if (queryResult.action !== 'unknown' && queryResult.data) {
      console.log('✅ Action intelligente trouvée:', queryResult.action);
      
      setTimeout(async () => {
        try {
          // chatbot login disabled
          
          // Afficher le contenu dynamiquement selon le type
          switch (queryResult.action) {
            case 'openPdf':
              console.log('📄 Ouverture du PDF...');
              setDynamicContent({
                isVisible: true,
                contentType: 'pdf',
                data: queryResult.data
              });
              break;
              
            case 'showStudentList':
              console.log('👥 Affichage de la liste des étudiants...');
              setDynamicContent({
                isVisible: true,
                contentType: 'student-list',
                data: queryResult.data
              });
              break;
              
            case 'showTestList':
              console.log('📚 Affichage de la liste des tests...');
              setDynamicContent({
                isVisible: true,
                contentType: 'test-list',
                data: queryResult.data
              });
              break;
              
            case 'showReportList':
              console.log('📋 Affichage de la liste des rapports...');
              setDynamicContent({
                isVisible: true,
                contentType: 'report-list',
                data: queryResult.data
              });
              break;
          }
          
          // Message de confirmation intelligent
          let confirmationMessage = '';
          switch (queryResult.type) {
            case 'report':
              confirmationMessage = `تم فتح ${(queryResult.data as any).title}! 📋`;
              break;
            case 'student-list':
              confirmationMessage = `تم عرض قائمة الطلاب (${(queryResult.data as any[]).length} طالب)! 👥`;
              break;
            case 'test-list':
              confirmationMessage = `تم عرض الاختبارات المتاحة (${(queryResult.data as any[]).length} اختبار)! 📚`;
              break;
            case 'report-list':
              confirmationMessage = `تم عرض التقارير المتاحة (${(queryResult.data as any[]).length} تقرير)! 📊`;
              break;
            default:
              confirmationMessage = 'تم تنفيذ طلبك بنجاح! ✅';
          }
          
          const confirmationAiMessage: ChatMessage = {
            role: 'assistant',
            content: confirmationMessage
          };
          setMessages(prev => [...prev, confirmationAiMessage]);
          
        } catch (error) {
          console.error('Intelligent command error:', error);
        }
      }, 1000);
      
      return true;
    }
    
    // Fallback vers les anciennes commandes si nécessaire
    for (const [command, config] of Object.entries(intelligentCommands)) {
      console.log('🔍 Vérification de la commande:', command);
      if (message.includes(command) || message === command) {
        console.log('✅ Commande intelligente trouvée:', command, 'Action:', config.action);
        
        setTimeout(async () => {
          try {
            // chatbot login disabled
            
            if (config.action === 'openPdf') {
              console.log('📄 Ouverture du PDF...');
              // Afficher le PDF directement à l'écran (style NCIS)
              setShowPDF(true);
            } else if (config.action === 'openStudentList') {
              console.log('👥 Ouverture de la liste des étudiants...');
              // TODO: Implémenter l'affichage direct de la liste des étudiants
              setShowPDF(false); // Pour l'instant, on ferme le PDF
            } else if (config.action === 'openTestList') {
              console.log('📚 Ouverture de la liste des tests...');
              // TODO: Implémenter l'affichage direct de la liste des tests
              setShowPDF(false); // Pour l'instant, on ferme le PDF
            }
            
            // Message de confirmation
            const confirmationAiMessage: ChatMessage = {
              role: 'assistant',
              content: config.message
            };
            setMessages(prev => [...prev, confirmationAiMessage]);
            
          } catch (error) {
            console.error('Intelligent command error:', error);
          }
        }, 1000);
        
        return true;
      }
    }
    
    return false;
  };

  // Base de données virtuelle - Simule l'interrogation de l'application
  const virtualDatabase = {
    // Rapports disponibles
    reports: {
      'information-report': {
        id: 'info-001',
        title: 'تقرير عملية الإعلام والتوجيه للتلاميذ',
        type: 'pdf',
        path: '/dalil.pdf',
        description: 'تقرير شامل عن عملية الإعلام والتوجيه للتلاميذ للفصل الدراسي الحالي',
        metadata: {
          academicYear: '2024/2025',
          semester: 'الفصل الأول',
          level: 'السنة الأولى متوسط',
          groups: 4,
          students: 120
        }
      },
      'comprehensive-report': {
        id: 'comp-001',
        title: 'تقرير شامل للتوجيه المهني',
        type: 'pdf',
        path: '/comprehensive-report.pdf',
        description: 'تقرير شامل عن جميع الأنشطة والتوجيهات المهنية',
        metadata: {
          academicYear: '2024/2025',
          semester: 'الفصل الأول',
          totalActivities: 15,
          totalStudents: 450
        }
      }
    },
    
    // Étudiants (exemple)
    students: [
      { id: 1, name: 'أحمد محمد', level: 'السنة الأولى متوسط', group: 'أ', status: 'نشط' },
      { id: 2, name: 'فاطمة علي', level: 'السنة الأولى متوسط', group: 'أ', status: 'نشط' },
      { id: 3, name: 'محمد أحمد', level: 'السنة الأولى متوسط', group: 'ب', status: 'نشط' },
      { id: 4, name: 'عائشة حسن', level: 'السنة الأولى متوسط', group: 'ب', status: 'نشط' }
    ],
    
    // Tests disponibles
    tests: [
      { id: 1, title: 'اختبار التوجيه المهني الأساسي', duration: '30 دقيقة', level: 'متوسط' },
      { id: 2, title: 'اختبار الميول المهنية', duration: '45 دقيقة', level: 'متقدم' },
      { id: 3, title: 'اختبار القدرات المعرفية', duration: '60 دقيقة', level: 'متقدم' }
    ]
  };

  // Fonction d'interrogation intelligente de la base de données
  const queryVirtualDatabase = (intent: any) => {
    console.log('🔍 Interrogation de la base de données virtuelle pour:', intent);
    
    try {
      switch (intent.primaryIntent) {
        case 'reports':
          if (intent.specificContext === 'information-report') {
            return {
              type: 'report',
              data: virtualDatabase.reports['information-report'],
              action: 'openPdf'
            };
          } else if (intent.specificContext === 'comprehensive-report') {
            return {
              type: 'report',
              data: virtualDatabase.reports['comprehensive-report'],
              action: 'openPdf'
            };
          } else {
            // Retourner la liste des rapports disponibles
            return {
              type: 'report-list',
              data: Object.values(virtualDatabase.reports),
              action: 'showReportList'
            };
          }
          
        case 'students':
          return {
            type: 'student-list',
            data: virtualDatabase.students,
            action: 'showStudentList'
          };
          
        case 'tests':
          return {
            type: 'test-list',
            data: virtualDatabase.tests,
            action: 'showTestList'
          };
          
        default:
          return {
            type: 'unknown',
            data: null,
            action: 'unknown'
          };
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'interrogation de la base de données:', error);
      return {
        type: 'error',
        data: null,
        action: 'error'
      };
    }
  };

    // Composant d'affichage dynamique - S'adapte au type de contenu (Style NCIS)
  const DynamicContentViewer: React.FC<{ isVisible: boolean; onClose: () => void; contentType: string; data: any }> = ({ 
    isVisible, 
    onClose, 
    contentType, 
    data 
  }) => {
    if (!isVisible) return null;

    const renderContent = () => {
      switch (contentType) {
        case 'pdf':
          return (
            <iframe
              src={data.path}
              className="w-full h-full border-0"
              title={data.title}
              style={{ filter: 'brightness(1.1) contrast(1.05)' }}
            />
          );
          
        case 'student-list':
          return (
            <div className="w-full h-full bg-white p-6 overflow-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">قائمة الطلاب</h2>
              <div className="grid gap-4">
                {data.map((student: any) => (
                  <div key={student.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-semibold text-lg text-gray-800">{student.name}</h3>
                    <p className="text-gray-600">المستوى: {student.level}</p>
                    <p className="text-gray-600">المجموعة: {student.group}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      student.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
          
        case 'test-list':
          return (
            <div className="w-full h-full bg-white p-6 overflow-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">الاختبارات المتاحة</h2>
              <div className="grid gap-4">
                {data.map((test: any) => (
                  <div key={test.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h3 className="font-semibold text-lg text-gray-800">{test.title}</h3>
                    <p className="text-gray-600">المدة: {test.duration}</p>
                    <p className="text-gray-600">المستوى: {test.level}</p>
                  </div>
                ))}
              </div>
            </div>
          );
          
        case 'report-list':
          return (
            <div className="w-full h-full bg-white p-6 overflow-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">التقارير المتاحة</h2>
              <div className="grid gap-4">
                {data.map((report: any) => (
                  <div key={report.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="font-semibold text-lg text-gray-800">{report.title}</h3>
                    <p className="text-gray-600">{report.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      السنة الدراسية: {report.metadata.academicYear}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
          
        default:
          return (
            <div className="w-full h-full bg-white p-6 flex items-center justify-center">
              <p className="text-gray-500 text-lg">لا يوجد محتوى لعرضه</p>
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in">
        {/* Contenu dynamique en plein écran - Style NCIS */}
        <div className="relative w-full h-full animate-scale-in">
          {/* Bouton fermer discret en haut à droite */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm animate-fade-in-delayed"
            title="إغلاق"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Contenu dynamique - S'adapte au type */}
          {renderContent()}
        </div>
      </div>
    );
  };

  // Composant PDFViewer style NCIS - Document direct à l'écran (pour compatibilité)
  const PDFViewer: React.FC<PDFViewerProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in">
        {/* Document PDF en plein écran - Style NCIS */}
        <div className="relative w-full h-full animate-scale-in">
          {/* Bouton fermer discret en haut à droite */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm animate-fade-in-delayed"
            title="إغلاق"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* PDF en plein écran - Juste le document, rien d'autre */}
          <iframe
            src="/dalil.pdf"
            className="w-full h-full border-0"
            title="تقرير عملية الإعلام"
            style={{ filter: 'brightness(1.1) contrast(1.05)' }}
          />
        </div>
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Ajouter le message de l'utilisateur
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Vérifier si c'est une commande de navigation avancée EN PREMIER (priorité absolue)
    if (handleAdvancedNavigation(userMessage)) {
      return;
    }

    // Vérifier si c'est une commande de connexion (après la navigation avancée)
    if (checkLoginCommand(userMessage)) {
      try {
        // chatbot login disabled
        navigate('/');
        return;
      } catch (error) {
        console.error('Login error:', error);
      }
    }

    // Vérifier si c'est une demande de création de rapport (après la navigation avancée)
    if (userMessage.includes('أريد إنشاء تقرير شامل عن عملية الإعلام والتوجيه للتلاميذ') || 
        userMessage.includes('إنشاء تقرير') || 
        userMessage.includes('تقرير شامل')) {
      
      const reportResponse = `تم إنشاء التقرير الشامل عن عملية الإعلام والتوجيه للتلاميذ بنجاح! 📊

سأقوم الآن بـ:
1️⃣ **توصيلك** إلى النظام أولاً
2️⃣ **فتح قسم "إدارة التقارير"**

بعد الوصول، اتبع هذه الخطوات:
📋 **في قسم التقارير:**
• ابحث عن "تقرير عملية الإعلام"
• اضغط على "إنشاء التقرير"
• ستجد النموذج جاهز للملء

جاري التوصيل... ⏳`;
      
      const newAiMessage: ChatMessage = {
        role: 'assistant',
        content: reportResponse
      };

      setMessages(prev => [...prev, newAiMessage]);
      
      // Se connecter automatiquement puis rediriger vers les rapports
      setTimeout(async () => {
        try {
          // chatbot login disabled
          
          // Redirection vers la section des rapports
          navigate('/reports');
          
        } catch (error) {
          console.error('Login or navigation error:', error);
        }
      }, 2000);
      
      return;
    }

    // Vérifier si c'est une demande d'aide
    if (userMessage.includes('مساعدة') || userMessage.includes('help') || userMessage.includes('ماذا تستطيع') || userMessage.includes('أوامر')) {
      const helpResponse = `مرحباً! أنا Appamine، المساعد الذكي الذي يمكنه التنقل في جميع أقسام تطبيقك! 🚀

**أوامر التنقل المتاحة:**

📊 **التقارير:**
• "افتح تقرير عملية الإعلام"
• "أريد إنشاء تقرير شامل"
• "عرض التقارير"

👥 **إدارة الطلاب:**
• "إدارة الطلاب"
• "إضافة طالب جديد"
• "بحث عن طالب"

📚 **الاختبارات:**
• "إدارة الاختبارات"
• "إنشاء اختبار جديد"
• "أخذ اختبار"

📅 **الجدول الزمني:**
• "عرض الجدول"
• "إضافة موعد جديد"

🎯 **أوامر أخرى:**
• "لوحة التحكم" - للوصول للنظام
• "مساعدة" - لعرض هذه القائمة

**مثال:** قل "افتح تقرير عملية الإعلام" وسأقوم بذلك تلقائياً! ✨`;
      
      const newAiMessage: ChatMessage = {
        role: 'assistant',
        content: helpResponse
      };

      setMessages(prev => [...prev, newAiMessage]);
      return;
    }


    // Réponse intelligente basée sur le contenu
    setIsTyping(true);
    
    // Simuler un délai de réponse
    setTimeout(() => {
      let aiResponse = '';
      
             // Réponses intelligentes basées sur le contenu
       if (userMessage.includes('من أنت') || userMessage.includes('ما اسمك')) {
         aiResponse = 'أنا Appamine، المساعد الذكي لمستشار التوجيه والإرشاد المهني. أنا متخصص في مساعدتك في جميع احتياجاتك التوجيهية والإرشادية. يمكنني مساعدتك في التوجيه المهني، الاختبارات، التقارير، والاستشارة المهنية!';
       } else if (userMessage.includes('كيف') || userMessage.includes('ماذا')) {
         aiResponse = 'أنا هنا لمساعدتك! يمكنني إرشادك حول كيفية استخدام النظام، التوجيه المهني، إنشاء الاختبارات، عرض التقارير، والاستشارة المهنية. ما الذي تريد معرفته تحديداً؟';
       } else if (userMessage.includes('شكر') || userMessage.includes('ممتاز')) {
         aiResponse = 'شكراً لك! أنا سعيد لمساعدتك. إذا كنت تحتاج إلى أي شيء آخر، لا تتردد في السؤال. هل تريد الوصول إلى لوحة التحكم الآن؟';
       } else {
         aiResponse = 'أفهم سؤالك! أنا Appamine، المساعد الذكي لمستشار التوجيه والإرشاد المهني. يمكنني مساعدتك في جميع جوانب التوجيه المهني. اكتب "لوحة التحكم" للوصول إلى النظام الكامل.';
       }
      
      const newAiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse
      };

      setMessages(prev => [...prev, newAiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

    return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden" dir="rtl">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Contenu dynamique intelligent - Style NCIS */}
      <DynamicContentViewer 
        isVisible={dynamicContent.isVisible} 
        onClose={() => setDynamicContent({ isVisible: false, contentType: '', data: null })} 
        contentType={dynamicContent.contentType} 
        data={dynamicContent.data} 
      />
      
      {/* PDF Viewer Modal (pour compatibilité) */}
      <PDFViewer isVisible={showPDF} onClose={() => setShowPDF(false)} />
 
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">أ</span>
              </div>
              <h1 className="text-3xl font-bold text-white">أبامين</h1>
            </div>
            <p className="text-blue-200 text-lg">نظام التوجيه والإرشاد المهني الذكي</p>
          </div>
        </div>
      </div>
  
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center relative z-10">
        <div className="max-w-4xl w-full space-y-6">
          {messages.slice(1).map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-2xl px-6 py-4 rounded-3xl shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
                    : 'bg-white/10 backdrop-blur-xl text-white border border-white/20'
                }`}
              >
                <p className="text-base leading-relaxed font-medium">{message.content}</p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-6 py-4 rounded-3xl shadow-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex space-x-1 space-x-reverse">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-white/60 font-medium">يكتب...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse"></div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent border-none outline-none text-white text-lg font-medium placeholder-white/60"
                placeholder="اكتب رسالتك هنا..."
                dir="rtl"
                disabled={isTyping}
                autoFocus
              />
              <div className="w-2 h-6 bg-primary-400 animate-pulse rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 