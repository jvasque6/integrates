/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1] }]*/
/* eslint no-shadow: ["error", { "allow": ["$scope"] }]*/
/* global
BASE, downLink:true, Morris, estado:true, exploitLabel:true, eventsData:true,
nonexploitLabel:true, totalHigLabel:true, exploitable:true, totalSegLabel:true,
openLabel:true, partialLabel:true, integrates, userRole, document, $, $msg,
userName, userEmail, Rollbar, aux:true, json:true, closeLabel:true, j:true,
mixPanelDashboard, win:true, window, Organization, projectData:true, i:true,
eventsTranslations, keysToTranslate, labelEventState:true, angular, ldclient
*/
/**
 * @file projectEventsCtrl.js
 * @author engineering@fluidattacks.com
 */
/**
 * @function labelEventState
 * @param {string} value Status of an eventuality
 * @member integrates.registerCtrl
 * @return {string|boolean} Html code for specific label
 */
/* eslint-disable-next-line  func-name-matching */
labelEventState = function labelEventStateFunction (value) {
  if (value === "Tratada") {
    return "<label class='label label-success' style='background-color: " +
           "#31c0be'>Tratada</label>";
  }
  else if (value === "Solved") {
    return "<label class='label label-success' style='background-color: " +
           "#31c0be'>Solved</label>";
  }
  else if (value === "Pendiente") {
    return "<label class='label label-danger' style='background-color: " +
           "#f22;'>Pendiente</label>";
  }
  else if (value === "Unsolved") {
    return "<label class='label label-danger' style='background-color: " +
           "#f22;'>Unsolved</label>";
  }
  return false;
};

/**
 * Controller definition for eventuality view.
 * @name projectEventsCtrl
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @param {Object} $stateParams
 * @param {Object} $state
 * @param {Object} $timeout
 * @return {undefined}
 */
