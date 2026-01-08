/**
 * 텍스트에서 URL을 감지하고 링크로 변환합니다.
 */
export function detectLinks(text: string): Array<{ type: 'text' | 'link'; content: string }> {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts: Array<{ type: 'text' | 'link'; content: string }> = [];
    let lastIndex = 0;

    text.replace(urlRegex, (match, p1, offset) => {
        // URL 앞의 일반 텍스트 추가
        if (offset > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, offset) });
        }

        // URL 추가
        parts.push({ type: 'link', content: match });
        lastIndex = offset + match.length;

        return match;
    });

    // 마지막 남은 텍스트 추가
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}

/**
 * 주석 여부를 확인합니다.
 */
export function isCommentLine(line: string): boolean {
    return line.trim().startsWith('#') || line.trim().startsWith('//');
}
