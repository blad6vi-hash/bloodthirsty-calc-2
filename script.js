// Attack multipliers
const Multipliers = {
  Slash: 1,
  Blunt: 0.65,
  Dagger: 3
};

// Round to 2 decimals
const r2 = x => Math.round(x * 100) / 100;

// Formulas
function baseFormula(S, M){
  return 0.1 * S * M + (0.1 * S + 3) * (0.9 + 0.1 * M);
}

function daggerFormula(S){
  return 0.1 * S * 3 + (0.1 * S + 1) * (0.9 + 0.1 * 3);
}

function alloyFormula(S, M){
  return 0.1 * S * M * 0.25 + (0.1 * S + 3) * (0.9 + 0.25 * (2 - M) + 0.1 * M);
}

// Alloyblood FINAL reduction (post-formula)
function alloyReduction(ironsing){
  ironsing = Math.max(0, Math.min(100, ironsing));
  const reduction = 0.75 - 0.0075 * (100 - ironsing);
  return 1 - reduction; // multiplier
}

// Calculate everything
function calculate(baseDamage, attackType, isAlloy, ironsing, armor, cw){
  const S = baseDamage * 1.1;
  const M = Multipliers[attackType];

  let raw;
  let label;

  if(isAlloy){
    raw = alloyFormula(S, M);
    label = "Alloyblood formula (raw)";
  } else if(attackType === "Dagger") {
    raw = daggerFormula(S);
    label = "Dagger nerfed formula";
  } else {
    raw = baseFormula(S, M);
    label = "Standard formula";
  }

  // Post-formula reductions
  let final = raw;

  // Armor resistance
  final *= (1 - armor / 100);

  // Alloyblood target reduction
  if(isAlloy){
    final *= alloyReduction(ironsing);
  }

  // Cauterized Wounds
  if(cw){
    final *= 0.70;
  }

  return { S, raw, final, label };
}


// UI
document.getElementById("calcBtn").addEventListener("click", ()=>{
  const baseDamage = parseFloat(document.getElementById("baseDamage").value);
  const attackType = document.getElementById("attackType").value;
  const isAlloy = document.getElementById("isAlloy").checked;
  const ironsing = parseInt(document.getElementById("ironsing").value) || 0;
  const armor = parseFloat(document.getElementById("armor").value) || 0;
  const cw = document.getElementById("cw").checked;

  const out = calculate(baseDamage, attackType, isAlloy, ironsing, armor, cw);

  document.getElementById("scaledS").textContent = r2(out.S);
  document.getElementById("rawLoss").textContent = r2(out.raw);
  document.getElementById("finalLoss").textContent = r2(out.final);
  document.getElementById("notes").textContent = out.label;
});

document.getElementById("copyBtn").addEventListener("click", ()=>{
  const txt = `Scaled: ${scaledS.textContent} — Raw: ${rawLoss.textContent} — Final: ${finalLoss.textContent}`;
  navigator.clipboard.writeText(txt);
});

document.getElementById("calcBtn").click();
