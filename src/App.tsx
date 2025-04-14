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
            maxWidth: '600px',
            margin: '20px auto',
            padding: '0',
            fontFamily: 'Segoe UI, sans-serif',
        },
        header: {
            background: '#34c7eb',
            color: 'white',
            padding: '12px 20px',
            display: 'flex' as const,
            justifyContent: 'space-between' as const,
            alignItems: 'center' as const,
            fontSize: '20px',
        },
        subHeader: {
            textAlign: 'center' as const,
            color: '#666',
            fontSize: '14px',
            margin: '10px 0 20px',
        },
        chatContainer: {
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden' as const,
            flexDirection: 'column' as const,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        messagesArea: {
            flex: 1,
            padding: '20px',
            overflowY: 'auto' as const,
            backgroundColor: '#f8f9fa',
        },
        userBubble: {
            background: '#bbdefb',
            borderRadius: 18,
            marginLeft: 'auto' as const,
            maxWidth: '75%',
            padding: '14px 18px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            wordBreak: 'break-all' as const,
        },
        aiBubble: {
            background: '#f5f5f5',
            borderRadius: 18,
            marginRight: 'auto' as const,
            maxWidth: '75%',
            padding: '14px 18px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            wordBreak: 'break-all' as const,
            display: 'flex' as const,
            alignItems: 'flex-start' as const,
        },
        inputArea: {
            borderTop: '1px solid #e0e0e0',
            padding: '20px',
            display: 'flex' as const,
            gap: '10px',
        },
        input: {
            flex: 1,
            padding: '14px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
        },
        button: {
            background: '#007bff',
            color: 'white',
            border: 'none' as const,
            borderRadius: '8px',
            padding: '14px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex' as const,
            alignItems: 'center' as const,
            gap: 8,
        },
        aiIcon: {
            background: '#333',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginRight: '12px',
            fontSize: '14px',
        },
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
                // top_k: 50,
                frequency_penalty: 0,
                messages: [
                    {
                        "role": "system",
                        "content": "You are a helpful and harmless assistant. You should think step - by - step."
                    },
                    {
                        "role": "user",
                        "content": input.trim()
                    }
                ],
            });

            let fullAnswer = '';
            for await (const part of response) {
                const content = part.choices[0]?.delta?.content;
                if (content) {
                    fullAnswer += content;
                }
            }

            const aiMessage: Message = {
                content: fullAnswer,
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
                <div style={{ display: 'flex', gap: 4 }}>
                    {[...Array(3)].map((_, i) => (
                        <span key={i} style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'white'
                        }}></span>
                    ))}
                </div>
            </div>
            <div style={styles.subHeader}>AI问答（DeepSeek - R1）</div>

            <div style={styles.chatContainer}>
                <div style={styles.messagesArea}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={message.isAI
                                ? { display: 'flex', alignItems: 'center', marginBottom: '16px' }
                                : { display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}
                        >
                            {message.isAI && <div style={styles.aiIcon}>AI</div>}
                            <div style={message.isAI ? styles.aiBubble : styles.userBubble}>
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={styles.aiIcon}>AI</div>
                            <div style={styles.aiBubble}>思考中...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
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
        </div>
    );
};

export default App;
    