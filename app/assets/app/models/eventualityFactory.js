/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1, 5] }]*/
/* global integrates, BASE, $xhr, $, Rollbar, angular, secureRandom */
/**
 * @file eventualityFactory.js
 * @author engineering@fluidattacks.com
 */
/**
 * Factory definition for eventuality controler and functions.
 * @name
 * @param {Object} $q
 * @return {undefined}
 */
/** @export */
angular.module("FluidIntegrates").factory(
  "eventualityFactory",
  function eventualityFactory ($q) {
    return {

      /**
       * Return the eventualities of a project
       * @function getEvntByName
       * @param {String} project Project Name
       * @param {String} category Search filter: By Name or ID
       * @member integrates.eventualityFactory
       * @return {Object} Formstack response with the eventualities of a project
       */
      "getEvntByName" (project, category) {
        const oopsAc = "An error ocurred getting event by name";
        return $xhr.get($q, `${BASE.url}get_eventualities`, {
          "_": parseInt(secureRandom(5).join(""), 10),
          category,
          project
        }, oopsAc);
      },

      /**
       * Update an eventuality
       * @function updateEvnt
       * @param {Object} vuln New data about an eventuality
       * @member integrates.eventualityFactory
       * @return {Object} Formstack response about update request
       */
      "updateEvnt" (vuln) {
        const oopsAc = "An error ocurred updating event";
        return $xhr.post($q, `${BASE.url}update_eventuality`, {
          "_": parseInt(secureRandom(5).join(""), 10),
          vuln
        }, oopsAc);
      }
    };
  }
);
