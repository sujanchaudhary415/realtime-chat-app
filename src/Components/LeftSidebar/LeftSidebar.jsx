import React, { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "./../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    setChatUser,
    setMessagesId,
    messagesId,
  } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value.trim().toLowerCase();
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].id !== userData.id) {
          const foundUser = querySnap.docs[0].data();
          const userExist = chatData.some((user) => user.rId === foundUser.id);

          if (!userExist) {
            setUser(foundUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const addChat = async () => {
    try {
      if (!user) return;

      // Create new message document
      const newMessageRef = doc(collection(db, "messages"));
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const newChatData = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
      };

      // Update the chat for the other user
      await updateDoc(doc(db, "chats", user.id), {
        chatsData: arrayUnion({
          ...newChatData,
          rId: userData.id,
        }),
      });

      // Update the chat for the current user
      await updateDoc(doc(db, "chats", userData.id), {
        chatsData: arrayUnion({
          ...newChatData,
          rId: user.id,
        }),
      });

      // Set the chat to open the chat box for the new user
      setChatUser({
        ...newChatData,
        userData: user,
      });
      setMessagesId(newMessageRef.id);
      setUser(null);
      setShowSearch(false);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);

      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapShot = await getDoc(userChatsRef);

      if (userChatsSnapShot.exists()) {
        const userChatsData = userChatsSnapShot.data();
        const chatIndex = userChatsData.chatsData.findIndex(
          (c) => c.messageId === item.messageId
        );

        if (chatIndex !== -1) {
          userChatsData.chatsData[chatIndex].messageSeen = true;
          await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData,
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Remove duplicates from chatData
  const uniqueChatData = chatData.reduce((acc, item) => {
    if (!acc.find((chat) => chat.rId === item.rId)) {
      acc.push(item);
    }
    return acc;
  }, []);

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="logo" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="search" />
          <input onChange={inputHandler} type="text" placeholder="Search here.." />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt={user.name} />
            <p>{user.name}</p>
          </div>
        ) : (
          uniqueChatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId ? "" : "border"
              }`}
              key={index}
            >
              <img src={item.userData.avatar} alt={item.userData.name} />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage || "No messages yet"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
