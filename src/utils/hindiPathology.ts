// Comprehensive Hindi Agropari Pathology & Integrated Pest Management Dictionary
// Translates diseases, symptoms, and remedies into clear, understandable Hindi

export interface TranslatedDiseaseData {
  hindiName: string;
  hindiDescription: string;
  hindiProblemSummary: string;
  hindiMonitoring: string[];
  hindiCultural: string[];
  hindiBiological: string[];
  hindiMechanical?: string[];
  hindiChemical: string[];
  hindiSafetyWarning: string;
}

export const HINDI_DISEASE_REGISTRY: Record<string, TranslatedDiseaseData> = {
  'Early Blight': {
    hindiName: 'अगेती झुलसा रोग (Early Blight)',
    hindiDescription: 'पत्तियों पर संकेंद्रित छल्लों (टारगेट बोर्ड) जैसे भूरे-काले धब्बे बनते हैं और निचली पत्तियां पीली पड़कर सूखने लगती हैं।',
    hindiProblemSummary: 'फसल की निचली पत्तियों पर भूरे छल्लेदार धब्बे बन रहे हैं, जिससे पत्तियां समय से पहले पीली होकर झुलस रही हैं।',
    hindiMonitoring: [
      'हफ्ते में दो बार सुबह के समय पौधे की निचली पत्तियों का बारीकी से निरीक्षण करें।',
      'खेत के चारों कोनों से 20-25 पौधों के पत्तों की जांच करें।'
    ],
    hindiCultural: [
      'संक्रमित निचली पत्तियों को तोड़कर खेत से दूर ले जाकर नष्ट करें या गड्ढे में दबाएं।',
      'पौधों के बीच पर्याप्त दूरी रखें ताकि धूप और हवा का संचार बना रहे।',
      'अत्यधिक यूरिया (नाइट्रोजन) के प्रयोग से बचें; ड्रिप या थाला विधि से सिंचाई करें ताकि पत्तियां गीली न रहें।'
    ],
    hindiBiological: [
      'ट्राइकोडर्मा हरजिएनम (Trichoderma harzianum) या विरिडी 5 ग्राम प्रति लीटर पानी में घोलकर छिड़काव करें।',
      'नीम का तेल (10,000 पीपीएम) 3 मिलीलीटर प्रति लीटर पानी में साबुन के घोल के साथ मिलाकर छिड़कें।'
    ],
    hindiChemical: [
      'शुरुआती लक्षण दिखते ही मैन्कोजेब 75% डब्ल्यूपी (Mancozeb) 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।',
      'रोग का प्रकोप अधिक होने पर एज़ोक्सीस्ट्रोबिन + डाइफेनोकोनाज़ोल 1 मिली प्रति लीटर पानी में घोलकर छिड़कें।'
    ],
    hindiSafetyWarning: 'दवा छिड़कने के 15 दिन बाद तक फसल की तुड़ाई न करें। छिड़काव करते समय मुंह पर मास्क व दस्ताने अवश्य पहनें।'
  },

  'Late Blight': {
    hindiName: 'पछेती झुलसा रोग (Late Blight)',
    hindiDescription: 'पत्तियों के सिरों और किनारों पर पानी से भीगे हुए अनियमित गहरे काले-भूरे धब्बे बनते हैं। नम मौसम में पत्ती के नीचे सफेद फफूंद दिखती है।',
    hindiProblemSummary: 'पत्तियों के किनारे तेजी से काले पड़ रहे हैं और ठंड/कोहरे के मौसम में यह रोग बहुत तेजी से पूरे खेत में फैल सकता है।',
    hindiMonitoring: [
      'कोहरा, बादल छाए रहने या उच्च आर्द्रता (>85%) वाले दिनों में प्रतिदिन खेत की निगरानी करें।',
      'पत्तियों के नीचे की सतह पर सफेद फफूंद की परत की जांच करें।'
    ],
    hindiCultural: [
      'खेत में जलजमाव न होने दें और जल निकासी की उचित व्यवस्था करें।',
      'रोगग्रस्त पौधों और टहनियों को तुरंत उखाड़कर नष्ट करें।'
    ],
    hindiBiological: [
      'स्यूडोमोनास फ्लोरोसेंस (Pseudomonas fluorescens) 10 ग्राम प्रति लीटर पानी से पौधों को तर-बतर करें।',
      'खट्टी छाछ (5 दिन पुरानी) 50 मिली प्रति लीटर पानी में मिलाकर छिड़कें।'
    ],
    hindiChemical: [
      'रोकथाम हेतु कॉपर ऑक्सीक्लोराइड 50% डब्ल्यूपी 2.5 ग्राम प्रति लीटर पानी का तुरंत छिड़काव करें।',
      'तीव्र संक्रमण में साइमोक्सानिल + मैन्कोजेब 3 ग्राम प्रति लीटर या मेटलैक्टिसल + मैन्कोजेब 2.5 ग्राम प्रति लीटर छिड़कें।'
    ],
    hindiSafetyWarning: 'छिड़काव के समय सुरक्षा उपकरण पहनें। अंतिम छिड़काव और फसल कटाई के बीच कम से कम 14 दिन का अंतर रखें।'
  },

  'Bacterial Leaf Blight': {
    hindiName: 'जीवाणु पत्ती झुलसा रोग (Bacterial Leaf Blight)',
    hindiDescription: 'पत्तियों के किनारों से शुरू होकर पीले से भूरे रंग की लहरदार धारियां बनती हैं और बाद में पूरी पत्ती सूखकर पुआल जैसी हो जाती है।',
    hindiProblemSummary: 'पत्तियों के किनारों से सूखने की शुरुआत होकर लंबी लहरदार धारियां बन रही हैं, जिससे पत्तियां झुलस कर सफेद-पीली हो रही हैं।',
    hindiMonitoring: [
      'तेज हवा और बारिश के बाद पत्तियों पर जीवाणु रस (बैक्टीरियल ऊज) की बूंदों की जांच करें।',
      'सुबह के समय पत्तियों को धूप के सामने रखकर पारदर्शी धारियों की पहचान करें।'
    ],
    hindiCultural: [
      'खेत से पानी की निकासी करें और 3-4 दिनों के लिए खेत का पानी सूखा दें।',
      'यूरिया खाद का छिड़काव तुरंत बंद कर दें; केवल पोटाश की हल्की मात्रा दें।'
    ],
    hindiBiological: [
      'स्यूडोमोनास फ्लोरोसेंस 5 ग्राम प्रति लीटर या गोबर की स्लरी का छना हुआ पानी 20% का छिड़काव करें।'
    ],
    hindiChemical: [
      'कॉपर ऑक्सीक्लोराइड 2.5 ग्राम + स्ट्रेप्टोसाइक्लिन (Streptocycline) 0.1 ग्राम (1 ग्राम प्रति 10 लीटर) पानी में मिलाकर छिड़काव करें।'
    ],
    hindiSafetyWarning: 'तेज धूप या दोपहर में छिड़काव न करें। छिड़काव के 15 दिनों तक पशुओं को उस खेत का चारा न खिलाएं।'
  },

  'Rice Blast': {
    hindiName: 'धान का झोंका रोग (Rice Blast)',
    hindiDescription: 'पत्तियों पर नाव या आंख के आकार के धब्बे बनते हैं, जिनका केंद्र राख जैसा धूसर और किनारे भूरे होते हैं।',
    hindiProblemSummary: 'पत्तियों पर आंखनुमा धब्बे बन रहे हैं और बाली की गर्दन काली पड़कर टूट सकती है।',
    hindiMonitoring: [
      'कल्ले फूटने और बाली निकलने की अवस्था में पत्तियों व गांठों पर विशेष नजर रखें।'
    ],
    hindiCultural: [
      'खेत में निरंतर पानी का स्तर 2-3 सेमी बनाए रखें; खेत को पूरी तरह सूखने न दें।',
      'संतुलित उर्वरकों का प्रयोग करें; अतिरिक्त नाइट्रोजन न दें।'
    ],
    hindiBiological: [
      'ट्राइकोडर्मा विरिडी 5 ग्राम प्रति लीटर पानी का छिड़काव करें।'
    ],
    hindiChemical: [
      'ट्राइसाइक्लाज़ोल 75% डब्ल्यूपी (Tricyclazole) 0.6 ग्राम प्रति लीटर पानी या आइसोप्रोथियोलेन 1.5 मिली प्रति लीटर पानी में मिलाकर छिड़कें।'
    ],
    hindiSafetyWarning: 'सुरक्षा चश्मा व मास्क पहनें। पीएचआई 21 दिन का ध्यान रखें।'
  },

  'Pink Bollworm': {
    hindiName: 'गुलाबी सुंडी कीट प्रकोप (Pink Bollworm)',
    hindiDescription: 'कपास के फूलों के दल आपस में जुड़कर गुलाब की कली (रोसेटेड फूल) जैसे बन जाते हैं और सुंडी टिंडे के अंदर घुसकर बीजों व रेशे को खा जाती है।',
    hindiProblemSummary: 'फूल आपस में चिपके दिख रहे हैं और टिंडों के अंदर सुंडी छेद करके रेशे व बिनौले को नुकसान पहुंचा रही है।',
    hindiMonitoring: [
      'प्रति एकड़ 4 से 5 फेरोमोन ट्रैप लगाएं और प्रतिदिन नर पतंगों की संख्या दर्ज करें।',
      'खेत में 20 टिंडों को तोड़कर अंदर गुलाबी सुंडी की उपस्थिति जांचें।'
    ],
    hindiCultural: [
      'गुलाब जैसी कली बने (रोसेटेड) फूलों को हाथ से तोड़कर सुंडी सहित नष्ट कर दें।',
      'फसल कटाई के बाद कपास की डंठल खेत में न छोड़ें।'
    ],
    hindiBiological: [
      'ट्राइकोग्रामा किलोनिस (Trichogramma chilonis) परजीवी ततैया के अंडे (ट्राइकोकार्ड) 50,000 प्रति हेक्टेयर की दर से छोड़ें।',
      'नीम आधारित कीटनाशक (Azadirachtin 1500 PPM) 5 मिली प्रति लीटर पानी में छिड़कें।'
    ],
    hindiChemical: [
      'ईटीएल (आर्थिक नुकसान सीमा) पार होने पर क्लोरपायरीफॉस 20% ईसी 2 मिली प्रति लीटर या प्रोफेनोफॉस 50% ईसी 2 मिली प्रति लीटर छिड़कें।'
    ],
    hindiSafetyWarning: 'दवा के छिड़काव के बाद खेत में मधुमक्खियों के समय (प्रातः) छिड़काव न करें। सुरक्षा मानकों का पालन करें।'
  },

  'Yellow Rust': {
    hindiName: 'पीला रतुआ / गेरुआ रोग (Yellow Rust)',
    hindiDescription: 'गेहूं की पत्तियों पर पीले रंग की धारियों में चूर्ण जैसे फफोले बनते हैं। उंगली लगाने पर पीला पाउडर हाथ पर लग जाता है।',
    hindiProblemSummary: 'पत्तियों पर पीले रंग की लंबी कतारों में हल्दी जैसा पाउडर दिखाई दे रहा है, जो हवा के साथ तेजी से फैल रहा है।',
    hindiMonitoring: [
      'दिसंबर से फरवरी के दौरान खेत की मेड़ों और नम स्थानों पर पीले पाउडर की जांच करें।'
    ],
    hindiCultural: [
      'रतुआ रोधी किस्मों की ही बुवाई करें। अत्यधिक सिंचाई से बचें।'
    ],
    hindiBiological: [
      'गोमूत्र (10%) एवं नीम अर्क का शुरुआती दौर में छिड़काव सहायक होता है।'
    ],
    hindiChemical: [
      'प्रोपिकोनाज़ोल 25% ईसी (Tilt) 1 मिली प्रति लीटर पानी या टेबुकोनाज़ोल 1 मिली प्रति लीटर का तुरंत घोल बनाकर छिड़काव करें।'
    ],
    hindiSafetyWarning: 'हवा की विपरीत दिशा में छिड़काव न करें। छिड़काव के 20 दिन बाद तक कटाई न करें।'
  },

  'Powdery Mildew': {
    hindiName: 'चूर्णिल आसिता / छाछिया रोग (Powdery Mildew)',
    hindiDescription: 'पत्तियों, तनों और फूलों पर सफेद रंग का आटे जैसा चूर्ण दिखाई देता है। बाद में पत्तियां पीली होकर सूख जाती हैं।',
    hindiProblemSummary: 'पौधे की पत्तियों और टहनियों पर सफेद चूर्ण की परत छा रही है, जिससे पौधे की बढ़वार रुक गई है।',
    hindiMonitoring: [
      'छायादार व घने पौधों की निचली पत्तियों पर सफेद पाउडर की शुरुआत देखें।'
    ],
    hindiCultural: [
      'पौधों की छंटाई करें ताकि हवा और धूप पत्तियों तक सीधे पहुंच सके।'
    ],
    hindiBiological: [
      'घुलनशील गंधक (सल्फर) 2 ग्राम प्रति लीटर पानी या बेकिंग सोडा (सोडियम बाइकार्बोनेट) 5 ग्राम प्रति लीटर पानी का छिड़काव करें।'
    ],
    hindiChemical: [
      'डायनोकैप 1 मिली प्रति लीटर या हेक्साकोनाज़ोल 5% ईसी 1 मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।'
    ],
    hindiSafetyWarning: 'अधिक तापमान (>35°C) होने पर सल्फर का छिड़काव न करें।'
  },

  'Healthy Crop': {
    hindiName: 'स्वस्थ फसल (कोई गंभीर रोग नहीं)',
    hindiDescription: 'फसल की पत्तियां हरी-भरी और सामान्य हैं। कोई सक्रिय रोगजनक फफूंद या कीट संक्रमण नहीं पाया गया है।',
    hindiProblemSummary: 'आपकी फसल बिल्कुल स्वस्थ है। पौधों में उचित वृद्धि और सामान्य रंगत बनी हुई है।',
    hindiMonitoring: [
      'सप्ताह में एक बार सामान्य खेत निरीक्षण जारी रखें।'
    ],
    hindiCultural: [
      'संतुलित पोषण, समय पर सिंचाई और खरपतवार नियंत्रण बनाए रखें।'
    ],
    hindiBiological: [
      'नियमित जैविक खाद व जीवामृत का उपयोग करें।'
    ],
    hindiChemical: [
      'किसी भी रासायनिक दवा के छिड़काव की कोई आवश्यकता नहीं है।'
    ],
    hindiSafetyWarning: 'अनावश्यक रसायनों का प्रयोग न करें। मित्र कीटों का संरक्षण करें।'
  }
};

