// ==========================================================================
// AI Resume & Portfolio Builder - 클라이언트 스크립트 (app.js)
// 폼 제출, API 비동기 통신, 로딩 처리, 오류 안내, 클립보드 복사, 마크다운 다운로드
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. 주요 DOM 엘리먼트 가져오기
    const resumeForm = document.getElementById("resumeForm");
    const submitBtn = document.getElementById("submitBtn");

    const placeholderMessage = document.getElementById("placeholderMessage");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const errorBox = document.getElementById("errorBox");
    const errorMessage = document.getElementById("errorMessage");

    const resultContainer = document.getElementById("resultContainer");
    const resultOutput = document.getElementById("resultOutput");
    const actionButtons = document.getElementById("actionButtons");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    // 2. 폼 제출(Submit) 이벤트 처리
    resumeForm.addEventListener("submit", async (event) => {
        // 기본 폼 제출(페이지 새로고침) 방지
        event.preventDefault();

        // 폼 입력값 읽어오기
        const name = document.getElementById("name").value.trim();
        const jobTitle = document.getElementById("jobTitle").value.trim();
        const tone = document.getElementById("tone").value;
        const promptType = document.querySelector('input[name="prompt_type"]:checked')?.value || "general";
        const experience = document.getElementById("experience").value.trim();
        const projects = document.getElementById("projects").value.trim();

        // 3. 프론트엔드 입력값 1차 검증
        if (!name || !jobTitle || !experience || !projects) {
            showError("모든 필수 항목(이름, 지원 직무, 경력 사항, 프로젝트)을 빠짐없이 입력해 주세요.");
            return;
        }

        // 4. 로딩 상태 시작 (화면 전환)
        setLoadingState(true);

        try {
            // 5. 백엔드 Flask 서버의 /generate API 호출 (비동기 POST 요청)
            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    job_title: jobTitle,
                    tone: tone,
                    prompt_type: promptType,
                    experience: experience,
                    projects: projects
                })
            });

            const data = await response.json();

            // 백엔드에서 반환한 HTTP 상태 코드 및 결과 검사
            if (!response.ok) {
                // 백엔드가 전달한 에러 메시지 또는 기본 메시지 출력
                throw new Error(data.error || `서버 오류가 발생했습니다. (상태 코드: ${response.status})`);
            }

            // 6. 성공적으로 결과를 수신했을 때 화면에 출력
            displayResult(data.result);

        } catch (error) {
            // 네트워크 오류 또는 서버 응답 에러 처리
            console.error("생성 요청 실패:", error);
            showError(error.message || "서버와 통신하는 중 문제가 발생했습니다. 백엔드 서버 상태를 확인해 주세요.");
        } finally {
            // 로딩 상태 종료 (버튼 활성화)
            setLoadingState(false);
        }
    });

    // 7. 로딩 UI 전환 함수
    function setLoadingState(isLoading) {
        if (isLoading) {
            // 제출 버튼 비활성화 및 안내 텍스트 변경
            submitBtn.disabled = true;
            submitBtn.textContent = "⏳ Gemini AI가 커리어 나무를 가꾸고 있습니다...";

            // 이전 결과 및 오류 메시지 숨기기
            placeholderMessage.style.display = "none";
            errorBox.style.display = "none";
            resultContainer.style.display = "none";
            actionButtons.style.display = "none";

            // 로딩 스피너 표시
            loadingIndicator.style.display = "block";
        } else {
            // 제출 버튼 다시 활성화
            submitBtn.disabled = false;
            submitBtn.textContent = "🌿 AI 이력서 & 포트폴리오 싹 틔우기";

            // 로딩 스피너 숨기기
            loadingIndicator.style.display = "none";
        }
    }

    // 8. 결과 텍스트 표시 함수
    function displayResult(markdownText) {
        errorBox.style.display = "none";
        placeholderMessage.style.display = "none";

        resultOutput.textContent = markdownText;
        resultContainer.style.display = "block";
        actionButtons.style.display = "flex";

        // 모바일이나 작은 화면에서 결과 영역으로 부드럽게 스크롤
        resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // 9. 오류 메시지 표시 함수
    function showError(message) {
        errorMessage.textContent = message;
        errorBox.style.display = "block";
        placeholderMessage.style.display = "block";
        resultContainer.style.display = "none";
        actionButtons.style.display = "none";
    }

    // 10. 결과 클립보드 복사 기능
    copyBtn.addEventListener("click", async () => {
        const textToCopy = resultOutput.textContent;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "✅ 복사 완료!";
            copyBtn.disabled = true;

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.disabled = false;
            }, 2000);
        } catch (err) {
            console.error("복사 실패:", err);
            alert("클립보드 복사에 실패했습니다. 텍스트를 직접 드래그하여 복사해 주세요.");
        }
    });

    // 11. 마크다운(.md) 파일 다운로드 기능
    downloadBtn.addEventListener("click", () => {
        const textToDownload = resultOutput.textContent;
        if (!textToDownload) return;

        const name = document.getElementById("name").value.trim() || "사용자";
        // 특수문자 제거 후 파일명 생성
        const sanitizedName = name.replace(/[\\/:*?"<>|]/g, "");
        const fileName = `${sanitizedName}_이력서_포트폴리오.md`;

        // 텍스트 데이터를 Blob(바이너리 대형 객체) 파일 형태로 변환
        const blob = new Blob([textToDownload], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        // 가상 링크 요소를 만들어 강제 다운로드 클릭 실행
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // 다운로드 후 임시 URL 및 가상 요소 정리
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    });
});
