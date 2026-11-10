// ================= Rafiq rules engine v1.0 (deterministic) =================
const RULE_VERSION = "1.0";
const PR = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };

const PATHWAYS = {
  EMERGENCY: { ar: "قسم الطوارئ فورًا", en: "Emergency department, now" },
  URGENT_SAME_DAY: { ar: "تقييم طبي حضوري اليوم", en: "Same-day in-person medical assessment" },
  PROMPT_EXAM: { ar: "فحص طبي حضوري قريب: رعاية أولية أو مسالك بولية", en: "Prompt in-person exam: primary care or urology" },
  PRIMARY_CARE: { ar: "طبيب الرعاية الأولية، مع تحويل لمختص عند الحاجة", en: "Primary care; specialist referral when indicated" },
  URO_ANDRO: { ar: "رعاية أولية أو مسالك بولية/أمراض الذكورة", en: "Primary care or urology/andrology" },
  URO_ENDO: { ar: "مسالك بولية/أمراض الذكورة أو الغدد الصماء حسب الحالة", en: "Urology/andrology or endocrinology as appropriate" },
  ONCO_URO: { ar: "متابعة الأورام و/أو مسالك/ذكورة إنجابية", en: "Oncology follow-up and/or reproductive urology/andrology" },
  PRESCRIBER: { ar: "الطبيب الواصف للدواء أو الرعاية الأولية", en: "Prescribing clinician or primary care" },
  PREVENTIVE: { ar: "رعاية وقائية ودعم الإقلاع عن التدخين", en: "Preventive care and smoking-cessation support" },
  OCCUPATIONAL: { ar: "رعاية أولية أو الصحة المهنية", en: "Primary care or occupational health" },
  SYMPTOM_EVAL: { ar: "رعاية أولية أو مسالك بولية/أمراض الذكورة حسب العرض", en: "Primary care or urology/andrology, by symptom" },
  DISCHARGE: { ar: "تقييم سريري قريب مع فحص عدوى يحدده الطبيب", en: "Prompt clinical assessment with clinician-directed infection testing" },
  FAMILY: { ar: "رعاية أولية، ومختص عند الحاجة", en: "Primary care; specialist if indicated" },
  FERT_EDU: { ar: "معلومات عامة، مع تقييم أبكر إذا وُجدت عوامل خطورة أو مخاوف", en: "General guidance; earlier assessment if risk factors or concerns exist" },
  FERT_ADVICE: { ar: "استشارة طبية حسب العمر والتاريخ الصحي وعوامل الخطورة", en: "Clinical advice based on age, history and risk factors" },
  FERT_BOTH: { ar: "تقييم خصوبة للطرفين بالتوازي: مركز خصوبة أو مسالك/ذكورة إنجابية", en: "Concurrent evaluation of both partners: fertility service or reproductive urology/andrology" },
  TESTS: { ar: "رعاية أولية أو مسالك/ذكورة إنجابية", en: "Primary care or reproductive urology/andrology" },
  NONE: { ar: "لا يوجد", en: "None" }
};

