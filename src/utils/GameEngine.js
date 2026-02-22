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
        // Limit one factor to maxNumber, and the other to 12 (max) for mental math
        const limit1 = maxNumber;
        const limit2 = Math.min(maxNumber, 12);

        if (!allowSimple) {
            x = Math.floor(Math.random() * (limit1 - 1)) + 2; // 2..limit1
            y = Math.floor(Math.random() * (limit2 - 1)) + 2; // 2..limit2
        } else {
            x = Math.floor(Math.random() * (limit1 + 1)); // 0..limit1
            y = Math.floor(Math.random() * (limit2 + 1)); // 0..limit2
        }
        
        // Randomly swap so the smaller factor isn't always second
        if (Math.random() > 0.5) {
            [x, y] = [y, x];
        }
        
        answer = x * y;
    } else if (operator === '/') {
        // x / y = answer  -> answer * y = x
        // We generate answer and y (divisor) first
        const answerLimit = maxNumber;
        const divisorLimit = Math.min(maxNumber, 12);

        if (!allowSimple) {
            answer = Math.floor(Math.random() * (answerLimit - 1)) + 2; // 2..answerLimit
            y = Math.floor(Math.random() * (divisorLimit - 1)) + 2; // 2..divisorLimit (divisor > 1)
        } else {
            // Avoid division by zero
            y = Math.floor(Math.random() * divisorLimit) + 1; // 1..divisorLimit
            answer = Math.floor(Math.random() * (answerLimit + 1)); // 0..answerLimit
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
