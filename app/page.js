"use client";

import Image from 'next/image';
import styles from './page.module.css';
import React, { useState, useEffect } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react';

const key = process.env.NEXT_PUBLIC_API_KEY

export default function Home() {

  const options = ["Speak to me like I'm in middle school",
  "Speak to me like a pirate",
  "Speak to me like I'm already a genius",
  "Speak to me like Snoop Dogg",
];

  const [selected, setSelected] = useState(options[0]);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am Dean's chatbot!",
      sender: "ChatGPT"
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true)
    await processMessageToChatGPT(newMessages)
  }

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT") {
        role="assistant"
      } else {
        role = "user"
      }
      return { role: role, content: messageObject.message }
    });

    const systemMessage = {
      role: "system",
      content: selected
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
         }]
      );
      setTyping(false);
    });
  }


  function DropdownForm() {
    const submit = () => {
      console.log(selected);;
    };
    return (
      <form>
        <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}>
          {options.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
        <button className={styles.submit} type="button" onClick={submit}>
          Submit
        </button>
      </form>
    );
  }


  return (
    <main className={styles.main}>
      <div className={styles.DropdownForm}>{DropdownForm()}</div>
      <div style = {{ position: "relative", height: "800px", width: "600px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList
            scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="Dean's chatbot is typing" /> :null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type here' onSend = { handleSend }/>
          </ChatContainer>
        </MainContainer>
      </div>
    </main>
  )
}
