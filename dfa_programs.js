// ============================================================================
// PROGRAM 1: ENUMERATE DFAs
// ============================================================================

function enumerateDFAs(alphabet, maxStates, count) {
  const dfas = [];
  const numStates = 2; // Start with 2-state DFAs
  
  function generateAllTransitions(states, alphabet) {
    const numSymbols = alphabet.length;
    const numStatesCount = states.length;
    const totalTransitions = Math.pow(numStatesCount, numStatesCount * numSymbols);
    const allTransitions = [];
    
    for (let i = 0; i < totalTransitions; i++) {
      const transitions = {};
      let temp = i;
      
      for (const state of states) {
        transitions[state] = {};
        for (const symbol of alphabet) {
          transitions[state][symbol] = states[temp % numStatesCount];
          temp = Math.floor(temp / numStatesCount);
        }
      }
      allTransitions.push(transitions);
    }
    return allTransitions;
  }
  
  function generateAllAcceptStateSets(states) {
    const sets = [];
    const numSets = Math.pow(2, states.length);
    
    for (let i = 0; i < numSets; i++) {
      const acceptStates = [];
      for (let j = 0; j < states.length; j++) {
        if (i & (1 << j)) {
          acceptStates.push(states[j]);
        }
      }
      sets.push(acceptStates);
    }
    return sets;
  }
  
  const states = Array.from({ length: numStates }, (_, i) => `q${i}`);
  const allTransitions = generateAllTransitions(states, alphabet);
  const allAcceptSets = generateAllAcceptStateSets(states);
  
  for (const transitions of allTransitions) {
    for (const acceptStates of allAcceptSets) {
      if (dfas.length >= count) break;
      
      dfas.push({
        states: [...states],
        alphabet: [...alphabet],
        transitions: JSON.parse(JSON.stringify(transitions)),
        start_state: states[0],
        accept_states: [...acceptStates]
      });
    }
    if (dfas.length >= count) break;
  }
  
  return dfas;
}

console.log("=".repeat(80));
console.log("PROGRAM 1: ENUMERATE DFAs");
console.log("=".repeat(80));
console.log("Enumerating the first 20 DFAs over alphabet {a, b}:\n");

const dfas = enumerateDFAs(["a", "b"], 2, 20);
dfas.forEach((dfa, index) => {
  console.log(`DFA #${index + 1}:`);
  console.log(JSON.stringify(dfa, null, 2));
  console.log();
});

// ============================================================================
// PROGRAM 2: VALIDATE DFA
// ============================================================================

function validateDFA(dfa) {
  // Check that required properties exist
  const requiredProperties = ["states", "alphabet", "transitions", "start_state", "accept_states"];
  for (const prop of requiredProperties) {
    if (!dfa.hasOwnProperty(prop)) {
      return 0; // Invalid
    }
  }

  const { states, alphabet, transitions, start_state, accept_states } = dfa;

  // Check that states is an array and contains unique values
  if (!Array.isArray(states) || new Set(states).size !== states.length) {
    return 0;
  }

  // Check that alphabet is an array and contains unique values
  if (!Array.isArray(alphabet) || new Set(alphabet).size !== alphabet.length) {
    return 0;
  }

  // Check that transitions is an object
  if (typeof transitions !== "object" || transitions === null) {
    return 0;
  }

  // Validate the transition function
  for (const state of states) {
    if (!transitions.hasOwnProperty(state)) {
      return 0;
    }
    for (const symbol of alphabet) {
      if (!transitions[state].hasOwnProperty(symbol)) {
        return 0;
      }
      if (!states.includes(transitions[state][symbol])) {
        return 0;
      }
    }
  }

  // Check that start_state is a valid state
  if (!states.includes(start_state)) {
    return 0;
  }

  // Check that accept_states is an array and all values are valid states
  if (!Array.isArray(accept_states)) {
    return 0;
  }
  for (const acceptState of accept_states) {
    if (!states.includes(acceptState)) {
      return 0;
    }
  }

  return 1; // Valid
}

console.log("=".repeat(80));
console.log("PROGRAM 2: VALIDATE DFA");
console.log("=".repeat(80));

// Valid DFA example
const validDFA = {
  states: ["q0", "q1", "q2"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q2" },
    "q1": { "a": "q0", "b": "q2" },
    "q2": { "a": "q2", "b": "q2" }
  },
  start_state: "q0",
  accept_states: ["q1"]
};

console.log("\nValid DFA Example:");
console.log(JSON.stringify(validDFA, null, 2));
console.log(`Validation Result: ${validateDFA(validDFA)}`);

// Invalid DFA examples
const invalidDFA1 = {
  states: ["q0", "q1"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q0" }
    // Missing transitions for q1
  },
  start_state: "q0",
  accept_states: ["q1"]
};

