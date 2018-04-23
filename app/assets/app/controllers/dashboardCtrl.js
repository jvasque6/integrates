/* eslint no-shadow: ["error", { "allow": ["$scope"] }]*/
/* global
integrates, $, BASE, mixpanel, userMail, $xhr, Organization, userEmail,
mixPanelDashboard, userName, projectData:true, eventsData:true, findingData:true
*/
/**
 * @file dashboardController.js
 * @author engineering@fluidattacks.com
 */
/**
 * Crea el controlador de las funciones del dashboard
 * @name dashboardController
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @return {undefined}
 */
/** @export */
integrates.controller("dashboardCtrl", function dashboardCtrl (
  $scope, $uibModal, $timeout,
  $state, $stateParams, $q,
  $translate
) {
  $scope.initMyProjects = function initMyProjects () {
    let vlang = "en-US";
    if (localStorage.lang === "en") {
      vlang = "en-US";
    }
    else {
      vlang = "es-CO";
    }
    $timeout(() => {
      $("#myProjectsTbl").bootstrapTable({
        "locale": vlang,
        "onClickRow" (row, elem) {
          $state.go("ProjectIndicators", {"project": row.project});
        },
        "url": `${BASE.url}get_myprojects`
      });
      $("#myProjectsTbl").bootstrapTable("refresh");
    });
  };

  /**
   * Redirecciona a un usuario para cerrar la sesion
   * @function logout
   * @member integrates.dashboardCtrl
   * @return {undefined}
   */
  $scope.logout = function logout () {
    const modalInstance = $uibModal.open({
      "animation": true,
      "controller" ($scope, $uibModalInstance) {
        $scope.closeModalLogout = function closeModalLogout () {
          $uibModalInstance.close();
        };
        $scope.okModalLogout = function okModalLogout () {
          projectData = [];
          eventsData = [];
          findingData = {};
          window.location = `${BASE.url}logout`;
        };
      },
      "resolve": {"done": true},
      "templateUrl": "logout.html",
      "windowClass": "modal avance-modal"
    });
  };

  /**
   * Cambia el lenguaje del dashboard
   * @function changeLang
   * @param {string} langKey Language key set by the user
   * @member integrates.dashboardCtrl
   * @return {undefined}
   */
  $scope.changeLang = function changeLang (langKey) {
    if (langKey === "es" || langKey === "en") {
      localStorage.lang = langKey;
    }
    $translate.use(localStorage.lang);
    mixpanel.identify(userEmail);
    mixpanel.people.set({"$Language": localStorage.lang});
    location.reload();
  };
  $scope.initMyEventualities = function initMyEventualities () {
    let vlang = "en-US";
    if (localStorage.lang === "en") {
      vlang = "en-US";
    }
    else {
      vlang = "es-CO";
    }
    const aux = $xhr.get($q, `${BASE.url}get_myevents`, {});
    aux.then((response) => {
      for (let cont = 0; cont < response.data.length; cont++) {
        switch (response.data[cont].tipo) {
        case "Autorización para ataque especial":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.auth_attack");
          break;
        case "Alcance difiere a lo aprobado":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.toe_differs");
          break;
        case "Aprobación de alta disponibilidad":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.high_approval");
          break;
        case "Insumos incorrectos o faltantes":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.incor_supplies");
          break;
        case "Cliente suspende explicitamente":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.explic_suspend");
          break;
        case "Cliente aprueba cambio de alcance":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.approv_change");
          break;
        case "Cliente cancela el proyecto/hito":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.cancel_proj");
          break;
        case "Cliente detecta ataque":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.det_attack");
          break;
        case "Otro":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.other");
          break;
        case "Ambiente no accesible":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.inacc_ambient");
          break;
        case "Ambiente inestable":
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.uns_ambient");
          break;
        default:
          response.data[cont].tipo = $translate.instant("eventFormstack." +
                                                        "type.unknown");
        }
      }
      $("#myEventsTbl").bootstrapTable({
        "data": response.data,
        "locale": vlang,
        "onClickRow" (row, elem) {
          const modalInstance = $uibModal.open({
            "animation": true,
            "controller" ($scope, data, $uibModalInstance) {
              $scope.evnt = data;
              // Tracking mixpanel
              const org = Organization.toUpperCase();
              const projt = $scope.evnt.proyecto_fluid.toUpperCase();
              mixPanelDashboard.trackReadEventuality(
                userName,
                userEmail,
                org,
                projt,
                $scope.evnt.id
              );
              $scope.close = function close () {
                $uibModalInstance.close();
              };
            },
            "resolve": {"data": row},
            "templateUrl": "ver.html",
            "windowClass": "modal avance-modal"
          });
        }
      });
      $("#myEventsTbl").bootstrapTable("refresh");
    });
  };
  $scope.init = function init () {
    $scope.initMyProjects();
    $scope.initMyEventualities();
  };
  $scope.init();
});
