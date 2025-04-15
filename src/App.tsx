import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import OpenAI from "openai";
import { styles } from './styles';

const client = new OpenAI({
    baseURL: "https://ai.gitee.com/v1",
    apiKey: process.env.REACT_APP_GITEE_API_KEY,
    defaultHeaders: { "X-Failover-Enabled": "true" },
    dangerouslyAllowBrowser: true
});

interface Message {
    content: string;
    isAI: boolean;
    timestamp: Date;
}

const App: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 消息滚动控制
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 初始化加载消息
    useEffect(() => {
        const initializeChat = async () => {
            try {
                const response = await fetch('/.netlify/functions/getMessages');
                if (!response.ok) throw new Error('HTTP error: ' + response.status);
                
                const data = await response.json();
                
                if (data.length === 0) {
                    const welcomeMessage = {
                        content: '你好，我是译心筑梦团队的AI小助手！你现在可以向我提问了！',
                        isAI: true,
                        timestamp: new Date()
                    };
                    await saveMessage(welcomeMessage);
                    setMessages([welcomeMessage]);
                } else {
                    const formattedMessages = data.map((msg: any) => ({
                        content: msg.content,
                        isAI: msg.isAI,
                        timestamp: new Date(msg.timestamp)
                    }));
                    setMessages(formattedMessages);
                }
            } catch (error) {
                console.error('初始化失败:', error);
                setMessages([{
                    content: '对话记录加载失败，请检查网络连接',
                    isAI: true,
                    timestamp: new Date()
                }]);
            }
        };

        initializeChat();
    }, []);

    // 实时滚动
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 保存消息到数据库
    const saveMessage = async (message: Message) => {
        try {
            const response = await fetch('/.netlify/functions/saveMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...message,
                    timestamp: message.timestamp.toISOString()
                })
            });
            
            if (!response.ok) throw new Error('保存失败: ' + response.status);
        } catch (error) {
            console.error('消息保存失败:', error);
        }
    };

    // 处理用户提交
    const handleSubmit = async () => {
        if (!input.trim() || loading) return;

        // 用户消息处理
        const userMessage: Message = {
            content: input.trim(),
            isAI: false,
            timestamp: new Date()
        };
        
        try {
            setMessages(prev => [...prev, userMessage]);
            await saveMessage(userMessage);
            setInput('');
            setLoading(true);

            // 流式获取AI响应
            const response = await client.chat.completions.create({
                model: "DeepSeek-R1-Distill-Qwen-14B",
                stream: true,
                max_tokens: 1024,
                temperature: 0.6,
                messages: [
                    { 
                        role: "system", 
                        content: `你是一个专业助手，请分步骤解释复杂问题`
                    },
                    { role: "user", content: input.trim() }
                ],
            });

            let fullAnswer = '';
            let isNewMessage = true;
            
            for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content || '';
                fullAnswer += content;

                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    
                    if (lastMessage?.isAI) {
                        // 更新现有AI消息
                        lastMessage.content += content;
                        return newMessages;
                    } else {
                        // 创建新AI消息
                        return [...newMessages, {
                            content: content,
                            isAI: true,
                            timestamp: new Date()
                        }];
                    }
                });
                
                // 优化滚动体验
                if (content.includes('\n') || content.length > 30) {
                    scrollToBottom();
                }
            }

            // 保存完整消息
            const aiMessage: Message = {
                content: fullAnswer,
                isAI: true,
                timestamp: new Date()
            };
            await saveMessage(aiMessage);

        } catch (error) {
            const errorMessage: Message = {
                content: '请求失败，请稍后重试（错误代码: 500）',
                isAI: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            await saveMessage(errorMessage);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>人工智能 AI 问答</h2>
                <div style={styles.statusIndicator}>
                    {[...Array(3)].map((_, i) => (
                        <span key={i} style={styles.statusDot}></span>
                    ))}
                </div>
            </div>
            <div style={styles.subHeader}>AI问答（DeepSeek - R1）</div>

            <div style={styles.chatContainer}>
                <div style={styles.messagesArea}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={message.isAI ? styles.aiMessageContainer : styles.userMessageContainer}
                        >
                            {message.isAI && <div style={styles.aiIcon}>AI</div>}
                            <div style={message.isAI ? styles.aiBubble : styles.userBubble}>
                                {message.content.split('\n').map((line, i) => (
                                    <p key={i} style={{ margin: '4px 0' }}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={styles.aiMessageContainer}>
                            <div style={styles.aiIcon}>AI</div>
                            <div style={styles.aiBubble}>
                                <div style={styles.thinkingAnimation}>
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={styles.inputArea}>
                    <input
                        type="text"
                        style={styles.input}
                        value={input}
                        placeholder="输入你的问题..."
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        disabled={loading}
                    />
                    <button
                        style={{ ...styles.button, ...(loading && styles.disabledButton) }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <SendIcon style={styles.sendIcon} />
                        {loading ? '发送中...' : '发送'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;