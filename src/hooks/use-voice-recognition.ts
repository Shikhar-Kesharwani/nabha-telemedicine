
'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

// This needs to be defined here or imported to be used in handleCommand
const navItems = [
    { href: '/dashboard', labelKey: 'dashboard' },
    { href: '/appointments', labelKey: 'appointments' },
    { href: '/symptom-checker', labelKey: 'symptomChecker' },
    { href: '/health-records', labelKey: 'healthRecords' },
    { href: '/medicine-finder', labelKey: 'medicineFinder' },
    { href: '/pharmacy-locator', labelKey: 'pharmacies' },
    { href: '/ambulance-nearby', labelKey: 'ambulanceNearby' },
];

function clickElement(selector: string, textContent?: string) {
  let element: HTMLElement | null = null;
  if (textContent) {
    element = Array.from(document.querySelectorAll(selector)).find(el => el.textContent?.trim().toLowerCase().includes(textContent.toLowerCase())) as HTMLElement | null;
  } else {
    element = document.querySelector(selector);
  }
  
  if (element) {
    element.click();
    return true;
  }
  return false;
}

// Multilingual command mapping
const commandMap: { [key: string]: string | (() => boolean) | ((...args: any[]) => void) } = {
  // English
  'dashboard': '/dashboard',
  'home': '/dashboard',
  'main page': '/dashboard',
  'appointment': '/appointments',
  'appointments': '/appointments',
  'consultation': '/appointments',
  'schedule': '/appointments',
  'book': '/appointments',
  'symptom checker': '/symptom-checker',
  'check symptoms': '/symptom-checker',
  'symptoms': '/symptom-checker',
  'ai': '/symptom-checker',
  'health record': '/health-records',
  'health records': '/health-records',
  'my record': '/health-records',
  'my records': '/health-records',
  'my health': '/health-records',
  'records': '/health-records',
  'medicine': '/medicine-finder',
  'find medicine': '/medicine-finder',
  'medicine finder': '/medicine-finder',
  'pharmacy': '/pharmacy-locator',
  'pharmacies': '/pharmacy-locator',
  'medical store': '/pharmacy-locator',
  'ambulance': '/ambulance-nearby',
  'emergency': '/ambulance-nearby',
  'ambulance nearby': '/ambulance-nearby',

  // Hindi (Devanagari script) - Includes partials and synonyms
  'डैशबोर्ड': '/dashboard',
  'होम': '/dashboard',
  'मुख्य पृष्ठ': '/dashboard',
  'अपॉइंटमेंट': '/appointments',
  'अपॉइंटमेंट्स': '/appointments',
  'परामर्श': '/appointments',
  'मुलाकात': '/appointments',
  'लक्षण': '/symptom-checker',
  'लक्षण चेकर': '/symptom-checker',
  'एआई': '/symptom-checker',
  'स्वास्थ्य रिकॉर्ड': '/health-records',
  'रिकॉर्ड': '/health-records',
  'मेरा स्वास्थ्य': '/health-records',
  'दवाई': '/medicine-finder',
  'दवा': '/medicine-finder',
  'दवा खोजें': '/medicine-finder',
  'दवा खोजक': '/medicine-finder',
  'फार्मेसी': '/pharmacy-locator',
  'मेडिकल स्टोर': '/pharmacy-locator',
  'एम्बुलेंस': '/ambulance-nearby',
  'आपातकाल': '/ambulance-nearby',
  'आस-पास एम्बुलेंस': '/ambulance-nearby',

  // Punjabi (Gurmukhi script) - Includes partials and synonyms
  'ਡੈਸ਼ਬੋਰਡ': '/dashboard',
  'ਮੁੱਖ ਪੰਨਾ': '/dashboard',
  'ਅਪਾਇੰਟਮੈਂਟ': '/appointments',
  'ਅਪਾਇੰਟਮੈਂਟਸ': '/appointments',
  'ਮੁਲਾਕਾਤ': '/appointments',
  'ਸਲਾਹ-ਮਸ਼ਵਰਾ': '/appointments',
  'ਲੱਛਣ': '/symptom-checker',
  'ਲੱਛਣ ਜਾਂਚਕਰਤਾ': '/symptom-checker',
  'ਏਆਈ': '/symptom-checker',
  'ਸਿਹਤ ਰਿਕਾਰਡ': '/health-records',
  'ਰਿਕਾਰਡ': '/health-records',
  'ਮੇਰੀ ਸਿਹਤ': '/health-records',
  'ਦਵਾਈ': '/medicine-finder',
  'ਦਵਾਈ ਖੋਜਕ': '/medicine-finder',
  'ਫਾਰਮੇਸੀ': '/pharmacy-locator',
  'ਫਾਰਮੇਸੀਆਂ': '/pharmacy-locator',
  'ਮੈਡੀਕਲ ਸਟੋਰ': '/pharmacy-locator',
  'ਐਂਬੂਲੈਂਸ': '/ambulance-nearby',
  'ਐਮਰਜੈਂਸੀ': '/ambulance-nearby',
  'ਨੇੜੇ ਦੀ ਐਂਬੂਲੈਂਸ': '/ambulance-nearby',

  // Actions (English)
  'join call': () => clickElement('button', 'Join Call'),
  'get directions': () => clickElement('a[href*="google.com/maps/dir"]'),
  'check availability': () => clickElement('form button[type="submit"]'),
  'submit form': () => clickElement('form button[type="submit"]'),
  'get guidance': () => clickElement('button', 'Get AI Guidance'),
  'download record': () => clickElement('button', 'Download'),

  // Actions (Hindi)
  'कॉल जॉइन करो': () => clickElement('button', 'कॉल में शामिल हों'),
  'रास्ता देखो': () => clickElement('a[href*="google.com/maps/dir"]'),
  'उपलब्धता जांचें': () => clickElement('form button[type="submit"]'),
  'फॉर्म जमा करो': () => clickElement('form button[type="submit"]'),
  'सलाह लो': () => clickElement('button', 'AI मार्गदर्शन प्राप्त करें'),
  'रिकॉर्ड डाउनलोड करो': () => clickElement('button', 'Download'),
  
  // Actions (Punjabi)
  'ਕਾਲ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ': () => clickElement('button', 'ਕਾਲ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ'),
  'ਦਿਸ਼ਾਵਾਂ ਲਵੋ': () => clickElement('a[href*="google.com/maps/dir"]'),
  'ਉਪਲਬਧਤਾ ਦੀ ਜਾਂਚ ਕਰੋ': () => clickElement('form button[type="submit"]'),
  'ਫਾਰਮ ਜਮ੍ਹਾਂ ਕਰੋ': () => clickElement('form button[type="submit"]'),
  'ਸਲਾਹ ਲਵੋ': () => clickElement('button', 'AI ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ'),
  'ਰਿਕਾਰਡ ਡਾਊਨਲੋਡ ਕਰੋ': () => clickElement('button', 'Download'),
};

