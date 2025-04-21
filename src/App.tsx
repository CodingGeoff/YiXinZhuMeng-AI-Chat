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
            display: 'flex',
            flexDirection: 'column',
        } as const,
        header: {
            background: '#34c7eb',
            color: 'white',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: '500',
        } as const,
        subHeader: {
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            margin: '8px 0 24px',
            paddingBottom: '12px',
        } as const,
        chatContainer: {
            flex: 1,
            position: 'relative',
            margin: '0 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        } as const,
        messagesArea: {
            position: 'relative',
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa',
            // 移除固定定位，改用弹性布局
        } as const,
        userBubble: {
            background: '#bbdefb',
            borderRadius: 24,
            marginLeft: 'auto',
            maxWidth: '80%',
            padding: '16px 20px',
            marginBottom: '16px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            wordBreak: 'break-all',
            fontSize: '16px',
        } as const,
        aiBubble: {
            background: 'white', // 改用白色背景提升可读性
            borderRadius: 24,
            marginRight: 'auto',
            maxWidth: '80%',
            padding: '16px 20px',
            marginBottom: '16px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            wordBreak: 'break-all',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px', // 增加图标与气泡间距
        } as const,
        inputArea: {
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            padding: '16px 24px',
            display: 'flex',
            gap: '12px',
            borderTop: '1px solid #e0e0e0',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
        } as const,
        input: {
            flex: 1,
            padding: '14px 18px',
            border: '1px solid #e0e0e0',
            borderRadius: '24px',
            fontSize: '16px',
            // 移动端优化：增加内边距和圆角
        } as const,
        button: {
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            padding: '14px 24px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            // 修复图标拉伸问题：使用固定尺寸
            minWidth: '64px', // 防止按钮在移动端被压缩
        } as const,
        aiIcon: {
            width: '40px', // 增大图标尺寸
            height: '40px', // 保持宽高一致
            borderRadius: '50%', // 确保圆形显示
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0', // 移除右侧边距，改用气泡内间距
            fontSize: '18px', // 增大字体
            background: '#007bff', // 改用主色背景
        } as const,
        thinkingBubble: {
            background: '#f5f5f5',
            borderRadius: 16,
            margin: '12px 0 0',
            padding: '12px 16px',
            fontSize: '14px',
            color: '#666',
            wordBreak: 'break-all',
            display: 'block', // 始终显示，由状态控制
        } as const,
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
                max_tokens: 999999999, // 增加最大token限制
                temperature: 0.7,
                top_p: 0.8,
                frequency_penalty: 0.2,
                messages: [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that shows thinking process in detail. " +
                                   "Respond with clear reasoning steps before giving the final answer."
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
                if (content.startsWith('THINKING:')) {
                    inThinking = true;
                    thinkingProcess += content.replace('THINKING:', '').trim() + ' ';
                } else if (content.startsWith('ANSWER:')) {
                    inThinking = false;
                    fullAnswer += content.replace('ANSWER:', '').trim() + ' ';
                } else {
                    inThinking ? thinkingProcess += content : fullAnswer += content;
                }
            }

            const aiMessage: Message = {
                content: fullAnswer.trim(),
                thinkingContent: thinkingProcess.trim(),
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
            <div style={styles.header}>人工智能 AI 问答</div>
            <div style={styles.subHeader}>AI问答（DeepSeek - R1）</div>

            <div style={styles.chatContainer}>
                <div style={styles.messagesArea}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={message.isAI 
                                ? { display: 'flex', alignItems: 'flex-start', marginBottom: '20px' } 
                                : { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }
                            }
                        >
                            {message.isAI && (
                                <div style={styles.aiIcon}>AI</div>
                            )}
                            <div style={message.isAI ? styles.aiBubble : styles.userBubble}>
                                {message.content}
                                {message.thinkingContent && (
                                    <div style={styles.thinkingBubble}>
                                        <span style={{ color: '#999', fontSize: '14px', marginRight: '8px' }}>思考过程：</span>
                                        {message.thinkingContent}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={styles.aiIcon}>AI</div>
                            <div style={styles.aiBubble}>思考中...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} style={{ height: '40px', visibility: 'hidden' }} />
                </div>
            </div>

            <div style={styles.inputArea}>
                <input
                    type="text"
                    style={styles.input}
                    value={input}
                    placeholder="输入你的问题（支持长文本）"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button style={styles.button} onClick={handleSubmit} disabled={loading}>
                    <SendIcon style={{ fontSize: '24px' }} />
                </button>
            </div>
        </div>
    );
};

export default App;