// Messages: Arabic = doctor's approved-draft wording (source: Clinical Rules Catalogue v1.0).
// English = translation added for international reviewers (needs review).
const RULES = {
  "CR-001": { q: "Q01", cat: { ar: "الأهلية", en: "Eligibility" }, path: "NONE",
    ar: "تم تصميم رفيق حاليًا للبالغين بعمر 18 سنة فأكثر. لا يمكننا إكمال هذا التقييم من خلال النسخة الحالية.",
    en: "Rafiq is currently designed for adults aged 18 and over. We can’t complete this assessment in the current version." },
  "CR-002": { q: "Q02", cat: { ar: "علامة خطر طارئة", en: "Emergency red flag" }, path: "EMERGENCY",
    ar: "الألم المفاجئ والشديد في الخصية قد يكون علامة على حالة طبية طارئة، مثل التواء الخصية. توجّه إلى قسم الطوارئ فورًا. لا تنتظر إكمال التقييم داخل التطبيق.",
    en: "Sudden, severe testicular pain can be a sign of a medical emergency, such as testicular torsion. Go to the emergency department now. Don’t wait to finish the assessment." },
  "CR-003": { q: "Q03", cat: { ar: "علامة خطر طارئة", en: "Emergency red flag" }, path: "EMERGENCY",
    ar: "اجتماع ألم الخصية مع الغثيان أو القيء أو ألم البطن قد يشير إلى حالة تحتاج إلى تقييم عاجل في المستشفى. توجّه إلى الطوارئ فورًا.",
    en: "Testicular pain together with nausea, vomiting or abdominal pain may point to a condition that needs urgent hospital assessment. Go to the emergency department now." },
  "CR-004": { q: "Q04", cat: { ar: "عرض يحتاج تقييمًا عاجلًا", en: "Urgent symptom" }, path: "URGENT_SAME_DAY",
    ar: "وجود ألم أو تورم في الخصية مع الحمى يستدعي تقييمًا طبيًا حضوريًا اليوم. إذا كان الألم مفاجئًا وشديدًا أو مصحوبًا بالغثيان أو القيء، فتوجّه إلى الطوارئ فورًا.",
    en: "Testicular pain or swelling with fever needs an in-person medical assessment today. If the pain is sudden and severe, or comes with nausea or vomiting, go to the emergency department now." },
  "CR-005": { q: "Q05", cat: { ar: "تغير في الخصية", en: "Testicular change" }, path: "PROMPT_EXAM",
    ar: "أي كتلة جديدة أو تغير في حجم الخصية أو شكلها يحتاج إلى فحص طبي حضوري. لا يعني ذلك بالضرورة وجود مرض خطير، لكن من المهم معرفة السبب وعدم تجاهل التغير.",
    en: "Any new lump or change in testicular size or shape needs an in-person medical examination. It doesn’t necessarily mean a serious disease, but it’s important to find the cause and not ignore the change." },
  "CR-006": { q: "Q07", cat: { ar: "التاريخ الصحي والأيضي", en: "Metabolic and medical history" }, path: "PRIMARY_CARE",
    ar: "بعض الأمراض المزمنة واضطرابات التمثيل الغذائي والهرمونات قد ترتبط بصحة الرجل الإنجابية. من المهم متابعة الحالة الصحية مع الطبيب ومناقشة أي أعراض أو مخاوف متعلقة بالصحة الإنجابية.",
    en: "Some chronic, metabolic and hormonal conditions can be linked to male reproductive health. Keep up follow-up with your doctor and discuss any reproductive symptoms or concerns." },
  "CR-007": { q: "Q08", cat: { ar: "تاريخ بولي وتناسلي سابق", en: "Previous genitourinary history" }, path: "URO_ANDRO",
    ar: "بعض الحالات السابقة التي تصيب الخصيتين أو الجهاز التناسلي قد تكون مهمة عند تقييم الصحة الإنجابية. يُنصح بمراجعة هذه المعلومات مع طبيب، خصوصًا إذا كانت لديك أعراض حالية أو قلق متعلق بالإنجاب.",
    en: "Some past conditions affecting the testicles or reproductive system can matter when assessing reproductive health. Review this history with a doctor, especially if you have current symptoms or fertility concerns." },
  "CR-008": { q: "Q09", cat: { ar: "التعرض لهرمونات خارجية", en: "Hormone exposure" }, path: "URO_ENDO",
    ar: "قد يؤثر استخدام التستوستيرون الخارجي أو المنشطات البنائية في إنتاج الحيوانات المنوية. من المهم مناقشة الاستخدام الحالي أو السابق مع طبيب مختص، خاصة إذا كنت مهتمًا بالإنجاب. لا توقف أي دواء موصوف دون إشراف طبي.",
    en: "External testosterone or anabolic steroids can affect sperm production. Discuss current or past use with a specialist, especially if you plan to have children. Don’t stop any prescribed medicine without medical supervision." },
  "CR-009": { q: "Q09", cat: { ar: "علاجات سابقة مؤثرة", en: "Gonadotoxic treatment" }, path: "ONCO_URO",
    ar: "بعض علاجات السرطان، مثل العلاج الكيميائي أو الإشعاعي، قد تؤثر في الوظيفة الإنجابية بدرجات تختلف حسب نوع العلاج والجرعة والمنطقة المعالجة. يمكن للطبيب المختص تقييم وضعك وتوضيح الخيارات المناسبة.",
    en: "Some cancer treatments, such as chemotherapy or radiotherapy, can affect reproductive function to varying degrees depending on the treatment, dose and area treated. A specialist can assess your situation and explain your options." },
  "CR-010": { q: "Q09", cat: { ar: "أدوية طويلة الأمد", en: "Long-term medication" }, path: "PRESCRIBER",
    ar: "بعض الأدوية قد تؤثر في الوظيفة الجنسية أو الهرمونية أو الإنجابية، بينما لا يؤثر كثير منها. إذا كانت لديك مخاوف، ناقش أسماء أدويتك وجرعاتها مع الطبيب دون إيقاف أي دواء من نفسك.",
    en: "Some medicines can affect sexual, hormonal or reproductive function, while many don’t. If you have concerns, discuss your medicines and doses with your doctor, without stopping any on your own." },
  "CR-011": { q: "Q10", cat: { ar: "نمط الحياة", en: "Lifestyle" }, path: "PREVENTIVE",
    ar: "يرتبط التدخين واستخدام منتجات التبغ بتأثيرات سلبية محتملة على الصحة العامة وبعض مؤشرات الصحة الإنجابية. تقليل الاستخدام والإقلاع عنه خطوة مفيدة لصحتك.",
    en: "Smoking and tobacco use are linked to possible harmful effects on general health and some reproductive health markers. Cutting down and quitting is a helpful step for your health." },
  "CR-012": { q: "Q11", cat: { ar: "التعرض المهني والبيئي", en: "Occupational exposure" }, path: "OCCUPATIONAL",
    ar: "بعض التعرضات المهنية، مثل الحرارة المرتفعة أو بعض المواد الكيميائية، قد تكون ذات صلة بالصحة الإنجابية. يُنصح بمراجعة إجراءات السلامة المهنية ومناقشة التعرض المتكرر مع الطبيب عند وجود مخاوف.",
    en: "Some workplace exposures, such as high heat or certain chemicals, may be relevant to reproductive health. Review workplace safety measures and discuss repeated exposure with a doctor if you have concerns." },
  "CR-013": { q: "Q12", cat: { ar: "أعراض حالية", en: "Current symptoms" }, path: "SYMPTOM_EVAL",
    ar: "الأعراض التي ذكرتها تستحق تقييمًا طبيًا لمعرفة السبب. قد ترتبط بعض هذه الأعراض بأسباب بولية أو هرمونية أو جنسية مختلفة، ولا يمكن تحديد السبب من خلال الاستبيان وحده.",
    en: "The symptoms you reported deserve a medical assessment to find the cause. They can have different urinary, hormonal or sexual causes, which a questionnaire alone can’t determine." },
  "CR-014": { q: "Q13", cat: { ar: "التاريخ العائلي", en: "Family history" }, path: "FAMILY",
    ar: "وجود تاريخ عائلي لبعض الأمراض قد يكون مهمًا عند تقييم صحتك. لا يعني ذلك أنك مصاب بالمرض نفسه، لكن من المفيد إخبار الطبيب بهذه المعلومات عند الحاجة.",
    en: "A family history of some conditions can matter when assessing your health. It doesn’t mean you have the same condition, but it’s useful to tell your doctor." },
  "CR-015": { q: "Q14", cat: { ar: "محاولات الإنجاب", en: "Conception attempts" }, path: "FERT_BOTH",
    ar: "تأخر حدوث الحمل قد تكون له أسباب مرتبطة بالرجل أو المرأة أو كليهما. عند الحاجة إلى تقييم الخصوبة، يُفضَّل تقييم الطرفين بالتوازي للوصول إلى فهم أدق للأسباب.",
    en: "A delay in pregnancy can have causes related to the man, the woman or both. When fertility assessment is needed, evaluating both partners in parallel gives a clearer picture." },
  "CR-016": { q: "Q15", cat: { ar: "فحوصات سابقة", en: "Previous investigations" }, path: "TESTS",
    ar: "الفحوصات السابقة قد تساعد الطبيب في فهم حالتك. إذا كانت لديك نتائج، احتفظ بها وشاركها مع الطبيب المختص. ولا يمكن الحكم على الخصوبة من اسم الفحص أو من نتيجة واحدة دون تفسير طبي مناسب.",
    en: "Previous tests can help a doctor understand your situation. Keep any results and share them with the specialist. Fertility can’t be judged from a test’s name or a single result without proper medical interpretation." }
};