console.log("\nInvalid DFA Example 1 (Missing transitions):");
console.log(JSON.stringify(invalidDFA1, null, 2));
console.log(`Validation Result: ${validateDFA(invalidDFA1)}`);

const invalidDFA2 = {
  states: ["q0", "q1"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q0" },
    "q1": { "a": "q2", "b": "q0" } // q2 is not in states
  },
  start_state: "q0",
  accept_states: ["q1"]
};

console.log("\nInvalid DFA Example 2 (Invalid transition target):");
console.log(JSON.stringify(invalidDFA2, null, 2));
console.log(`Validation Result: ${validateDFA(invalidDFA2)}`);

const invalidDFA3 = {
  states: ["q0", "q1"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q0" },
    "q1": { "a": "q0", "b": "q1" }
  },
  start_state: "q2", // q2 is not in states
  accept_states: ["q1"]
};

console.log("\nInvalid DFA Example 3 (Invalid start state):");
console.log(JSON.stringify(invalidDFA3, null, 2));
console.log(`Validation Result: ${validateDFA(invalidDFA3)}`);

// ============================================================================
// PROGRAM 3: CONVERT DFA TO TM DECIDER AND SIMULATE
// ============================================================================

function convertDFAtoTM(dfa) {
  // Validate DFA first
  if (validateDFA(dfa) === 0) {
    throw new Error("Invalid DFA");
  }

  const { states, alphabet, transitions, start_state, accept_states } = dfa;
  
  // TM states: DFA states + accept state + reject state
  const tmStates = [...states, "q_accept", "q_reject"];
  const tmAlphabet = [...alphabet, "_"]; // _ is blank symbol
  const tmTransitions = {};

  // Convert DFA transitions to TM transitions
  for (const state of states) {
    tmTransitions[state] = {};
    for (const symbol of alphabet) {
      const nextState = transitions[state][symbol];
      // TM transition: (state, symbol) -> (nextState, symbol, R)
      tmTransitions[state][symbol] = {
        next_state: nextState,
        write_symbol: symbol,
        move: "R"
      };
    }
    // When reading blank (end of input)
    if (accept_states.includes(state)) {
      tmTransitions[state]["_"] = {
        next_state: "q_accept",
        write_symbol: "_",
        move: "R"
      };
    } else {
      tmTransitions[state]["_"] = {
        next_state: "q_reject",
        write_symbol: "_",
        move: "R"
      };
    }
  }

  return {
    states: tmStates,
    alphabet: tmAlphabet,
    transitions: tmTransitions,
    start_state: start_state,
    accept_state: "q_accept",
    reject_state: "q_reject",
    blank_symbol: "_"
  };
}

function simulateTM(tm, inputString) {
  const { transitions, start_state, accept_state, reject_state, blank_symbol } = tm;
  
  // Initialize tape with input string and blanks
  let tape = inputString.split("");
  if (tape.length === 0) tape = [blank_symbol];
  
  let head = 0;
  let currentState = start_state;
  const configurations = [];

  // Record initial configuration
  configurations.push({
    state: currentState,
    tape: [...tape],
    head: head
  });

  let steps = 0;
  const maxSteps = 1000;

  while (currentState !== accept_state && currentState !== reject_state && steps < maxSteps) {
    // Extend tape if needed
    if (head < 0) {
      tape.unshift(blank_symbol);
      head = 0;
    }
    if (head >= tape.length) {
      tape.push(blank_symbol);
    }

    const currentSymbol = tape[head];
    
    // Check if transition exists
    if (!transitions[currentState] || !transitions[currentState][currentSymbol]) {
      currentState = reject_state;
      break;
    }

    const transition = transitions[currentState][currentSymbol];
    
    // Apply transition
    tape[head] = transition.write_symbol;
    currentState = transition.next_state;
    head += (transition.move === "R" ? 1 : (transition.move === "L" ? -1 : 0));
    
    steps++;

    // Record configuration
    configurations.push({
      state: currentState,
      tape: [...tape],
      head: head
    });
  }

  return {
    accepted: currentState === accept_state,
    configurations: configurations
  };
}

console.log("\n" + "=".repeat(80));
console.log("PROGRAM 3: CONVERT DFA TO TM DECIDER AND SIMULATE");
console.log("=".repeat(80));

// Example DFA that accepts strings with even number of 'a's
const dfaForTM = {
  states: ["q0", "q1"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q0" },
    "q1": { "a": "q0", "b": "q1" }
  },
  start_state: "q0",
  accept_states: ["q0"]
};

console.log("\nOriginal DFA (accepts strings with even number of 'a's):");
console.log(JSON.stringify(dfaForTM, null, 2));

const tm = convertDFAtoTM(dfaForTM);
console.log("\nConverted Turing Machine:");
console.log(JSON.stringify(tm, null, 2));

