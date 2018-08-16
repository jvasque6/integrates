/* eslint no-magic-numbers: ["error", { "ignore":[-1,0,1] }]*/
/* global
integrates, BASE, userEmail, mixpanel, projectData:true,
eventsData:true, findingData:true, angular, $window, Rollbar */
/* eslint no-shadow: ["error", { "allow": ["$scope"] }]*/
/**
 * @file registerCtrl.js
 * @author engineering@fluidattacks.com
 */
/**
 * Controller definition for user registration view.
 * @name registerController
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @return {undefined}
 */
/** @export */
angular.module("FluidIntegrates").controller(
  "registerCtrl",
  function registerCtrl (
    $scope,
    $state,
    $stateParams,
    $timeout,
    $translate,
    $uibModal,
    $window,
    registerFactory
  ) {
    $scope.loadDashboard = function loadDashboard () {
      const currentUrl = $window.location.toString();
      if (localStorage.getItem("url_inicio") === null) {
        $window.location = "dashboard";
      }
      else {
        let baseUrl = "";
        if (currentUrl.indexOf("localhost:8000") === -1) {
          if (currentUrl.indexOf(".integrates.env") === -1) {
            baseUrl = "https://fluidattacks.com/integrates/dashboard";
            const link = `${baseUrl}#${localStorage.getItem("url_inicio")}`;
            localStorage.clear();
            $window.location = link;
          }
          else {
            const dev = currentUrl.match("https://(.*).integrates")[1];
            baseUrl = `https://${dev}.integrates.env.fluidattacks.com/dashbo`;
            const link = `${baseUrl}ard#${localStorage.getItem("url_inicio")}`;
            localStorage.clear();
            $window.location = link;
          }
        }
        else {
          baseUrl = "https://localhost:8000/dashboard";
          const link = `${baseUrl}#${localStorage.getItem("url_inicio")}`;
          localStorage.clear();
          $window.location = link;
        }
      }
    };

    $scope.showAlreadyLoggedin = function showAlreadyLoggedin () {
      angular.element("#alreadyLoggedin").show();
      localStorage.clear();
    };

    $scope.showNotAuthorized = function showNotAuthorized () {
      angular.element("#notAuthorizedTxt").show();
      const currentUrl = $window.location.toString();
      if (currentUrl.indexOf("localhost:8000") === -1) {
        mixpanel.track("Registered User", {
          "Email":
          "{{ request.session.username }}"
        });
      }
    };

    $scope.initLegalNotice = function initLegalNotice () {
      $scope.legalNotice = {
        "accept": {
          "text": $translate.instant("legalNotice.acceptBtn.text"),
          "tooltip": $translate.instant("legalNotice.acceptBtn.tooltip")
        },
        "remember": {
          "text": $translate.instant("legalNotice.rememberCbo.text"),
          "tooltip": $translate.instant("legalNotice.rememberCbo.tooltip")
        },
        "text": $translate.instant("legalNotice.description"),
        "title": $translate.instant("legalNotice.title")
      };
      const infoReq = registerFactory.getLoginInfo();
      infoReq.then((response) => {
        const respData = response.data;
        if (angular.isUndefined(respData)) {
          location.reload();
        }
        else if (!respData.login.authorized) {
          $scope.showNotAuthorized();
        }
        else if (respData.login.remember) {
          $scope.loadDashboard();
        }
        else {
          $scope.showLegalNotice = true;
        }
      });
    };

    $scope.init = function init () {
      $scope.showLegalNotice = false;
      if (localStorage.getItem("showAlreadyLoggedin") === "1") {
        $scope.showAlreadyLoggedin();
      }
      else {
        $scope.initLegalNotice();
      }
    };

    $scope.init();
  }
);
