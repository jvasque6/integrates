/* eslint no-magic-numbers: ["error", { "ignore": [0,13, 100] }]*/
/* eslint no-shadow: ["error", { "allow": ["$scope"] }]*/
/* global
BASE, downLink:true, Morris, estado:true, exploitLabel:true, eventsData:true,
nonexploitLabel:true, totalHigLabel:true, explotable:true, totalSegLabel:true,
openLabel:true, partialLabel:true, integrates, userRole, document, $, $msg,
userName, userEmail, Rollbar, aux:true, json:true, closeLabel:true, j:true,
mixPanelDashboard, win:true, window, Organization, projectData:true, i:true,
eventsTranslations, keysToTranslate, labelEventState:true
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
labelEventState = function labelEventState (value) {
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
 * Controlador de vista de proyectos
 * @name projectEventsCtrl
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @param {Object} $stateParams
 * @param {Object} $state
 * @param {Object} $timeout
 * @return {undefined}
 */
/** @export */
integrates.controller(
  "projectEventsCtrl",
  function projectEventsCtrl (
    $scope, $location,
    $uibModal, $timeout,
    $state, $stateParams,
    $translate, projectFtry,
    eventualityFactory
  ) {
    $scope.init = function init () {
      const projectName = $stateParams.project;
      const findingId = $stateParams.finding;
      $scope.userRole = userRole;

      $scope.isManager = userRole !== "customer";
      // Defaults para cambiar vistas
      $scope.view = {};
      $scope.view.project = false;
      $scope.view.finding = false;
      // Parametros de ruta
      if (typeof findingId !== "undefined") {
        $scope.findingId = findingId;
      }
      if (typeof projectName !== "undefined" &&
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
      // Asigna el evento buscar al textbox search y tecla enter
      $scope.configKeyboardView();
      $scope.goUp();
      $scope.finding = {};
    };
    $scope.goUp = function goUp () {
      $("html, body").animate({"scrollTop": 0}, "fast");
    };
    $scope.alertHeader = function alertHeader (company, project) {
      const req = projectFtry.getAlerts(company, project);
      req.then((response) => {
        if (!response.error && response.data.length > 0) {
          if (response.data.status_act === "1") {
            let html = "<div class=\"alert alert-danger-2\">";
            html += "<strong>Atención! </strong>" +
                    `${response.data[0].message}</div>`;
            document.getElementById("header_alert").innerHTML = html;
          }
        }
      });
    };
    $scope.configKeyboardView = function configKeyboardView () {
      document.onkeypress = function onkeypress (ev) {
        // Buscar un proyecto
        if (ev.keyCode === 13) {
          if ($("#project").is(":focus")) {
            $scope.search();
          }
        }
      };
      return true;
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
      const filterAux = $scope.filter;
      const filter = filterAux;
      const finding = $scope.findingId;
      if (typeof projectName === "undefined" ||
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

        /* Handling presentation button */
        const searchAt = $translate.instant("proj_alerts.search_title");
        const searchAc = $translate.instant("proj_alerts.search_cont");
        $msg.info(searchAc, searchAt);
        if (eventsData.length > 0 &&
           eventsData[0].proyecto_fluid.toLowerCase() ===
           $scope.project.toLowerCase()) {
          $scope.view.project = true;
          $scope.loadEventContent(eventsData, vlang, projectName);
        }
        else {
          const reqEventualities = projectFtry.eventualityByName(
            projectName,
            "Name"
          );
          reqEventualities.then((response) => {
            if (!response.error) {
              $scope.view.project = true;
              eventsData = response.data;
              $scope.loadEventContent(eventsData, vlang, projectName);
            }
            else if (response.message === "Access to project denied") {
              Rollbar.warning("Warning: Access to event denied");
              $msg.error($translate.instant("proj_alerts.access_denied"));
            }
            else {
              Rollbar.warning("Warning: Event not found");
              $msg.error($translate.instant("proj_alerts.eventExist"));
            }
          });
        }
      }
      return true;
    };
    $scope.loadEventContent = function loadEventContent (data, vlang, project) {
      const organizationName = Organization.toUpperCase();
      const projectName = project.toUpperCase();
      $scope.alertHeader(organizationName, projectName);
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
      $scope.isManager = userRole !== "customer";
      mixPanelDashboard.trackSearch("SearchEventuality", userEmail, project);
      // CONFIGURACION DE TABLA
      $("#tblEventualities").bootstrapTable("destroy");
      $("#tblEventualities").bootstrapTable({
        data,
        "locale": vlang,
        "onClickRow" (row) {
          const modalInstance = $uibModal.open({
            "animation": true,
            "backdrop": "static",
            "controller" ($scope, $uibModalInstance, evt) {
              $scope.evt = evt;
              $scope.evt.isManager = userRole !== "customer";
              $scope.evt.onlyReadableEvt1 = true;
              // Tracking mixpanel
              const nameOrg = Organization.toUpperCase();
              const nameProj = project.toUpperCase();
              mixPanelDashboard.trackReadEventuality(
                userName,
                userEmail,
                nameOrg,
                nameProj,
                evt.id
              );
              if ($scope.evt.afectacion === "" ||
                  typeof $scope.evt.afectacion === "undefined") {
                $scope.evt.afectacion = "0";
              }
              $scope.evt.afectacion = parseInt($scope.evt.afectacion, 10);
              $scope.eventEdit = function eventEdit () {
                if ($scope.evt.onlyReadableEvt1 === false) {
                  $scope.evt.onlyReadableEvt1 = true;
                }
                else {
                  $scope.evt.onlyReadableEvt1 = false;
                }
              };
              $scope.okModalEditar = function okModalEditar () {
                const neg = "negativo";
                let submit = false;
                try {
                  if (typeof $scope.evt.afectacion === "undefined") {
                    throw neg;
                  }
                  submit = true;
                }
                catch (err) {
                  Rollbar.error("Error: Affectation can not " +
                                "be a negative number");
                  $msg.error($translate.instant("proj_alerts." +
                                                "eventPositiveint"));
                  return false;
                }
                eventualityFactory.updateEvnt($scope.evt).then((response) => {
                  if (!response.error) {
                    const updatedAt = $translate.instant("proj_alerts." +
                                                         "updatedTitle");
                    const updatedAc = $translate.instant("proj_alerts." +
                                                         "eventUpdated");
                    $msg.success(updatedAc, updatedAt);
                    $uibModalInstance.close();
                    location.reload();
                  }
                  else if (response.error) {
                    if (response.message === "Campos vacios") {
                      Rollbar.error("Error: An error occurred updating events");
                      $msg.error($translate.instant("proj_alerts.emptyField"));
                    }
                    else {
                      Rollbar.error("Error: An error occurred updating events");
                      $msg.error($translate.instant("proj_alerts." +
                                                    "errorUpdatingEvent"));
                    }
                  }
                });
                return true;
              };
              $scope.close = function close () {
                $uibModalInstance.close();
              };
            },
            "resolve": {"evt": row},
            "templateUrl": `${BASE.url}assets/views/project/eventualityMdl.html`
          });
        }
      });
      $("#tblEventualities").bootstrapTable("refresh");
      // MANEJO DEL UI
      $("#search_section").show();
      $("[data-toggle=\"tooltip\"]").tooltip();
    };
    $scope.openModalEventAvance = function openModalEventAvance () {
      const modalInstance = $uibModal.open({
        "animation": true,
        "controller" ($scope, $uibModalInstance) {
          $scope.rowsEvent = $("#tblEventualities").bootstrapTable("getData");
          $scope.close = function close () {
            $uibModalInstance.close();
            $timeout(() => {
              $("#tblEventualities").bootstrapTable("load", $scope.rowsEvent);
            }, 100);
          };
        },
        "resolve": {"ok": true},
        "templateUrl": "avance.html",
        "windowClass": "modal avance-modal"
      });
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
    $scope.init();
  }
);
