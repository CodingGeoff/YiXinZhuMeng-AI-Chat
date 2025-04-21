import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://ai.gitee.com/v1",
    apiKey: process.env.REACT_APP_GITEE_API_KEY,
    defaultHeaders: { "X-Failover-Enabled": "true" },
    dangerouslyAllowBrowser: true
});

interface Message {
    content: string;
    thinkingContent?: string;
    isAI: boolean;
    timestamp: Date;
}

const App: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            content: '你好，我是译心筑梦团队的AI小助手！你现在可以向我提问了！',
            isAI: true,
            timestamp: new Date(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const styles = {
        container: {
            width: '100%',
            height: '100vh',
            margin: 0,
            padding: 0,
            fontFamily: 'Segoe UI, sans-serif',
        } as const,
        header: {
            background: '#34c7eb',
            color: 'white',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '20px',
        } as const,
        subHeader: {
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            margin: '10px 0 20px',
            paddingBottom: '10px',
        } as const,
        chatContainer: {
            position: 'relative',
            height: 'calc(100vh - 160px)',
            margin: '0 20px',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        } as const,
        messagesArea: {
            position: 'absolute',
            top: 0,
            bottom: 80,
            left: 0,
            right: 0,
            padding: '20px 30px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa',
        } as const,
        userBubble: {
            background: '#bbdefb',
            borderRadius: 18,
            marginLeft: 'auto',
            maxWidth: '75%',
            padding: '14px 18px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            wordBreak: 'break-all',
        } as const,
        aiBubble: {
            background: '#f5f5f5',
            borderRadius: 18,
            marginRight: 'auto',
            maxWidth: '75%',
            padding: '14px 18px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            wordBreak: 'break-all',
            display: 'flex',
            alignItems: 'flex-start',
        } as const,
        inputArea: {
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            padding: '20px',
            display: 'flex',
            gap: '10px',
            borderTop: '1px solid #e0e0e0',
            boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
        } as const,
        input: {
            flex: 1,
            padding: '14px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
        } as const,
        button: {
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        } as const,
        aiIcon: {
            background: '#333',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            fontSize: '14px',
        } as const,
        thinkingBubble: {
            background: '#f9f9f9',
            borderRadius: 14,
            margin: '8px 0',
            padding: '10px 14px',
            fontSize: '14px',
            color: '#666',
            wordBreak: 'break-all',
            display: 'none',
        } as const,
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            content: input.trim(),
            isAI: false,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await client.chat.completions.create({
                model: "DeepSeek-R1-Distill-Qwen-14B",
                stream: true,
                max_tokens: 1024,
                temperature: 0.6,
                top_p: 0.7,
                frequency_penalty: 0,
                messages: [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that shows thinking process. " +
                                   "Respond with [THINKING] tag for reasoning and [ANSWER] tag for final answer."
                    },
                    {
                        "role": "user",
                        "content": input.trim()
                    }
                ],
            });

            let fullAnswer = '';
            let thinkingProcess = '';
            let inThinking = false;

            for await (const part of response) {
                const content = part.choices[0]?.delta?.content || '';
                if (content.includes('[THINKING]')) {
                    inThinking = true;
                    thinkingProcess += content.replace('[THINKING]', '').trim();
                } else if (content.includes('[ANSWER]')) {
                    inThinking = false;
                    fullAnswer += content.replace('[ANSWER]', '').trim();
                } else {
                    if (inThinking) {
                        thinkingProcess += content;
                    } else {
                        fullAnswer += content;
                    }
                }
            }

            const aiMessage: Message = {
                content: fullAnswer,
                thinkingContent: thinkingProcess,
                isAI: true,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                content: '请求失败，请稍后重试',
                isAI: true,
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>人工智能 AI 问答</h2>
            </div>
            <div style={styles.subHeader}>AI问答（DeepSeek - R1）</div>

            <div style={styles.chatContainer}>
                <div style={styles.messagesArea}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={message.isAI 
                                ? { display: 'flex', alignItems: 'flex-start', marginBottom: '24px' } 
                                : { display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }
                            }
                        >
                            {message.isAI && <div style={styles.aiIcon}>AI</div>}
                            <div style={message.isAI ? styles.aiBubble : styles.userBubble}>
                                {message.content}
                                {message.thinkingContent && (
                                    <div style={{ 
                                        ...styles.thinkingBubble, 
                                        display: 'block', 
                                        wordBreak: 'break-all'
                                    }}>
                                        <span style={{ color: '#999', fontSize: '12px', marginRight: '6px' }}>思考过程：</span>
                                        {message.thinkingContent}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={styles.aiIcon}>AI</div>
                            <div style={styles.aiBubble}>思考中...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div style={styles.inputArea}>
                <input
                    type="text"
                    style={styles.input}
                    value={input}
                    placeholder="输入你的问题"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                    style={styles.button}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    <SendIcon style={{ fontSize: '20px' }} />
                </button>
            </div>
        </div>
    );
};

export default App;