// Helper: match any English disease name to our rich Hindi pathology data
export function getHindiPathology(diseaseName: string): TranslatedDiseaseData {
  if (!diseaseName) return HINDI_DISEASE_REGISTRY['Healthy Crop'];

  const lower = diseaseName.toLowerCase();

  if (lower.includes('early blight')) return HINDI_DISEASE_REGISTRY['Early Blight'];
  if (lower.includes('late blight')) return HINDI_DISEASE_REGISTRY['Late Blight'];
  if (lower.includes('bacterial') || lower.includes('blight')) return HINDI_DISEASE_REGISTRY['Bacterial Leaf Blight'];
  if (lower.includes('blast')) return HINDI_DISEASE_REGISTRY['Rice Blast'];
  if (lower.includes('bollworm') || lower.includes('pink')) return HINDI_DISEASE_REGISTRY['Pink Bollworm'];
  if (lower.includes('rust')) return HINDI_DISEASE_REGISTRY['Yellow Rust'];
  if (lower.includes('powdery') || lower.includes('mildew')) return HINDI_DISEASE_REGISTRY['Powdery Mildew'];
  if (lower.includes('healthy') || lower.includes('normal')) return HINDI_DISEASE_REGISTRY['Healthy Crop'];

  // Generic pathology builder if not directly matched
  return {
    hindiName: `${diseaseName} (संभावित रोग)`,
    hindiDescription: `पत्तियों के निरीक्षण में ${diseaseName} के लक्षण दिखाई दिए हैं। पौधों में धब्बे और पत्तियों की रंगत में बदलाव देखा गया है।`,
    hindiProblemSummary: `फसल में ${diseaseName} के लक्षण पाए गए हैं। पौधे की पत्तियां प्रभावित हो रही हैं।`,
    hindiMonitoring: [
      'खेत में रोग के फैलाव पर नजर रखने के लिए नियमित रूप से पौधों की जांच करें।'
    ],
    hindiCultural: [
      'रोगग्रस्त पत्तियों को तोड़कर खेत से दूर नष्ट करें और जल निकासी दुरुस्त रखें।'
    ],
    hindiBiological: [
      'नीम तेल 3 मिली प्रति लीटर पानी या ट्राइकोडर्मा का छिड़काव करें।'
    ],
    hindiChemical: [
      'कृषि विशेषज्ञ की सलाह अनुसार अनुशंसित फफूंदनाशक का उचित मात्रा में छिड़काव करें।'
    ],
    hindiSafetyWarning: 'सुरक्षा चश्मा व मास्क पहनें और अनुशंसित प्रतीक्षा अवधि का ध्यान रखें।'
  };
}