// Option-level priority mapping. "proposed" = chosen by the technical team where the
// catalogue says "P2 or P3 depending on context" — needs medical confirmation.
const MAP = {
  Q07: { diabetes: "P2", hypertension: "P3", obesity: "P3", thyroid: "P2", hormonal: "P2", cancer: "P2", other_chronic: "P3" },
  Q13: { testicular_cancer: "P3", inherited: "P2" }
};
const PROPOSED = ["CR-006", "CR-012", "CR-014", "CR-015", "CR-016"];
const arr = v => Array.isArray(v) ? v : [];

function evaluate(a) {
  const signals = [];
  const add = (id, trig, prio, extra = {}) => signals.push({
    rule_id: id, question_id: RULES[id].q, triggered_by: trig, priority: prio,
    category: RULES[id].cat.en, message_id: "MSG-" + id, care_pathway: extra.path || RULES[id].path, ...extra
  });

  if (a.Q01 === "no") {
    add("CR-001", ["under_18"], "P4");
    return pack(signals, "ineligible");
  }
  if (a.Q02 === "yes") add("CR-002", ["sudden_severe_pain"], "P0");
  if (a.Q03 === "yes") add("CR-003", ["pain_with_nausea_vomiting_abdominal"], "P0");
  if (a.Q04 === "yes") add("CR-004", ["pain_swelling_with_fever"], "P1");
  if (a.Q05 === "yes") add("CR-005", ["new_lump_or_change"], "P2");

  const q07 = arr(a.Q07).filter(v => MAP.Q07[v]);
  if (q07.length) add("CR-006", q07, q07.some(v => MAP.Q07[v] === "P2") ? "P2" : "P3");

  const q08 = arr(a.Q08).filter(v => !["dont_know", "none"].includes(v));
  if (q08.length) add("CR-007", q08, "P2");

  const q09 = arr(a.Q09);
  const hormone = q09.filter(v => ["testosterone", "anabolic_steroids"].includes(v));
  if (hormone.length) add("CR-008", hormone, "P2");
  const gonado = q09.filter(v => ["chemotherapy", "radiotherapy"].includes(v));
  if (gonado.length) add("CR-009", gonado, "P2");
  if (q09.includes("long_term_meds")) add("CR-010", ["long_term_meds"], "P3");

  if (a.Q10 && a.Q10 !== "none") add("CR-011", [a.Q10], "P3");

  const q12 = arr(a.Q12).filter(v => !["none", "prefer_not"].includes(v));
  const q11 = arr(a.Q11).filter(v => !["none", "dont_know"].includes(v));
  if (q11.length) add("CR-012", q11, q12.length ? "P2" : "P3");

  if (q12.length) add("CR-013", q12, "P2", q12.includes("discharge") ? { path: "DISCHARGE" } : {});

  const q13 = arr(a.Q13).filter(v => MAP.Q13[v]);
  if (q13.length) add("CR-014", q13, q13.some(v => MAP.Q13[v] === "P2") ? "P2" : "P3");

  if (a.Q14 === "yes") {
    const d = a.Q14A || "unknown";
    const by = { lt6: ["P3", "FERT_EDU"], "6to12": ["P2", "FERT_ADVICE"], gt12: ["P2", "FERT_BOTH"], unknown: ["P2", "FERT_ADVICE"] }[d];
    add("CR-015", ["tried_to_conceive", "duration_" + d], by[0], { path: by[1] });
  }

  const q15 = arr(a.Q15).filter(v => !["none", "dont_remember"].includes(v));
  if (q15.length) {
    const abnormal = q15.includes("semen_analysis") && a.Q15A === "yes";
    add("CR-016", abnormal ? [...q15, "abnormal_semen_reported"] : q15, abnormal ? "P2" : "P3");
  }
  return pack(signals);
}

