import os
import logging
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

# .env 파일에서 환경변수 로드
load_dotenv()

# 로깅 설정 (요청, 응답, 오류 출력)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

app = Flask(__name__)

# Gemini API 클라이언트 초기화 함수
def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        logging.error("GEMINI_API_KEY가 설정되지 않았거나 기본 예시 값입니다.")
        return None
    return genai.Client(api_key=api_key)

# 메인 페이지 라우트
@app.route("/")
def index():
    return render_template("index.html")

# PWA Service Worker 및 Manifest 라우트
@app.route("/sw.js")
def service_worker():
    return app.send_static_file("sw.js")

@app.route("/manifest.json")
def manifest():
    return app.send_static_file("manifest.json")

# 이력서 및 포트폴리오 생성 API 라우트
@app.route("/generate", methods=["POST"])
def generate():
    # 1. JSON 요청 데이터 파싱
    data = request.get_json()
    if not data:
        logging.warning("요청에 JSON 본문이 없습니다.")
        return jsonify({"error": "입력 데이터가 전송되지 않았습니다."}), 400

    name = data.get("name", "").strip()
    job_title = data.get("job_title", "").strip()
    experience = data.get("experience", "").strip()
    projects = data.get("projects", "").strip()
    tone = data.get("tone", "전문적이고 신뢰감 있는").strip()
    prompt_type = data.get("prompt_type", "general").strip()

    # 2. 백엔드 필수 입력값 검증
    if not name or not job_title or not experience or not projects:
        logging.warning("필수 입력값 누락: 모든 필수 항목을 입력해야 합니다.")
        return jsonify({
            "error": "이름, 지원 직무, 경력 사항, 프로젝트 경험을 모두 입력해 주세요."
        }), 400

    # 3. 백엔드 로깅 (요청 수신 로그)
    logging.info(
        f"[요청 수신] 이름: {name} | 직무: {job_title} | 톤: {tone} | 프롬프트 유형: {prompt_type}"
    )

    # 4. API Key 검증 및 클라이언트 생성
    client = get_gemini_client()
    if not client:
        return jsonify({
            "error": ".env 파일에 유효한 GEMINI_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인해 주세요."
        }), 500

    # 5. 프롬프트 엔지니어링 (Prompt A: 일반 vs Prompt B: 전문가)
    if prompt_type == "expert":
        prompt_instruction = f"""
당신은 최고 수준의 테크 리크루터이자 테크니컬 라이팅 전문가입니다.
지원자의 정보를 바탕으로 채용 담당자의 시선을 즉시 사로잡는 고성과자(High Performer) 스타일의 이력서(Resume)와 상세 포트폴리오(Portfolio)를 작성해 주세요.

[작성 지침]
- 어조 및 스타일: {tone}
- STAR 기법(Situation, Task, Action, Result)을 적용하여 구체적 문제 해결 과정 서술
- 정량적 성과 수치(수치, 퍼센트, 개선율 등)를 적극적으로 추정 및 가미하여 전문성과 설득력 극대화
- 핵심 역량 키워드와 최신 기술 스택을 직무에 맞게 구조화하여 서술
- 결과물은 보기 쉬운 완성도 높은 Markdown 형식으로 제공
"""
    else:  # 'general' (일반 모드)
        prompt_instruction = f"""
당신은 친절하고 전문적인 커리어 코치입니다.
지원자의 정보를 바탕으로 명확하고 가독성이 뛰어난 표준 이력서(Resume)와 프로젝트 포트폴리오(Portfolio) 초안을 작성해 주세요.

[작성 지침]
- 어조 및 스타일: {tone}
- 직무와 관련된 핵심 역량과 경험을 일목요연하고 깔끔하게 정리
- 누구나 읽기 편하고 신뢰감을 주는 문장 구조 사용
- 결과물은 보기 쉬운 완성도 높은 Markdown 형식으로 제공
"""

    user_content = f"""
{prompt_instruction}

---
[지원자 기본 정보]
- 이름: {name}
- 희망 지원 직무: {job_title}
- 주요 경력 및 역량:
{experience}
- 주요 프로젝트 경험:
{projects}

---
[요청 출력 형식]
반드시 다음 두 섹션으로 명확히 구분하여 Markdown 형식으로 작성해 주세요:
1. # {name} 님의 이력서 (Resume)
2. # {name} 님의 프로젝트 포트폴리오 (Portfolio)
"""

    # 6. Gemini API 호출
    try:
        # 최신 Gemini Pro / Flash 모델 우선 호출 및 폴백 체인
        response = None
        models_to_try = [
            "gemini-3.8-pro",
            "gemini-3.8-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-flash-latest"
        ]
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_content
                )
                if response and response.text:
                    logging.info(f"모델 [{model_name}] 호출 성공")
                    break
            except Exception as model_err:
                logging.warning(f"모델 [{model_name}] 호출 실패, 다음 모델 재시도: {model_err}")

        if not response or not response.text:
            raise Exception("모든 Gemini 모델 호출에 실패했습니다.")

        generated_text = response.text

        if not generated_text:
            logging.error("Gemini API가 빈 응답을 반환했습니다.")
            return jsonify({"error": "AI로부터 응답을 생성하지 못했습니다. 다시 시도해 주세요."}), 500

        # 백엔드 로깅 (응답 완료 로그)
        logging.info(f"[응답 완료] AI 생성 성공 (출력 글자수: {len(generated_text)}자)")

        return jsonify({
            "success": True,
            "result": generated_text
        })

    except Exception as e:
        # 백엔드 로깅 (오류 로그)
        logging.error(f"[Gemini API 오류 발생] {str(e)}", exc_info=True)
        return jsonify({
            "error": f"AI 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

if __name__ == "__main__":
    # 개발 서버 실행 (포트 5000)
    app.run(host="127.0.0.1", port=5000, debug=True)