type VoiceRecognitionOptions = {
    onTranscript?: (transcript: string) => void;
};

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const { onTranscript } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { i18n, t } = useTranslation();

  const handleCommand = useCallback(
    (command: string) => {
       if (onTranscript) {
        onTranscript(command);
        setIsListening(false); // Stop listening after command is captured for form input
        return;
      }

      const normalizedCommand = command.toLowerCase().trim();
      
      const matchedKeyword = Object.keys(commandMap)
        .sort((a, b) => b.length - a.length) 
        .find(keyword => normalizedCommand.includes(keyword.toLowerCase()));

      if (matchedKeyword) {
        const action = commandMap[matchedKeyword];
        if (typeof action === 'string') {
          const navItem = navItems.find(item => item.href === action);
          const pageName = navItem ? t(navItem.labelKey as any) : action.substring(1);
          toast({
            title: t('navigating'),
            description: `${t('goingTo')} ${pageName}`,
          });
          router.push(action);
        } else if (typeof action === 'function') {
          const success = action();
          if (success) {
            toast({ title: t('actionComplete'), description: `${t('executing')} "${matchedKeyword}"` });
          } else {
             toast({ title: t('actionFailed'), description: `${t('couldNotFind')} "${matchedKeyword}"` });
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: t('commandNotRecognized'),
          description: `${t('didNotUnderstand')} "${command}".`,
        });
      }
    },
    [router, toast, t, onTranscript]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition is not supported by this browser.');
      return;
    }

    if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
    }
    
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    
    const langMap: { [key: string]: string } = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'pa': 'pa-IN',
    };
    recognition.lang = langMap[i18n.language] || 'en-IN';
    
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
       for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = event.results[event.results.length - 1][0].transcript;
      setTranscript(currentTranscript);
      
      const fullTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

      if (onTranscript) {
        onTranscript(fullTranscript);
      } 
      
      if (!onTranscript && finalTranscript) {
          handleCommand(finalTranscript);
          if (recognitionRef.current && isListening) {
             recognitionRef.current.stop();
          }
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      if(!onTranscript){
          toast({
            title: t('listening'),
            description: t('sayACommand'),
          });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        setIsListening(false);
        return;
      }
      
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast({
          variant: 'destructive',
          title: t('permissionDenied'),
          description: t('allowMicrophone'),
        });
      }
      setIsListening(false);
    };

    // Update language when it changes
    if (recognitionRef.current) {
        recognitionRef.current.lang = langMap[i18n.language] || 'en-IN';
    }

  }, [handleCommand, toast, i18n.language, t, onTranscript, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        toast({
          variant: 'destructive',
          title: t('voiceNotSupported'),
          description: t('browserNotSupported'),
        });
        return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        const langMap: { [key: string]: string } = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'pa': 'pa-IN',
        };
        recognitionRef.current.lang = langMap[i18n.language] || 'en-IN';
        recognitionRef.current?.start();
      } catch (error) {
        console.error("Error starting voice recognition:", error);
      }
    }
  };

  return { isListening, transcript, toggleListening };
};
