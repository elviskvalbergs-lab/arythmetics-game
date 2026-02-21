import { safeUUID } from './uuid';

export const generateProblem = (settings) => {
    const { maxNumber, allowedOperations = ['+', '-'] } = settings;

    // Pick random operation from allowed list
    const operator = allowedOperations[Math.floor(Math.random() * allowedOperations.length)];

    // 10% chance to allow zero/one based problems to keep it interesting but not too easy
    const allowSimple = Math.random() < 0.1;

    let x, y, answer;

    if (operator === '+') {
        if (!allowSimple && maxNumber >= 2) {
            const minAnswer = 2;
            answer = Math.floor(Math.random() * (maxNumber - minAnswer + 1)) + minAnswer;
            x = Math.floor(Math.random() * (answer - 1)) + 1;
            y = answer - x;
        } else {
            answer = Math.floor(Math.random() * (maxNumber + 1));
            x = Math.floor(Math.random() * (answer + 1));
            y = answer - x;
        }
    } else if (operator === '-') {
        if (!allowSimple && maxNumber >= 2) {
            const minX = 2;
            x = Math.floor(Math.random() * (maxNumber - minX + 1)) + minX;
            y = Math.floor(Math.random() * (x - 1)) + 1;
            answer = x - y;
        } else {
            x = Math.floor(Math.random() * (maxNumber + 1));
            y = Math.floor(Math.random() * (x + 1));
            answer = x - y;
        }
    } else if (operator === '*') {
        // x * y = answer
        // Limit factors to maxNumber (usually lower for multiplication, e.g. 10 or 12)
        // If maxNumber is high (e.g. 100), we probably want factors <= 10 or sqrt(maxNumber).
        // For simplicity in Custom mode, let's treat maxNumber as the Factor Limit for * and /

        const limit = maxNumber; // Treat as factor limit

        if (!allowSimple) {
            x = Math.floor(Math.random() * (limit - 1)) + 2; // 2..limit
            y = Math.floor(Math.random() * (limit - 1)) + 2; // 2..limit
        } else {
            x = Math.floor(Math.random() * (limit + 1)); // 0..limit
            y = Math.floor(Math.random() * (limit + 1)); // 0..limit
        }
        answer = x * y;
    } else if (operator === '/') {
        // x / y = answer  -> answer * y = x
        // We generate answer and y (divisor) first
        const limit = maxNumber; // Treat as limit for answer and divisor

        if (!allowSimple) {
            answer = Math.floor(Math.random() * (limit - 1)) + 2; // 2..limit
            y = Math.floor(Math.random() * (limit - 1)) + 2; // 2..limit (divisor > 1)
        } else {
            // Avoid division by zero
            y = Math.floor(Math.random() * limit) + 1; // 1..limit
            answer = Math.floor(Math.random() * (limit + 1)); // 0..limit
        }
        x = answer * y;
    }

    return {
        id: safeUUID(),
        x,
        y,
        operator: operator === '*' ? '×' : operator === '/' ? '÷' : operator,
        rawOperator: operator, // Keep standard operator for calculation if needed later
        answer,
        userAnswer: null,
        isCorrect: null,
        timeTaken: 0,
        startTime: Date.now(),
    };
};
