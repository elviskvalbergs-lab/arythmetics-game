export function getLevelInfo(profile) {
    // Calculate total correct from history if totalCorrect is not explicitly set yet for backward compatibility
    let points = profile.totalCorrect;
    if (points === undefined) {
        points = profile.history?.reduce((sum, round) => sum + (round.correct || 0), 0) || 0;
    }

    // Formula: nextLevelPoints = 5 * currentLevel * (currentLevel + 1)
    // L1: 0 pts, L2: 10 pts, L3: 30 pts, L4: 60 pts, L5: 100 pts
    // Quadratic reverse: Level = floor((5 + sqrt(25 + 20 * points)) / 10)
    const level = Math.floor((5 + Math.sqrt(25 + 20 * points)) / 10);
    const nextLevelPoints = 5 * level * (level + 1);
    const pointsNeeded = nextLevelPoints - points;

    return { level, points, nextLevelPoints, pointsNeeded };
}
