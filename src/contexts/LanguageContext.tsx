import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Add index signature type
interface TranslationDict {
  [key: string]: string;
}

const translations: { [lang: string]: TranslationDict } = {
  english: {
    settings: 'Settings',
    manageAccount: 'Manage your account and system preferences',
    profile: 'Profile',
    security: 'Security',
    notifications: 'Notifications',
    system: 'System',
    profileInfo: 'Profile Information',
    updatePersonalInfo: 'Update your personal information',
    fullName: 'Full Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    department: 'Department',
    emailCannotBeChanged: 'Email cannot be changed',
    updateProfile: 'Update Profile',
    updating: 'Updating...',
    securitySettings: 'Security Settings',
    manageAccountSecurity: 'Manage your account security',
    changePassword: 'Change Password',
    updateAccountPassword: 'Update your account password',
    twoFactorAuth: 'Two-Factor Authentication',
    addExtraSecurity: 'Add an extra layer of security',
    enable2FA: 'Enable 2FA',
    sessionManagement: 'Session Management',
    manageActiveSessions: 'Manage your active sessions',
    viewSessions: 'View Sessions',
    notificationPreferences: 'Notification Preferences',
    chooseNotifications: 'Choose what notifications you want to receive',
    emailNotifications: 'Email Notifications',
    receiveEmailNotifications: 'Receive notifications via email',
    pushNotifications: 'Push Notifications',
    receiveBrowserNotifications: 'Receive browser push notifications',
    certificateAlerts: 'Certificate Alerts',
    getCertificateNotifications: 'Get notified about new certificate requests',
    studentUpdates: 'Student Updates',
    receiveStudentUpdates: 'Receive updates about student activities',
    systemPreferences: 'System Preferences',
    configureSystemSettings: 'Configure system-wide settings',
    autoLogout: 'Auto Logout (minutes)',
    theme: 'Theme',
    language: 'Language',
    logout: 'Logout',
    // Add more keys as needed for other pages
  },
  hindi: {
    settings: 'सेटिंग्स',
    manageAccount: 'अपने खाते और सिस्टम प्राथमिकताओं का प्रबंधन करें',
    profile: 'प्रोफ़ाइल',
    security: 'सुरक्षा',
    notifications: 'सूचनाएं',
    system: 'सिस्टम',
    profileInfo: 'प्रोफ़ाइल जानकारी',
    updatePersonalInfo: 'अपनी व्यक्तिगत जानकारी अपडेट करें',
    fullName: 'पूरा नाम',
    email: 'ईमेल',
    phoneNumber: 'फ़ोन नंबर',
    department: 'विभाग',
    emailCannotBeChanged: 'ईमेल नहीं बदला जा सकता',
    updateProfile: 'प्रोफ़ाइल अपडेट करें',
    updating: 'अपडेट हो रहा है...',
    securitySettings: 'सुरक्षा सेटिंग्स',
    manageAccountSecurity: 'अपने खाते की सुरक्षा का प्रबंधन करें',
    changePassword: 'पासवर्ड बदलें',
    updateAccountPassword: 'अपना खाता पासवर्ड अपडेट करें',
    twoFactorAuth: 'दो-कारक प्रमाणीकरण',
    addExtraSecurity: 'सुरक्षा की एक अतिरिक्त परत जोड़ें',
    enable2FA: '2FA सक्षम करें',
    sessionManagement: 'सत्र प्रबंधन',
    manageActiveSessions: 'अपने सक्रिय सत्रों का प्रबंधन करें',
    viewSessions: 'सत्र देखें',
    notificationPreferences: 'सूचना प्राथमिकताएं',
    chooseNotifications: 'चुनें कि आप कौन सी सूचनाएं प्राप्त करना चाहते हैं',
    emailNotifications: 'ईमेल सूचनाएं',
    receiveEmailNotifications: 'ईमेल के माध्यम से सूचनाएं प्राप्त करें',
    pushNotifications: 'पुश सूचनाएं',
    receiveBrowserNotifications: 'ब्राउज़र पुश सूचनाएं प्राप्त करें',
    certificateAlerts: 'प्रमाणपत्र अलर्ट',
    getCertificateNotifications: 'नए प्रमाणपत्र अनुरोधों के बारे में सूचित किया जाए',
    studentUpdates: 'छात्र अपडेट',
    receiveStudentUpdates: 'छात्र गतिविधियों के बारे में अपडेट प्राप्त करें',
    systemPreferences: 'सिस्टम प्राथमिकताएं',
    configureSystemSettings: 'सिस्टम-व्यापी सेटिंग्स कॉन्फ़िगर करें',
    autoLogout: 'स्वचालित लॉगआउट (मिनट)',
    theme: 'थीम',
    language: 'भाषा',
    logout: 'लॉगआउट',
    // Add more keys as needed for other pages
  },
  marathi: {
    settings: 'सेटिंग्ज',
    manageAccount: 'तुमचे खाते आणि सिस्टम प्राधान्ये व्यवस्थापित करा',
    profile: 'प्रोफाइल',
    security: 'सुरक्षा',
    notifications: 'सूचना',
    system: 'सिस्टम',
    profileInfo: 'प्रोफाइल माहिती',
    updatePersonalInfo: 'तुमची वैयक्तिक माहिती अपडेट करा',
    fullName: 'पूर्ण नाव',
    email: 'ईमेल',
    phoneNumber: 'फोन नंबर',
    department: 'विभाग',
    emailCannotBeChanged: 'ईमेल बदलता येत नाही',
    updateProfile: 'प्रोफाइल अपडेट करा',
    updating: 'अपडेट होत आहे...',
    securitySettings: 'सुरक्षा सेटिंग्ज',
    manageAccountSecurity: 'तुमच्या खात्याची सुरक्षा व्यवस्थापित करा',
    changePassword: 'पासवर्ड बदला',
    updateAccountPassword: 'तुमचा खाता पासवर्ड अपडेट करा',
    twoFactorAuth: 'दोन-कारक प्रमाणीकरण',
    addExtraSecurity: 'सुरक्षेचा अतिरिक्त स्तर जोडा',
    enable2FA: '2FA सक्षम करा',
    sessionManagement: 'सत्र व्यवस्थापन',
    manageActiveSessions: 'तुमची सक्रिय सत्रे व्यवस्थापित करा',
    viewSessions: 'सत्रे पहा',
    notificationPreferences: 'सूचना प्राधान्ये',
    chooseNotifications: 'तुम्हाला कोणत्या सूचना हव्यात ते निवडा',
    emailNotifications: 'ईमेल सूचना',
    receiveEmailNotifications: 'ईमेलद्वारे सूचना प्राप्त करा',
    pushNotifications: 'पुश सूचना',
    receiveBrowserNotifications: 'ब्राउझर पुश सूचना प्राप्त करा',
    certificateAlerts: 'प्रमाणपत्र सूचना',
    getCertificateNotifications: 'नवीन प्रमाणपत्र विनंत्यांबद्दल सूचित केले जा',
    studentUpdates: 'विद्यार्थी अपडेट्स',
    receiveStudentUpdates: 'विद्यार्थी क्रियाकलापांबद्दल अपडेट्स प्राप्त करा',
    systemPreferences: 'सिस्टम प्राधान्ये',
    configureSystemSettings: 'सिस्टम-व्यापी सेटिंग्ज कॉन्फिगर करा',
    autoLogout: 'स्वयं लॉगआउट (मिनिटे)',
    theme: 'थीम',
    language: 'भाषा',
    logout: 'लॉगआउट',
    // Add more keys as needed for other pages
  },
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'english',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('english');

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) setLanguageState(saved);
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    const dict: TranslationDict = translations[language] || translations.english;
    return dict[key] || translations.english[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 