/** @export */
angular.module("FluidIntegrates").controller(
  "projectEventsCtrl",
  function projectEventsCtrl (
    $location,
    $scope,
    $state,
    $stateParams,
    $timeout,
    $translate,
    $uibModal,
    eventualityFactory,
    functionsFtry1,
    functionsFtry3,
    functionsFtry4,
    projectFtry,
    projectFtry2
  ) {
    $scope.init = function init () {
      const projectName = $stateParams.project;
      const findingId = $stateParams.finding;
      $scope.userRole = userRole;
      functionsFtry4.verifyRoles($scope, projectName, userEmail, userRole);
      // Default flags value for view visualization
      $scope.view = {};
      $scope.view.project = false;
      $scope.view.finding = false;
      // Route parameters
      if (angular.isDefined(findingId)) {
        $scope.findingId = findingId;
      }
      if (angular.isDefined(projectName) &&
                projectName !== "") {
        $scope.project = projectName;
        $scope.search();
        const orgName = Organization.toUpperCase();
        const projName = projectName.toUpperCase();
        mixPanelDashboard.trackReports(
          "ProjectEvents",
          userName,
          userEmail,
          orgName,
          projName
        );
      }
      // Search function assignation to button and enter key configuration.
      functionsFtry3.configKeyboardView($scope);
      $scope.goUp();
      $scope.finding = {};
    };
    $scope.goUp = function goUp () {
      angular.element("html, body").animate({"scrollTop": 0}, "fast");
    };
    $scope.search = function search () {
      let vlang = "en-US";
      if (localStorage.lang === "en") {
        vlang = "en-US";
      }
      else {
        vlang = "es-CO";
      }
      const projectName = $scope.project;
      if (angular.isUndefined(projectName) ||
                projectName === "") {
        const attentionAt = $translate.instant("proj_alerts.attentTitle");
        const attentionAc = $translate.instant("proj_alerts.attent_cont");
        $msg.warning(attentionAc, attentionAt);
        return false;
      }
      if ($stateParams.project !== $scope.project) {
        $state.go("ProjectIndicators", {"project": $scope.project});
      }
      else if ($stateParams.project === $scope.project) {
        $scope.view.project = false;
        $scope.view.finding = false;

        const reqEventualities = projectFtry2.eventsByProject(projectName);
        reqEventualities.then((response) => {
          if (response.errors) {
            const {message} = response.errors[0];
            if (message === "Login required") {
              location.reload();
            }
            else if (message === "Access denied") {
              $msg.error($translate.instant("proj_alerts.access_denied"));
            }
            else {
              Rollbar.error(message);
            }
          }
          else {
            eventsData = [];
            if (response.data.events.length === 0) {
              $msg.error($translate.instant("proj_alerts.eventExist"));
            }
            else {
              eventsData = response.data.events;
            }
            $scope.view.project = true;
            $scope.loadEventContent(eventsData, vlang, projectName);
          }
        });
      }
      return true;
    };
    $scope.goToEvent = function goToEvent (rowInfo) {
      // Mixpanel tracking
      mixPanelDashboard.trackFinding("ReadEvent", userEmail, rowInfo.id);
      $scope.currentScrollPosition = angular.element(document).scrollTop();
      $state.go("EventsDescription", {
        "id": rowInfo.id,
        "project": rowInfo.projectName.toLowerCase()
      });
    };
    $scope.loadEventContent = function loadEventContent (data, vlang, project) {
      const organizationName = Organization.toUpperCase();
      const projectName = project.toUpperCase();
      functionsFtry1.alertHeader(organizationName, projectName);
      for (let cont = 0; cont < data.length; cont++) {
        for (let inc = 0; inc < eventsTranslations.length; inc++) {
          if (data[cont][eventsTranslations[inc]] in keysToTranslate) {
            data[cont][eventsTranslations[inc]] =
                  $translate.instant(keysToTranslate[
                    data[cont][eventsTranslations[inc]]
                  ]);
          }
        }
      }
      $scope.isManager = userRole !== "customer" &&
                         userRole !== "customeradmin";
      mixPanelDashboard.trackSearch("SearchEventuality", userEmail, project);
      $scope.tblEventsHeaders = [
        {
          "align": "center",
          "dataField": "id",
          "header": $translate.instant("search_events.headings.id"),
          "width": "3.0%"
        },
        {
          "align": "center",
          "dataField": "eventDate",
          "header":
            $translate.instant("search_events.headings.date"),
          "width": "3.5%"
        },
        {
          "align": "center",
          "dataField": "detail",
          "header": $translate.instant("search_events.headings.details"),
          "width": "6.5%",
          "wrapped": true
        },
        {
          "align": "center",
          "dataField": "eventType",
          "header": $translate.instant("search_events.headings.type"),
          "width": "4.8%",
          "wrapped": true
        },
        {
          "align": "center",
          "dataField": "eventStatus",
          "header": $translate.instant("search_events.headings.status"),
          "isStatus": true,
          "width": "3.0%"
        }
      ];
      $scope.eventsDataset = data;
      angular.element("#search_section").show();
      angular.element("[data-toggle=\"tooltip\"]").tooltip();
      if (!$scope.isManager) {
        $scope.openEvents = projectFtry.alertEvents(eventsData);
        $scope.atAlert = $translate.instant("main_content.eventualities." +
                                            "descSingularAlert1");
        if ($scope.openEvents === 1) {
          $scope.descAlert1 = $translate.instant("main_content.eventualities." +
                                                  "descSingularAlert2");
          $scope.descAlert2 = $translate.instant("main_content.eventualities." +
                                                  "descSingularAlert3");
          angular.element("#events_alert").show();
        }
        else if ($scope.openEvents > 1) {
          $scope.descAlert1 = $translate.instant("main_content.eventualities." +
                                                  "descPluralAlert1");
          $scope.descAlert2 = $translate.instant("main_content.eventualities." +
                                                  "descPluralAlert2");
          angular.element("#events_alert").show();
        }
      }
    };
    $scope.urlIndicators = function urlIndicators () {
      $state.go("ProjectIndicators", {"project": $scope.project});
    };
    $scope.urlFindings = function urlFindings () {
      $state.go("ProjectFindings", {"project": $scope.project});
    };
    $scope.urlEvents = function urlEvents () {
      $state.go("ProjectEvents", {"project": $scope.project});
    };
    $scope.urlUsers = function urlUsers () {
      $state.go("ProjectUsers", {"project": $scope.project});
    };
    $scope.urlComments = function urlComments () {
      $state.go("ProjectComments", {"project": $scope.project});
    };
    $scope.urlDrafts = function urlDrafts () {
      $state.go("ProjectDrafts", {"project": $scope.project});
    };
    $scope.urlResources = function urlResources () {
      $state.go("ProjectResources", {"project": $scope.project});
    };
    $scope.init();
  }
);
