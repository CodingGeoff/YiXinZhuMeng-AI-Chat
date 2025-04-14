from flask import Flask, request, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import requests
import json
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 配置Ollama参数
OLLAMA_HOST = 'http://localhost:11434'
DEFAULT_MODEL = 'deepseek-r1:1.5b'  # 根据实际安装的模型修改

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500))
    answer = db.Column(db.String(500))
    model = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.now)

def get_ai_response(question: str, model: str = DEFAULT_MODEL) -> str:
    """调用本地Ollama API"""
    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": model,
                "prompt": question,
                "stream": False  # 关闭流式获取完整响应
            },
            timeout=300  # 超时时间设为5分钟
        )
        response.raise_for_status()
        return response.json()['response']
    except requests.exceptions.RequestException as e:
        print(f"Ollama API请求失败: {str(e)}")
        return "AI服务暂时不可用，请稍后再试"
    except KeyError:
        return "AI响应解析失败"

@app.route('/api/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    question = data.get('question', '').strip()
    
    if not question:
        return jsonify({'error': '问题不能为空'}), 400
    
    # 获取AI回复
    answer = get_ai_response(question)
    
    # 存储到数据库
    chat_record = ChatHistory(
        question=question,
        answer=answer,
        model=DEFAULT_MODEL
    )
    db.session.add(chat_record)
    db.session.commit()
    
    return jsonify({
        'answer': answer,
        'model': DEFAULT_MODEL,
        'timestamp': chat_record.timestamp.isoformat()
    })

# 流式响应端点（可选）
@app.route('/api/ask-stream', methods=['POST'])
def ask_question_stream():
    data = request.get_json()
    question = data.get('question', '').strip()
    
    def generate():
        try:
            with requests.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": DEFAULT_MODEL,
                    "prompt": question,
                    "stream": True
                },
                stream=True
            ) as r:
                for line in r.iter_lines():
                    if line:
                        json_data = json.loads(line)
                        yield f"data: {json.dumps({'chunk': json_data['response']})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)