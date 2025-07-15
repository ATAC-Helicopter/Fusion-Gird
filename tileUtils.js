export function isValid2048Value(value) {
  // Returns true if the value is a power of 2 between 2 and 4096
  return (value & (value - 1)) === 0 && value >= 2 && value <= 4096;
}

export function tryMerge(a, b) {
  const valA = a.value;
  const valB = b.value;

  const opTile = a.op ? a : b.op ? b : null;
  if (opTile) {
    const op = opTile.op;
    let result = applyOp(valA, valB, op);
    if (result !== null) {
      result = Math.max(2, Math.min(result, 4096)); // Clamp to [2, 4096]
      if (!isValid2048Value(result)) {
        return { value: result, blocking: true };
      }
      return result;
    }
    return null;
  }

  // Fallback to default merge (only same values)
  if (valA === valB) {
    return valA * 2;
  }

  return null;
}

export function applyOp(a, b, op) {
  let result = null;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = Math.abs(a - b); break;
    case '*': result = a * b; break;
    case '/':
      if (a % b === 0) result = a / b;
      else if (b % a === 0) result = b / a;
      break;
  }

  return result;
}