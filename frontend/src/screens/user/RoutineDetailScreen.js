import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UniversalVideoPlayer from '../../components/common/UniversalVideoPlayer';
import { API_URL } from '../../../config';
import api, { contentAPI } from '../../services/api';

const headingBold = 'JosefinSans-Bold';
const bodyRegular = 'WorkSans-Regular';

export default function RoutineDetailScreen({ route, navigation }) {
  const { step } = route.params;
  const [hasRead, setHasRead] = useState(false);
  const [language, setLanguage] = useState('english');
  const [manifestationVideo, setManifestationVideo] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [levelVideos, setLevelVideos] = useState({ 1: null, 2: null, 3: null });
  const [userProgress, setUserProgress] = useState(null);
  const [showVideoCompleteModal, setShowVideoCompleteModal] = useState(false);
  const [completingVideoId, setCompletingVideoId] = useState(null);
  const [videoRequiredModal, setVideoRequiredModal] = useState(false);

  useEffect(() => {
    if (step === 1) {
      loadLevelVideos();
      loadUserProgress();
    }
    if (step === 5) {
      loadManifestationVideo();
    }
  }, [step]);

  const loadManifestationVideo = async () => {
    try {
      const data = await contentAPI.getManifestationVideo();
      if (data) {
        setManifestationVideo(data);
      }
    } catch (error) {
      console.log('Manifestation video not available:', error);
    }
  };

  const loadLevelVideos = async () => {
    try {
      for (let level = 1; level <= 3; level++) {
        const data = await contentAPI.getVideoByLevel(level);
        if (data) {
          setLevelVideos(prev => ({ ...prev, [level]: data }));
        }
      }
    } catch (error) {
      console.log('Level videos not available:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/attendance/user/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data);
      }
    } catch (error) {
      console.log('Could not load user progress');
    }
  };

  const playVideo = (videoUrl, videoId = null) => {
    setPlayingVideo(videoUrl);
    if (videoId) {
      setCompletingVideoId(videoId);
    }
  };

  const handleVideoClose = () => {
    setPlayingVideo(null);
    if (completingVideoId) {
      setShowVideoCompleteModal(true);
    }
  };

  const handleVideoComplete = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      await contentAPI.completeVideo(username, completingVideoId);
      setShowVideoCompleteModal(false);
      setCompletingVideoId(null);

      // Optimistic update to ensure UI reflects completion immediately
      setUserProgress(prev => ({ ...prev, videoCompleted: true }));

      loadUserProgress();
    } catch (error) {
      console.error('Error completing video:', error);
    }
  };

  const handleVideoNotComplete = () => {
    setShowVideoCompleteModal(false);
    setCompletingVideoId(null);
  };

  const isLevelUnlocked = (level) => {
    if (!userProgress) return level === 1;
    if (level === 1) return true;
    if (level === 2) return userProgress.totalDaysCompleted >= 120;
    if (level === 3) return userProgress.totalDaysCompleted >= 240;
    return false;
  };

  const stepContent = {
    1: {
      title: { english: 'Chakra Cleansing', tamil: 'சக்ர சுத்திகரிப்பு' },
      icon: 'self-improvement',
      content: {
        english: `Chakra Cleansing - Cleanse and balance your seven chakras through meditation and energy work.`,
        tamil: `சக்ர சுத்திகரிப்பு - தியானம் மற்றும் ஆற்றல் வேலை மூலம் உங்கள் ஏழு சக்கரங்களை சுத்தம் செய்து சமநிலைப்படுத்துங்கள்.`
      }
    },
    2: {
      title: { english: 'Forgiveness', tamil: 'சுயமன்னிப்பு' },
      icon: 'self-improvement',
      content: {
        english: `Forgiveness is the key to releasing negative emotions and attaining inner peace.

I am the divine fire.
I am the purity the Divine desires. (9)

I surrender my mind, body, ego, and emotions to my soul.
Let my soul lead my life. (3)

FORGIVING MYSELF

To the Supreme Divine
Divine Father
Divine Mother
To my Higher Soul
To all Divine Beings, the five elements of this universe, the great solar system, the plant kingdom, the animal kingdom, the human kingdom, the panchabhutas within my body, and to my physical body
To our Spiritual Guides, Helpers, and Teachers
To all the Healing Angels
To the Great Karmic Board

I am that I am.
I am humbly invoking for Divine forgiveness.

Divine Beings, the five elements, the great solar system, the plant kingdom, the animal kingdom, the human kingdom, the panchabhutas inside my body, and my physical body —
please forgive me for all my wrongdoings and deep hurt that I may have committed knowingly or unknowingly, in this life or in my past lives.

I am forgiving everyone for all the wrongdoings toward me and my family. (3)
I am forgiving and forgetting. (3)
Please go in peace. (3)
Please cast out all fear and doubts in me. (3)

Let Divine Light blaze and transmute all negative energies and discords within me and those sent to me. (3)
Please fill me with Divine love, Divine kindness, and Divine compassion. (3)
Let the Divine Light protect and guide me always in the Divine direction. (3)

Let myself be the Divine’s perfection made manifest in body, mind, and soul.
Let the Divine provide me with the wisdom of karma and the knowledge of how to balance it.

I consciously accept this. Manifest, manifest, manifest.
Divine, thank you, thank you, thank you.

FORGIVENESS WITH FAMILY

To the Supreme Divine
Divine Father
Divine Mother
To my Higher Soul
To the higher soul of my (ancestors / father / mother / brother / sister / life partner / children / in-laws / ex-life partner / ex-boyfriend / ex-girlfriend)
To our Spiritual Guides, Helpers, and Teachers
To all the Healing Angels
To the Great Karmic Board

I am that I am.

Divine, thank you for bringing us together.
Thank you for allowing us to balance our karma.
I accept this Divine direction and plan.

I am humbly invoking for Divine forgiveness.
(Ancestors / father / mother / brother / sister / life partner / children / in-laws / ex-life partner / ex-boyfriend / ex-girlfriend) —
Please forgive me for all my wrongdoings and deep hurt that I may have committed knowingly or unknowingly in my past life or present life.

I am forgiving everyone for all the wrongdoings toward me. (3)
I am forgiving and forgetting. (3)
Please go in peace. (3)
Please cast out all fear and doubts in us. (3)

Let Divine Light blaze and transmute all discords and negative energies coming from us and those sent to us. (3)
Let there be peace and harmony between us. (3)
Let the Divine fill us with love, kindness, and compassion. (3)
Let the Divine Light protect and guide us always in the Divine direction. (3)

Let ourselves be the Divine’s perfection made manifest in body, mind, and soul.
Let the Divine provide us with the wisdom of karma and how to balance it.

Divine, thank you, thank you, thank you.

FORGIVENESS WITH FRIENDS

To the Supreme Divine
Divine Father
Divine Mother
To my Higher Soul
To the higher soul of (energies from black magic / white magic / souls / curse / friends / co-workers / neighbours)
To our Spiritual Guides, Helpers, and Teachers
To all the Healing Angels
To the Great Karmic Board

I am that I am.

Divine, thank you for bringing us together.
Thank you for allowing us to balance our karma.
I accept this Divine direction and plan.

I am humbly invoking for Divine forgiveness.
(Black magic / white magic / souls / curse / friends / co-workers / neighbours) —
Please forgive me for all my wrongdoings and deep hurt that I may have committed knowingly or unknowingly in my past life or present life. (3)

If my actions have caused you to take wrong actions toward me or my family,
I ask for forgiveness again.

I am forgiving everyone for all the wrongdoings toward me and my family. (3)
I am forgiving and forgetting. (3)
Please go in peace. (3)
Please cast out all fear and doubts in me. (3)

Let Divine Light blaze and transmute all discords and negative energies coming from us and those sent to us. (3)
Let there be peace and harmony between us. (3)
Let the Divine fill us with Divine love, kindness, and compassion. (3)
Let the Divine Light protect and guide us always in the Divine direction. (3)

Let ourselves be the Divine’s perfection made manifest in body, mind, and soul.
Let the Divine provide us with the wisdom of karma and how to balance it.

Divine, thank you, thank you, thank you.

FORGIVENESS FOR PERSONS AFFECTED BY MY ANCESTORS

To the Supreme Divine
Divine Father
Divine Mother
To my Higher Soul
To the higher soul of all persons affected by my ancestors and family members
To our Spiritual Guides, Helpers, and Teachers
To all the Healing Angels
To the Great Karmic Board

I am that I am.

I seek Divine forgiveness on behalf of my ancestors and my family members.
Divine, thank you for bringing us together.
Thank you for allowing us to balance our karma.
I accept this Divine direction and plan.

I am humbly invoking for Divine forgiveness.
Please forgive me for all my wrongdoings and the deep hurt I may have committed knowingly or unknowingly in my past life and present life. (3)

I am forgiving everyone for all the wrongdoings toward me and my family. (3)
I am forgiving and forgetting. (3)
Please go in peace. (3)
Please cast out all fear and doubts in me. (3)

Let Divine Light blaze and transmute all discords and negative energies coming from us and those sent to us. (3)
Let there be peace and harmony between us. (3)
Let the Divine fill us with Divine love, kindness, and compassion. (3)
Let the Divine Light protect and guide us always in the Divine direction. (3)

Let ourselves be the Divine’s perfection made manifest in body, mind, and soul.
Let the Divine provide us with the wisdom of karma and how to balance it.

Divine, thank you, thank you, thank you.`,
        tamil: `சுயமன்னிப்பு

நான் தெய்வீக தநருப்பாக இருக்கிறேன்,
நான் இறைவனின் விருப்பத்திற்கு ஏற்ப தூய்மையாக இருக்கிறேன் (9)

நான் என் மனம், உடல், நினைத்தென்றை அனைத்தும் உணர்ச்சிகளை என் ஆன்மாவிடம் சர்ப்பிக்கிறேன்,
என் ஆன்மா என் வாழ்வை வழிநடத்தட்டும் (3)

பிரபுவே,
தெய்வீக நன்றெ,
தெய்வீக ஒளி,
எனது உயர்ஆன்மா,
அனைத்தும் (தெய்வீக ஆன்மாக்கள், இந்த பிரபஞ்சத்தின் பஞ்சபூதங்கள், சூரிய குடும்பம், மனித இனம், விலங்கினம், தாவர இனம், என் உடலுக்குள் உள்ள பஞ்சபூதங்கள், என் உடல்)
அறனத்து ஆன்மீக வழிகாட்டிகள், உபவியாக்கள் மற்றும் ஆசிரியர்கள்
அறனத்து குணப்படுத்தும் சக்திகள்,
உயர் கர்ம வாரியம் ஆகியாரிடம்
நான் நன்றெ கூறுகிறேன்

(தெய்வீக ஆன்மாக்கள், இந்த பிரபஞ்சத்தின் பஞ்சபூதங்கள், சூரிய குடும்பம், மனித இனம்,
விலங்கினம், தாவர இனம், என் உடலுக்குள் உள்ள பஞ்சபூதங்கள், என் உடல்) அனைவருக்கு
இப்பிறவியிலும் முற்பிறவியிலும் இருந்தும் இல்லாவிட்டாலும்
நான் செய்த அறனத்து தவறுகளுக்கும் முழு மனதுடன் இறை மன்னிப்பு கேட்கிறேன்

எனக்கும் எனது குடும்பத்தினருக்கும் விதைவிட்ட தவறுகளுக்காக
அறனவரையும் நான் மனம் திறந்து மன்னிக்கிறேன்

நான் மன்னித்து விடுவிக்கிறேன் (3)

தெயவுசெய்து சுத்திகரணம் அருளுங்கள் (3)
தெயவுசெய்து என்னிடம் இருக்கும் அறனத்து பயம் மற்றும் சந்தேகங்களை நீக்கிவிடுங்கள் (3)

இறை ஒளி என்னிடம் வரும் மற்றும் என்னிடமிருந்து பிறருக்கு பாயும்
அறனத்து எரிசக்தித் தொடர்புகளையும் எரித்து நீக்கட்டும் (3)

தெயவுசெய்து என்னை தெய்வீக அன்பு, தெய்வீக கருணை மற்றும் தெய்வீக இரக்கத்தால் நிரப்பவும் (3)

தெய்வீக ஒளி என்னை பாதுகாத்து எப்போதும் கடவுளின் பாதையில் வழிநடத்தட்டும் (3)

என் உடல், மனம் மற்றும் ஆன்மா அனைத்தும் கடவுளின் பரிபூரணமான படைப்பு.
தெய்வீகமானது எனக்கு கர்மத்தைப் பற்றிய புரிதலையும் ஆளும் சக்தியையும் வழங்கட்டும்.

நான் சுயநிறைவுடன் இந்த ஏற்பாட்டை ஏற்றுக்கொள்கிறேன்.
இறைவா நன்றி, நன்றி, நன்றி.

குடும்ப உறவுகள், பந்தங்களுக்கான மன்னிப்பு

பிரபுவே,
தெய்வீக நன்றெ,
தெய்வீக ஒளி,
எனது உயர்ஆன்மா,

என் (முன்னோர்கள் / நன்றெ / ஒளி / சகோதரன் / சகோதரி / வாழ்க்கை துணை / குழந்தைகள் / சிறுவயது நண்பர்கள் /
முன்னாள் வாழ்க்கை துணை / முன்னாள் காதலன் / முன்னாள் காதலி) உயர் ஆன்மா

அறனத்து ஆன்மீக வழிகாட்டிகள், உபவியாக்கள் மற்றும் ஆசிரியர்கள்
அறனத்து குணப்படுத்தும் சக்திகள்,
உயர் கர்ம வாரியம் ஆகியாரிடம்
நான் நன்றெ கூறுகிறேன்

இறைவா எங்களை ஒன்றாக இணைத்ததற்கு நன்றி.
எங்கள் கர்ம சரிசெய்தலுக்கு உதவியதற்கு நன்றி.
நான் இந்த தெய்வீக வழிகாட்டுதலும் சிகிச்சையையும் ஏற்றுக்கொள்கிறேன்.

நான் (மேலே உள்ள பெயர்கள்) உங்களுக்கும் உங்கள் குடும்பத்திற்கும்
இப்பிறவியிலும் முற்பிறவியிலும் இருந்தும் இல்லாவிட்டாலும்
செய்த அறனத்து தவறுகளுக்கும் முழு மனதுடன் இறை மன்னிப்பு கேட்கிறேன்

எனக்கும் என் குடும்பத்தினருக்கும் விதைவிட்ட தவறுகளுக்காக
அறனவரையும் நான் மனம் திறந்து மன்னிக்கிறேன் (3)

நான் மன்னித்து விடுவிக்கிறேன் (3)

தெயவுசெய்து சுத்திகரணம் அருளுங்கள் (3)
தெயவுசெய்து பயமும் சந்தேகங்களும் நீக்குங்கள் (3)

இறை ஒளி எங்களுக்கு வரும் மற்றும் எங்களிடமிருந்து மற்றவர்களுக்கு பாயும்
அறனத்து எரிசக்தித் தொடர்புகளையும் எரித்து நீக்கட்டும் (3)

தெயவுசெய்து எங்களை தெய்வீக அன்பு, கருணை, இரக்கத்தால் நிரப்பவும் (3)
தெய்வீக ஒளி எங்களை பாதுகாத்து கடவுளின் பாதையில் வழிநடத்தட்டும் (3)

எங்கள் உடல், மனம், ஆன்மா அனைத்தும் கடவுளின் பரிபூரணமான படைப்பு.
தெய்வீகமானது எங்களுக்கு கர்மம் பற்றிய புரிதலும் ஞானமும் வழங்கட்டும்.

இறைவா நன்றி, நன்றி, நன்றி.

நண்பர்கள், சக மனிதர்களுக்கான மன்னிப்பு

பிரபுவே, தெய்வீக நன்றெ, தெய்வீக ஒளி,
என் உயர்ஆன்மா,

(தவறுணர்வு / தவணைநிரம் / சாபம் / ஆன்மாக்கள் / முற்பிறவி ஆன்மாக்கள் / நண்பர்கள் பெயர் பட்டியல் /
சக ஊழியர்கள் / அண்டை வீட்டார்) உயர்ஆன்மா,

அறனத்து ஆன்மீக வழிகாட்டிகள், உபவியாக்கள் மற்றும் ஆசிரியர்கள்
அறனத்து குணப்படுத்தும் சக்திகள்,
உயர் கர்ம வாரியம் ஆகியாரிடம்
நான் நன்றெ கூறுகிறேன்

நான் (மேலே உள்ளவர்கள்) உங்களுக்கும் உங்கள் குடும்பத்திற்கும்
இப்பிறவியிலும் முற்பிறவியிலும் இருந்தும் இல்லாவிட்டாலும்
செய்த அறனத்து தவறுகளுக்கும் முழு மனதுடன் இறை மன்னிப்பு கேட்கிறேன்

எனது தவறுகள் தான் எனக்கும் என் குடும்பத்தினருக்கும் எதிரான செயல்களைச் செய்ய
உங்களைத் தூண்டியது. நான் மீண்டும் மனம் திறந்து மன்னிப்பு கேட்கிறேன் (3)

எனக்கும் என் குடும்பத்தினருக்கும் விதைவிட்ட தவறுகளுக்காக
அறனவரையும் நான் மனம் திறந்து மன்னிக்கிறேன் (3)

நான் மன்னித்து விடுவிக்கிறேன் (3)

தெயவுசெய்து சுத்திகரணம் அருளுங்கள் (3)
தெயவுசெய்து பயம் மற்றும் சந்தேகங்கள் நீக்கட்டும் (3)

இறை ஒளி எங்களுக்கு வரும் மற்றும் எங்களிடமிருந்து பிறருக்கு பாயும்
அறனத்து சக்தித் தொடர்புகளையும் எரித்து நீக்கட்டும் (3)

தெயவுசெய்து எங்களை தெய்வீக அன்பு, கருணை, இரக்கத்தால் நிரப்பவும் (3)
தெய்வீக ஒளி எங்களை பாதுகாத்து கடவுளின் பாதையில் நடத்தட்டும் (3)

எங்கள் உடல், மனம், ஆன்மா அனைத்தும் கடவுளின் பரிபூரணமான படைப்பு.
தெய்வீகமானது கர்மத்தைப் பற்றிய புரிதலும் ஆளும் சக்தியையும் வழங்கட்டும்.

இறைவா நன்றி, நன்றி, நன்றி.

முன்னோர்களால் பாதிக்கப்பட்டவர்களுக்கான மன்னிப்பு

பிரபுவே, தெய்வீக நன்றெ, தெய்வீக ஒளி,
என் உயர்ஆன்மா,

(என் முன்னோர்களால் பாதிக்கப்பட்ட அனைத்தும்நபர்கள் மற்றும்
என் குடும்ப உறுப்பினர்களால் பாதிக்கப்பட்ட நபர்கள்) உயர்ஆன்மா

அறனத்து ஆன்மீக வழிகாட்டிகள், உபவியாக்கள் மற்றும் ஆசிரியர்கள்
அறனத்து குணப்படுத்தும் சக்திகள்,
உயர் கர்ம வாரியம் ஆகியாரிடம்
நான் நன்றெ கூறுகிறேன்

நான் (மேலே உள்ளவர்கள்) உங்களுக்கும் உங்கள் குடும்பத்திற்கும்
இப்பிறவியிலும் முற்பிறவியிலும் இருந்தும் இல்லாவிட்டாலும்
செய்த அறனத்து தவறுகளுக்கும் முழு மனதுடன் இறை மன்னிப்பு கேட்கிறேன் (3)

எனக்கும் என் குடும்பத்தினருக்கும் விதைவிட்ட தவறுகளுக்காக
அறனவரையும் நான் மனம் திறந்து மன்னிக்கிறேன் (3)

நான் மன்னித்து விடுவிக்கிறேன் (3)

தெயவுசெய்து சுத்திகரணம் அருளுங்கள் (3)
தெயவுசெய்து பயம் மற்றும் சந்தேகங்களை நீக்கிவிடுங்கள் (3)

இறை ஒளி எங்களுக்கு வரும் மற்றும் எங்களிடமிருந்து பிறருக்கு பாயும்
அறனத்து சக்தித் தொடர்புகளையும் எரித்து நீக்கட்டும் (3)

தெயவுசெய்து எங்களை தெய்வீக அன்பு, கருணை, இரக்கத்தால் நிரப்பவும் (3)
தெய்வீக ஒளி எங்களை பாதுகாத்து எப்போதும் கடவுளின் பாதையில் நடத்தட்டும் (3)

எங்கள் உடல், மனம், ஆன்மா அனைத்தும் கடவுளின் பரிபூரணமான படைப்பு.
தெய்வீகமானது கர்மத்தைப் பற்றிய புரிதலும் ஞானமும் வழங்கட்டும்.

இறைவா நன்றி, நன்றி, நன்றி.`
      }
    },
    3: {
      title: { english: 'Awareness', tamil: 'விழிப்புணர்வு' },
      icon: 'visibility',
      content: {
        english: `Translation of the First Content

“Conduct and discipline mean choosing actions, words, and thoughts that cause no harm—neither to oneself nor to others—whether in the present or the future, and whether to the body, the mind, or the soul.”


2. Translation of the Second Content

“Between one sankalpa (affirmation/intention) and the next, reflect and check whether you have failed to uphold this discipline. If you find that you have faltered, read the statement of repentance on their behalf and then proceed to make your next sankalpa.”
1. Simplified Version of the First Content

“Discipline means not hurting yourself or others in any way—through your thoughts, words, or actions—now or in the future, whether it affects the body, mind, or soul.”


2. Simplified Version of the Second Content

“Before making each new intention (sankalpa), think about whether you broke this discipline. If you did, read the apology statement for anyone you may have affected, and then make your next intention.”`,
        tamil: `தனக்கோ பிறருக்கும் தற்காலத்திலும் பிற்காலத்திலோ உடலிருக்கோ மனதிற்கு ஆன்மாவிற்க்கோ எண்ணம் சொல் செயலால் துன்பம் தராத செயல் ஒழுக்கம்.
        
        இந்த ஒழுக்கத்தை ஒரு சங்கல்பத்திற்கு அடுத்த சங்கல்பத்திற்கும் இடையே நாம்  இழந்திருக்கிறோமா என்று சரி பார்த்து அப்படி இழந்திருந்தால் அவர்களுக்காக மன்னிப்பு அறிக்கையை படித்துவிட்டு சங்கல்பம் செய்யவும்.`
      }
    },
    4: {
      title: { english: 'Meditation', tamil: 'தியானம்' },
      icon: 'spa',
      content: {
        english: `MEDITATION

Step-by-Step Procedure:

Keep a lamp on your left side and water on your right side.

1. Standard Position:

▪︎ Face straight

▪︎ Eyes straight

▪︎ Spine stretched and kept straight

▪︎ Back-to-front shoulder rotation 3 times

▪︎ Place your left hand over your right hand and connect the thumbs.

2. Om Kara — 9 Times

▪︎ Chant “Om Kara” 9 times.

3. Five-Breath Technique:

Follow the exact pattern:

▪︎ Breath 1:
 Breathe in (calm, full inhale). Hold for 5 seconds. Breathe out fully. And suspend for 5 seconds. 

▪︎ Breath 2:
 Breathe in. Hold for 10 seconds. Breathe out fully. And suspend for 10 seconds .

▪︎ Breath 3: 
Breathe in. Hold for 15 seconds. Breathe out fully. And suspend for 15 seconds. 

▪︎ Breath 4: 
Breathe in. Hold for 15 seconds. Breathe out fully. And suspend for 15 seconds. 

▪︎ Breath 5: 
Breathe in. Hold for 15 seconds. Breathe out fully. And suspend for 15 seconds. 

Tips: 
▪︎Breathe in and out through the nose if comfortable. 
▪︎Keep the exhale relaxed and complete.

4. Focusing on the 5th Chakra (Vishuddha - Throat) Bring gentle attention to the throat region.

▪︎  Focus on 5th chakra for 10 seconds and say Visualisation prayer:

         “I am not the body”

         “I am not the mind”

         “I am not the five elements”

          “I am the true identity of eternally blissful  form of Shivam”

▪︎ Focus on 5th chakra for 10 seconds and say Visualisation prayer. 

▪︎ Focus on 5th chakra for 10 seconds and say Visualisation prayer.

5. Focusing on the 6th Chakra (Ajna — Third Eye) Shift awareness to the point between the eyebrows.

▪︎ Focus on 6th chakra for 10 seconds and say Visualisation Prayer.

▪︎ Focus on 6th chakra for 10 seconds and say Visualisation Prayer.

▪︎Focus on 6th chakra for 10 seconds and say Visualisation Prayer.

●“Bless yourself with love, peace and joy” - 3 times

6. Focusing on the 7th Chakra (Sahasrara - Crown) Move awareness to the crown of the head and feel openness.

▪︎ Focus on 7th chakra for 10 seconds and say Visualisation Prayer.

▪︎ Focus on 7th chakra for 10 seconds and say Visualisation Prayer.

▪︎ Focus on 7th chakra for 10 seconds and say Visualisation Prayer.

●“Bless yourself with love, peace and joy” - 3 times.

▪︎Focus on 7th chakra for 10 seconds and say Visualisation prayer.

7. Closing:

▪︎ Open your eyes gently when ready and finish it.

● Disclaimer :
     • Visualisation Prayer: Each time visualise the prayer mentioned. 

      • Focusing: Try to focus on the mentioned chakra and be in a thoughtless state.`,
        tamil: `தியானம் :- 
படிப்படியான
செயல்முறை:

*​உங்கள் இடது பக்கத்தில் ஒரு விளக்கையும், வலது பக்கத்தில் தண்ணீரையும் வைத்துக் கொள்ளவும்.

​1) அமரும் நிலை (Standard Position):
▪︎​முகம் நேராக இருக்க வேண்டும்.
▪︎​கண்கள் நேராகப் பார்க்க வேண்டும்.
▪︎​முதுகுத்தண்டை வளைக்காமல் நேராக நிமிர்த்தி வைக்கவும்.
▪︎​தோள்களைப் பின்னுக்கிருந்து முன்னாக 3 முறை சுழற்றவும்.
▪︎​உங்கள் வலது கையின் மேல் இடது கையை வைத்து, இரண்டு பெருவிரல்களையும் இணைக்கவும்.

​2) ஓம் காரம் — 9 முறை:

▪︎​“ஓம்” (Om Kara) மந்திரத்தை 9 முறை உச்சரிக்கவும்.

​3) ஐந்து சுவாசப் பயிற்சி (Five-Breath Technique):

​கீழே கொடுக்கப்பட்டுள்ள முறையைச் சரியாகப் 
பின்பற்றவும்:

▪︎​சுவாசம் 1:
மூச்சை உள்ளிழுக்கவும் (நிதானமாக, முழுமையாக). 
5 நொடிகள் உள்ளே நிறுத்தவும். மூச்சை முழுமையாக வெளியே விடவும். பிறகு 5 நொடிகள் மூச்சை வெளியே நிறுத்தவும்.

▪︎​சுவாசம் 2:
மூச்சை உள்ளிழுக்கவும். 10 நொடிகள் உள்ளே நிறுத்தவும். மூச்சை முழுமையாக வெளியே விடவும். பிறகு 10 நொடிகள் வெளியே நிறுத்தவும்.

▪︎​சுவாசம் 3:
மூச்சை உள்ளிழுக்கவும். 15 நொடிகள் உள்ளே நிறுத்தவும். மூச்சை முழுமையாக வெளியே விடவும். பிறகு 15 நொடிகள் வெளியே நிறுத்தவும்.

▪︎​சுவாசம் 4:
மூச்சை உள்ளிழுக்கவும். 15 நொடிகள் உள்ளே நிறுத்தவும். மூச்சை முழுமையாக வெளியே விடவும். பிறகு 15 நொடிகள் வெளியே நிறுத்தவும்.

▪︎​சுவாசம் 5:
மூச்சை உள்ளிழுக்கவும். 15 நொடிகள் உள்ளே நிறுத்தவும். மூச்சை முழுமையாக வெளியே விடவும். பிறகு 15 நொடிகள் வெளியே நிறுத்தவும்.

​குறிப்பு:
▪︎ வசதியாக இருந்தால் மூக்கின் வழியாகவே மூச்சை உள்ளிழுத்து வெளியே விடவும்.
▪︎ மூச்சை வெளியேற்றுவது தளர்வாகவும் முழுமையாகவும் இருக்கட்டும்.

​4) 5-வது சக்கரத்தில் கவனம் செலுத்துதல் (விசுத்தி — தொண்டை பகுதி):

உங்கள் கவனத்தை மெதுவாகத் தொண்டைப் பகுதிக்குக் கொண்டு வாருங்கள்.
▪︎​5-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பின்வரும் 'காட்சிப்படுத்தல் பிரார்த்தனையை' (Visualisation Prayer) மனதிற்குள் சொல்லவும்:
​"நான் இந்த உடல் அல்ல"
​"நான் இந்த மனம் அல்ல"
​"நான் பஞ்சபூதங்கள் அல்ல"
​"நான் இந்த சிவத்தின் பேரானந்த நிலையே நான்.."

▪︎​மீண்டும் 5-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

▪︎​மீண்டும் 5-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

​5) 6-வது சக்கரத்தில் கவனம் செலுத்துதல் (ஆக்ஞா — புருவ மத்தி/நெற்றிக்கண்):

உங்கள் கவனத்தை இரண்டு புருவங்களுக்கு இடைப்பட்ட புள்ளிக்கு மாற்றவும்.
▪︎​6-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

▪︎​6-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

▪︎​6-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

​● “அன்பு, அமைதி மற்றும் மகிழ்ச்சியுடன் உங்களை நீங்களே ஆசீர்வதித்துக் கொள்ளுங்கள்” - 3 முறை.

​6)  7-வது சக்கரத்தில் கவனம் செலுத்துதல் (சஹஸ்ராரா — தலை உச்சி):

கவனத்தைத் தலை உச்சிக்குக் கொண்டு சென்று, அங்கே ஒரு திறந்த உணர்வை உணரவும்.

▪︎​7-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

▪︎​7-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

▪︎​7-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

​● “அன்பு, அமைதி மற்றும் மகிழ்ச்சியுடன் உங்களை நீங்களே ஆசீர்வதித்துக் கொள்ளுங்கள்” - 3 முறை.

▪︎​கடைசியாக 7-வது சக்கரத்தில் 10 நொடிகள் கவனம் செலுத்தி, பிரார்த்தனையைச் சொல்லவும்.

​7) நிறைவு செய்தல் (Closing):

▪︎​நீங்கள் தயாரானதும் மெதுவாகக் கண்களைத் திறந்து தியானத்தை நிறைவு செய்யவும்.
​● முக்கியக் குறிப்பு (Disclaimer):

▪︎​காட்சிப்படுத்தல் பிரார்த்தனை (Visualisation Prayer): ஒவ்வொரு முறையும் மேலே குறிப்பிட்டுள்ள பிரார்த்தனையைச் சொல்லும்போது அதன் பொருளை மனக்கண்ணில் காட்சிப்படுத்தவும்.

▪︎​கவனம் செலுத்துதல் (Focusing): குறிப்பிட்ட சக்கரத்தில் கவனம் செலுத்தும்போது, எண்ணற்ற நிலையில் (thoughtless state) இருக்க முயற்சிக்கவும்.`
      }
    },
    5: {
      title: { english: 'Manifestation', tamil: 'வெளிப்பாடு' },
      icon: 'stars',
      content: {
        english: `Manifestation Prayer   ( Short form of Adi Shankara’ s Nirvana Shatakam ) 
   
Time : ( 9 am / 12 pm / 4 pm / 9 pm )
 
1.Body position: Spinal cord should be straight, right palm on top of left palm and thumbs touching.
2.Rotate your shoulder back to front three times.
3 .Take a deep single breath. 

➢ 3 times Om Kara

➢ Say the manifestation prayer “I am not the mind, I am not the body, I am not the the five elements, I am the true identity of the blissful form of Shivam “.( 3 times ) 

➢ Now bless yourself (Imagine yourself filled with peace, love and Joy  till the next manifestation time. 

➢ Then see your hands both and then cover both your eyeswith your hands and keep your hands (right on top of left) on the top of your head (Chakra 7) and then keep them on your heart and move them all the way down to your feet.

 Watch the manifestation video for guided practice.

Remember: What you focus on expands!`,
        tamil: `வெளிப்பாடு பிரார்த்தனை (ஆதி சங்கரரின் நிர்வாண ஷட்கத்தின் சுருக்க வடிவம்)

நேரம்: காலை 9 மணி / மதியம் 12 மணி / மாலை 4 மணி / இரவு 9 மணி

செய்யும் முறை

உடல் நிலை:
முதுகெலும்பு நேராக இருக்க வேண்டும்.
இடது கை மீது வலது கை வைத்துக் கொண்டு, இரு கைவிரல்களின் (அங்கூடுகள்) முனைகள் ஒன்றோடொன்று தொடும் படி அமரவும்.

தோள்சுழற்சி:
தோள்களை பின்புறம் இருந்து முன்புறம் நோக்கி 3 முறை மெதுவாக சுழற்றவும்.

மூச்சு:
ஒரு ஆழமான மூச்சை ஒரே முறையாக உள்ளே இழுத்து வெளியே விடவும்.

ஜபம்

➢ ஓம் காரம் – 3 முறை

➢ மாநிபெஸ்டேஷன் பிரார்த்தனை – 3 முறை
“நான் மனம் அல்ல,
நான் உடல் அல்ல,
நான் ஐந்து பஞ்சபூதங்களும் அல்ல,
நான் ஆனந்த ரூபமான சிவத்தின்
உண்மையான அடையாளம்.”

ஆசீர்வாதம் (Self Blessing)

➢ அடுத்த மாநிபெஸ்டேஷன் நேரம் வரை,
நீங்கள் அமைதி, அன்பு, மகிழ்ச்சி ஆகியவற்றால் நிரம்பியிருப்பதாக மனதில் கற்பனை செய்து, உங்களை நீங்களே ஆசீர்வதிக்கவும்.

சக்தி இயக்கம்

➢ உங்கள் இரு கைகளையும் பாருங்கள்.
➢ பின்னர், இரு கைகளாலும் கண்களை மெதுவாக மூடுங்கள்.
➢ அதன்பின், வலது கை மேல், இடது கை கீழ் என வைத்து,

தலை உச்சியில் (7வது சக்ரா) வைக்கவும்

இதயத்தில் வைக்கவும்

அங்கிருந்து மெதுவாக கால்கள் வரை கைகளை நகர்த்தவும்.`
      }
    },
    6: {
      title: { english: 'Tharpanam/Thithi', tamil: 'தர்ப்பணம்/திதி' },
      icon: 'local-florist',
      content: {
        english: `Thithi - refined step-by-step ritual

Items to prepare

	•	Plate with your meal (veg or non-veg — as you prefer)
	•	A glass of water (placed to the left of the plate)
	•	Mat (if sitting on the floor) or dining chair/table (both OK)



Before you begin (setup)

	1.	Sit facing west.
	2.	Make sure your plate contains the dishes you intend to eat.
	3.	Place the glass of water at the left-hand corner of your plate.
	4.	If sitting on the floor, sit on a mat; if at a table, sit normally. Remain seated until the ritual and meal are finished.



Step-by-step ritual (action + words)

	1.	Pick up the glass with your left hand and hold it throughout steps 2–4
	2.	With your right hand, touch the tip of the middle finger and lightly dip that fingertip into the water.
	3.	Move your right hand to the back-right corner (slightly behind you, toward the floor) and drop the tiny amount of water there.
	•	Intention to hold in your heart while doing this:
“On behalf of the unmarried girls (Kanniga) who are no more, from seven generations on my father’s side and mother’s side, I offer this water. May their souls receive it and reach the higher plane. I seek their blessings.”
	4.	After dropping the water, bring the glass back and take a sip with the left hand. Keep holding the glass until you finish this short portion.
	5.	Now take the first piece of food from your plate in your hand (any item is fine). Hold it respectfully for a moment.
	6.	Silently pray (with feeling and gratitude), speaking or thinking these words:
“I take this food on behalf of all my ancestors of seven generations, both on my mother’s side and father’s side (126 people). May their souls receive this food and reach the higher plane. I seek their blessings for myself and for my family.”
	7.	 Start your meal in gratitude.
	8.	Do not get up from your place until you have finished your meal — remain seated to maintain the energy and intention.


Frequency
	•	Do this ritual every time you take a meal, i.e., three times a day (or when you eat main meals).`,
        tamil: `திதி — செயல்முறை: (Thithi — Refined Step-by-Step Ritual)

●தயாரிக்க வேண்டிய பொருட்கள் (Items to prepare):

•​உங்களின் உணவுடன் கூடிய தட்டு (சைவம் அல்லது அசைவம் — உங்கள் விருப்பப்படி)

•​ஒரு டம்ளர் தண்ணீர் (தட்டின் இடதுபுறம் வைக்கப்பட வேண்டும்)
​பாயோ அல்லது விரிப்போ (தரையில் அமர்ந்தால்) அல்லது டைனிங் சேர்/டேபிள் (இரண்டும் சரி)
​
●தொடங்குவதற்கு முன் (அமைத்தல்) (Before you begin - Setup):

•​மேற்கு நோக்கி அமரவும்.

•​உங்கள் தட்டில் நீங்கள் உண்ண உத்தேசித்த உணவுகள் இருப்பதை உறுதிசெய்யவும்.

•​தண்ணீர் டம்ளரை உங்கள் தட்டின் இடதுபுற மூலையில் வைக்கவும்.

•​தரையில அமர்ந்தால், ஒரு பாயின் மீது அமரவும்; மேசையில அமர்ந்தால், சாதாரணமாக அமரவும். 

•திதி மற்றும் உணவு முடியும் வரை அமர்ந்தே இருக்கவும்.
​
●  செய்முறை (செயல் + வார்த்தைகள்) (Step-by-Step Ritual - Action + Words):

1.இடது கையால் டம்ளரை எடுக்கவும்.

2.​உங்கள் வலது கையால், நடுவிரலின் நுனியைத் தொட்டு, அந்த விரல் நுனியை தண்ணீரில் லேசாகத் தோய்க்கவும்.

3.​உங்கள் வலது கையை பின்-வலது மூலைக்கு (உங்களுக்குப் பின்னால், தரை நோக்கி) நகர்த்தி, அந்தச் சிறிய அளவு தண்ணீரை அங்கே விடவும்.

4.​இதைச் செய்யும்போது உங்கள் மனதில் கொள்ள வேண்டிய எண்ணம்:
“என் தந்தை வழி மற்றும் தாய் வழி ஏழு தலைமுறைகளில் காலமான திருமணமாகாத கன்னிகளுக்காக (Kanniga) இந்தத் தண்ணீரை நான் அர்ப்பணிக்கிறேன். அவர்களின் ஆன்மாக்கள் அதைப் பெற்று உயர்நிலையை அடையட்டும். அவர்கள் என்னை ஆசீர்வதிக்கட்டும்.”

5.​தண்ணீரை விட்டபின், டம்ளரை மீண்டும் கொண்டு வந்து, இடது கையால் ஒரு வாய் தண்ணீர் அருந்தவும். இந்த செயல்கள் முடியும் வரை டம்ளரைப் பிடித்திருக்கவும்.

6.​இப்போது உங்கள் தட்டிலிருந்து முதல் உணவுப் பிடியை உங்கள் கையில் எடுக்கவும் (எந்த உணவுப் பொருளும் பரவாயில்லை). அதை மரியாதையுடன் ஒரு கணம் பிடித்திருக்கவும்.
​மௌனமாகப் பிரார்த்தனை செய்யுங்கள் (உணர்வுடனும் நன்றியுடனும்), இந்த வார்த்தைகளைப் பேசவும் அல்லது சிந்திக்கவும்:

“என் தாய் மற்றும் தந்தை வழி ஏழு தலைமுறைகளின் அனைத்து முன்னோர்களுக்காகவும் (126 பேர்) இந்த உணவை நான் எடுத்துக்கொள்கிறேன். அவர்களின் ஆன்மாக்கள் இந்த உணவைப் பெற்று உயர்நிலையை அடையட்டும். என்னையும் எனது குடும்பத்தினரையும் ஆசிர்வதிக்கட்டும்.”
​நன்றியுணர்வுடன் உங்கள் உணவைத் தொடங்கவும்.

7.​உங்கள் உணவு முடியும் வரை உங்கள் இடத்தை விட்டு எழ வேண்டாம் — ஆற்றலையும் நோக்கத்தையும் தக்கவைக்க அமர்ந்தே இருங்கள்.
​
●​நீங்கள் உணவு உண்ணும் ஒவ்வொரு முறையும் இந்தச் சடங்கைச் செய்யவும், அதாவது, ஒரு நாளைக்கு மூன்று முறை (அல்லது நீங்கள் முக்கிய உணவை உண்ணும் போது).`
      }
    },
    7: {
      title: { english: 'Healing - Self & Family', tamil: 'குணப்படுத்துதல் - சுய மற்றும் குடும்பம்' },
      icon: 'healing',
      content: {
        english: `1. Opening Invocation

To the Supreme Divine
Divine Father
Divine Mother
To my Higher Soul
To all Divine Beings, Healing Angels, Spiritual Guides, Helpers and Teachers
To the Great Karmic Board

I am that I am.
I humbly invoke for Divine healing, Divine guidance, and Divine protection for myself and my family.

2. Preparing for Healing

Sit comfortably.
Close your eyes gently.
Take a deep breath in… and relax as you exhale.
Allow your mind and body to settle.

Visualize a soft, bright white Divine Light above your head —
pure, healing, powerful, loving.

3. Healing Yourself

Bring awareness to your heart.

Silently say:

“Divine Healing Light,
enter every cell of my body.
Cleanse me, heal me, energize me.”

Visualize:

A bright golden-white light entering your crown

Flowing through your head, shoulders, chest, and spine

Releasing all physical pain

Dissolving emotional wounds

Clearing negative thoughts

Filling you with strength, peace, and clarity

Now repeat:

“I am healed.
I am strong.
I am peaceful.
I am whole.”

Let this light continue to flow through you for a few moments.

4. Healing Family Members

Hold your hands out gently as if offering light.

Visualize each family member (one by one) standing in front of you, surrounded by soft white light.

Say:

“Divine Healing Light,
flow to my family members.
Heal their body, mind, emotions, and soul.”

Visualize:

The Divine Light wrapping them like a warm blanket

Removing their stress, fear, pain, trauma, and burdens

Filling them with peace, love, protection, and positivity

Repeat:

“May they be healed.
May they be blessed.
May they be protected.”

5. Healing for Home and Relationships

Visualize your entire home filled with bright, radiant light.

Bless your home:

“Let our home be filled with peace, harmony, protection, and good energy.”

Bless your relationships:

“Let there be love, understanding, unity, and healing between us.”

6. Deep Healing Prayer

Say slowly and with feeling:

“Divine Light,
heal everything that needs healing.
Remove everything that blocks our growth.
Protect us from all negative influences.
Guide us toward physical health, emotional balance,
mental clarity, spiritual strength,
and abundance in all areas of life.”

7. Closing

Place your hands on your heart.

Say:

“Divine, thank you for this healing.
Thank you for your protection.
Thank you for your blessings.”

Take a deep breath in…
and slowly open your eyes.

You are healed.
You are renewed.
You are blessed.`,
        tamil: `குணப்படுத்துதல் - உங்களுக்கும் உங்கள் குடும்ப உறுப்பினர்களுக்கும் குணப்படுத்தும் ஆற்றலை அனுப்புங்கள்.`
      }
    },
  };

  const currentStep = stepContent[step] || stepContent[1];
  const currentTitle = currentStep.title[language];
  const currentContent = currentStep.content[language];

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isNearBottom && !hasRead) {
      setHasRead(true);
    }
  };

  const handleComplete = () => {
    // For Step 1 (Chakra Cleansing), video completion is mandatory
    if (step === 1) {
      if (!userProgress || !userProgress.videoCompleted) {
        setVideoRequiredModal(true);
        return;
      }
    }

    navigation.navigate('ChemsingDashboard', { completedStep: step });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step {step}</Text>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLanguage(language === 'english' ? 'tamil' : 'english')}>
          <Text style={styles.langBtnText}>{language === 'english' ? 'த' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name={currentStep.icon} size={64} color="#516f8b" />
        </View>

        <Text style={styles.title}>{currentTitle}</Text>

        <View style={styles.card}>
          {currentContent.split('\n').map((line, index) => {
            const isHeading = line.match(/^[A-Z][A-Z\s]+$/) ||
              line.match(/^\d+\.\s+[A-Z]/) ||
              line.match(/^[A-Z][a-z]+.*:$/) ||
              line.includes('●') ||
              line.match(/^FORGIVING|^FORGIVENESS/) ||
              line.match(/^Step \d+:/);

            if (line.trim() === '') return <View key={index} style={{ height: 8 }} />;

            if (isHeading) {
              return <Text key={index} style={styles.sectionHeading}>{line.trim()}</Text>;
            }

            return <Text key={index} style={styles.contentText}>{line}</Text>;
          })}
        </View>

        {step === 1 && (
          <View style={styles.levelVideosSection}>
            <View style={styles.levelVideosTitleRow}>
              <MaterialIcons name="video-library" size={28} color="#516f8b" />
              <Text style={styles.levelVideosTitle}>Level Videos</Text>
            </View>
            <Text style={styles.levelVideosDesc}>Complete 120 days to unlock next level</Text>

            {[1, 2, 3].map(level => {
              const video = levelVideos[level];
              const unlocked = isLevelUnlocked(level);
              const daysNeeded = level === 2 ? 120 : level === 3 ? 240 : 0;
              const currentDays = userProgress?.totalDaysCompleted || 0;

              return (
                <View
                  key={level}
                  style={[
                    styles.levelCard,
                    !unlocked && styles.levelCardLocked
                  ]}
                >
                  <View style={styles.levelCardLeft}>
                    <View style={[
                      styles.levelBadge,
                      unlocked ? styles.levelBadgeUnlocked : styles.levelBadgeLocked
                    ]}>
                      <Text style={styles.levelBadgeText}>Level {level}</Text>
                    </View>
                    {!unlocked && (
                      <View style={styles.lockInfo}>
                        <MaterialIcons name="lock" size={16} color="#dc3545" />
                        <Text style={styles.lockText}>
                          {daysNeeded - currentDays} days to unlock
                        </Text>
                      </View>
                    )}
                  </View>

                  {video ? (
                    <View style={styles.levelCardButtons}>
                      <TouchableOpacity
                        style={[
                          styles.playButton,
                          !unlocked && styles.disabledButton
                        ]}
                        onPress={() => {
                          if (unlocked) {
                            playVideo(video.url, video.id);
                          }
                        }}
                        disabled={!unlocked}
                      >
                        <MaterialIcons
                          name="play-circle-filled"
                          size={20}
                          color={unlocked ? "#FFFFFF" : "#9CA3AF"}
                        />
                        <Text style={[
                          styles.playButtonText,
                          !unlocked && styles.disabledButtonText
                        ]}>
                          Play Video
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.noVideoText}>No video yet</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {step === 5 && manifestationVideo && (
          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => playVideo(manifestationVideo.url)}>
            <View style={styles.videoIconCircle}>
              <MaterialIcons name="play-circle-filled" size={48} color="#516f8b" />
            </View>
            <View style={styles.videoTextContainer}>
              <Text style={styles.videoCardTitle}>🎥 Manifestation Video</Text>
              <Text style={styles.videoCardDesc}>Watch guided manifestation practice</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color="#516f8b" />
          </TouchableOpacity>
        )}

        <View style={styles.readIndicator}>
          {hasRead ? (
            <View style={styles.readBadge}>
              <MaterialIcons name="check-circle" size={20} color="#28a745" />
              <Text style={styles.readText}>You've read the instructions</Text>
            </View>
          ) : (
            <Text style={styles.scrollText}>Scroll to bottom to enable complete button</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.completeBtn,
            !hasRead && styles.disabledBtn,
            (step === 1 && userProgress && !userProgress.videoCompleted) && { backgroundColor: '#F59E0B' }
          ]}
          onPress={handleComplete}
          disabled={!hasRead}
        >
          <MaterialIcons
            name={(step === 1 && userProgress && !userProgress.videoCompleted) ? "play-circle-outline" : "check-circle"}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.completeBtnText}>
            {(step === 1 && userProgress && !userProgress.videoCompleted) ? 'Watch Video to Complete' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      </View>

      {playingVideo && (
        <UniversalVideoPlayer
          videoUrl={playingVideo}
          onClose={handleVideoClose}
        />
      )}

      <Modal
        visible={showVideoCompleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleVideoNotComplete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="check-circle" size={64} color="#516f8b" />
            <Text style={styles.modalTitle}>Complete Video?</Text>
            <Text style={styles.modalMessage}>Did you finish watching the video?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnYes}
                onPress={handleVideoComplete}
              >
                <Text style={styles.modalBtnYesText}>Yes, Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnNo}
                onPress={handleVideoNotComplete}
              >
                <Text style={styles.modalBtnNoText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={videoRequiredModal}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoRequiredModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="play-circle-outline" size={64} color="#F59E0B" />
            <Text style={styles.modalTitle}>Video Required</Text>
            <Text style={styles.modalMessage}>Please watch and complete the video before marking this step as done.</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtnYes, { backgroundColor: '#516f8b' }]}
                onPress={() => setVideoRequiredModal(false)}
              >
                <Text style={styles.modalBtnYesText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#04223e',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#b37e68',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontFamily: headingBold, color: '#e1e4e8' },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  langBtnText: {
    color: '#e1e4e8',
    fontSize: 14,
    fontFamily: bodyRegular
  },
  content: { flex: 1, padding: 20 },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff8f4', // Light Peach
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ffcbb5'
  },
  title: {
    fontSize: 28,
    fontFamily: headingBold,
    color: '#04223e',
    textAlign: 'center',
    marginBottom: 24
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#b37e68',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  contentText: {
    fontSize: 16,
    fontFamily: bodyRegular,
    color: '#2e2e2e',
    lineHeight: 28,
    letterSpacing: 0.2
  },
  sectionHeading: {
    fontSize: 17,
    fontFamily: headingBold,
    color: '#04223e',
    marginTop: 20,
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#516f8b',
    backgroundColor: '#eff4f8',
    paddingVertical: 10,
    paddingRight: 12,
    borderRadius: 8
  },
  readIndicator: {
    alignItems: 'center',
    marginBottom: 100,
    padding: 16
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb'
  },
  readText: {
    fontFamily: bodyRegular,
    fontSize: 14,
    color: '#155724'
  },
  scrollText: {
    fontSize: 14,
    fontFamily: bodyRegular,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ffcbb5',
    shadowColor: '#b37e68',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  completeBtn: {
    backgroundColor: '#28a745',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  disabledBtn: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: headingBold,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#b37e68',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ffcbb5'
  },
  videoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff8f4',
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoTextContainer: {
    flex: 1
  },
  videoCardTitle: {
    fontSize: 18,
    fontFamily: headingBold,
    color: '#04223e',
    marginBottom: 4
  },
  videoCardDesc: {
    fontSize: 14,
    color: '#66483c'
  },
  levelVideosSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#b37e68',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  levelVideosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  levelVideosTitle: {
    fontSize: 22,
    fontFamily: headingBold,
    color: '#04223e'
  },
  levelVideosDesc: {
    fontSize: 14,
    color: '#516f8b',
    marginBottom: 20
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ffcbb5',
    shadowColor: '#b37e68',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  levelCardLocked: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    opacity: 0.7
  },
  levelCardLeft: {
    flex: 1
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  levelBadgeUnlocked: {
    backgroundColor: '#d1e7dd'
  },
  levelBadgeLocked: {
    backgroundColor: '#f8d7da'
  },
  levelBadgeText: {
    fontSize: 14,
    color: '#04223e',
    fontFamily: bodyRegular
  },
  lockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  lockText: {
    fontSize: 12,
    color: '#dc3545',
    fontFamily: bodyRegular
  },
  levelCardRight: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  noVideoText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic'
  },
  levelCardButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  playButton: {
    flex: 1,
    backgroundColor: '#516f8b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#516f8b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: headingBold
  },
  completeVideoButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  completeVideoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: headingBold
  },
  disabledButton: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0
  },
  disabledButtonText: {
    color: '#a0aec0'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 34, 62, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: headingBold,
    color: '#04223e',
    marginTop: 16,
    marginBottom: 8
  },
  modalMessage: {
    fontSize: 16,
    color: '#516f8b',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: bodyRegular
  },
  modalButtons: {
    width: '100%',
    gap: 12
  },
  modalBtnYes: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  modalBtnYesText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: headingBold
  },
  modalBtnNo: {
    backgroundColor: '#fff8f4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcbb5'
  },
  modalBtnNoText: {
    color: '#b37e68',
    fontSize: 16,
    fontFamily: headingBold
  }
});
