import { getCarnivoreTargets } from './src/data/carnivoreTargets';

console.log("--- Validation: Carnivore Targets Logic ---");

// Case 1: Default (No Weight)
const t1 = getCarnivoreTargets();
console.log(`Default (No Weight): Protein=${t1.protein}g (Expected ~110), Fat=${t1.fat}g`);

// Case 2: 50kg Person
const t2 = getCarnivoreTargets(undefined, undefined, undefined, false, false, false, 'low', 8, 'none', 'none', 'normal', 'none', false, 'low', 'good', false, false, false, 'none', 'none', undefined, 50);
console.log(`Weight 50kg: Protein=${t2.protein}g (Expected 80), Fat=${t2.fat}g`);

// Case 3: 100kg Person
const t3 = getCarnivoreTargets(undefined, undefined, undefined, false, false, false, 'low', 8, 'none', 'none', 'normal', 'none', false, 'low', 'good', false, false, false, 'none', 'none', undefined, 100);
console.log(`Weight 100kg: Protein=${t3.protein}g (Expected 160), Fat=${t3.fat}g (Expected >160)`);

if (t2.protein !== 110 && t3.protein !== 110 && t2.protein !== t3.protein) {
    console.log("✅ SUCCESS: Protein targets are dynamic based on weight.");
} else {
    console.error("❌ FAILURE: Protein targets are static or incorrect.");
    process.exit(1);
}
