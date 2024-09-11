import { initializeApp } from "firebase/app";
import {createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut} from "firebase/auth"
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyCP_Hl9ltkfpCWDx8dNdBwyXZcpywsfHqM",
    authDomain: "realtime-chatapp-e169c.firebaseapp.com",
    projectId: "realtime-chatapp-e169c",
    storageBucket: "realtime-chatapp-e169c.appspot.com",
    messagingSenderId: "809744447015",
    appId: "1:809744447015:web:2d730f91aa1f6a794b0002",
    measurementId: "G-94451EK101"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app)


const signup=async(username,email,password)=>{
       try {
           const res =await createUserWithEmailAndPassword(auth,email,password);
           const user=res.user;
           await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey, There i am using chat app",
            lastSeen:Date.now()

           })
           await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
           })
           toast.success("Account Created Successfully!")
       } catch (error) {
            console.error(error)
            toast.error(error.code.split('/')[1].split('-').join(" "))
       }
}

const login=async(email,password)=>{
    try {
        await signInWithEmailAndPassword(auth,email,password)
        toast.success("Logged in Successfully!")
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

const logout=async()=>{

 try {
    await signOut(auth);
    toast.success("Logged out successfully")
 } catch (error) {
    console.error(error)
    toast.error(error.code.split('/')[1].split('-').join(" "))
 }

}

const reset =async(email)=>{
   if(!email){
    toast.error('Enter Your Email')
    return null;
   }
   try {
    const userRef=collection(db,'users');
    const q=query(userRef,where("email","==",email));
    const querySnap=await getDocs(q);
    if(!querySnap.empty){
        await sendPasswordResetEmail(auth,email)
        toast.success("Reset email sent")
    }
    else{
        toast.error("Email doesnot Exist")
    }
   } catch (error) {
    console.error(error)
    toast.error(error.message)
    
   }
}

export {signup,login,logout,auth,db,reset} 