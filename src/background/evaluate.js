// Use this to adjust the potency of each ratting.
const DEFAULT_RISK_SCALE = [0, 1, 2, 3];

// Generic ratting
const NO_IMPACT = 0;
const MILD_IMPACT = 1;
const MODERATE_IMPACT = 2;
const SEVERE_IMPACT = 3;

const WOT_RATING = {
  100: SEVERE_IMPACT,
  200: MODERATE_IMPACT,
  300: MILD_IMPACT,
  500: NO_IMPACT,
};

const GRADE = {
  F: 50,
  D: 60,
  C: 70,
  B: 80,
  A: 90,
};

/**
 * This is from WOT conference rating.
 * @param {integer} value
 * @returns
 */
const getGradeMultiplier = (value) => {
  console.debug("grade is: " + value);
  if (value <= GRADE.F) {
    console.debug("un-ranked grade, return 1");
    return 1;
  } else if (GRADE.F < value && value <= GRADE.D) {
    console.debug("grade F, return 2");
    return 2;
  } else if (GRADE.D < value && value <= GRADE.C) {
    console.debug("grade D, return 3");
    return 3;
  } else if (GRADE.C < value && value <= GRADE.B) {
    console.debug("grade C, return 4");
    return 4;
  } else if (GRADE.B < value && value <= GRADE.A) {
    console.debug("grade B, return 5");
    return 5;
  } else if (GRADE.A < value) {
    console.debug("grade A, return 6");
    return 6;
  }
  console.error("Something in the grade evaluation went wrong");
};

/**
 * Method for WOT Ratings.
 * @param {*} value
 * @param {*} ratings
 * @returns
 */
const getWotRating = (value) => {
  console.debug("WOT Rating is: " + value);
  if (value >= 500) {
    return WOT_RATING[500];
  } else if (300 <= value && value < 400) {
    return WOT_RATING[300];
  } else if (200 <= value && value < 300) {
    return WOT_RATING[200];
  } else if (100 <= value && value < 200) {
    return WOT_RATING[100];
  }
};

/**
 * Evaluate uses the builder design pattern
 */
class Evaluate {
  constructor() {
    this.weight = 0;
    this.categoryId = 0;
    this.confidence = 0;
    this.values = [];
    this.otherValues = [];
    this.rating = getWotRating;
    this.multiplier = getGradeMultiplier;
    this.notSafe = false;
  }

  setWeight(weight) {
    this.weight = weight;
    return this;
  }

  setCategoryId(categoryId) {
    this.categoryId = categoryId;
    return this;
  }

  setConfidence(confidence) {
    this.confidence = confidence;
    return this;
  }

  setWotValues(values = DEFAULT_RISK_SCALE) {
    this.values[500] = values[0];
    this.values[300] = values[1];
    this.values[200] = values[2];
    this.values[100] = values[3];

    return this;
  }

  setMultiplierCurve(values) {
    this.values = values;
    return this;
  }

  setRatingMethod(method) {
    this.rating = method;
    return this;
  }

  setMultiplierMethod(method) {
    this.method = method;
    return this;
  }

  getWeight() {
    console.warn("RETURNING WEIGHT: " + this.weight);
    return this.weight;
  }

  /**
   * This will take in the category from WOT and its confidence to evaluate the weight as the primary
   * As the secondary, it also scrapes the site.
   * @param {integer} weight
   * @param {string} category
   * @param {integer} confidence
   * @returns
   */
  evaluateWeight() {
    console.warn("WEIGHT BEFORE: " + this.weight);

    console.log("Confidence is: " + this.confidence);

    const multiplier = this.multiplier(this.confidence);
    console.debug("multiplier is: " + multiplier);

    const deduction = this.rating(this.categoryId, this.values);
    console.debug("deduction is: " + deduction);

    const change = deduction * multiplier;
    console.debug("change is: " + change);

    this.weight -= change;
    this.weight = this.weight > 0 ? this.weight : 0;
    console.warn("WEIGHT AFTER: " + this.weight);

    return this;
  }
}