function pack(signals, forced) {
  signals.sort((x, y) => PR[x.priority] - PR[y.priority]);
  const highest = signals.length ? signals[0].priority : null;
  let status = forced || "completed";
  if (!forced && highest === "P0") status = "stopped_emergency";
  else if (!forced && highest === "P1") status = "stopped_urgent";
  return {
    status, urgent_flag: highest === "P0" || highest === "P1", highest_priority: highest,
    signals, diagnosis: null, fertility_score: null, clinical_rule_version: RULE_VERSION
  };
}

// ---------------- Validation test cases (catalogue section 10 + negative cases) ----------------
const has = (r, id) => r.signals.some(s => s.rule_id === id);
const base = { Q01: "yes", Q02: "no", Q03: "na", Q04: "no", Q05: "no" };
const TESTS = [
  ["TC-001", "Q01 = No", { Q01: "no" }, r => r.status === "ineligible" && r.signals.length === 1, "Adult assessment blocked"],
  ["TC-002", "Q02 = Yes", { ...base, Q02: "yes" }, r => r.highest_priority === "P0" && r.status === "stopped_emergency", "P0 emergency"],
  ["TC-003", "Q03 = Yes with testicular pain", { ...base, Q03: "yes" }, r => r.highest_priority === "P0", "P0 emergency"],
  ["TC-004", "Q04 = Yes, no P0 symptoms", { ...base, Q04: "yes" }, r => r.highest_priority === "P1" && r.status === "stopped_urgent", "P1 same-day assessment"],
  ["TC-005", "Q05 = Yes, no emergency", { ...base, Q05: "yes" }, r => r.highest_priority === "P2" && has(r, "CR-005"), "P2 prompt examination"],
  ["TC-006", "Q07 includes diabetes", { ...base, Q07: ["diabetes"] }, r => has(r, "CR-006"), "Metabolic signal"],
  ["TC-007", "Q08 includes cryptorchidism", { ...base, Q08: ["cryptorchidism"] }, r => has(r, "CR-007"), "Urological history signal"],
  ["TC-008", "Q09 includes testosterone", { ...base, Q09: ["testosterone"] }, r => has(r, "CR-008"), "Medication/exposure signal"],
  ["TC-009", "Q09 includes chemotherapy", { ...base, Q09: ["chemotherapy"] }, r => has(r, "CR-009"), "Gonadotoxic treatment signal"],
  ["TC-010", "Q10 includes smoking", { ...base, Q10: "cigarettes" }, r => has(r, "CR-011") && r.highest_priority === "P3", "Lifestyle signal"],
  ["TC-011", "Q11 includes pesticides", { ...base, Q11: ["pesticides"] }, r => has(r, "CR-012"), "Occupational exposure signal"],
  ["TC-012", "Q12 includes urethral discharge", { ...base, Q12: ["discharge"] }, r => has(r, "CR-013") && r.signals[0].care_pathway === "DISCHARGE", "Clinical evaluation signal"],
  ["TC-013", "Q13 testicular cancer family history", { ...base, Q13: ["testicular_cancer"] }, r => has(r, "CR-014"), "Family-history signal"],
  ["TC-014", "Q14 more than 12 months", { ...base, Q14: "yes", Q14A: "gt12" }, r => has(r, "CR-015") && r.signals[0].care_pathway === "FERT_BOTH", "Fertility evaluation guidance"],
  ["TC-015", "Q15 abnormal semen analysis", { ...base, Q15: ["semen_analysis"], Q15A: "yes" }, r => has(r, "CR-016") && r.signals[0].priority === "P2", "Professional interpretation guidance"],
  ["TC-016", "No risk signals", { ...base, Q07: ["none"], Q08: ["none"], Q09: ["none"], Q10: "none", Q11: ["none"], Q12: ["none"], Q13: ["none"], Q14: "no", Q15: ["none"] }, r => r.signals.length === 0 && r.status === "completed", "No-signal educational report"],
  ["TC-017", "Q02 = Yes and diabetes", { ...base, Q02: "yes", Q07: ["diabetes"] }, r => r.highest_priority === "P0" && r.status === "stopped_emergency", "P0 takes precedence"],
  ["TC-018", "Q05 = Yes and smoking", { ...base, Q05: "yes", Q10: "shisha" }, r => has(r, "CR-005") && has(r, "CR-011") && r.highest_priority === "P2", "P2 and P3 signals retained"],
  ["TC-019", "Q04 = Yes and Q02 = Yes", { ...base, Q02: "yes", Q04: "yes" }, r => r.highest_priority === "P0", "P0 takes precedence"],
  ["TC-020", "Q12 sexual symptoms only", { ...base, Q12: ["erectile"] }, r => has(r, "CR-013") && r.diagnosis === null && r.fertility_score === null, "Clinical evaluation, not infertility diagnosis"],
  ["NEG-01", "Q07 = I don’t know", { ...base, Q07: ["dont_know"] }, r => !has(r, "CR-006"), "No metabolic signal"],
  ["NEG-02", "Q08 = None", { ...base, Q08: ["none"] }, r => !has(r, "CR-007"), "No history signal"],
  ["NEG-03", "Q09 = Prefer not to answer", { ...base, Q09: ["prefer_not"] }, r => r.signals.length === 0, "No medication signal"],
  ["NEG-04", "Q10 = Does not use", { ...base, Q10: "none" }, r => !has(r, "CR-011"), "No lifestyle signal"],
  ["NEG-05", "Q03 = Not applicable", { ...base, Q03: "na" }, r => r.highest_priority !== "P0", "No emergency"],
  ["NEG-06", "Q14 = No", { ...base, Q14: "no" }, r => !has(r, "CR-015"), "No fertility signal"],
  ["NEG-07", "Semen analysis, result not abnormal", { ...base, Q15: ["semen_analysis"], Q15A: "no" }, r => has(r, "CR-016") && r.signals[0].priority === "P3", "Recorded as P3 only"],
  ["NEG-08", "Q12 = Prefer not to answer", { ...base, Q12: ["prefer_not"] }, r => !has(r, "CR-013"), "No symptom signal"]
];

if (typeof module !== "undefined") module.exports = { evaluate, TESTS, RULES };
