import React, { useState, useEffect } from 'react';
import { Beaker, BookOpen, Scale, FlaskConical, Percent, ChevronsRight, AlertTriangle, CheckCircle2, XCircle, Calculator } from 'lucide-react';

// Atomic weights data (simplified, can be expanded)
const atomicWeights = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
  Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
  Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
  Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.96, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
  Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24,
  Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05,
  Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
  Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03
};

// Helper function to parse a chemical formula
// Returns an object with element counts, e.g., {H: 2, O: 1} for H2O
// Handles simple parentheses like Mg(OH)2
function parseFormula(formula) {
  const elementCounts = {};
  let i = 0;

  function getElementAndCount(str, startIndex) {
    let element = '';
    let count = '';
    let k = startIndex;

    if (k < str.length && str[k] >= 'A' && str[k] <= 'Z') {
      element += str[k];
      k++;
      if (k < str.length && str[k] >= 'a' && str[k] <= 'z') {
        element += str[k];
        k++;
      }
    } else {
      return null; // Invalid start
    }

    while (k < str.length && str[k] >= '0' && str[k] <= '9') {
      count += str[k];
      k++;
    }
    return { element, count: count ? parseInt(count) : 1, length: k - startIndex };
  }

  while (i < formula.length) {
    if (formula[i] === '(') {
      let j = i + 1;
      let balance = 1;
      let subFormula = '';
      while (j < formula.length && balance > 0) {
        if (formula[j] === '(') balance++;
        if (formula[j] === ')') balance--;
        if (balance > 0) subFormula += formula[j];
        j++;
      }

      if (balance !== 0) throw new Error("Mismatched parentheses in formula.");

      let groupMultiplier = '';
      let k = j;
      while (k < formula.length && formula[k] >= '0' && formula[k] <= '9') {
        groupMultiplier += formula[k];
        k++;
      }
      const multiplier = groupMultiplier ? parseInt(groupMultiplier) : 1;
      
      const subCounts = parseFormula(subFormula);
      for (const el in subCounts) {
        elementCounts[el] = (elementCounts[el] || 0) + subCounts[el] * multiplier;
      }
      i = k;
    } else {
      const part = getElementAndCount(formula, i);
      if (part) {
        if (!atomicWeights[part.element]) {
          throw new Error(`Unknown element: ${part.element}`);
        }
        elementCounts[part.element] = (elementCounts[part.element] || 0) + part.count;
        i += part.length;
      } else {
        throw new Error(`Invalid character or format at position ${i} in formula "${formula}"`);
      }
    }
  }
  return elementCounts;
}


// --- Components ---

