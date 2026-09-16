import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert, Image, Linking, Pressable, SafeAreaView, ScrollView, Share, StatusBar,
  StyleSheet, Text, TextInput, View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const C={red:'#E43616',green:'#3D7046',cream:'#FFF8E9',paper:'#FFFDF8',ink:'#251F1B',muted:'#6D625C',yellow:'#F4B73A',line:'#E4D8CC'};
const STORE={favorites:'kadopych:favorites',reminders:'kadopych:reminders'};

Notifications.setNotificationHandler({
  handleNotification:async()=>({shouldPlaySound:true,shouldSetBadge:false,shouldShowBanner:true,shouldShowList:true})
});

const questions=[
 {key:'occasion',title:'این هدیه قرار است چه لحظه‌ای را خاص کند؟',options:[['birthday','تولد','🎂'],['love','سالگرد یا عاشقانه','💞'],['thanks','تشکر و موفقیت','🌟'],['now','بی‌مناسبت','🎈']]},
 {key:'relation',title:'هدیه برای چه کسی است؟',options:[['partner','همسر یا پارتنر','❤️'],['friend','دوست','🫶'],['family','عضو خانواده','🏡'],['work','همکار یا مدیر','💼']]},
 {key:'age',title:'در چه بازه‌ی سنی است؟',options:[['teen','زیر ۲۰ سال','⚡'],['young','۲۰ تا ۳۵ سال','🌱'],['adult','۳۶ تا ۵۰ سال','✨'],['senior','بیشتر از ۵۰ سال','🌿']]},
 {key:'interest',title:'بیشتر با کدام دنیا حال می‌کند؟',options:[['culture','هنر، کتاب و موسیقی','🎨'],['tech','فناوری و بازی','🎮'],['home','خانه، خوراکی و آرامش','☕'],['outdoor','سفر، ورزش و تجربه','🧭']]},
 {key:'type',title:'هدیه چه حال‌وهوایی داشته باشد؟',options:[['personalized','شخصی‌سازی‌شده','🪄'],['object','یک وسیله‌ی باکیفیت','🎁'],['experience','یک تجربه‌ی تازه','🎟️'],['digital','دیجیتال یا فوری','💳']]},
 {key:'personality',title:'سبک انتخاب‌هایش چطور است؟',options:[['practical','کاربردی و منطقی','🧩'],['emotional','احساسی و خاطره‌باز','💌'],['minimal','مینیمال و سخت‌پسند','◻️'],['adventurous','کنجکاو و ماجراجو','🚀']]},
 {key:'delivery',title:'چقدر برای تهیه‌ی هدیه فرصت داری؟',options:[['urgent','امروز یا فردا','⚡'],['week','تا یک هفته','📦'],['later','بیشتر از یک هفته','🗓️'],['flexible','زمان مهم نیست','✨']]},
 {key:'budget',title:'حدود بودجه‌ات چقدر است؟',options:[['low','تا ۷۰۰ هزار تومان','💛'],['mid','۷۰۰ هزار تا ۲ میلیون','💚'],['high','۲ تا ۵ میلیون','💜'],['premium','بیشتر از ۵ میلیون','🧡']]}
];