// Build fluent spoken audio text in Hindi or English
export function buildAudioNarrationText(
  diseaseName: string,
  description: string,
  ipmAdvisory: any,
  language: string,
  cropName: string
): string {
  if (language === 'hi') {
    const hindiData = getHindiPathology(diseaseName);

    const culturalStr = hindiData.hindiCultural.slice(0, 2).join('। ') || 'खेत को साफ रखें और संक्रमित पत्तियों को हटा दें।';
    const bioStr = hindiData.hindiBiological.slice(0, 2).join('। ') || 'नीम के तेल का छिड़काव करें।';
    const chemStr = hindiData.hindiChemical.slice(0, 1).join('। ') || 'जरूरत पड़ने पर अनुशंसित दवा का छिड़काव करें।';

    return `नमस्ते किसान भाई। एग्रोपरी फसल स्वास्थ्य जांच रिपोर्ट। आपकी ${cropName} की फसल में पाई गई मुख्य दिक्कत है: ${hindiData.hindiName}। क्या दिक्कत है: ${hindiData.hindiProblemSummary}। अब सुनिए इसका संपूर्ण समाधान और रोकथाम के उपाय। पहला, सस्य उपाय: ${culturalStr}। दूसरा, जैविक व प्राकृतिक उपाय: ${bioStr}। तीसरा, रासायनिक उपाय: ${chemStr}। ${hindiData.hindiSafetyWarning} धन्यवाद।`;
  }

  // English fallback
  const culturalStr = ipmAdvisory?.culturalControls?.slice(0, 2)?.join('. ') || 'Maintain sanitation.';
  const bioStr = ipmAdvisory?.biologicalControls?.slice(0, 2)?.join('. ') || 'Apply neem extract.';
  const chemStr = ipmAdvisory?.chemicalControls?.map((c: any) => `${c.activeIngredientClass}: ${c.dosageGuidelines}`).slice(0, 1)?.join('. ') || 'Apply recommended bactericide.';

  return `Hello farmer. Agropari Crop Health Diagnosis for ${cropName}. Detected problem: ${diseaseName}. Observed symptoms: ${description}. Recommended Integrated Pest Management solutions: First, cultural practices: ${culturalStr}. Second, biological controls: ${bioStr}. Third, chemical control: ${chemStr}. Please follow safety precautions and pre-harvest intervals.`;
}