// Molar Mass Calculator Component
const MolarMassCalculator = () => {
  const [formula, setFormula] = useState('H2O');
  const [molarMass, setMolarMass] = useState(null);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [error, setError] = useState('');

  const calculateMolarMass = () => {
    if (!formula.trim()) {
      setError('Please enter a chemical formula.');
      setMolarMass(null);
      setCalculationSteps([]);
      return;
    }
    try {
      const counts = parseFormula(formula);
      let totalMass = 0;
      const steps = [];
      for (const element in counts) {
        if (atomicWeights[element]) {
          const mass = atomicWeights[element] * counts[element];
          totalMass += mass;
          steps.push({ element, count: counts[element], atomicWeight: atomicWeights[element], mass });
        } else {
          throw new Error(`Atomic weight not found for element: ${element}`);
        }
      }
      setMolarMass(totalMass.toFixed(3));
      setCalculationSteps(steps);
      setError('');
    } catch (e) {
      setError(`Error: ${e.message}`);
      setMolarMass(null);
      setCalculationSteps([]);
    }
  };

  useEffect(() => {
    calculateMolarMass(); // Calculate for default H2O on initial load
  }, []);


  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center">
        <Scale className="mr-2 h-6 w-6" /> Molar Mass Calculator
      </h2>
      <div className="mb-4">
        <label htmlFor="formula" className="block text-sm font-medium text-gray-700 mb-1">
          Chemical Formula (e.g., H2O, C6H12O6, Mg(OH)2)
        </label>
        <input
          type="text"
          id="formula"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="Enter chemical formula"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={calculateMolarMass}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center justify-center"
      >
        <Calculator className="mr-2 h-5 w-5" /> Calculate Molar Mass
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      {molarMass !== null && !error && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h3 className="text-xl font-semibold text-indigo-800 mb-2">
            Molar Mass of {formula}: <span className="font-bold">{molarMass} g/mol</span>
          </h3>
          <p className="text-sm text-gray-600 mb-3">Calculation Breakdown:</p>
          <ul className="space-y-1">
            {calculationSteps.map((step, index) => (
              <li key={index} className="text-sm text-gray-700">
                {step.element}: {step.count} × {step.atomicWeight.toFixed(3)} g/mol = {step.mass.toFixed(3)} g/mol
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Equation Balancer Component (Helper)
const EquationBalancer = () => {
  const [reactantsStr, setReactantsStr] = useState('H2 + O2');
  const [productsStr, setProductsStr] = useState('H2O');
  const [balancedStatus, setBalancedStatus] = useState(null); // null, true, or false
  const [atomCounts, setAtomCounts] = useState({ reactants: {}, products: {} });
  const [errorMessage, setErrorMessage] = useState('');

  const parseSide = (sideStr) => {
    const terms = sideStr.split('+').map(s => s.trim()).filter(s => s);
    const elementTotals = {};
    for (const term of terms) {
      let coefficient = 1;
      let formula = term;
      const matchCoeff = term.match(/^(\d+)\s*([A-Za-z0-9()]+)$/); // e.g. 2H2O
      if (matchCoeff) {
        coefficient = parseInt(matchCoeff[1]);
        formula = matchCoeff[2];
      } else {
         // check if it's just a formula like H2O (coefficient is 1)
         if (!term.match(/^[A-Za-z0-9()]+$/)) {
            if (term.match(/^\d+$/)) { // if it's just a number, it's an invalid term
                throw new Error(`Invalid term: "${term}". Coefficients must be followed by a formula.`);
            }
         }
      }

      const counts = parseFormula(formula);
      for (const el in counts) {
        elementTotals[el] = (elementTotals[el] || 0) + counts[el] * coefficient;
      }
    }
    return elementTotals;
  };

  const checkBalance = () => {
    setErrorMessage('');
    setBalancedStatus(null);
    if (!reactantsStr.trim() || !productsStr.trim()) {
        setErrorMessage("Reactants and products fields cannot be empty.");
        return;
    }
    try {
      const reactantCounts = parseSide(reactantsStr);
      const productCounts = parseSide(productsStr);
      setAtomCounts({ reactants: reactantCounts, products: productCounts });

      const allElements = new Set([...Object.keys(reactantCounts), ...Object.keys(productCounts)]);
      let isBalanced = true;
      if (allElements.size === 0 && (reactantsStr.trim() || productsStr.trim())) {
          // If there are no elements parsed but input strings are not empty, it's likely an invalid formula.
          // parseSide would have thrown an error for invalid formula structure, but this is a fallback.
          setErrorMessage("Could not parse elements from the equation. Check formula syntax.");
          isBalanced = false;
      } else if (allElements.size === 0) {
          // Both sides are empty and parse to no elements.
          setErrorMessage("Please enter chemical formulas for reactants and products.");
          isBalanced = false; // Or treat as trivially balanced, but an error message is more useful.
      }


      for (const el of allElements) {
        if ((reactantCounts[el] || 0) !== (productCounts[el] || 0)) {
          isBalanced = false;
          break;
        }
      }
      setBalancedStatus(isBalanced);

    } catch (e) {
      setErrorMessage(`Error parsing equation: ${e.message}`);
      setAtomCounts({ reactants: {}, products: {} });
      setBalancedStatus(null);
    }
  };
  
  useEffect(() => {
    checkBalance();
  }, []);


  const renderAtomCountsTable = () => {
    const allElements = new Set([...Object.keys(atomCounts.reactants), ...Object.keys(atomCounts.products)]);
    if (allElements.size === 0 && !errorMessage) return null;

    return (
      <div className="mt-4 overflow-x-auto">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Atom Counts:</h4>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reactants</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balanced?</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from(allElements).sort().map(el => {
              const rCount = atomCounts.reactants[el] || 0;
              const pCount = atomCounts.products[el] || 0;
              const isElBalanced = rCount === pCount;
              return (
                <tr key={el} className={isElBalanced ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{el}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{rCount}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{pCount}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {isElBalanced ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-teal-700 mb-4 flex items-center">
        <BookOpen className="mr-2 h-6 w-6" /> Equation Balancing Helper
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter reactants and products (e.g., <code className="bg-gray-100 p-1 rounded">2H2 + O2</code> for reactants, <code className="bg-gray-100 p-1 rounded">2H2O</code> for products). The helper will check if the atom counts are balanced.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center mb-4">
        <div className="md:col-span-5">
          <label htmlFor="reactants" className="block text-sm font-medium text-gray-700 mb-1">Reactants</label>
          <input
            type="text"
            id="reactants"
            value={reactantsStr}
            onChange={(e) => setReactantsStr(e.target.value)}
            placeholder="e.g., CH4 + 2O2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
        <div className="md:col-span-1 text-center text-2xl text-gray-500 font-semibold pt-6 md:pt-0">
          →
        </div>
        <div className="md:col-span-5">
          <label htmlFor="products" className="block text-sm font-medium text-gray-700 mb-1">Products</label>
          <input
            type="text"
            id="products"
            value={productsStr}
            onChange={(e) => setProductsStr(e.target.value)}
            placeholder="e.g., CO2 + 2H2O"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
      </div>
      <button
        onClick={checkBalance}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center justify-center"
      >
        Check Balance
      </button>
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}
      {balancedStatus !== null && !errorMessage && (
        <div className={`mt-4 p-3 rounded-md flex items-center font-medium ${balancedStatus ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
          {balancedStatus ? <CheckCircle2 className="h-5 w-5 mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
          <span>Equation is {balancedStatus ? 'BALANCED' : 'NOT BALANCED'}</span>
        </div>
      )}
      {renderAtomCountsTable()}
    </div>
  );
};


// Stoichiometry Calculator Component
const StoichiometryCalculator = () => {
  const [equation, setEquation] = useState('2H2 + O2 -> 2H2O'); // User must input balanced equation
  const [knownSubstance, setKnownSubstance] = useState({ formula: 'H2', amount: '2', unit: 'g' });
  const [targetSubstance, setTargetSubstance] = useState({ formula: 'H2O' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculationSteps, setCalculationSteps] = useState([]);

  // Function to parse the balanced equation and extract stoichiometric coefficients
  const parseBalancedEquation = (eqStr) => {
    const parts = eqStr.split('->').map(s => s.trim());
    if (parts.length !== 2) throw new Error("Equation must contain '->' separating reactants and products.");
    
    const parseSideCoeffs = (sideStr) => {
      const terms = sideStr.split('+').map(s => s.trim());
      const coeffs = {};
      for (const term of terms) {
        let coefficient = 1;
        let formula = term;
        const match = term.match(/^(\d*)\s*([A-Za-z0-9()]+)$/);
        if (match) {
          coefficient = match[1] ? parseInt(match[1]) : 1;
          formula = match[2];
        } else if (!term.match(/^[A-Za-z0-9()]+$/)) {
             throw new Error(`Invalid term format in equation: "${term}". Should be like "2H2O" or "H2O".`);
        }
        if (!formula) throw new Error(`Could not parse formula from term: "${term}"`);
        coeffs[formula] = coefficient;
      }
      return coeffs;
    };
    
    const reactantCoeffs = parseSideCoeffs(parts[0]);
    const productCoeffs = parseSideCoeffs(parts[1]);
    return { reactants: reactantCoeffs, products: productCoeffs };
  };

  const calculateStoichiometry = () => {
    setError('');
    setResult(null);
    setCalculationSteps([]);

    if (!equation.trim() || !knownSubstance.formula.trim() || !targetSubstance.formula.trim() || !knownSubstance.amount.trim()) {
        setError("Please fill in all required fields: balanced equation, known substance (formula and amount), and target substance formula.");
        return;
    }
    if (isNaN(parseFloat(knownSubstance.amount)) || parseFloat(knownSubstance.amount) <= 0) {
        setError("Amount of known substance must be a positive number.");
        return;
    }

    try {
      const { reactants, products } = parseBalancedEquation(equation);
      const allSubstances = { ...reactants, ...products };

      if (!allSubstances[knownSubstance.formula]) throw new Error(`Known substance "${knownSubstance.formula}" not found in the equation.`);
      if (!allSubstances[targetSubstance.formula]) throw new Error(`Target substance "${targetSubstance.formula}" not found in the equation.`);

      const knownCoeff = allSubstances[knownSubstance.formula];
      const targetCoeff = allSubstances[targetSubstance.formula];

      const knownMolarMass = parseFloat(new MolarMassCalculatorInternal(knownSubstance.formula).molarMass);
      const targetMolarMass = parseFloat(new MolarMassCalculatorInternal(targetSubstance.formula).molarMass);
      
      let steps = [];

      // 1. Convert known substance to moles
      let molesKnown;
      if (knownSubstance.unit === 'g') {
        molesKnown = parseFloat(knownSubstance.amount) / knownMolarMass;
        steps.push(`1. Moles of ${knownSubstance.formula} = ${knownSubstance.amount} g / ${knownMolarMass.toFixed(3)} g/mol = ${molesKnown.toFixed(4)} mol`);
      } else {
        molesKnown = parseFloat(knownSubstance.amount);
        steps.push(`1. Moles of ${knownSubstance.formula} = ${molesKnown.toFixed(4)} mol (given)`);
      }

      // 2. Use mole ratio to find moles of target substance
      const molesTarget = (molesKnown / knownCoeff) * targetCoeff;
      steps.push(`2. Mole ratio: (${targetCoeff} mol ${targetSubstance.formula} / ${knownCoeff} mol ${knownSubstance.formula})`);
      steps.push(`   Moles of ${targetSubstance.formula} = ${molesKnown.toFixed(4)} mol ${knownSubstance.formula} * (${targetCoeff} / ${knownCoeff}) = ${molesTarget.toFixed(4)} mol`);
      
      // 3. Convert moles of target substance to grams
      const massTarget = molesTarget * targetMolarMass;
      steps.push(`3. Mass of ${targetSubstance.formula} = ${molesTarget.toFixed(4)} mol * ${targetMolarMass.toFixed(3)} g/mol = ${massTarget.toFixed(3)} g`);
      
      setResult({ amount: massTarget.toFixed(3), unit: 'g' });
      setCalculationSteps(steps);

    } catch (e) {
      setError(`Calculation Error: ${e.message}`);
    }
  };
  
  // Internal helper for molar mass calculation within StoichiometryCalculator
  // This avoids rendering the full MolarMassCalculator component just for its logic
  function MolarMassCalculatorInternal(formulaStr) {
    this.formula = formulaStr;
    this.molarMass = null;
    this.error = null;
    try {
      const counts = parseFormula(this.formula);
      let totalMass = 0;
      for (const element in counts) {
        if (atomicWeights[element]) {
          totalMass += atomicWeights[element] * counts[element];
        } else {
          throw new Error(`Atomic weight not found for element: ${element}`);
        }
      }
      this.molarMass = totalMass.toFixed(3);
    } catch (e) {
      this.error = e.message;
      throw e; // re-throw to be caught by main calculator
    }
  }
  
  useEffect(() => {
    calculateStoichiometry();
  }, []);


  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center">
        <FlaskConical className="mr-2 h-6 w-6" /> Stoichiometry Calculator
      </h2>
      <div className="mb-4">
        <label htmlFor="equation" className="block text-sm font-medium text-gray-700 mb-1">
          Balanced Chemical Equation (e.g., 2H2 + O2 {'->'} 2H2O)
        </label>
        <input
          type="text"
          id="equation"
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Known Substance</h3>
          <label htmlFor="knownFormula" className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
          <input
            type="text"
            id="knownFormula"
            value={knownSubstance.formula}
            onChange={(e) => setKnownSubstance({...knownSubstance, formula: e.target.value})}
            placeholder="e.g., H2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm mb-2"
          />
          <label htmlFor="knownAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            id="knownAmount"
            value={knownSubstance.amount}
            onChange={(e) => setKnownSubstance({...knownSubstance, amount: e.target.value})}
            placeholder="e.g., 2.0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm mb-2"
          />
          <label htmlFor="knownUnit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select
            id="knownUnit"
            value={knownSubstance.unit}
            onChange={(e) => setKnownSubstance({...knownSubstance, unit: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            <option value="g">grams (g)</option>
            <option value="mol">moles (mol)</option>
          </select>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Target Substance</h3>
          <label htmlFor="targetFormula" className="block text-sm font-medium text-gray-700 mb-1">Formula (to calculate)</label>
          <input
            type="text"
            id="targetFormula"
            value={targetSubstance.formula}
            onChange={(e) => setTargetSubstance({...targetSubstance, formula: e.target.value})}
            placeholder="e.g., H2O"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>
      </div>

      <button
        onClick={calculateStoichiometry}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center justify-center"
      >
        Calculate Target Amount
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      {result && !error && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-xl font-semibold text-purple-800 mb-2">
            Calculated Amount of {targetSubstance.formula}: <span className="font-bold">{result.amount} {result.unit}</span>
          </h3>
          <p className="text-sm text-gray-600 mb-3">Calculation Steps:</p>
          <ul className="space-y-1">
            {calculationSteps.map((step, index) => (
              <li key={index} className="text-sm text-gray-700 whitespace-pre-wrap">{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Limiting Reactant Calculator Component
const LimitingReactantCalculator = () => {
  // For now, a placeholder. Implementation will be similar to StoichiometryCalculator
  // but will take multiple reactants and identify the limiting one.
  const [equation, setEquation] = useState('N2 + 3H2 -> 2NH3');
  const [reactants, setReactants] = useState([
    { formula: 'N2', amount: '28', unit: 'g' },
    { formula: 'H2', amount: '3', unit: 'g' },
  ]);
  const [targetProductFormula, setTargetProductFormula] = useState('NH3'); // Which product's yield to calculate
  const [result, setResult] = useState(null); // { limitingReactant: 'N2', theoreticalYield: '34g NH3', steps: [] }
  const [error, setError] = useState('');

  const handleReactantChange = (index, field, value) => {
    const updatedReactants = [...reactants];
    updatedReactants[index] = { ...updatedReactants[index], [field]: value };
    setReactants(updatedReactants);
  };

  const addReactant = () => {
    if (reactants.length < 5) { // Limit to 5 reactants for UI simplicity
        setReactants([...reactants, { formula: '', amount: '', unit: 'g' }]);
    }
  };
  
  const removeReactant = (index) => {
    if (reactants.length > 1) { // Keep at least one reactant
        const updatedReactants = reactants.filter((_, i) => i !== index);
        setReactants(updatedReactants);
    }
  };

  function MolarMassCalculatorInternal(formulaStr) {
    this.formula = formulaStr;
    this.molarMass = null;
    try {
      const counts = parseFormula(this.formula);
      let totalMass = 0;
      for (const element in counts) {
        if (atomicWeights[element]) {
          totalMass += atomicWeights[element] * counts[element];
        } else {
          throw new Error(`Atomic weight not found for element: ${element}`);
        }
      }
      this.molarMass = totalMass; // Return as number for precision
    } catch (e) {
      throw e;
    }
  }

  const calculateLimitingReactant = () => {
    setError('');
    setResult(null);
    let localSteps = [];

    if (!equation.trim()) {
        setError("Balanced chemical equation is required.");
        return;
    }
    if (!targetProductFormula.trim()){
        setError("Target product formula is required.");
        return;
    }
    if (reactants.some(r => !r.formula.trim() || !r.amount.trim() || isNaN(parseFloat(r.amount)) || parseFloat(r.amount) <= 0)) {
        setError("All reactants must have a valid formula and a positive amount.");
        return;
    }


    try {
      const parsedEq = new StoichiometryCalculator().parseBalancedEquation(equation); // Re-use parsing logic
      const productCoeff = parsedEq.products[targetProductFormula];
      if (!productCoeff) throw new Error(`Target product "${targetProductFormula}" not found in the equation's products.`);

      const targetProductMolarMass = new MolarMassCalculatorInternal(targetProductFormula).molarMass;

      let minMolesProduct = Infinity;
      let limitingReactantFormula = '';

      localSteps.push("Calculating moles of product each reactant can produce:");

      for (const reactant of reactants) {
        const reactantCoeff = parsedEq.reactants[reactant.formula];
        if (!reactantCoeff) throw new Error(`Reactant "${reactant.formula}" not found in the equation's reactants.`);
        
        const reactantMolarMass = new MolarMassCalculatorInternal(reactant.formula).molarMass;
        
        let molesReactant;
        if (reactant.unit === 'g') {
          molesReactant = parseFloat(reactant.amount) / reactantMolarMass;
          localSteps.push(`  For ${reactant.formula}: ${reactant.amount}g / ${reactantMolarMass.toFixed(3)} g/mol = ${molesReactant.toFixed(4)} mol ${reactant.formula}`);
        } else {
          molesReactant = parseFloat(reactant.amount);
          localSteps.push(`  For ${reactant.formula}: ${molesReactant.toFixed(4)} mol ${reactant.formula} (given)`);
        }
        
        const molesProductFromThisReactant = (molesReactant / reactantCoeff) * productCoeff;
        localSteps.push(`    Moles of ${targetProductFormula} possible = (${molesReactant.toFixed(4)} mol ${reactant.formula} / ${reactantCoeff} mol ${reactant.formula}) * ${productCoeff} mol ${targetProductFormula} = ${molesProductFromThisReactant.toFixed(4)} mol ${targetProductFormula}`);

        if (molesProductFromThisReactant < minMolesProduct) {
          minMolesProduct = molesProductFromThisReactant;
          limitingReactantFormula = reactant.formula;
        }
      }

      if (!limitingReactantFormula) {
        throw new Error("Could not determine limiting reactant. Check inputs and equation.");
      }
      
      const theoreticalYieldMass = minMolesProduct * targetProductMolarMass;
      localSteps.push(`\nLimiting reactant is ${limitingReactantFormula} because it produces the least amount of ${targetProductFormula} (${minMolesProduct.toFixed(4)} moles).`);
      localSteps.push(`Theoretical yield of ${targetProductFormula} = ${minMolesProduct.toFixed(4)} mol * ${targetProductMolarMass.toFixed(3)} g/mol = ${theoreticalYieldMass.toFixed(3)} g.`);

      setResult({
        limitingReactant: limitingReactantFormula,
        theoreticalYieldMoles: minMolesProduct.toFixed(4),
        theoreticalYieldMass: theoreticalYieldMass.toFixed(3),
        productFormula: targetProductFormula,
        steps: localSteps
      });

    } catch (e) {
      setError(`Calculation Error: ${e.message}`);
      setResult(null);
    }
  };
  
  useEffect(() => {
    calculateLimitingReactant();
  }, []);


  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-orange-700 mb-4 flex items-center">
        <ChevronsRight className="mr-2 h-6 w-6" /> Limiting Reactant Calculator
      </h2>
      <div className="mb-4">
        <label htmlFor="lr_equation" className="block text-sm font-medium text-gray-700 mb-1">
          Balanced Chemical Equation (e.g., N2 + 3H2 {'->'} 2NH3)
        </label>
        <input
          type="text"
          id="lr_equation"
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>

      <h3 className="text-lg font-medium text-gray-800 mb-2">Reactants</h3>
      {reactants.map((reactant, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3 p-3 border border-gray-200 rounded-md relative">
          <div className="md:col-span-4">
            <label htmlFor={`reactantFormula-${index}`} className="block text-xs font-medium text-gray-600">Formula</label>
            <input
              type="text"
              id={`reactantFormula-${index}`}
              value={reactant.formula}
              onChange={(e) => handleReactantChange(index, 'formula', e.target.value)}
              placeholder={`e.g., N2`}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor={`reactantAmount-${index}`} className="block text-xs font-medium text-gray-600">Amount</label>
            <input
              type="number"
              id={`reactantAmount-${index}`}
              value={reactant.amount}
              onChange={(e) => handleReactantChange(index, 'amount', e.target.value)}
              placeholder="e.g., 28"
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor={`reactantUnit-${index}`} className="block text-xs font-medium text-gray-600">Unit</label>
            <select
              id={`reactantUnit-${index}`}
              value={reactant.unit}
              onChange={(e) => handleReactantChange(index, 'unit', e.target.value)}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="g">grams (g)</option>
              <option value="mol">moles (mol)</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            {reactants.length > 1 && (
                 <button onClick={() => removeReactant(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                    <XCircle size={20}/>
                 </button>
            )}
          </div>
        </div>
      ))}
       <button
        onClick={addReactant}
        disabled={reactants.length >= 5}
        className="text-sm text-orange-600 hover:text-orange-800 disabled:text-gray-400 disabled:cursor-not-allowed font-medium py-1 mb-4"
      >
        + Add Reactant
      </button>

      <div className="mb-4">
        <label htmlFor="targetProduct" className="block text-sm font-medium text-gray-700 mb-1">
          Target Product Formula (for theoretical yield)
        </label>
        <input
          type="text"
          id="targetProduct"
          value={targetProductFormula}
          onChange={(e) => setTargetProductFormula(e.target.value)}
          placeholder="e.g., NH3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>
      
      <button
        onClick={calculateLimitingReactant}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center justify-center"
      >
        Calculate Limiting Reactant & Yield
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      {result && !error && (
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="text-xl font-semibold text-orange-800 mb-2">
            Limiting Reactant: <span className="font-bold">{result.limitingReactant}</span>
          </h3>
          <p className="text-lg text-orange-700 mb-2">
            Theoretical Yield of {result.productFormula}: <span className="font-bold">{result.theoreticalYieldMass} g</span> ({result.theoreticalYieldMoles} moles)
          </p>
          <p className="text-sm text-gray-600 mb-3">Calculation Steps:</p>
          <ul className="space-y-1">
            {result.steps.map((step, index) => (
              <li key={index} className="text-sm text-gray-700 whitespace-pre-wrap">{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


// Percent Yield Calculator Component
const PercentYieldCalculator = () => {
  const [actualYield, setActualYield] = useState('');
  const [theoreticalYield, setTheoreticalYield] = useState('');
  const [percentYield, setPercentYield] = useState(null);
  const [error, setError] = useState('');

  const calculatePercentYield = () => {
    setError('');
    setPercentYield(null);
    const actual = parseFloat(actualYield);
    const theoretical = parseFloat(theoreticalYield);

    if (isNaN(actual) || isNaN(theoretical)) {
      setError("Both actual and theoretical yields must be numbers.");
      return;
    }
    if (theoretical <= 0) {
      setError("Theoretical yield must be a positive number.");
      return;
    }
     if (actual < 0) {
      setError("Actual yield cannot be negative.");
      return;
    }

    const py = (actual / theoretical) * 100;
    setPercentYield(py.toFixed(2));
  };
  
  useEffect(() => {
    if (actualYield && theoreticalYield) {
        calculatePercentYield();
    } else {
        setPercentYield(null);
        setError('');
    }
  }, [actualYield, theoreticalYield]);


  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-lime-700 mb-4 flex items-center">
        <Percent className="mr-2 h-6 w-6" /> Percent Yield Calculator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label htmlFor="actualYield" className="block text-sm font-medium text-gray-700 mb-1">
            Actual Yield (g)
          </label>
          <input
            type="number"
            id="actualYield"
            value={actualYield}
            onChange={(e) => setActualYield(e.target.value)}
            placeholder="e.g., 30.5"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="theoreticalYield" className="block text-sm font-medium text-gray-700 mb-1">
            Theoretical Yield (g)
          </label>
          <input
            type="number"
            id="theoreticalYield"
            value={theoreticalYield}
            onChange={(e) => setTheoreticalYield(e.target.value)}
            placeholder="e.g., 34.0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
          />
        </div>
      </div>
       <button
        onClick={calculatePercentYield}
        className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center justify-center"
      >
        Calculate Percent Yield
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      {percentYield !== null && !error && (
        <div className="mt-6 p-4 bg-lime-50 rounded-lg border border-lime-200">
          <h3 className="text-xl font-semibold text-lime-800">
            Percent Yield: <span className="font-bold">{percentYield}%</span>
          </h3>
        </div>
      )}
    </div>
  );
};


// Main App Component
function App() {
  const [activeView, setActiveView] = useState('molarMass');

  const navItems = [
    { id: 'molarMass', label: 'Molar Mass', icon: Scale, component: <MolarMassCalculator />, color: 'indigo' },
    { id: 'balancer', label: 'Balance Check', icon: BookOpen, component: <EquationBalancer />, color: 'teal' },
    { id: 'stoichiometry', label: 'Stoichiometry', icon: FlaskConical, component: <StoichiometryCalculator />, color: 'purple' },
    { id: 'limiting', label: 'Limiting Reactant', icon: ChevronsRight, component: <LimitingReactantCalculator />, color: 'orange' },
    { id: 'percentYield', label: 'Percent Yield', icon: Percent, component: <PercentYieldCalculator />, color: 'lime' },
  ];

  const ActiveComponent = navItems.find(item => item.id === activeView)?.component || <MolarMassCalculator />;
  const activeColor = navItems.find(item => item.id === activeView)?.color || 'indigo';


  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-slate-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-3xl font-bold flex items-center">
            <Beaker className="mr-3 h-8 w-8" /> Stoichiometry Helper
          </h1>
          <p className="text-sm text-slate-300">Your companion for chemistry calculations.</p>
        </div>
      </header>

      <nav className="bg-slate-700 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center px-3 py-3 text-sm sm:text-base font-medium rounded-t-md whitespace-nowrap transition-colors duration-150
                  ${activeView === item.id 
                    ? `bg-${item.color}-600 text-white shadow-inner` 
                    : `text-gray-200 hover:bg-slate-600 hover:text-white`}
                `}
              >
                <item.icon className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Tailwind JIT safety net - ensures dynamic classes like bg-indigo-600 are generated */}
      <div className="hidden bg-indigo-600 text-indigo-700 border-indigo-200 bg-indigo-50"></div>
      <div className="hidden bg-teal-600 text-teal-700 border-teal-200 bg-teal-50"></div>
      <div className="hidden bg-purple-600 text-purple-700 border-purple-200 bg-purple-50"></div>
      <div className="hidden bg-orange-600 text-orange-700 border-orange-200 bg-orange-50"></div>
      <div className="hidden bg-lime-600 text-lime-700 border-lime-200 bg-lime-50"></div>


      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className={`border-t-4 border-${activeColor}-600 rounded-b-lg shadow-xl`}>
            {ActiveComponent}
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 text-center py-6 mt-12">
        <p>&copy; {new Date().getFullYear()} Stoichiometry Helper. Happy Calculating!</p>
      </footer>
    </div>
  );
}

export default App;
