export default class Ingredient {
  static UNITS = {
    teaspoon: {
      type: 'volume',
      name: 'teaspoon',
      short: 'tsp.',
      factor: 5,
    },
    tablespoon: {
      type: 'volume',
      name: 'tablespoon',
      short: 'tbsp.',
      factor: 14.7868,
    },
    fluidOunce: {
      type: 'volume',
      name: 'fluid Ounce',
      short: 'fl oz',
      factor: 29.5736,
    },
    gill: {
      type: 'volume',
      name: 'gill',
      short: 'gill',
      factor: 147.868,
    },
    cup: {
      type: 'volume',
      name: 'cup',
      short: 'c',
      factor: 240,
    },
    pint: {
      type: 'volume',
      name: 'pint',
      short: 'pt',
      factor: 473.1776,
    },
    quart: {

    },
    gallon: {

    },
    milliliter: {

    },
    liter: {

    },
    deciliter: {

    },
    pound: {

    },
    ounce: {

    },
    milligram: {

    },
    gram: {

    },
    kilogram: {

    },
  }
}