// Simulate on a short string
const testString = "aab";
console.log(`\nSimulating TM on input string: "${testString}"`);
const result = simulateTM(tm, testString);

console.log("\nTape Configurations:");
result.configurations.forEach((config, index) => {
  const tapeStr = config.tape.map((symbol, i) => 
    i === config.head ? `[${symbol}]` : symbol
  ).join(" ");
  console.log(`Step ${index}: State=${config.state}, Tape: ${tapeStr}`);
});

console.log(`\nResult: ${result.accepted ? "ACCEPTED" : "REJECTED"}`);

// Test with another string
const testString2 = "aa";
console.log(`\n${"=".repeat(40)}`);
console.log(`Simulating TM on input string: "${testString2}"`);
const result2 = simulateTM(tm, testString2);

console.log("\nTape Configurations:");
result2.configurations.forEach((config, index) => {
  const tapeStr = config.tape.map((symbol, i) => 
    i === config.head ? `[${symbol}]` : symbol
  ).join(" ");
  console.log(`Step ${index}: State=${config.state}, Tape: ${tapeStr}`);
});

console.log(`\nResult: ${result2.accepted ? "ACCEPTED" : "REJECTED"}`);

// ============================================================================
// PROGRAM 4: DETERMINE IF DFA RECOGNIZES EMPTY LANGUAGE
// ============================================================================

function recognizesEmptyLanguage(dfa) {
  // Validate DFA first
  if (validateDFA(dfa) === 0) {
    throw new Error("Invalid DFA");
  }

  const { states, alphabet, transitions, start_state, accept_states } = dfa;

  // If there are no accept states, language is empty
  if (accept_states.length === 0) {
    return true;
  }

  // BFS to find if any accept state is reachable from start state
  const visited = new Set();
  const queue = [start_state];
  visited.add(start_state);

  while (queue.length > 0) {
    const currentState = queue.shift();

    // If we reached an accept state, language is not empty
    if (accept_states.includes(currentState)) {
      return false;
    }

    // Explore all transitions from current state
    for (const symbol of alphabet) {
      const nextState = transitions[currentState][symbol];
      if (!visited.has(nextState)) {
        visited.add(nextState);
        queue.push(nextState);
      }
    }
  }

  // No accept state is reachable, language is empty
  return true;
}

console.log("\n" + "=".repeat(80));
console.log("PROGRAM 4: DETERMINE IF DFA RECOGNIZES EMPTY LANGUAGE");
console.log("=".repeat(80));

// Test Case 1: DFA with reachable accept state (non-empty language)
const dfaNonEmpty = {
  states: ["q0", "q1", "q2"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q0" },
    "q1": { "a": "q1", "b": "q1" },
    "q2": { "a": "q2", "b": "q2" }
  },
  start_state: "q0",
  accept_states: ["q1"]
};

console.log("\nTest Case 1: DFA with reachable accept state");
console.log(JSON.stringify(dfaNonEmpty, null, 2));
console.log(`Recognizes Empty Language: ${recognizesEmptyLanguage(dfaNonEmpty)}`);

// Test Case 2: DFA with unreachable accept state (empty language)
const dfaEmpty = {
  states: ["q0", "q1", "q2"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q0", "b": "q0" },
    "q1": { "a": "q1", "b": "q1" },
    "q2": { "a": "q2", "b": "q2" }
  },
  start_state: "q0",
  accept_states: ["q2"]
};

console.log("\nTest Case 2: DFA with unreachable accept state");
console.log(JSON.stringify(dfaEmpty, null, 2));
console.log(`Recognizes Empty Language: ${recognizesEmptyLanguage(dfaEmpty)}`);

// Test Case 3: DFA with no accept states (empty language)
const dfaNoAccept = {
  states: ["q0", "q1"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q0" },
    "q1": { "a": "q0", "b": "q1" }
  },
  start_state: "q0",
  accept_states: []
};

console.log("\nTest Case 3: DFA with no accept states");
console.log(JSON.stringify(dfaNoAccept, null, 2));
console.log(`Recognizes Empty Language: ${recognizesEmptyLanguage(dfaNoAccept)}`);

// Test Case 4: DFA where start state is accept state (non-empty language)
const dfaStartAccept = {
  states: ["q0", "q1"],
  alphabet: ["a", "b"],
  transitions: {
    "q0": { "a": "q1", "b": "q0" },
    "q1": { "a": "q1", "b": "q1" }
  },
  start_state: "q0",
  accept_states: ["q0"]
};

console.log("\nTest Case 4: DFA where start state is accept state");
console.log(JSON.stringify(dfaStartAccept, null, 2));
console.log(`Recognizes Empty Language: ${recognizesEmptyLanguage(dfaStartAccept)}`);

console.log("\n" + "=".repeat(80));
console.log("ALL PROGRAMS COMPLETED");
console.log("=".repeat(80));