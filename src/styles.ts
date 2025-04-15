import { CSSProperties } from 'react';

export const styles: { [key: string]: CSSProperties } = {
    container: {
        maxWidth: '800px',
        margin: '20px auto',
        padding: '0 15px',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    header: {
        background: 'linear-gradient(135deg, #007bff, #00b4d8)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    statusIndicator: {
        display: 'flex',
        gap: '6px',
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.8)',
        animation: 'pulse 1.5s infinite',
    },
    subHeader: {
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '14px',
        margin: '10px 0 20px',
    },
    chatContainer: {
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    },
    messagesArea: {
        height: '60vh',
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa',
    },
    aiMessageContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '16px',
    },
    userMessageContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
    },
    aiIcon: {
        background: '#2d3436',
        color: 'white',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '12px',
        fontSize: '14px',
        flexShrink: 0,
    },
    aiBubble: {
        background: '#ffffff',
        borderRadius: '18px',
        padding: '14px 18px',
        maxWidth: '75%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid #e0e0e0',
        lineHeight: '1.6',
    },
    userBubble: {
        background: '#007bff',
        color: 'white',
        borderRadius: '18px',
        padding: '14px 18px',
        maxWidth: '75%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        lineHeight: '1.6',
    },
    inputArea: {
        borderTop: '1px solid #e0e0e0',
        padding: '15px',
        display: 'flex',
        gap: '10px',
        backgroundColor: '#f8f9fa',
    },
    input: {
        flex: 1,
        padding: '12px 18px',
        border: '1px solid #e0e0e0',
        borderRadius: '25px',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.3s ease',
    },
    button: {
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        padding: '12px 24px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
    },
    disabledButton: {
        background: '#6c757d',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
    sendIcon: {
        fontSize: '20px',
    },
    thinkingAnimation: {
        display: 'inline-flex',
        gap: '4px',
        // 移除嵌套选择器
    } as CSSProperties,
    // 添加单独的span样式
    thinkingDot: {
        animation: 'blink 1.4s infinite',
        '&:nth-child(2)': {
            animationDelay: '0.2s'
        },
        '&:nth-child(3)': {
            animationDelay: '0.4s'
        }
    } as CSSProperties,

    // // 在全局样式中添加动画
    // const styleSheet = document.styleSheets[0];
    // styleSheet.insertRule(`
    //     @keyframes blink {
    //         0%, 100% { opacity: 0.2; }
    //         50% { opacity: 1; }
    //     }
    // `);
};

// 在全局样式中添加动画
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`);
styleSheet.insertRule(`
    @keyframes blink {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 1; }
    }
`);