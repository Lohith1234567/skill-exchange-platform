// Simple skill matching utilities
// We map naming as follows:
// - skillsHave  => user's skills they can teach (skillsToTeach / offering)
// - skillsWant  => user's skills they want to learn (skillsToLearn / requesting)

const norm = (s) => (s || '').trim().toLowerCase();

export const normalizeSkills = (arr) => {
  if (!Array.isArray(arr)) return [];
  return Array.from(
    new Set(
      arr
        .map((x) => (typeof x === 'string' ? x : String(x)))
        .map(norm)
        .filter(Boolean)
    )
  );
};

export const intersect = (a, b) => {
  const A = new Set(normalizeSkills(a));
  const B = new Set(normalizeSkills(b));
  const out = [];
  A.forEach((x) => {
    if (B.has(x)) out.push(x);
  });
  return out;
};

// Determine if two users have a mutual match:
// A.have ∩ B.want AND B.have ∩ A.want are both non-empty
export const isMutualMatch = (aHave, aWant, bHave, bWant) => {
  const aToB = intersect(aHave, bWant);
  const bToA = intersect(bHave, aWant);
  return aToB.length > 0 && bToA.length > 0;
};

// Compute a simple 0-100 score based on directional coverage
// Each direction contributes up to 50 points, proportional to how much of the target wants are covered
export const computeMatchScore = (aHave, aWant, bHave, bWant) => {
  const aToB = intersect(aHave, bWant);
  const bToA = intersect(bHave, aWant);

  const dir1 = bWant && bWant.length ? Math.min(1, aToB.length / bWant.length) : aToB.length > 0 ? 1 : 0;
  const dir2 = aWant && aWant.length ? Math.min(1, bToA.length / aWant.length) : bToA.length > 0 ? 1 : 0;

  return Math.round(((dir1 + dir2) / 2) * 100);
};

export default {
  normalizeSkills,
  intersect,
  isMutualMatch,
  computeMatchScore,
};
