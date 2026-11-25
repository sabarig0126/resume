import Prism from 'prismjs';

// Ensure global Prism is always defined before Prism language components evaluate
const globalScope = globalThis as typeof globalThis & { Prism?: typeof Prism };
if (!globalScope.Prism) {
  globalScope.Prism = Prism;
}

export default Prism;