const gifts=[
 {id:'sound-frame',name:'تابلوی صدادار با QR خاطره',emoji:'🎵',provider:'صدانما',url:'https://sedanama.com/',desc:'عکس، آهنگ یا صدای شما در یک قاب شخصی و داستان‌دار.',tags:['culture','emotional'],types:['personalized'],budgets:['mid','high'],relations:['partner','friend','family'],time:['week','later','flexible']},
 {id:'night-sky',name:'تابلوی آسمان شب یک تاریخ خاص',emoji:'🌌',provider:'صدانما',url:'https://sedanama.com/',desc:'نقشه‌ی آسمان شب تولد، آشنایی یا یک تاریخ مشترک.',tags:['culture','emotional','minimal'],types:['personalized'],budgets:['mid','high'],relations:['partner','friend','family'],time:['week','later','flexible']},
 {id:'pottery',name:'ورکشاپ سفالگری دونفره',emoji:'🏺',provider:'چار سرامیک',url:'https://chaarceramic.ir/experiential-gift-tehran/',desc:'چند ساعت ساختن، خندیدن و بردن یک یادگاری دست‌ساز.',tags:['outdoor','culture','adventurous'],types:['experience'],budgets:['mid','high'],relations:['partner','friend','family'],time:['week','later','flexible']},
 {id:'experience',name:'کارت هدیه‌ی یک تجربه',emoji:'🎟️',provider:'قاصتک',url:'https://ghasetak.ir/',desc:'انتخاب تجربه را به خودش بسپار؛ از تفریح تا یادگیری.',tags:['outdoor','adventurous','practical'],types:['experience','digital'],budgets:['mid','high','premium'],relations:['partner','friend','family','work'],time:['urgent','week','later','flexible']},
 {id:'craft',name:'اثر صنایع‌دستی معاصر ایرانی',emoji:'🪬',provider:'دریک',url:'https://drikshop.ir/',desc:'سفال، مس، چوب یا دست‌بافته‌ای اصیل و غیرتکراری.',tags:['culture','home','minimal'],types:['object'],budgets:['mid','high','premium'],relations:['partner','friend','family','work'],time:['week','later','flexible']},
 {id:'turquoise',name:'فیروزه‌کوبی فاخر ایرانی',emoji:'💎',provider:'آقاجانی',url:'https://aghajani.net/',desc:'هدیه‌ای رسمی، هنری و ماندگار برای یک مناسبت مهم.',tags:['culture','home','minimal'],types:['object'],budgets:['high','premium'],relations:['family','work','partner'],time:['week','later','flexible']},
 {id:'candle',name:'شمع دست‌ساز با رایحه‌ی خاص',emoji:'🕯️',provider:'باسلام',url:'https://basalam.com/cat/home/%D8%B4%D9%85%D8%B9-%D8%AF%D8%B3%D8%AA-%D8%B3%D8%A7%D8%B2',desc:'هدیه‌ای گرم و خوش‌بو از سازنده‌های مستقل.',tags:['home','emotional','minimal'],types:['object'],budgets:['low','mid'],relations:['partner','friend','family','work'],time:['week','later','flexible']},
 {id:'plant',name:'گیاه خاص با گلدان دست‌ساز',emoji:'🪴',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%DA%AF%DB%8C%D8%A7%D9%87%20%D8%A2%D9%BE%D8%A7%D8%B1%D8%AA%D9%85%D8%A7%D9%86%DB%8C%20%DA%AF%D9%84%D8%AF%D8%A7%D9%86',desc:'یک هدیه‌ی زنده که هر روز یاد تو را تازه می‌کند.',tags:['home','emotional','minimal'],types:['object'],budgets:['low','mid'],relations:['partner','friend','family','work'],time:['week','later','flexible']},
 {id:'coffee',name:'پک قهوه و ابزار دم‌آوری',emoji:'☕',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%D9%BE%DA%A9%20%D9%87%D8%AF%DB%8C%D9%87%20%D9%82%D9%87%D9%88%D9%87',desc:'برای کسی که عطر قهوه بخشی از حال خوب روزش است.',tags:['home','practical','adventurous'],types:['object'],budgets:['low','mid','high'],relations:['partner','friend','family','work'],time:['week','later','flexible']},
 {id:'boardgame',name:'بازی رومیزی بزرگسال',emoji:'🎲',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%D8%A8%D8%A7%D8%B2%DB%8C%20%D9%81%DA%A9%D8%B1%DB%8C%20%D8%A8%D8%B2%D8%B1%DA%AF%D8%B3%D8%A7%D9%84',desc:'هدیه‌ای که همان شب تبدیل به دورهمی و خنده می‌شود.',tags:['tech','outdoor','adventurous'],types:['object','experience'],budgets:['low','mid'],relations:['partner','friend','family'],time:['week','later','flexible']},
 {id:'camera',name:'دوربین چاپ سریع',emoji:'📸',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%D8%AF%D9%88%D8%B1%D8%A8%DB%8C%D9%86%20%DA%86%D8%A7%D9%BE%20%D8%B3%D8%B1%DB%8C%D8%B9',desc:'ثبت لحظه و تحویل خاطره در همان چند ثانیه.',tags:['tech','culture','emotional','adventurous'],types:['object','experience'],budgets:['high','premium'],relations:['partner','friend','family'],time:['week','later','flexible']},
 {id:'projector',name:'مینی پروژکتور برای شب فیلم',emoji:'📽️',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%D9%85%DB%8C%D9%86%DB%8C%20%D9%BE%D8%B1%D9%88%DA%98%DA%A9%D8%AA%D9%88%D8%B1',desc:'یک سینمای کوچک برای اتاق، سفر یا شب‌های دونفره.',tags:['tech','home','practical'],types:['object'],budgets:['high','premium'],relations:['partner','friend','family'],time:['week','later','flexible']},
 {id:'keyboard',name:'صفحه‌کلید مکانیکی',emoji:'⌨️',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%DA%A9%DB%8C%D8%A8%D9%88%D8%B1%D8%AF%20%D9%85%DA%A9%D8%A7%D9%86%DB%8C%DA%A9%D8%A7%D9%84',desc:'برای گیمر یا کسی که میز کارش را با وسواس می‌چیند.',tags:['tech','practical','minimal'],types:['object'],budgets:['mid','high','premium'],relations:['partner','friend','family','work'],time:['week','later','flexible']},
 {id:'headphone',name:'هدفون حذف نویز',emoji:'🎧',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%D9%87%D8%AF%D9%81%D9%88%D9%86%20%D9%86%D9%88%DB%8C%D8%B2%20%DA%A9%D9%86%D8%B3%D9%84%DB%8C%D9%86%DA%AF',desc:'فضای شخصی برای موسیقی، تمرکز و سفر.',tags:['tech','culture','practical','minimal'],types:['object'],budgets:['high','premium'],relations:['partner','friend','family','work'],time:['week','later','flexible']},
 {id:'book',name:'کتاب با یادداشت دست‌نویس',emoji:'📚',provider:'طاقچه',url:'https://taaghche.com/blog/1398/08/27/%D8%A8%D9%87%D8%AA%D8%B1%DB%8C%D9%86-%DA%A9%D8%AA%D8%A7%D8%A8-%D8%A8%D8%B1%D8%A7%DB%8C-%D9%87%D8%AF%DB%8C%D9%87-%D8%A8%D9%87-%D8%B9%D8%B4%D9%82/',desc:'یک انتخاب شخصی که با چند خط از تو کامل می‌شود.',tags:['culture','emotional','minimal'],types:['object','personalized'],budgets:['low','mid'],relations:['partner','friend','family','work'],time:['urgent','week','later','flexible']},
 {id:'giftcard',name:'گیفت‌کارت موسیقی، بازی یا اپ',emoji:'💳',provider:'ایرانیکارت',url:'https://www.iranicard.ir/card/giftcard/application-giftcard/',desc:'انتخاب فوری برای علاقه‌مندان دنیای دیجیتال.',tags:['tech','practical'],types:['digital'],budgets:['low','mid','high'],relations:['partner','friend','family','work'],time:['urgent','week','later','flexible']},
 {id:'investment',name:'کارت هدیه‌ی سرمایه‌گذاری',emoji:'📈',provider:'هدهد فارابی',url:'https://hodhod.irfarabi.com/',desc:'هدیه‌ای متفاوت و آینده‌نگر برای یک انتخاب کاربردی.',tags:['practical','minimal'],types:['digital'],budgets:['mid','high','premium'],relations:['family','work','friend'],time:['urgent','week','later','flexible']},
 {id:'bank-card',name:'کارت بانکی با طرح اختصاصی',emoji:'💳',provider:'دیسماکارت',url:'https://dismacard.com/',desc:'انعطاف انتخاب با ظاهری شخصی‌سازی‌شده.',tags:['practical','minimal'],types:['personalized','digital'],budgets:['mid','high','premium'],relations:['partner','friend','family','work'],time:['week','later','flexible']},
 {id:'instagram',name:'هدیه‌ی صوتی و تصویری سفارشی',emoji:'📱',provider:'اینستاگرام صدانما',url:'https://instagram.com/sedanama',desc:'دیدن نمونه‌کار و سفارش مستقیم هدیه‌ی خاطره‌محور.',tags:['culture','emotional'],types:['personalized'],budgets:['mid','high'],relations:['partner','friend','family'],time:['week','later','flexible']},
 {id:'picnic',name:'پک سفر یک‌روزه و پیک‌نیک',emoji:'🎒',provider:'دیجی‌کالا',url:'https://www.digikala.com/search/?q=%D9%BE%DA%A9%20%D9%BE%DB%8C%DA%A9%20%D9%86%DB%8C%DA%A9',desc:'وسایل سبک و یک برنامه‌ی کوچک برای فرار از روزمرگی.',tags:['outdoor','adventurous','practical'],types:['object','experience'],budgets:['mid','high'],relations:['partner','friend','family'],time:['week','later','flexible']}
];

const score=(g,a)=>{
 let s=0;
 if(g.tags.includes(a.interest))s+=7;
 if(g.tags.includes(a.personality))s+=5;
 if(g.types.includes(a.type))s+=7;
 if(g.budgets.includes(a.budget))s+=6; else s-=4;
 if(g.relations.includes(a.relation))s+=4;
 if(g.time.includes(a.delivery))s+=4; else s-=5;
 return s;
};

function Header(){return <View style={styles.header}><Image source={require('./assets/logo.png')} style={styles.logo}/><View><Text style={styles.brand}>کادوپیچ</Text><Text style={styles.tagline}>یک فکر خوب، توی یک بسته‌ی قشنگ</Text></View></View>}
function Button({title,onPress,kind='primary',small=false}){return <Pressable onPress={onPress} style={({pressed})=>[styles.button,kind==='ghost'&&styles.ghost,small&&styles.smallButton,pressed&&{opacity:.72}]}><Text style={[styles.buttonText,kind==='ghost'&&styles.ghostText]}>{title}</Text></Pressable>}

function GiftCard({gift,isFavorite,onFavorite}){
 return <View style={styles.card}>
  <View style={styles.cardTop}><Text style={styles.emoji}>{gift.emoji}</Text><Pressable onPress={()=>onFavorite(gift)}><Text style={styles.heart}>{isFavorite?'♥':'♡'}</Text></Pressable></View>
  <Text style={styles.cardTitle}>{gift.name}</Text><Text style={styles.desc}>{gift.desc}</Text>
  <Text style={styles.provider}>● {gift.provider}</Text>
  <View style={styles.cardActions}><Button small title="مشاهده" onPress={()=>Linking.openURL(gift.url)}/><Button small kind="ghost" title="اشتراک" onPress={()=>Share.share({message:`${gift.name}\n${gift.desc}\n${gift.url}`})}/></View>
 </View>
}

function Quiz({favorites,toggleFavorite}){
 const [step,setStep]=useState(0),[answers,setAnswers]=useState({}),[results,setResults]=useState(null);
 const q=questions[step];
 const choose=(value)=>{const next={...answers,[q.key]:value};setAnswers(next);if(step===questions.length-1)setResults([...gifts].sort((a,b)=>score(b,next)-score(a,next)).slice(0,12));else setStep(step+1)};
 const reset=()=>{setStep(0);setAnswers({});setResults(null)};
 if(results)return <ScrollView contentContainerStyle={styles.content}><Text style={styles.kicker}>پیشنهادهای مخصوص تو</Text><Text style={styles.title}>این ۱۲ تا بیشتر به دلش می‌نشینند!</Text><Button title="اشتراک همه‌ی نتایج" onPress={()=>Share.share({message:'پیشنهادهای کادوپیچ:\n'+results.map((g,i)=>`${i+1}. ${g.name}`).join('\n')})}/>{results.map(g=><GiftCard key={g.id} gift={g} isFavorite={favorites.includes(g.id)} onFavorite={toggleFavorite}/>)}<Button kind="ghost" title="شروع دوباره" onPress={reset}/></ScrollView>;
 return <ScrollView contentContainerStyle={styles.content}><Text style={styles.step}>سؤال {step+1} از {questions.length}</Text><View style={styles.progress}><View style={[styles.progressFill,{width:`${(step+1)/questions.length*100}%`}]} /></View><Text style={styles.title}>{q.title}</Text><View style={styles.options}>{q.options.map(([value,label,icon])=><Pressable key={value} onPress={()=>choose(value)} style={({pressed})=>[styles.option,pressed&&styles.optionPressed]}><Text style={styles.optionIcon}>{icon}</Text><Text style={styles.optionText}>{label}</Text></Pressable>)}</View>{step>0&&<Button kind="ghost" title="سؤال قبل" onPress={()=>setStep(step-1)}/>}</ScrollView>
}

function Favorites({ids,toggleFavorite}){
 const items=gifts.filter(g=>ids.includes(g.id));
 return <ScrollView contentContainerStyle={styles.content}><Text style={styles.kicker}>ذخیره‌شده‌ها</Text><Text style={styles.title}>هدیه‌های محبوب من</Text>{items.length?items.map(g=><GiftCard key={g.id} gift={g} isFavorite onFavorite={toggleFavorite}/>):<View style={styles.empty}><Text style={styles.emptyEmoji}>♡</Text><Text style={styles.cardTitle}>هنوز هدیه‌ای ذخیره نکردی</Text><Text style={styles.desc}>روی قلب کنار هر پیشنهاد بزن تا اینجا نگهش داری.</Text></View>}</ScrollView>
}

function Reminders({items,setItems}){
 const [name,setName]=useState(''),[date,setDate]=useState('');
 const add=async()=>{
  const when=new Date(`${date}T10:00:00`);
  if(!name.trim()||Number.isNaN(when.getTime())||when<=new Date())return Alert.alert('اطلاعات ناقص','نام مناسبت و تاریخ آینده را به شکل 2027-03-21 وارد کن.');
  const permission=await Notifications.requestPermissionsAsync();
  if(permission.status!=='granted')return Alert.alert('اجازه اعلان لازم است','برای دریافت یادآور، اعلان‌های کادوپیچ را فعال کن.');
  const notificationId=await Notifications.scheduleNotificationAsync({content:{title:`وقت کادوپیچه! 🎁`,body:`برای ${name.trim()} یک هدیه‌ی خوب پیدا کن.`},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:when}});
  const next=[...items,{id:String(Date.now()),name:name.trim(),date,notificationId}];setItems(next);setName('');setDate('');Alert.alert('یادآور ثبت شد','ساعت ۱۰ صبح همان روز به تو یادآوری می‌کنیم.');
 };
 const remove=async(item)=>{if(item.notificationId)await Notifications.cancelScheduledNotificationAsync(item.notificationId);setItems(items.filter(x=>x.id!==item.id))};
 return <ScrollView contentContainerStyle={styles.content}><Text style={styles.kicker}>مناسبت‌ها</Text><Text style={styles.title}>کی باید یادم بندازی؟</Text><View style={styles.form}><Text style={styles.label}>نام مناسبت یا شخص</Text><TextInput value={name} onChangeText={setName} placeholder="مثلاً تولد سارا" placeholderTextColor="#A99B91" style={styles.input} textAlign="right"/><Text style={styles.label}>تاریخ میلادی</Text><TextInput value={date} onChangeText={setDate} placeholder="2027-03-21" placeholderTextColor="#A99B91" style={styles.input} keyboardType="numbers-and-punctuation" textAlign="right"/><Button title="ثبت یادآور" onPress={add}/></View>{items.map(item=><View key={item.id} style={styles.reminder}><View><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.desc}>{item.date} • ساعت ۱۰</Text></View><Pressable onPress={()=>remove(item)}><Text style={styles.delete}>حذف</Text></Pressable></View>)}</ScrollView>
}

export default function App(){
 const [tab,setTab]=useState('quiz'),[favorites,setFavorites]=useState([]),[reminders,setReminders]=useState([]);
 useEffect(()=>{Promise.all([AsyncStorage.getItem(STORE.favorites),AsyncStorage.getItem(STORE.reminders)]).then(([f,r])=>{if(f)setFavorites(JSON.parse(f));if(r)setReminders(JSON.parse(r))}).catch(()=>{})},[]);
 useEffect(()=>{AsyncStorage.setItem(STORE.favorites,JSON.stringify(favorites))},[favorites]);
 useEffect(()=>{AsyncStorage.setItem(STORE.reminders,JSON.stringify(reminders))},[reminders]);
 useEffect(()=>{Notifications.setNotificationChannelAsync('reminders',{name:'یادآور مناسبت‌ها',importance:Notifications.AndroidImportance.HIGH}).catch(()=>{})},[]);
 const toggleFavorite=(gift)=>setFavorites(x=>x.includes(gift.id)?x.filter(id=>id!==gift.id):[...x,gift.id]);
 return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content"/><Header/><View style={styles.body}>{tab==='quiz'?<Quiz favorites={favorites} toggleFavorite={toggleFavorite}/>:tab==='favorites'?<Favorites ids={favorites} toggleFavorite={toggleFavorite}/>:<Reminders items={reminders} setItems={setReminders}/>}</View><View style={styles.tabs}>{[['quiz','پیشنهاد','🎁'],['favorites','محبوب‌ها','♥'],['reminders','یادآورها','🔔']].map(([id,label,icon])=><Pressable key={id} onPress={()=>setTab(id)} style={styles.tab}><Text style={[styles.tabIcon,tab===id&&styles.active]}>{icon}</Text><Text style={[styles.tabText,tab===id&&styles.active]}>{label}</Text></Pressable>)}</View></SafeAreaView>
}

const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:C.cream},body:{flex:1},header:{height:82,flexDirection:'row-reverse',alignItems:'center',paddingHorizontal:20,gap:10,borderBottomWidth:1,borderColor:C.line},logo:{width:58,height:58,resizeMode:'contain'},brand:{fontSize:21,fontWeight:'900',color:C.ink,textAlign:'right'},tagline:{fontSize:11,color:C.muted,textAlign:'right'},content:{padding:20,paddingBottom:36},kicker:{color:C.green,fontWeight:'800',fontSize:14,textAlign:'right',marginBottom:6},title:{fontSize:28,lineHeight:41,fontWeight:'900',color:C.ink,textAlign:'right',marginBottom:22},step:{color:C.muted,textAlign:'right',fontWeight:'700'},progress:{height:7,backgroundColor:'#E9DDD1',borderRadius:10,marginTop:9,marginBottom:26,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:C.red,borderRadius:10},options:{gap:11},option:{minHeight:68,backgroundColor:C.paper,borderWidth:1,borderColor:C.line,borderRadius:17,paddingHorizontal:16,flexDirection:'row-reverse',alignItems:'center',gap:12},optionPressed:{borderColor:C.red,transform:[{scale:.99}]},optionIcon:{fontSize:25},optionText:{fontSize:16,fontWeight:'800',color:C.ink,textAlign:'right',flex:1},button:{backgroundColor:C.green,minHeight:47,borderRadius:14,alignItems:'center',justifyContent:'center',paddingHorizontal:16,marginTop:14},smallButton:{minHeight:41,flex:1,marginTop:0},buttonText:{color:'white',fontWeight:'900',fontSize:15},ghost:{backgroundColor:'transparent',borderWidth:1,borderColor:C.line},ghostText:{color:C.ink},card:{backgroundColor:C.paper,borderWidth:1,borderColor:C.line,borderRadius:22,padding:17,marginTop:14},cardTop:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'},emoji:{fontSize:42},heart:{fontSize:32,color:C.red,padding:5},cardTitle:{fontSize:18,fontWeight:'900',color:C.ink,textAlign:'right',marginTop:8},desc:{fontSize:14,lineHeight:23,color:C.muted,textAlign:'right',marginTop:5},provider:{fontSize:12,color:C.green,fontWeight:'800',textAlign:'right',marginTop:11},cardActions:{flexDirection:'row-reverse',gap:9,marginTop:15},empty:{alignItems:'center',backgroundColor:C.paper,borderRadius:22,padding:28,borderWidth:1,borderColor:C.line},emptyEmoji:{fontSize:46,color:C.red},form:{backgroundColor:C.paper,borderRadius:22,padding:18,borderWidth:1,borderColor:C.line},label:{fontSize:13,fontWeight:'800',color:C.ink,textAlign:'right',marginBottom:7,marginTop:8},input:{height:50,borderWidth:1,borderColor:C.line,borderRadius:13,paddingHorizontal:14,fontSize:16,color:C.ink,backgroundColor:'white'},reminder:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',backgroundColor:C.paper,padding:16,borderWidth:1,borderColor:C.line,borderRadius:17,marginTop:12},delete:{color:C.red,fontWeight:'800',padding:10},tabs:{height:72,flexDirection:'row-reverse',backgroundColor:C.paper,borderTopWidth:1,borderColor:C.line,paddingBottom:6},tab:{flex:1,alignItems:'center',justifyContent:'center'},tabIcon:{fontSize:20,color:C.muted},tabText:{fontSize:11,fontWeight:'700',color:C.muted,marginTop:3},active:{color:C.red}
});
