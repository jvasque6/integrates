/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1] }]*/
/* global integrates, BASE, $xhr, window.location:true, response:true,
Organization, mixPanelDashboard, mixPanelDashboard, mixPanelDashboard,$msg,
$, Rollbar, eventsData, userEmail, userName */
/* eslint no-shadow: ["error", { "allow": ["$scope","$stateParams",
                                          "response"] }]*/
/**
 * @file functions-factory-1.js
 * @author engineering@fluidattacks.com
 */
/**
 * Crea el factory de la funcionalidad de hallazgos
 * @name functionsFtry1
 * @param {Object} $q Angular constructor
 * @param {Object} $translate Angular translator
 * @param {Object} projectFtry Factory with main functions
 * @return {undefined}
 */
/** @export */
integrates.factory(
  "functionsFtry1",
  ($q, $translate, projectFtry, $uibModal, $stateParams, functionsFtry2) => ({

    "alertHeader" (company, project) {
      const req = projectFtry.getAlerts(company, project);
      req.then((response) => {
        if (typeof response.data === "undefined") {
          location.reload();
        }
        if (!response.error && response.data.length > 0) {
          if (response.data[0].status_act === "1") {
            let html = "<div class=\"alert alert-danger-2\">";
            html += "<strong>Atención! </strong>" +
                    `${response.data[0].message}</div>`;
            document.getElementById("header_alert").innerHTML = html;
          }
        }
      });
    },

    "deleteFinding" ($scope) {
      // Obtener datos
      const descData = {"id": $scope.finding.id};
      const modalInstance = $uibModal.open({
        "animation": true,
        "backdrop": "static",
        "controller" (
          $scope,
          $uibModalInstance,
          updateData,
          $stateParams,
          $state
        ) {
          $scope.vuln = {};
          $scope.modalTitle = $translate.instant("confirmmodal.title_finding");
          $scope.ok = function ok () {
            $scope.vuln.id = updateData.id;
            // Consumir el servicio
            const req = projectFtry.deleteFinding($scope.vuln);
            // Capturar la Promisse
            req.then((response) => {
              if (!response.error) {
                const updatedAt =
                                 $translate.instant("proj_alerts.updatedTitle");
                const updatedAc =
                                 $translate.instant("proj_alerts.updated_cont");
                $msg.success(updatedAc, updatedAt);
                $uibModalInstance.close();
                $state.go("ProjectFindings", {"project": $stateParams.project});
                // Tracking mixpanel
                mixPanelDashboard.trackFinding(
                  "deleteFinding",
                  userEmail,
                  descData.id
                );
              }
              else if (response.error) {
                const errorAc1 =
                                $translate.instant("proj_alerts.error_textsad");
                Rollbar.error("Error: An error occurred deleting finding");
                $msg.error(errorAc1);
              }
            });
          };
          $scope.close = function close () {
            $uibModalInstance.close();
          };
        },
        "resolve": {"updateData": descData},
        "templateUrl": `${BASE.url}assets/views/project/deleteMdl.html`
      });
    },

    "findingCalculateSeveridad" (data) {
      let severidad = 0;
      const maxSeverity = 5;
      const percent = 100.0;
      if (!isNaN(data.finding.severidad)) {
        severidad = parseFloat(data.finding.severidad);
        if (severidad < 0 || severidad > maxSeverity) {
          Rollbar.error("Error: Severity must be an integer bewteen 0 and 5");
          $msg.error($translate.instant("proj_alerts.error_severity"), "error");
          data.finding.valorRiesgo = "";
          return [
            false,
            data.finding.valorRiesgo
          ];
        }
        try {
          let prob = data.finding.probabilidad;
          severidad = data.finding.severidad;
          prob = prob.split("%")[0];
          prob = parseFloat(prob) / percent;
          severidad = parseFloat(severidad);
          const vRiesgo = prob * severidad;
          const criticLimit = 3;
          const moderateLimit = 2;
          if (vRiesgo >= criticLimit) {
            data.finding.valorRiesgo = "(:r) Critico".replace(
              ":r",
              vRiesgo.toFixed(1)
            );
          }
          else if (vRiesgo >= moderateLimit && vRiesgo < criticLimit) {
            data.finding.valorRiesgo = "(:r) Moderado".replace(
              ":r",
              vRiesgo.toFixed(1)
            );
          }
          else {
            data.finding.valorRiesgo = "(:r) Tolerable".replace(
              ":r",
              vRiesgo.toFixed(1)
            );
          }
          return [
            true,
            data.finding.valorRiesgo
          ];
        }
        catch (err) {
          data.finding.valorRiesgo = "";
          return [
            false,
            data.finding.valorRiesgo
          ];
        }
      }
      else if (isNaN(data.finding.severidad)) {
        Rollbar.error("Error: Severity must be an integer bewteen 0 and 5");
        $msg.error($translate.instant("proj_alerts.error_severity"), "error");
        data.finding.valorRiesgo = "";
        return [
          false,
          data.finding.valorRiesgo
        ];
      }
      return true;
    },

    "findingHeaderBuilding" ($scope, findingData) {
      $scope.header = {};
      const cierresHallazgo = $scope.finding.cierres;
      const cierresTmp = [];
      for (let cont = 0; cont < cierresHallazgo.length; cont++) {
        const cierre = cierresHallazgo[cont];
        cierre.position = cont + 1;
        cierresTmp.push(cierre);
      }
      $scope.finding.cierres = cierresTmp;
      $scope.header.findingTitle = $scope.finding.hallazgo;
      $scope.header.findingType = $scope.finding.tipoPrueba;
      $scope.header.findingRisk = "";
      $scope.header.findingState = $scope.finding.estado;
      $scope.header.findingID = $scope.finding.id;
      $scope.header.findingValue = $scope.finding.criticidad;
      $scope.header.findingTreatment = $scope.finding.tratamiento;
      const highCriticity = 7;
      const moderateCriticity = 4;
      const findingValue = parseFloat($scope.finding.criticidad);
      if (findingValue >= highCriticity) {
        $scope.header.findingValueDescription =
               $translate.instant("finding_formstack.criticity_header.high");
        $scope.header.findingValueColor = $scope.colors.critical;
      }
      else if (findingValue >= moderateCriticity &&
               findingValue < highCriticity) {
        $scope.header.findingValueDescription =
            $translate.instant("finding_formstack.criticity_header.moderate");
        $scope.header.findingValueColor = $scope.colors.moderate;
      }
      else {
        $scope.header.findingValueDescription =
            $translate.instant("finding_formstack.criticity_header.tolerable");
        $scope.header.findingValueColor = $scope.colors.tolerable;
      }

      if ($scope.header.findingState === "Abierto" ||
          $scope.header.findingState === "Open") {
        $scope.header.findingStateColor = $scope.colors.critical;
      }
      else if ($scope.header.findingState === "Parcialmente cerrado" ||
               $scope.header.findingState === "Partially closed") {
        $scope.header.findingStateColor = $scope.colors.moderate;
      }
      else {
        $scope.header.findingStateColor = $scope.colors.ok;
      }

      $scope.header.findingCount = $scope.finding.cardinalidad;
      findingData.header = $scope.header;
    },

    "findingVerified" ($scope) {
    // Obtener datos
      const currUrl = window.location.href;
      const trackingUrl = currUrl.replace("/description", "/tracking");
      const descData = {
        "findingId": $scope.finding.id,
        "findingName": $scope.finding.hallazgo,
        "findingUrl": trackingUrl,
        "findingVulns": $scope.finding.cardinalidad,
        "project": $scope.finding.proyecto_fluid,
        "userMail": userEmail
      };
      const modalInstance = $uibModal.open({
        "animation": true,
        "backdrop": "static",
        "controller" ($scope, $uibModalInstance, mailData) {
          $scope.modalTitle = $translate.instant("search_findings." +
                                          "tab_description.verified_finding");
          $scope.ok = function ok () {
          // Consumir el servicio
            const req = projectFtry.findingVerified(mailData);
            // Capturar la Promisse
            req.then((response) => {
              if (!response.error) {
              // Tracking mixpanel
                const org = Organization.toUpperCase();
                const projt = descData.project.toUpperCase();
                mixPanelDashboard.trackFindingDetailed(
                  "findingVerified",
                  userName,
                  userEmail,
                  org,
                  projt,
                  descData.findingId
                );
                const updatedAt = $translate.instant("proj_alerts." +
                                                     "updatedTitle");
                const updatedAc = $translate.instant("proj_alerts." +
                                                   "verified_success");
                $msg.success(updatedAc, updatedAt);
                $uibModalInstance.close();
                location.reload();
              }
              else if (response.error) {
                Rollbar.error("Error: An error occurred " +
                            "when verifying the finding");
                $msg.error($translate.instant("proj_alerts.error_textsad"));
              }
            });
          };
          $scope.close = function close () {
            $uibModalInstance.close();
          };
        },
        "resolve": {"mailData": descData},
        "templateUrl": `${BASE.url}assets/views/project/confirmMdl.html`
      });
    },

    "treatmentEditable" ($scope) {
      functionsFtry2.goDown();
      if ($scope.onlyReadableTab4 === false) {
        $scope.finding.responsableTratamiento = userEmail;
        $scope.onlyReadableTab4 = true;
        $scope.finding.tratamiento = $scope.aux.tratamiento;
        $scope.finding.razonTratamiento = $scope.aux.razon;
        $scope.finding.btsExterno = $scope.aux.bts;
      }
      else if ($scope.onlyReadableTab4 === true) {
        $scope.finding.tratamiento = $scope.aux.tratamiento;
        $scope.finding.razonTratamiento = $scope.aux.razon;
        $scope.finding.responsableTratamiento = $scope.aux.responsable;
        $scope.finding.btsExterno = $scope.aux.bts;
        $scope.onlyReadableTab4 = false;
      }
    },

    "updateCSSv2" ($scope) {
      // Obtener datos de las listas
      const cssv2Data = {

        "autenticacion": $scope.finding.autenticacion,
        "complejidadAcceso": $scope.finding.complejidadAcceso,
        "explotabilidad": $scope.finding.explotabilidad,
        "id": $scope.finding.id,
        "impactoConfidencialidad": $scope.finding.impactoConfidencialidad,
        "impactoDisponibilidad": $scope.finding.impactoDisponibilidad,
        "impactoIntegridad": $scope.finding.impactoIntegridad,
        "nivelConfianza": $scope.finding.nivelConfianza,
        "nivelResolucion": $scope.finding.nivelResolucion,
        "vectorAcceso": $scope.finding.vectorAcceso
      };
      // Recalcular CSSV2
      functionsFtry2.findingCalculateCSSv2($scope);
      cssv2Data.criticidad = $scope.finding.criticidad;
      // Instanciar modal de confirmacion
      const modalInstance = $uibModal.open({
        "animation": true,
        "backdrop": "static",
        "controller" ($scope, $uibModalInstance, updateData) {
          $scope.modalTitle = $translate.instant("confirmmodal.title_cssv2");
          $scope.ok = function ok () {
            // Consumir el servicio
            const req = projectFtry.updateCSSv2(updateData);
            // Capturar la Promisse
            req.then((response) => {
              if (!response.error) {
                const updatedAt = $translate.instant("proj_alerts." +
                                                     "updatedTitle");
                const updatedAc = $translate.instant("proj_alerts." +
                                                     "updated_cont");
                $msg.success(updatedAc, updatedAt);
                $uibModalInstance.close();
                location.reload();
              }
              else if (response.error) {
                const errorAc1 = $translate.instant("proj_alerts." +
                                                   "error_textsad");
                Rollbar.error("Error: An error occurred updating CSSv2");
                $msg.error(errorAc1);
              }
            });
          };
          $scope.close = function close () {
            $uibModalInstance.close();
          };
        },
        "resolve": {"updateData": cssv2Data},
        "templateUrl": `${BASE.url}assets/views/project/confirmMdl.html`
      });
    },

    "updateEvidenceText" (element, $scope) {
      const evImage = $(element).attr("target");
      const data = {};
      data.id = $scope.finding.id;
      const description = $(`#evidenceText${evImage}`).val();
      const file = $(`#evidence${evImage}`).val();
      if (description === "" || $scope.evidenceDescription[evImage] ===
          description) {
        if (file !== "") {
          functionsFtry2.updateEvidencesFiles(element, $scope);
        }
        else if (file === "") {
          return false;
        }
      }
      else {
        if (evImage === "2") {
          data.descEvidencia1 = description;
          data.field = "descEvidencia1";
        }
        if (evImage === "3") {
          data.descEvidencia2 = description;
          data.field = "descEvidencia2";
        }
        if (evImage === "4") {
          data.descEvidencia3 = description;
          data.field = "descEvidencia3";
        }
        if (evImage === "5") {
          data.descEvidencia4 = description;
          data.field = "descEvidencia4";
        }
        if (evImage === "6") {
          data.descEvidencia5 = description;
          data.field = "descEvidencia5";
        }
        const req = projectFtry.updateEvidenceText(data);
        // Capturar la Promisse
        req.then((response) => {
          if (!response.error) {
            const updatedAt = $translate.instant("proj_alerts.updatedTitle");
            const updatedAc = $translate.instant("proj_alerts." +
                                                 "updated_cont_description");
            $msg.success(updatedAc, updatedAt);
            if (file !== "") {
              functionsFtry2.updateEvidencesFiles(element, $scope);
            }
            else if (file === "") {
              location.reload();
            }
            return true;
          }
          const errorAc1 = $translate.instant("proj_alerts.no_text_update");
          Rollbar.error("Error: An error occurred updating " +
                        "evidences description");
          $msg.error(errorAc1);
          return false;
        });
      }
      return true;
    },

    "updateTreatment" ($scope) {
      const validateTreatment = function validateTreatment ($scope) {
        const minCharacter = 30;
        if ($scope.aux.razon === $scope.finding.razonTratamiento) {
          $msg.error($translate.instant("proj_alerts.differ_comment"));
          return false;
        }
        else if ($scope.finding.razonTratamiento === "") {
          $msg.error($translate.instant("proj_alerts.empty_comment"));
          return false;
        }
        else if ($scope.finding.razonTratamiento.length < minCharacter) {
          $msg.error($translate.instant("proj_alerts.short_comment"));
          return false;
        }
        $scope.finding.responsableTratamiento = userEmail;
        return true;
      };
      let flag = false;
      if ($scope.aux.tratamiento === $scope.finding.tratamiento &&
        $scope.aux.razon === $scope.finding.razonTratamiento &&
        $scope.aux.bts !== $scope.finding.btsExterno) {
        flag = true;
      }
      else if (validateTreatment($scope)) {
        $scope.finding.responsableTratamiento = userEmail;
        flag = true;
      }
      if (flag === true) {
        const newData = {
          "bts_externo": $scope.finding.btsExterno,
          "id": $scope.finding.id,
          "razonTratamiento": $scope.finding.razonTratamiento,
          "responsableTratamiento": $scope.finding.responsableTratamiento,
          "tratamiento": $scope.finding.tratamiento
        };
        const modalInstance = $uibModal.open({
          "animation": true,
          "backdrop": "static",
          "controller" ($scope, $uibModalInstance, updateData) {
            $scope.modalTitle = $translate.instant("search_findings." +
                                                 "tab_description." +
                                                 "update_treatmodal");
            $scope.ok = function ok () {
            // Consumir el servicio
              const req = projectFtry.updateTreatment(updateData);
              // Capturar la Promisse
              req.then((response) => {
                if (!response.error) {
                  const org = Organization.toUpperCase();
                  const projt = $stateParams.project.toUpperCase();
                  mixPanelDashboard.trackFindingDetailed(
                    "FindingUpdateTreatment",
                    userName,
                    userEmail,
                    org,
                    projt,
                    newData.id
                  );
                  $msg.success(
                    $translate.instant("proj_alerts." +
                                           "updated_treat"),
                    $translate.instant("proj_alerts." +
                                                         "congratulation")
                  );
                  $uibModalInstance.close();
                  location.reload();
                }
                else if (response.error) {
                  Rollbar.error("Error: An error occurred updating treatment");
                  const errorAc1 = $translate.instant("proj_alerts." +
                                                    "error_textsad");
                  $msg.error(errorAc1);
                }
              });
            };

            $scope.close = function close () {
              $uibModalInstance.close();
            };
          },
          "resolve": {"updateData": newData},
          "templateUrl": `${BASE.url}assets/views/project/confirmMdl.html`
        });
      }
    }


  })
);
