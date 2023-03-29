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
  if (value <= GRADE.F) {
    return 1;
  } else if (GRADE.F > value && value <= GRADE.D) {
    return 2;
  } else if (GRADE.D > value && value <= GRADE.C) {
    return 3;
  } else if (GRADE.C > value && value <= GRADE.B) {
    return 4;
  } else if (GRADE.B > value && value <= GRADE.A) {
    return 5;
  } else if (GRADE.A < value) {
    return 6;
  }
};

/**
 * Method for WOT Ratings.
 * @param {*} value
 * @param {*} ratings
 * @returns
 */
const getWotRating = (value) => {
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

  setValues(values) {
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
    const multiplier = this.multiplier(this.confidence);
    const deduction = this.rating(this.categoryId, this.values);
    const change = deduction * multiplier;

    this.weight -= change;

    this.weight = this.weight > 0 ? this.weight : 0;

    return this;
  }
}
