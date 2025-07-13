

export function tryMerge(a, b) {
  const opTile = a.op ? a : b.op ? b : null;
  if (opTile) {
    const valA = a.value;
    const valB = b.value;
    const op = opTile.op;

    let result = applyOp(valA, valB, op);
    if (result !== null) {
      result = Math.max(2, Math.min(result, 4096)); // clamp to [2, 4096]
      return result;
    }
    return null;
  }

  // Fallback to normal merge
  if (a.value === b.value) {
    return a.value * 2;
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

  if (
    result !== null &&
    Number.isInteger(result) &&
    result >= 2 &&
    result <= 4096
  ) return result;

  return null;
}